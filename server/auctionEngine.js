'use strict';
// Pitch Perfect – Auction Engine
// Pure state management — no timers, no I/O. All side-effects live in index.js.

const { PLAYERS, TEAMS } = require('./data/players');

const STARTING_BUDGET = 12000; // Lakhs  (= 120 Crore)
const MIN_INCREMENT   = 5;     // Lakhs
const MAX_ROOMS       = 20;
const MAX_SQUAD       = 25;
const MAX_FOREIGN     = 8;
const MAX_RETENTION   = 5;

const _rooms = new Map();

// ── Helpers ───────────────────────────────────────────────────────────────────

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do {
    code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (_rooms.has(code));
  return code;
}

// Build auction queue: WK → BAT → ALL → BWL, highest basePrice first within group
function buildQueue(excludeIds) {
  const roleOrder = ['WK', 'BAT', 'ALL', 'BWL'];
  const byRole = { WK: [], BAT: [], ALL: [], BWL: [] };
  for (const p of PLAYERS) {
    if (!excludeIds.has(p.id)) byRole[p.role]?.push(p);
  }
  const queue = [];
  for (const role of roleOrder) {
    byRole[role].sort((a, b) => b.basePrice - a.basePrice);
    queue.push(...byRole[role]);
  }
  return queue;
}

const BOT_NAMES = [
  'AuctionBot', 'BidMaster', 'SmartBid', 'CricketBot',
  'IPL_AI',     'TeamBot',   'QuickBid', 'BotOwner',
  'AutoSquad',  'TopBidder',
];

// ── Room creation ─────────────────────────────────────────────────────────────

function createAuctionRoom({ hostSocketId, hostName, teamKeys }) {
  if (_rooms.size >= MAX_ROOMS) return null;

  const code = genCode();

  // Build teams map – host occupies first teamKey
  const teams = {};
  for (const key of teamKeys) {
    teams[key] = {
      socketId:           key === teamKeys[0] ? hostSocketId : null,
      playerName:         key === teamKeys[0] ? hostName      : null,
      isBot:              false,
      budget:             STARTING_BUDGET,
      squad:              [],
      retentionSubmitted: false,
    };
  }

  const room = {
    code,
    hostSocketId,
    phase:            'lobby',  // lobby | retention | auction | second_round | results
    teamKeys,
    teams,
    auctionQueue:     [],       // ordered player objects
    unsoldPlayers:    [],       // not sold in round 1
    currentPlayerIdx: 0,
    currentBid:       0,
    currentBidder:    null,     // teamKey of highest bidder
    soldLog:          [],       // [{ player, soldTo, price }]
  };

  _rooms.set(code, room);
  return room;
}

function getAuctionRoom(code)   { return _rooms.get(code) || null; }
function deleteAuctionRoom(code){ _rooms.delete(code); }

// ── Lobby helpers ─────────────────────────────────────────────────────────────

function joinAuctionRoom(room, socketId, playerName, teamKey) {
  if (!room.teams[teamKey])               return { error: 'Invalid team' };
  if (room.teams[teamKey].socketId)        return { error: 'Team already taken' };
  if (room.phase !== 'lobby')             return { error: 'Game already started' };
  room.teams[teamKey].socketId   = socketId;
  room.teams[teamKey].playerName = playerName;
  return { ok: true };
}

function getLobbyState(room) {
  return {
    code:  room.code,
    phase: room.phase,
    teams: room.teamKeys.map(key => {
      const info = TEAMS[key] || {};
      const t    = room.teams[key];
      return {
        key,
        name:      info.name      || key,
        short:     info.short     || key,
        primary:   info.primary   || '#fff',
        secondary: info.secondary || '#000',
        owner:     t.playerName,
        isBot:     t.isBot,
      };
    }),
  };
}

// Fill unoccupied teams with bots
function fillWithBots(room) {
  let botIdx = 0;
  for (const key of room.teamKeys) {
    const t = room.teams[key];
    if (!t.socketId) {
      t.isBot       = true;
      t.socketId    = `__bot__:${key}`;
      t.playerName  = BOT_NAMES[botIdx % BOT_NAMES.length];
      botIdx++;
    }
  }
}

// ── Retention phase ───────────────────────────────────────────────────────────

function startRetentionPhase(room) {
  fillWithBots(room);
  room.phase = 'retention';

  // Bots auto-submit: 2–4 players from each league proportionally
  for (const key of room.teamKeys) {
    const t = room.teams[key];
    if (!t.isBot) continue;

    const count = 2 + Math.floor(Math.random() * 3); // 2–4
    const eligible = PLAYERS
      .filter(p => p.nationality === 'Indian')
      .sort(() => Math.random() - 0.5)
      .slice(0, count);

    let cost = 0;
    const retained = [];
    for (const p of eligible) {
      if (cost + p.basePrice > t.budget) break;
      cost += p.basePrice;
      retained.push({ ...p, retainedAt: p.basePrice, retained: true });
    }
    t.squad  = retained;
    t.budget -= cost;
    t.retentionSubmitted = true;
  }
}

function submitRetention(room, teamKey, retainedPlayerIds) {
  const t = room.teams[teamKey];
  if (!t)                               return { error: 'Invalid team' };
  if (t.retentionSubmitted)             return { error: 'Already submitted' };
  if (retainedPlayerIds.length > MAX_RETENTION)
    return { error: `Max ${MAX_RETENTION} retentions allowed` };

  let cost = 0;
  const retained = [];
  for (const id of retainedPlayerIds) {
    const p = PLAYERS.find(x => x.id === id);
    if (!p) return { error: `Unknown player: ${id}` };
    if (cost + p.basePrice > t.budget)  return { error: 'Retention exceeds budget' };
    cost += p.basePrice;
    retained.push({ ...p, retainedAt: p.basePrice, retained: true });
  }
  t.squad              = retained;
  t.budget            -= cost;
  t.retentionSubmitted = true;
  return { ok: true };
}

function allRetentionsDone(room) {
  return room.teamKeys.every(k => room.teams[k].retentionSubmitted);
}

// ── Auction phase ─────────────────────────────────────────────────────────────

function startAuctionPhase(room) {
  room.phase = 'auction';
  const retainedIds = new Set();
  for (const key of room.teamKeys) room.teams[key].squad.forEach(p => retainedIds.add(p.id));
  room.auctionQueue    = buildQueue(retainedIds);
  room.currentPlayerIdx = 0;
  room.currentBid      = 0;
  room.currentBidder   = null;
}

function getCurrentPlayer(room) {
  const q = room.phase === 'second_round' ? room.unsoldPlayers : room.auctionQueue;
  return q[room.currentPlayerIdx] || null;
}

function placeBid(room, teamKey, amount) {
  const t = room.teams[teamKey];
  if (!t) return { error: 'Invalid team' };

  const player = getCurrentPlayer(room);
  if (!player) return { error: 'No player up for auction' };

  const minBid = room.currentBid === 0
    ? player.basePrice
    : room.currentBid + MIN_INCREMENT;

  if (amount < minBid)          return { error: `Minimum bid is ${minBid}L` };
  if (amount > t.budget)        return { error: 'Insufficient budget' };
  if (teamKey === room.currentBidder) return { error: 'You are already the highest bidder' };

  // Squad-cap checks
  const foreignCount = t.squad.filter(p => p.nationality === 'Foreign').length;
  if (player.nationality === 'Foreign' && foreignCount >= MAX_FOREIGN)
    return { error: 'Foreign player cap (8) reached' };
  if (t.squad.length >= MAX_SQUAD)
    return { error: `Squad cap (${MAX_SQUAD}) reached` };

  room.currentBid    = amount;
  room.currentBidder = teamKey;
  return { ok: true, bid: amount, bidder: teamKey };
}

// Bot decides bid amount or returns null (pass)
function getBotBid(room, botTeamKey) {
  const player = getCurrentPlayer(room);
  if (!player) return null;

  const t = room.teams[botTeamKey];
  if (!t || !t.isBot)               return null;
  if (room.currentBidder === botTeamKey) return null; // already winning

  // Hard caps
  const foreignCount = t.squad.filter(p => p.nationality === 'Foreign').length;
  if (player.nationality === 'Foreign' && foreignCount >= MAX_FOREIGN) return null;
  if (t.squad.length >= MAX_SQUAD) return null;

  const minBid = room.currentBid === 0 ? player.basePrice : room.currentBid + MIN_INCREMENT;
  if (minBid > t.budget) return null;

  // Interest probability by rarity
  const prob = { LEGEND: 0.65, GOLD: 0.55, SILVER: 0.45, BRONZE: 0.35 }[player.rarity] ?? 0.45;
  if (Math.random() > prob) return null;

  // Random top-up: 0 – 100L above minimum (in MIN_INCREMENT steps)
  const headroom = Math.min(100, t.budget - minBid);
  if (headroom < 0) return null;
  const steps  = Math.floor(Math.random() * (headroom / MIN_INCREMENT + 1));
  const amount = minBid + steps * MIN_INCREMENT;
  return amount <= t.budget ? amount : null;
}

// Resolve current auction slot: sell to highest bidder or mark unsold
function sellCurrentPlayer(room) {
  const player = getCurrentPlayer(room);
  if (!player) return null;

  const result = { player };

  if (room.currentBidder) {
    const t = room.teams[room.currentBidder];
    t.squad.push({ ...player, soldAt: room.currentBid, retained: false });
    t.budget -= room.currentBid;
    result.sold    = true;
    result.soldTo  = room.currentBidder;
    result.price   = room.currentBid;
    room.soldLog.push({ player, soldTo: room.currentBidder, price: room.currentBid });
  } else {
    result.sold = false;
    if (room.phase !== 'second_round') {
      // Halve basePrice for second round
      room.unsoldPlayers.push({ ...player, basePrice: Math.max(5, Math.floor(player.basePrice / 2)) });
    }
  }

  room.currentPlayerIdx++;
  room.currentBid    = 0;
  room.currentBidder = null;

  // Determine next phase
  const q = room.phase === 'second_round' ? room.unsoldPlayers : room.auctionQueue;
  if (room.currentPlayerIdx >= q.length) {
    result.nextPhase = (room.phase === 'auction' && room.unsoldPlayers.length > 0)
      ? 'second_round'
      : 'results';
  }

  return result;
}

function startSecondRound(room) {
  room.phase            = 'second_round';
  room.currentPlayerIdx = 0;
  room.currentBid       = 0;
  room.currentBidder    = null;
}

// ── Results ───────────────────────────────────────────────────────────────────

function getTeamSummaries(room) {
  return room.teamKeys.map(key => {
    const t    = room.teams[key];
    const info = TEAMS[key] || {};
    return {
      teamKey:      key,
      teamName:     info.name      || key,
      teamShort:    info.short     || key,
      primary:      info.primary   || '#fff',
      secondary:    info.secondary || '#000',
      owner:        t.playerName,
      isBot:        t.isBot,
      budget:       t.budget,
      spent:        STARTING_BUDGET - t.budget,
      squad:        t.squad,
      squadSize:    t.squad.length,
      foreignCount: t.squad.filter(p => p.nationality === 'Foreign').length,
    };
  });
}

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
  createAuctionRoom,
  getAuctionRoom,
  deleteAuctionRoom,
  joinAuctionRoom,
  getLobbyState,
  fillWithBots,
  startRetentionPhase,
  submitRetention,
  allRetentionsDone,
  startAuctionPhase,
  getCurrentPlayer,
  placeBid,
  getBotBid,
  sellCurrentPlayer,
  startSecondRound,
  getTeamSummaries,
  STARTING_BUDGET,
  MIN_INCREMENT,
};
