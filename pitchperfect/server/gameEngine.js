'use strict';
const { PLAYERS, STAT_BY_KEY } = require('./data/players');

// ── Helpers ───────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Compare two cards on a given stat. Returns 'p1' | 'p2' | 'tie'
function compareStat(a, b, key) {
  const meta = STAT_BY_KEY[key];
  if (!meta) return 'tie';

  if (key === 'bestFig') {
    // [wickets, runs] — more wickets wins, then fewer runs wins
    const [aw, ar] = Array.isArray(a.bestFig) ? a.bestFig : [0, 0];
    const [bw, br] = Array.isArray(b.bestFig) ? b.bestFig : [0, 0];
    if (aw !== bw) return aw > bw ? 'p1' : 'p2';
    if (ar !== br) return ar < br ? 'p1' : 'p2';
    return 'tie';
  }

  const av = a[key] ?? 0;
  const bv = b[key] ?? 0;
  if (av === bv) return 'tie';
  if (meta.hi) return av > bv ? 'p1' : 'p2';
  // lower-is-better (econ, bowlAvg) — skip zeroes (0 means N/A)
  if (av === 0) return 'p2';
  if (bv === 0) return 'p1';
  return av < bv ? 'p1' : 'p2';
}

// ── Room ──────────────────────────────────────────────────────────────────────

class GameRoom {
  constructor(code, timeLimitSec = 600) {
    this.code         = code;
    this.timeLimitSec = timeLimitSec;
    this.status       = 'waiting'; // waiting | playing | finished
    this.players      = [];        // [{socketId, name, deck, wonCount}]
    this.currentTurn  = 0;         // index into players[]
    this.pot          = [];        // cards in tie-pot
    this.roundHistory = [];
    this.startTime    = null;
    this.timerHandle  = null;
  }

  addPlayer(socketId, name) {
    if (this.players.length >= 2) return false;
    this.players.push({ socketId, name, deck: [], wonCount: 0 });
    return true;
  }

  isFull() { return this.players.length === 2; }

  startGame(filter = 'all') {
    let pool = PLAYERS;
    if (filter === 'men')   pool = PLAYERS.filter(p => p.league === 'M');
    if (filter === 'women') pool = PLAYERS.filter(p => p.league === 'W');
    if (pool.length % 2 !== 0) pool = pool.slice(0, -1);
    const deck = shuffle(pool);
    const mid  = deck.length / 2;
    this.players[0].deck = deck.slice(0, mid);
    this.players[1].deck = deck.slice(mid);
    this.currentTurn = Math.random() < 0.5 ? 0 : 1;
    this.status    = 'playing';
    this.startTime = Date.now();
  }

  getTimeLeft() {
    if (!this.startTime) return this.timeLimitSec;
    return Math.max(0, this.timeLimitSec - Math.floor((Date.now() - this.startTime) / 1000));
  }

  // State snapshot visible to player at playerIdx
  getStateForPlayer(playerIdx) {
    const me  = this.players[playerIdx];
    const opp = this.players[1 - playerIdx];
    return {
      myTopCard:    me.deck[0]  || null,
      oppTopCard:   opp.deck[0] || null,
      myDeckCount:  me.deck.length,
      oppDeckCount: opp.deck.length,
      myWon:        me.wonCount,
      oppWon:       opp.wonCount,
      potCount:     this.pot.length,
      isMyTurn:     this.currentTurn === playerIdx,
      timeLeft:     this.getTimeLeft(),
      roundCount:   this.roundHistory.length,
    };
  }

  // Resolve a round. Returns round summary or null on error.
  resolveRound(statKey) {
    const p0 = this.players[0];
    const p1 = this.players[1];
    if (!p0.deck.length || !p1.deck.length) return null;

    const card0 = p0.deck.shift();
    const card1 = p1.deck.shift();
    const result = compareStat(card0, card1, statKey);

    let nextTurn = this.currentTurn; // tie: same picker
    if (result === 'tie') {
      this.pot.push(card0, card1);
    } else {
      const winnerIdx = result === 'p1' ? 0 : 1;
      const spoils    = [card0, card1, ...this.pot];
      this.players[winnerIdx].wonCount += spoils.length;
      this.pot = [];
      nextTurn = winnerIdx; // winner picks next
    }

    const roundData = {
      statKey,
      statLabel: STAT_BY_KEY[statKey]?.label || statKey,
      card0, card1,
      result,        // 'p1' | 'p2' | 'tie'
      potCount: this.pot.length,
      round: this.roundHistory.length + 1,
    };
    this.roundHistory.push(roundData);
    this.currentTurn = nextTurn;
    return roundData;
  }

  getResult() {
    const s0 = this.players[0];
    const s1 = this.players[1];
    const t0 = s0.wonCount + s0.deck.length;
    const t1 = s1.wonCount + s1.deck.length;
    if (t0 === t1) return { winner: null, isDraw: true, scores: [t0, t1] };
    return {
      winner:  t0 > t1 ? s0.name : s1.name,
      isDraw:  false,
      scores:  [t0, t1],
    };
  }
}

// ── Room registry ─────────────────────────────────────────────────────────────

const ROOMS = new Map();

function makeCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do { code = Array.from({length:6}, () => chars[Math.floor(Math.random()*chars.length)]).join(''); }
  while (ROOMS.has(code));
  return code;
}

function createRoom(timeLimitSec) {
  const code = makeCode();
  ROOMS.set(code, new GameRoom(code, timeLimitSec));
  return code;
}

function getRoom(code)    { return ROOMS.get(code) || null; }
function deleteRoom(code) { ROOMS.delete(code); }

module.exports = { createRoom, getRoom, deleteRoom };
