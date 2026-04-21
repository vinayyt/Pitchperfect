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
  // lower-is-better (econ, bowlAvg) — treat 0 as N/A, other player wins
  if (av === 0) return 'p2';
  if (bv === 0) return 'p1';
  return av < bv ? 'p1' : 'p2';
}

// ── Room ──────────────────────────────────────────────────────────────────────

class GameRoom {
  constructor(code, timeLimitSec = 600) {
    this.code           = code;
    this.timeLimitSec   = timeLimitSec;
    this.status         = 'waiting'; // waiting | playing | finished
    this.players        = [];        // [{socketId, name, deck, wonCount}]
    this.currentTurn    = 0;
    this.pot            = [];
    this.roundHistory   = [];
    this.startTime      = null;
    this.timerHandle    = null;
    this.botIdx         = null;      // null = no bot, 0 or 1 = bot player index
    this.botTurnHandle  = null;      // setTimeout handle for bot turn
    this._rematchVotes  = new Set(); // socket IDs that have voted rematch
  }

  addPlayer(socketId, name) {
    if (this.players.length >= 2) return false;
    this.players.push({ socketId, name, deck: [], wonCount: 0 });
    return true;
  }

  addBot() {
    if (this.players.length >= 2) return false;
    this.players.push({ socketId: '__bot__', name: 'Bot', deck: [], wonCount: 0 });
    this.botIdx = this.players.length - 1;
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
    this.currentTurn    = Math.random() < 0.5 ? 0 : 1;
    this.status         = 'playing';
    this.startTime      = Date.now();
    this._rematchVotes  = new Set();
  }

  getTimeLeft() {
    if (!this.startTime) return this.timeLimitSec;
    return Math.max(0, this.timeLimitSec - Math.floor((Date.now() - this.startTime) / 1000));
  }

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
      oppName:      opp.name,
      isVsBot:      this.botIdx !== null,
    };
  }

  // Resolve a round — turns ALWAYS alternate regardless of outcome.
  resolveRound(statKey) {
    const p0 = this.players[0];
    const p1 = this.players[1];
    if (!p0.deck.length || !p1.deck.length) return null;

    const card0  = p0.deck.shift();
    const card1  = p1.deck.shift();
    const result = compareStat(card0, card1, statKey);

    // Turns alternate every round — winner does NOT get an extra turn
    const nextTurn = 1 - this.currentTurn;

    if (result === 'tie') {
      this.pot.push(card0, card1);
    } else {
      const winnerIdx = result === 'p1' ? 0 : 1;
      const spoils    = [card0, card1, ...this.pot];
      this.players[winnerIdx].wonCount += spoils.length;
      this.pot = [];
    }

    const roundData = {
      statKey,
      statLabel: STAT_BY_KEY[statKey]?.label || statKey,
      card0, card1,
      result,
      potCount: this.pot.length,
      round: this.roundHistory.length + 1,
    };
    this.roundHistory.push(roundData);
    this.currentTurn = nextTurn;
    return roundData;
  }

  // Pick a random valid stat from the bot's top card, weighted by role
  pickBotStat() {
    if (this.botIdx === null) return null;
    const botCard = this.players[this.botIdx]?.deck[0];
    if (!botCard) return null;
    const roleStats = botCard.roleObj?.stats || ['runs', 'avg', 'sr'];
    const valid = roleStats.filter(s => {
      if (s === 'bestFig') return Array.isArray(botCard.bestFig) && botCard.bestFig[0] > 0;
      const v = botCard[s];
      return v !== undefined && v !== null && v !== 0;
    });
    const pool = valid.length > 0 ? valid : roleStats;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  getResult() {
    const s0 = this.players[0];
    const s1 = this.players[1];
    const t0 = s0.wonCount + s0.deck.length;
    const t1 = s1.wonCount + s1.deck.length;
    if (t0 === t1) return { winner: null, isDraw: true, scores: [t0, t1] };
    return {
      winner: t0 > t1 ? s0.name : s1.name,
      isDraw: false,
      scores: [t0, t1],
    };
  }
}

// ── Room registry ─────────────────────────────────────────────────────────────

const ROOMS    = new Map();
const MAX_ROOMS = 500; // guard against memory exhaustion

function makeCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do { code = Array.from({length:6}, () => chars[Math.floor(Math.random()*chars.length)]).join(''); }
  while (ROOMS.has(code));
  return code;
}

function createRoom(timeLimitSec) {
  if (ROOMS.size >= MAX_ROOMS) return null; // server at capacity
  const code = makeCode();
  ROOMS.set(code, new GameRoom(code, timeLimitSec));
  return code;
}

function getRoom(code)    { return ROOMS.get(code) || null; }
function deleteRoom(code) { ROOMS.delete(code); }
function getRoomCount()   { return ROOMS.size; }

module.exports = { createRoom, getRoom, deleteRoom, getRoomCount, GameRoom, compareStat };
