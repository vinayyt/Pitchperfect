'use strict';
const path    = require('path');
const http    = require('http');
const express = require('express');
const { Server } = require('socket.io');
const { createRoom, getRoom, deleteRoom, getRoomCount } = require('./gameEngine');

const app    = express();
const server = http.createServer(app);

// Restrict CORS to the deployed origin in production; allow all in dev
const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || '*';

const io = new Server(server, {
  cors: { origin: ALLOWED_ORIGIN, methods: ['GET', 'POST'] },
  pingTimeout:  30000,
  pingInterval: 10000,
  maxHttpBufferSize: 1e4, // 10 KB max per event payload
});

const PORT = process.env.PORT || 3001;

// Serve built React client
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get('*', (_, res) => res.sendFile(path.join(clientDist, 'index.html')));

// ── Input sanitisation ────────────────────────────────────────────────────────

function sanitizeName(raw) {
  if (typeof raw !== 'string') return '';
  // Strip HTML-sensitive chars, trim whitespace, cap at 18 chars
  return raw.trim().replace(/[<>"'`&]/g, '').slice(0, 18);
}

function sanitizeCode(raw) {
  if (typeof raw !== 'string') return '';
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

function sanitizeTimeLimit(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 600;
  return Math.max(300, Math.min(900, Math.floor(n))); // 5–15 min
}

// ── Per-socket rate limiter ───────────────────────────────────────────────────

const _rateLimits = new Map();

function checkRate(socketId, action, limit = 15, windowMs = 10_000) {
  const key = `${socketId}:${action}`;
  const now = Date.now();
  let rec = _rateLimits.get(key);
  if (!rec || now > rec.resetAt) {
    rec = { count: 0, resetAt: now + windowMs };
  }
  rec.count += 1;
  _rateLimits.set(key, rec);
  return rec.count <= limit;
}

function clearRate(socketId) {
  for (const k of _rateLimits.keys()) {
    if (k.startsWith(`${socketId}:`)) _rateLimits.delete(k);
  }
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function broadcast(room, event, payloadFn) {
  room.players.forEach((p, idx) => {
    if (p.socketId === '__bot__') return; // never emit to the bot
    io.to(p.socketId).emit(event, payloadFn(idx));
  });
}

function emitRoundResult(room, round) {
  room.players.forEach((p, idx) => {
    if (p.socketId === '__bot__') return;
    const iAmP1 = idx === 0;
    const myCard  = iAmP1 ? round.card0 : round.card1;
    const oppCard = iAmP1 ? round.card1 : round.card0;
    const iWon = (iAmP1 && round.result === 'p1') || (!iAmP1 && round.result === 'p2');
    io.to(p.socketId).emit('round_result', {
      statKey:   round.statKey,
      statLabel: round.statLabel,
      myCard, oppCard,
      result:    round.result,
      iWon:      round.result !== 'tie' && iWon,
      isTie:     round.result === 'tie',
      potCount:  round.potCount,
      round:     round.round,
      newState:  room.getStateForPlayer(idx),
    });
  });
}

function endGame(room) {
  if (room.status === 'finished') return;
  room.status = 'finished';
  if (room.timerHandle)    clearInterval(room.timerHandle);
  if (room.botTurnHandle)  clearTimeout(room.botTurnHandle);
  const res = room.getResult();
  broadcast(room, 'game_over', idx => ({
    iWon:   !res.isDraw && res.winner === room.players[idx].name,
    isDraw: res.isDraw,
    winner: res.winner,
    scores: res.scores,
    rounds: room.roundHistory.length,
  }));
  setTimeout(() => deleteRoom(room.code), 5 * 60_000);
}

function startTimer(room) {
  if (room.timerHandle) clearInterval(room.timerHandle);
  room.timerHandle = setInterval(() => {
    if (room.status !== 'playing') { clearInterval(room.timerHandle); return; }
    const left = room.getTimeLeft();
    room.players.forEach(p => {
      if (p.socketId !== '__bot__') io.to(p.socketId).emit('timer_tick', { timeLeft: left });
    });
    if (left <= 0) endGame(room);
  }, 1000);
}

// ── Bot turn scheduler ────────────────────────────────────────────────────────

function scheduleBotTurn(room) {
  if (room.status !== 'playing') return;
  if (room.botIdx === null || room.currentTurn !== room.botIdx) return;

  // Random "thinking" delay: 1.2 – 2.4 s
  const delay = 1200 + Math.floor(Math.random() * 1200);

  if (room.botTurnHandle) clearTimeout(room.botTurnHandle);
  room.botTurnHandle = setTimeout(() => {
    room.botTurnHandle = null;
    if (room.status !== 'playing') return;
    if (room.currentTurn !== room.botIdx) return;

    const statKey = room.pickBotStat();
    if (!statKey) return;

    const round = room.resolveRound(statKey);
    if (!round) return;

    emitRoundResult(room, round);

    // Check game-over conditions
    const p0Empty = room.players[0].deck.length === 0;
    const p1Empty = room.players[1].deck.length === 0;
    if ((p0Empty || p1Empty) && room.pot.length === 0) {
      endGame(room);
      return;
    }

    // Chain next bot turn if applicable
    if (room.currentTurn === room.botIdx) scheduleBotTurn(room);
  }, delay);
}

// ── Socket events ─────────────────────────────────────────────────────────────

io.on('connection', socket => {
  console.log(`[+] ${socket.id}`);

  // CREATE ROOM
  socket.on('create_room', ({ name, timeLimit } = {}) => {
    if (!checkRate(socket.id, 'create_room', 5, 30_000)) return socket.emit('error', { msg: 'Too many requests' });
    name = sanitizeName(name);
    if (!name) return socket.emit('error', { msg: 'Name required' });
    const tl   = sanitizeTimeLimit(timeLimit);
    const code = createRoom(tl);
    if (!code) return socket.emit('error', { msg: 'Server at capacity, try again shortly' });
    const room = getRoom(code);
    room.addPlayer(socket.id, name);
    socket.join(code);
    socket.data = { code, name };
    socket.emit('room_created', { code, name, timeLimit: tl });
    console.log(`Room ${code} created by ${name}`);
  });

  // JOIN ROOM
  socket.on('join_room', ({ code, name } = {}) => {
    if (!checkRate(socket.id, 'join_room', 10, 30_000)) return socket.emit('error', { msg: 'Too many requests' });
    code = sanitizeCode(code);
    name = sanitizeName(name);
    if (!name) return socket.emit('error', { msg: 'Name required' });
    if (code.length !== 6) return socket.emit('error', { msg: 'Invalid room code' });
    const room = getRoom(code);
    if (!room)                      return socket.emit('error', { msg: 'Room not found' });
    if (room.isFull())              return socket.emit('error', { msg: 'Room is full' });
    if (room.status !== 'waiting')  return socket.emit('error', { msg: 'Game already started' });
    if (room.botIdx !== null)       return socket.emit('error', { msg: 'Room not found' });
    room.addPlayer(socket.id, name);
    socket.join(code);
    socket.data = { code, name };
    const host = room.players[0];
    socket.emit('room_joined', { code, name, oppName: host.name });
    io.to(host.socketId).emit('opponent_joined', { oppName: name });
    console.log(`${name} joined room ${code}`);
  });

  // START GAME (host only)
  socket.on('start_game', () => {
    const { code } = socket.data || {};
    const room = getRoom(code);
    if (!room || !room.isFull() || room.status !== 'waiting') return;
    if (room.players[0].socketId !== socket.id) return; // only host can start
    room.startGame('all');
    broadcast(room, 'game_started', idx => room.getStateForPlayer(idx));
    startTimer(room);
    console.log(`Game started in room ${code}`);
  });

  // PLAY VS BOT
  socket.on('play_vs_bot', ({ name, timeLimit } = {}) => {
    if (!checkRate(socket.id, 'play_vs_bot', 5, 30_000)) return socket.emit('error', { msg: 'Too many requests' });
    name = sanitizeName(name);
    if (!name) return socket.emit('error', { msg: 'Name required' });
    const tl   = sanitizeTimeLimit(timeLimit);
    const code = createRoom(tl);
    if (!code) return socket.emit('error', { msg: 'Server at capacity, try again shortly' });
    const room = getRoom(code);
    room.addPlayer(socket.id, name);
    room.addBot();
    socket.join(code);
    socket.data = { code, name };
    room.startGame('all');
    const humanIdx = 0; // human is always player 0
    socket.emit('game_started', room.getStateForPlayer(humanIdx));
    startTimer(room);
    // If bot goes first, schedule its turn immediately
    if (room.currentTurn === room.botIdx) scheduleBotTurn(room);
    console.log(`Bot game started for ${name} (room ${code})`);
  });

  // CHOOSE STAT
  socket.on('choose_stat', ({ statKey } = {}) => {
    if (!checkRate(socket.id, 'choose_stat', 60, 60_000)) return;
    if (typeof statKey !== 'string') return;
    const { code } = socket.data || {};
    const room = getRoom(code);
    if (!room || room.status !== 'playing') return;

    const myIdx = room.players.findIndex(p => p.socketId === socket.id);
    if (myIdx === -1 || myIdx !== room.currentTurn) return socket.emit('error', { msg: 'Not your turn' });

    const round = room.resolveRound(statKey);
    if (!round) return;

    emitRoundResult(room, round);

    const p0Empty = room.players[0].deck.length === 0;
    const p1Empty = room.players[1].deck.length === 0;
    if ((p0Empty || p1Empty) && room.pot.length === 0) { endGame(room); return; }

    // Schedule bot if it's now the bot's turn
    if (room.botIdx !== null && room.currentTurn === room.botIdx) scheduleBotTurn(room);
  });

  // REMATCH VOTE
  socket.on('rematch_vote', () => {
    const { code } = socket.data || {};
    const room = getRoom(code);
    if (!room) return;

    // Each socket can only vote once per match
    if (room._rematchVotes.has(socket.id)) return;
    room._rematchVotes.add(socket.id);

    const votes = room._rematchVotes.size;
    const required = room.botIdx !== null ? 1 : 2; // bot game needs only 1 vote
    broadcast(room, 'rematch_waiting', () => ({ votes }));

    if (votes >= required) {
      room._rematchVotes = new Set();
      room.status = 'waiting';
      room.players.forEach(p => { p.deck = []; p.wonCount = 0; });
      room.pot = []; room.roundHistory = [];
      room.startGame('all');
      broadcast(room, 'game_started', idx => room.getStateForPlayer(idx));
      startTimer(room);
      if (room.botIdx !== null && room.currentTurn === room.botIdx) scheduleBotTurn(room);
    }
  });

  // DISCONNECT
  socket.on('disconnect', () => {
    clearRate(socket.id);
    const { code } = socket.data || {};
    const room = getRoom(code);
    if (room) {
      if (room.timerHandle)   clearInterval(room.timerHandle);
      if (room.botTurnHandle) clearTimeout(room.botTurnHandle);
      if (room.botIdx !== null) {
        // Bot game — clean up immediately, no one else to notify
        deleteRoom(code);
      } else {
        room.players
          .filter(p => p.socketId !== socket.id)
          .forEach(p => io.to(p.socketId).emit('opponent_disconnected'));
      }
    }
    console.log(`[-] ${socket.id}`);
  });
});

server.listen(PORT, () => console.log(`Pitch Perfect server → http://localhost:${PORT}`));
