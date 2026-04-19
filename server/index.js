'use strict';
const path    = require('path');
const http    = require('http');
const express = require('express');
const { Server } = require('socket.io');
const { createRoom, getRoom, deleteRoom } = require('./gameEngine');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: '*', methods: ['GET','POST'] },
  pingTimeout: 30000, pingInterval: 10000,
});
const PORT = process.env.PORT || 3001;

// Serve built React client
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get('*', (_, res) => res.sendFile(path.join(clientDist, 'index.html')));

// ── Helpers ───────────────────────────────────────────────────────────────────

function broadcast(room, event, payloadFn) {
  room.players.forEach((p, idx) => {
    io.to(p.socketId).emit(event, payloadFn(idx));
  });
}

function emitState(room) {
  broadcast(room, 'state_update', idx => room.getStateForPlayer(idx));
}

function endGame(room) {
  if (room.status === 'finished') return;
  room.status = 'finished';
  if (room.timerHandle) clearInterval(room.timerHandle);
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
    room.players.forEach(p => io.to(p.socketId).emit('timer_tick', { timeLeft: left }));
    if (left <= 0) endGame(room);
  }, 1000);
}

// ── Socket events ─────────────────────────────────────────────────────────────

io.on('connection', socket => {
  console.log(`[+] ${socket.id}`);

  // CREATE ROOM
  socket.on('create_room', ({ name, timeLimit = 600 }) => {
    name = name?.trim();
    if (!name) return socket.emit('error', { msg: 'Name required' });
    const code = createRoom(timeLimit);
    const room = getRoom(code);
    room.addPlayer(socket.id, name);
    socket.join(code);
    socket.data = { code, name };
    socket.emit('room_created', { code, name, timeLimit });
    console.log(`Room ${code} created by ${name}`);
  });

  // JOIN ROOM
  socket.on('join_room', ({ code, name }) => {
    code = (code || '').trim().toUpperCase();
    name = name?.trim();
    if (!name) return socket.emit('error', { msg: 'Name required' });
    const room = getRoom(code);
    if (!room)          return socket.emit('error', { msg: 'Room not found' });
    if (room.isFull())  return socket.emit('error', { msg: 'Room is full' });
    if (room.status !== 'waiting') return socket.emit('error', { msg: 'Game already started' });
    room.addPlayer(socket.id, name);
    socket.join(code);
    socket.data = { code, name };
    const host = room.players[0];
    socket.emit('room_joined', { code, name, oppName: host.name });
    io.to(host.socketId).emit('opponent_joined', { oppName: name });
    console.log(`${name} joined room ${code}`);
  });

  // START GAME
  socket.on('start_game', () => {
    const { code } = socket.data || {};
    const room = getRoom(code);
    if (!room || !room.isFull() || room.status !== 'waiting') return;
    room.startGame('all');
    broadcast(room, 'game_started', idx => room.getStateForPlayer(idx));
    startTimer(room);
    console.log(`Game started in room ${code}`);
  });

  // CHOOSE STAT
  socket.on('choose_stat', ({ statKey }) => {
    const { code } = socket.data || {};
    const room = getRoom(code);
    if (!room || room.status !== 'playing') return;

    // Verify it's this player's turn
    const myIdx = room.players.findIndex(p => p.socketId === socket.id);
    if (myIdx !== room.currentTurn) return socket.emit('error', { msg: 'Not your turn' });

    const round = room.resolveRound(statKey);
    if (!round) return;

    // Send personalised round result to each player
    room.players.forEach((p, idx) => {
      const iAmP1 = idx === 0;
      const myCard  = iAmP1 ? round.card0 : round.card1;
      const oppCard = iAmP1 ? round.card1 : round.card0;
      const iWon = (iAmP1 && round.result === 'p1') || (!iAmP1 && round.result === 'p2');
      io.to(p.socketId).emit('round_result', {
        statKey:   round.statKey,
        statLabel: round.statLabel,
        myCard,
        oppCard,
        result:    round.result,  // 'p1'|'p2'|'tie'
        iWon:      round.result !== 'tie' && iWon,
        isTie:     round.result === 'tie',
        potCount:  round.potCount,
        round:     round.round,
        newState:  room.getStateForPlayer(idx),
      });
    });

    // Check game-over conditions
    const p0Empty = room.players[0].deck.length === 0;
    const p1Empty = room.players[1].deck.length === 0;
    if ((p0Empty || p1Empty) && room.pot.length === 0) endGame(room);
  });

  // REMATCH VOTE
  socket.on('rematch_vote', () => {
    const { code } = socket.data || {};
    const room = getRoom(code);
    if (!room) return;
    room._rematchVotes = (room._rematchVotes || 0) + 1;
    io.to(code).emit('rematch_waiting', { votes: room._rematchVotes });
    if (room._rematchVotes >= 2) {
      room._rematchVotes = 0;
      room.status = 'waiting';
      room.players.forEach(p => { p.deck = []; p.wonCount = 0; });
      room.pot = []; room.roundHistory = [];
      room.startGame('all');
      broadcast(room, 'game_started', idx => room.getStateForPlayer(idx));
      startTimer(room);
    }
  });

  // DISCONNECT
  socket.on('disconnect', () => {
    const { code } = socket.data || {};
    const room = getRoom(code);
    if (room) {
      room.players.filter(p => p.socketId !== socket.id)
        .forEach(p => io.to(p.socketId).emit('opponent_disconnected'));
    }
    console.log(`[-] ${socket.id}`);
  });
});

server.listen(PORT, () => console.log(`Pitch Perfect server → http://localhost:${PORT}`));
