'use strict';

const ALL_QUESTIONS    = require('./data/quizQuestions');
const QUESTIONS_PER_GAME = 10;
const SECS_PER_Q       = 15;   // seconds per question
const BOT_CORRECT_RATE = 0.62; // 62% correct rate for the bot

// ── Room store ────────────────────────────────────────────────────────────────

const _rooms = new Map();

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do {
    code = Array.from({ length: 6 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  } while (_rooms.has(code));
  return code;
}

// ── Question helpers ──────────────────────────────────────────────────────────

function pickQuestions(n) {
  return [...ALL_QUESTIONS]
    .sort(() => Math.random() - 0.5)
    .slice(0, n);
}

/** Strip the answer before sending to client */
function publicQuestion(q, idx, total) {
  return {
    qIdx:      idx,
    total,
    id:        q.id,
    q:         q.q,
    opts:      q.opts,
    cat:       q.cat,
    timeLimit: SECS_PER_Q,
  };
}

// ── Room lifecycle ────────────────────────────────────────────────────────────

function createQuizRoom(socketId, name) {
  const code = generateCode();
  const room = {
    code,
    status:    'waiting',   // 'waiting' | 'playing' | 'finished'
    isBot:     false,
    questions: pickQuestions(QUESTIONS_PER_GAME),
    currentQ:  -1,
    players: [
      { socketId, name, score: 0 },
    ],
    roundAnswers:      {},  // socketId → { answerIdx, ts }
    questionStartedAt: 0,
    timerHandle:       null,
    botHandle:         null,
  };
  _rooms.set(code, room);
  return room;
}

function createBotQuizRoom(socketId, name) {
  const code = generateCode();
  const room = {
    code,
    status:    'ready',     // start immediately
    isBot:     true,
    questions: pickQuestions(QUESTIONS_PER_GAME),
    currentQ:  -1,
    players: [
      { socketId, name, score: 0 },
      { socketId: '__quiz_bot__', name: '🤖 CricBot', score: 0 },
    ],
    roundAnswers:      {},
    questionStartedAt: 0,
    timerHandle:       null,
    botHandle:         null,
  };
  _rooms.set(code, room);
  return room;
}

function getQuizRoom(code) { return _rooms.get(code); }

function deleteQuizRoom(code) {
  const r = _rooms.get(code);
  if (r) {
    if (r.timerHandle) clearInterval(r.timerHandle);
    if (r.botHandle)   clearTimeout(r.botHandle);
  }
  _rooms.delete(code);
}

function joinQuizRoom(code, socketId, name) {
  const room = _rooms.get(code);
  if (!room)                          return { error: 'Room not found' };
  if (room.status !== 'waiting')      return { error: 'Game already started' };
  if (room.players.length >= 2)       return { error: 'Room is full' };
  room.players.push({ socketId, name, score: 0 });
  room.status = 'ready';
  return { room };
}

// ── In-game helpers ───────────────────────────────────────────────────────────

function startQuestion(room, idx) {
  room.currentQ         = idx;
  room.roundAnswers     = {};
  room.questionStartedAt = Date.now();
}

function getPublicQuestion(room, idx) {
  return publicQuestion(room.questions[idx], idx, room.questions.length);
}

function submitAnswer(room, socketId, answerIdx) {
  if (room.roundAnswers[socketId] !== undefined) return false; // already locked
  room.roundAnswers[socketId] = { answerIdx, ts: Date.now() };
  return true;
}

function allAnswered(room) {
  return room.players.every(p => room.roundAnswers[p.socketId] !== undefined);
}

/** Resolve the current round; awards point to the fastest correct answerer */
function resolveRound(room) {
  const q          = room.questions[room.currentQ];
  const correctIdx = q.a;

  const playerResults = room.players.map(p => {
    const ans     = room.roundAnswers[p.socketId];
    const answered = ans !== undefined;
    const correct  = answered && ans.answerIdx === correctIdx;
    return {
      socketId:  p.socketId,
      name:      p.name,
      answered,
      correct,
      answerIdx: answered ? ans.answerIdx : null,
      ts:        answered ? ans.ts : Infinity,
    };
  });

  // Fastest correct answer wins the point
  const correct = playerResults
    .filter(r => r.correct)
    .sort((a, b) => a.ts - b.ts);

  let winnerSocketId = null;
  if (correct.length > 0) {
    winnerSocketId = correct[0].socketId;
    const winner = room.players.find(p => p.socketId === winnerSocketId);
    if (winner) winner.score += 1;
  }

  return {
    correctIdx,
    correctAnswer: q.opts[correctIdx],
    winnerSocketId,
    playerResults,
    scores: room.players.map(p => ({
      socketId: p.socketId,
      name:     p.name,
      score:    p.score,
    })),
  };
}

/** Generate a bot answer (used server-side only) */
function generateBotAnswer(room) {
  const q       = room.questions[room.currentQ];
  const correct = Math.random() < BOT_CORRECT_RATE;
  if (correct) return q.a;
  const wrong = [0, 1, 2, 3].filter(i => i !== q.a);
  return wrong[Math.floor(Math.random() * wrong.length)];
}

function getTimeLeft(room) {
  if (!room.questionStartedAt) return SECS_PER_Q;
  const elapsed = (Date.now() - room.questionStartedAt) / 1000;
  return Math.max(0, SECS_PER_Q - elapsed);
}

// ── Final results ─────────────────────────────────────────────────────────────

function getGameResult(room) {
  const [p0, p1] = room.players;
  const isDraw   = p0.score === p1.score;
  const winner   = isDraw ? null : (p0.score > p1.score ? p0 : p1);
  return {
    isDraw,
    winner:   winner?.name || null,
    winnerSocketId: winner?.socketId || null,
    scores: room.players.map(p => ({ socketId: p.socketId, name: p.name, score: p.score })),
    totalQuestions: room.questions.length,
  };
}

module.exports = {
  createQuizRoom, createBotQuizRoom, getQuizRoom, deleteQuizRoom, joinQuizRoom,
  startQuestion, getPublicQuestion, submitAnswer, allAnswered,
  resolveRound, generateBotAnswer, getTimeLeft, getGameResult,
  SECS_PER_Q,
};
