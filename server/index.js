'use strict';
const path    = require('path');
const http    = require('http');
const express = require('express');
const { Server } = require('socket.io');
const { createRoom, getRoom, deleteRoom, getRoomCount } = require('./gameEngine');
const {
  createAuctionRoom, getAuctionRoom, deleteAuctionRoom,
  joinAuctionRoom, getLobbyState, startRetentionPhase,
  submitRetention, allRetentionsDone, startAuctionPhase,
  getCurrentPlayer, placeBid, getBotBid, sellCurrentPlayer,
  startSecondRound, getTeamSummaries,
  STARTING_BUDGET, MIN_INCREMENT,
} = require('./auctionEngine');
const {
  createQuizRoom, createBotQuizRoom, getQuizRoom, deleteQuizRoom, joinQuizRoom,
  startQuestion, getPublicQuestion, submitAnswer, allAnswered,
  resolveRound: resolveQuizRound, generateBotAnswer, getGameResult,
  SECS_PER_Q,
} = require('./quizEngine');

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

// ── Auction timers (keyed by auction room code) ───────────────────────────────

const _auctionTimers = new Map(); // code → { noSaleTimer, soldTimer }

function clearAuctionTimers(code) {
  const t = _auctionTimers.get(code);
  if (!t) return;
  if (t.noSaleTimer) clearTimeout(t.noSaleTimer);
  if (t.soldTimer)   clearTimeout(t.soldTimer);
  _auctionTimers.delete(code);
}

function broadcastAuction(room, event, data) {
  for (const key of room.teamKeys) {
    const t = room.teams[key];
    if (!t.isBot && t.socketId) io.to(t.socketId).emit(event, data);
  }
}

function auctionPlayerUp(room) {
  const player = getCurrentPlayer(room);
  if (!player) return;
  clearAuctionTimers(room.code);
  broadcastAuction(room, 'auction_player_up', {
    player, phase: room.phase,
    currentBid: player.basePrice, currentBidder: null,
    timeLeft: 20, soldLog: room.soldLog,
  });
  const timers = { noSaleTimer: null, soldTimer: null };
  timers.noSaleTimer = setTimeout(() => resolveCurrentSlot(room), 20_000);
  _auctionTimers.set(room.code, timers);
  scheduleBotBids(room);
}

function scheduleBotBids(room) {
  for (const key of room.teamKeys) {
    const t = room.teams[key];
    if (!t.isBot) continue;
    const delay = 1500 + Math.floor(Math.random() * 2000);
    setTimeout(() => {
      const r = getAuctionRoom(room.code);
      if (!r || r.phase === 'results') return;
      if (getCurrentPlayer(r)?.id !== getCurrentPlayer(room)?.id) return;
      const amount = getBotBid(r, key);
      if (amount == null) return;
      const bidResult = placeBid(r, key, amount);
      if (!bidResult.ok) return;
      clearAuctionTimers(r.code);
      broadcastAuction(r, 'auction_bid_placed', {
        teamKey: key, teamName: r.teams[key].playerName,
        bid: amount, currentBid: r.currentBid, currentBidder: r.currentBidder,
      });
      const timers = { noSaleTimer: null, soldTimer: null };
      timers.noSaleTimer = setTimeout(() => resolveCurrentSlot(r), 20_000);
      _auctionTimers.set(r.code, timers);
      scheduleBotBids(r);
    }, delay);
  }
}

function resolveCurrentSlot(room) {
  clearAuctionTimers(room.code);
  const result = sellCurrentPlayer(room);
  if (!result) return;
  if (result.sold) {
    broadcastAuction(room, 'auction_player_sold', {
      player: result.player, soldTo: result.soldTo,
      price: result.price, teamName: room.teams[result.soldTo]?.playerName,
    });
  } else {
    broadcastAuction(room, 'auction_player_unsold', { player: result.player });
  }
  const timers = { noSaleTimer: null, soldTimer: null };
  timers.soldTimer = setTimeout(() => {
    _auctionTimers.delete(room.code);
    if (result.nextPhase === 'second_round') {
      startSecondRound(room);
      broadcastAuction(room, 'auction_second_round', { unsoldCount: room.unsoldPlayers.length });
      auctionPlayerUp(room);
    } else if (result.nextPhase === 'results') {
      room.phase = 'results';
      broadcastAuction(room, 'auction_ended', { teams: getTeamSummaries(room) });
    } else {
      auctionPlayerUp(room);
    }
  }, 3000);
  _auctionTimers.set(room.code, timers);
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

  // ── AUCTION EVENTS ─────────────────────────────────────────────────────────

  // AUCTION: CREATE ROOM
  socket.on('auction_create', ({ name, teamKeys } = {}) => {
    if (!checkRate(socket.id, 'auction_create', 3, 30_000))
      return socket.emit('auction_error', { msg: 'Too many requests' });
    name = sanitizeName(name);
    if (!name) return socket.emit('auction_error', { msg: 'Name required' });
    if (!Array.isArray(teamKeys) || teamKeys.length < 2 || teamKeys.length > 10)
      return socket.emit('auction_error', { msg: 'Choose 2–10 teams' });

    const aRoom = createAuctionRoom({ hostSocketId: socket.id, hostName: name, teamKeys });
    if (!aRoom) return socket.emit('auction_error', { msg: 'Server at capacity' });

    socket.join(`auction:${aRoom.code}`);
    socket.data = { ...socket.data, auctionCode: aRoom.code, auctionTeamKey: teamKeys[0] };
    socket.emit('auction_room_created', { code: aRoom.code, teamKey: teamKeys[0], lobby: getLobbyState(aRoom) });
    console.log(`[Auction] Room ${aRoom.code} created by ${name}`);
  });

  // AUCTION: SOLO vs BOTS (single player, instant start)
  socket.on('auction_vs_bots', ({ name, teamKeys } = {}) => {
    if (!checkRate(socket.id, 'auction_vs_bots', 3, 30_000))
      return socket.emit('auction_error', { msg: 'Too many requests' });
    name = sanitizeName(name);
    if (!name) return socket.emit('auction_error', { msg: 'Name required' });
    if (!Array.isArray(teamKeys) || teamKeys.length < 2 || teamKeys.length > 10)
      return socket.emit('auction_error', { msg: 'Choose 2–10 teams' });

    const aRoom = createAuctionRoom({ hostSocketId: socket.id, hostName: name, teamKeys });
    if (!aRoom) return socket.emit('auction_error', { msg: 'Server at capacity' });

    socket.join(`auction:${aRoom.code}`);
    socket.data = { ...socket.data, auctionCode: aRoom.code, auctionTeamKey: teamKeys[0] };

    // Fill all remaining slots with bots and kick off retention immediately
    startRetentionPhase(aRoom); // fillWithBots is called inside
    const { PLAYERS } = require('./data/players');
    socket.emit('auction_retention_phase', { players: PLAYERS, myTeamKey: teamKeys[0], budget: 12000 });
    console.log(`[Auction] Solo vs bots started for ${name} (room ${aRoom.code})`);
  });

  // AUCTION: JOIN ROOM
  socket.on('auction_join', ({ code, name, teamKey } = {}) => {
    if (!checkRate(socket.id, 'auction_join', 5, 30_000))
      return socket.emit('auction_error', { msg: 'Too many requests' });
    code    = sanitizeCode(code);
    name    = sanitizeName(name);
    teamKey = typeof teamKey === 'string' ? teamKey.trim().toUpperCase().slice(0, 6) : '';
    if (!name)    return socket.emit('auction_error', { msg: 'Name required' });
    if (!teamKey) return socket.emit('auction_error', { msg: 'Team required' });

    const aRoom = getAuctionRoom(code);
    if (!aRoom) return socket.emit('auction_error', { msg: 'Room not found' });

    const jr = joinAuctionRoom(aRoom, socket.id, name, teamKey);
    if (jr.error) return socket.emit('auction_error', { msg: jr.error });

    socket.join(`auction:${aRoom.code}`);
    socket.data = { ...socket.data, auctionCode: aRoom.code, auctionTeamKey: teamKey };

    const lobby = getLobbyState(aRoom);
    socket.emit('auction_player_joined', { teamKey, lobby });
    io.to(aRoom.hostSocketId).emit('auction_player_joined', { teamKey, lobby });
    console.log(`[Auction] ${name} joined ${code} as ${teamKey}`);
  });

  // AUCTION: HOST STARTS RETENTION
  socket.on('auction_start_retention', () => {
    const { auctionCode } = socket.data || {};
    const aRoom = getAuctionRoom(auctionCode);
    if (!aRoom)                           return;
    if (aRoom.hostSocketId !== socket.id) return socket.emit('auction_error', { msg: 'Host only' });
    if (aRoom.phase !== 'lobby')          return;

    startRetentionPhase(aRoom);
    const { PLAYERS } = require('./data/players');
    broadcastAuction(aRoom, 'auction_retention_phase', { players: PLAYERS });
    console.log(`[Auction] Retention started in ${auctionCode}`);

    if (allRetentionsDone(aRoom)) {
      startAuctionPhase(aRoom);
      broadcastAuction(aRoom, 'auction_all_retained', { phase: 'auction' });
      setTimeout(() => auctionPlayerUp(aRoom), 1500);
    }
  });

  // AUCTION: SUBMIT RETENTION
  socket.on('auction_submit_retention', ({ playerIds } = {}) => {
    const { auctionCode, auctionTeamKey } = socket.data || {};
    const aRoom = getAuctionRoom(auctionCode);
    if (!aRoom || aRoom.phase !== 'retention') return;
    if (!Array.isArray(playerIds)) return socket.emit('auction_error', { msg: 'Invalid player list' });

    const result = submitRetention(aRoom, auctionTeamKey, playerIds);
    if (result.error) return socket.emit('auction_error', { msg: result.error });

    broadcastAuction(aRoom, 'auction_retention_submitted', { teamKey: auctionTeamKey });

    if (allRetentionsDone(aRoom)) {
      startAuctionPhase(aRoom);
      broadcastAuction(aRoom, 'auction_all_retained', { phase: 'auction' });
      setTimeout(() => auctionPlayerUp(aRoom), 1500);
    }
  });

  // AUCTION: PLACE BID
  socket.on('auction_bid', ({ amount } = {}) => {
    if (!checkRate(socket.id, 'auction_bid', 30, 10_000)) return;
    const { auctionCode, auctionTeamKey } = socket.data || {};
    const aRoom = getAuctionRoom(auctionCode);
    if (!aRoom) return;
    if (aRoom.phase !== 'auction' && aRoom.phase !== 'second_round') return;

    const bidAmount = Math.floor(Number(amount));
    if (!Number.isFinite(bidAmount) || bidAmount <= 0)
      return socket.emit('auction_error', { msg: 'Invalid bid' });

    const result = placeBid(aRoom, auctionTeamKey, bidAmount);
    if (result.error) return socket.emit('auction_error', { msg: result.error });

    clearAuctionTimers(aRoom.code);
    broadcastAuction(aRoom, 'auction_bid_placed', {
      teamKey: auctionTeamKey, teamName: aRoom.teams[auctionTeamKey]?.playerName,
      bid: bidAmount, currentBid: aRoom.currentBid, currentBidder: aRoom.currentBidder,
    });

    const timers = { noSaleTimer: null, soldTimer: null };
    timers.noSaleTimer = setTimeout(() => resolveCurrentSlot(aRoom), 20_000);
    _auctionTimers.set(aRoom.code, timers);
    scheduleBotBids(aRoom);
  });

  // ── QUIZ EVENTS ────────────────────────────────────────────────────────────

  // QUIZ: CREATE ROOM
  socket.on('quiz_create', ({ name } = {}) => {
    if (!checkRate(socket.id, 'quiz_create', 5, 30_000))
      return socket.emit('quiz_error', { msg: 'Too many requests' });
    name = sanitizeName(name);
    if (!name) return socket.emit('quiz_error', { msg: 'Name required' });

    const qRoom = createQuizRoom(socket.id, name);
    socket.join(`quiz:${qRoom.code}`);
    socket.data = { ...socket.data, quizCode: qRoom.code };
    socket.emit('quiz_room_created', { code: qRoom.code, name });
    console.log(`[Quiz] Room ${qRoom.code} created by ${name}`);
  });

  // QUIZ: JOIN ROOM
  socket.on('quiz_join', ({ code, name } = {}) => {
    if (!checkRate(socket.id, 'quiz_join', 10, 30_000))
      return socket.emit('quiz_error', { msg: 'Too many requests' });
    code = sanitizeCode(code);
    name = sanitizeName(name);
    if (!name) return socket.emit('quiz_error', { msg: 'Name required' });

    const { room: qRoom, error } = joinQuizRoom(code, socket.id, name);
    if (error) return socket.emit('quiz_error', { msg: error });

    socket.join(`quiz:${qRoom.code}`);
    socket.data = { ...socket.data, quizCode: qRoom.code };

    const host = qRoom.players[0];
    socket.emit('quiz_joined', { code: qRoom.code, name, oppName: host.name });
    io.to(host.socketId).emit('quiz_opponent_joined', { oppName: name });
    console.log(`[Quiz] ${name} joined ${code}`);

    // Both players present — start immediately
    quizStartGame(qRoom);
  });

  // QUIZ: VS BOT
  socket.on('quiz_vs_bot', ({ name } = {}) => {
    if (!checkRate(socket.id, 'quiz_vs_bot', 5, 30_000))
      return socket.emit('quiz_error', { msg: 'Too many requests' });
    name = sanitizeName(name);
    if (!name) return socket.emit('quiz_error', { msg: 'Name required' });

    const qRoom = createBotQuizRoom(socket.id, name);
    socket.join(`quiz:${qRoom.code}`);
    socket.data = { ...socket.data, quizCode: qRoom.code };
    socket.emit('quiz_room_created', { code: qRoom.code, name, vsBot: true });
    console.log(`[Quiz] Bot game started for ${name} (room ${qRoom.code})`);

    // Start immediately
    quizStartGame(qRoom);
  });

  // QUIZ: SUBMIT ANSWER
  socket.on('quiz_answer', ({ answerIdx } = {}) => {
    if (!checkRate(socket.id, 'quiz_answer', 30, 60_000)) return;
    const { quizCode } = socket.data || {};
    const qRoom = getQuizRoom(quizCode);
    if (!qRoom || qRoom.status !== 'playing') return;

    const valid = typeof answerIdx === 'number' && answerIdx >= 0 && answerIdx <= 3;
    if (!valid) return;

    const accepted = submitAnswer(qRoom, socket.id, answerIdx);
    if (!accepted) return;

    // Acknowledge the player's answer (lock it in for them)
    socket.emit('quiz_answer_ack', { qIdx: qRoom.currentQ, answerIdx });

    if (allAnswered(qRoom)) {
      quizEndRound(qRoom);
    }
  });

  // ── Quiz helpers (defined inline so they close over `io`) ─────────────────

  function quizStartGame(qRoom) {
    qRoom.status = 'playing';
    // Notify all human players
    for (const p of qRoom.players) {
      if (p.socketId !== '__quiz_bot__') {
        io.to(p.socketId).emit('quiz_started', {
          totalQuestions: qRoom.questions.length,
          oppName: qRoom.players.find(x => x.socketId !== p.socketId)?.name,
        });
      }
    }
    setTimeout(() => quizSendQuestion(qRoom, 0), 600);
  }

  function quizSendQuestion(qRoom, idx) {
    if (qRoom.status !== 'playing') return;
    if (idx >= qRoom.questions.length) { quizFinishGame(qRoom); return; }

    startQuestion(qRoom, idx);
    const pq = getPublicQuestion(qRoom, idx);

    for (const p of qRoom.players) {
      if (p.socketId !== '__quiz_bot__') {
        io.to(p.socketId).emit('quiz_question', pq);
      }
    }

    // Schedule bot answer
    if (qRoom.isBot) {
      const delay = 2500 + Math.floor(Math.random() * 8000); // 2.5–10.5 s
      qRoom.botHandle = setTimeout(() => {
        qRoom.botHandle = null;
        if (qRoom.status !== 'playing') return;
        if (qRoom.currentQ !== idx) return;
        const botAnswer = generateBotAnswer(qRoom);
        submitAnswer(qRoom, '__quiz_bot__', botAnswer);
        if (allAnswered(qRoom)) quizEndRound(qRoom);
      }, delay);
    }

    // Hard timer: auto-resolve when time runs out
    qRoom.timerHandle = setTimeout(() => {
      qRoom.timerHandle = null;
      if (qRoom.status !== 'playing' || qRoom.currentQ !== idx) return;
      quizEndRound(qRoom);
    }, SECS_PER_Q * 1000 + 500); // +500ms grace period
  }

  function quizEndRound(qRoom) {
    if (qRoom.timerHandle) { clearTimeout(qRoom.timerHandle); qRoom.timerHandle = null; }
    if (qRoom.botHandle)   { clearTimeout(qRoom.botHandle);   qRoom.botHandle   = null; }

    const roundData = resolveQuizRound(qRoom);

    for (const p of qRoom.players) {
      if (p.socketId === '__quiz_bot__') continue;
      const myResult = roundData.playerResults.find(r => r.socketId === p.socketId);
      io.to(p.socketId).emit('quiz_round_result', {
        qIdx:          qRoom.currentQ,
        correctIdx:    roundData.correctIdx,
        correctAnswer: roundData.correctAnswer,
        myAnswerIdx:   myResult?.answerIdx ?? null,
        iGotIt:        myResult?.correct   ?? false,
        iWon:          roundData.winnerSocketId === p.socketId,
        winnerName:    roundData.scores.find(s => s.socketId === roundData.winnerSocketId)?.name || null,
        scores:        roundData.scores,
      });
    }

    const nextIdx = qRoom.currentQ + 1;
    if (nextIdx >= qRoom.questions.length) {
      setTimeout(() => quizFinishGame(qRoom), 3200);
    } else {
      setTimeout(() => quizSendQuestion(qRoom, nextIdx), 3200);
    }
  }

  function quizFinishGame(qRoom) {
    if (qRoom.status === 'finished') return;
    qRoom.status = 'finished';
    const result = getGameResult(qRoom);

    for (const p of qRoom.players) {
      if (p.socketId === '__quiz_bot__') continue;
      io.to(p.socketId).emit('quiz_game_over', {
        ...result,
        iWon: !result.isDraw && result.winnerSocketId === p.socketId,
      });
    }
    setTimeout(() => deleteQuizRoom(qRoom.code), 5 * 60_000);
  }

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
    // Auction cleanup
    const { auctionCode } = socket.data || {};
    if (auctionCode) {
      const aRoom = getAuctionRoom(auctionCode);
      if (aRoom && aRoom.phase !== 'results') {
        broadcastAuction(aRoom, 'auction_error', { msg: 'A player disconnected from the auction' });
      }
    }
    // Quiz cleanup
    const { quizCode } = socket.data || {};
    if (quizCode) {
      const qRoom = getQuizRoom(quizCode);
      if (qRoom && qRoom.status !== 'finished') {
        for (const p of (qRoom.players || [])) {
          if (p.socketId !== socket.id && p.socketId !== '__quiz_bot__') {
            io.to(p.socketId).emit('quiz_error', { msg: 'Opponent disconnected.' });
          }
        }
        if (qRoom.isBot) deleteQuizRoom(quizCode);
      }
    }
    console.log(`[-] ${socket.id}`);
  });
});

server.listen(PORT, () => console.log(`Pitch Perfect server → http://localhost:${PORT}`));
