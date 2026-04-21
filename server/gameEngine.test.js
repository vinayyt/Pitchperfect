'use strict';
const { GameRoom, compareStat, createRoom, getRoom, deleteRoom } = require('./gameEngine');

// ── compareStat ───────────────────────────────────────────────────────────────

describe('compareStat', () => {
  test('higher runs wins (hi: true)', () => {
    expect(compareStat({ runs: 500 }, { runs: 300 }, 'runs')).toBe('p1');
    expect(compareStat({ runs: 100 }, { runs: 400 }, 'runs')).toBe('p2');
  });

  test('equal runs is a tie', () => {
    expect(compareStat({ runs: 250 }, { runs: 250 }, 'runs')).toBe('tie');
  });

  test('lower economy wins (hi: false)', () => {
    expect(compareStat({ econ: 6.5 }, { econ: 8.2 }, 'econ')).toBe('p1');
    expect(compareStat({ econ: 9.1 }, { econ: 7.0 }, 'econ')).toBe('p2');
  });

  test('zero economy (N/A) loses to a real value', () => {
    expect(compareStat({ econ: 0 }, { econ: 7.5 }, 'econ')).toBe('p2');
    expect(compareStat({ econ: 7.5 }, { econ: 0 }, 'econ')).toBe('p1');
  });

  test('bestFig: more wickets wins', () => {
    expect(compareStat({ bestFig: [5, 20] }, { bestFig: [3, 15] }, 'bestFig')).toBe('p1');
    expect(compareStat({ bestFig: [2, 10] }, { bestFig: [4, 30] }, 'bestFig')).toBe('p2');
  });

  test('bestFig: same wickets — fewer runs wins', () => {
    expect(compareStat({ bestFig: [4, 18] }, { bestFig: [4, 25] }, 'bestFig')).toBe('p1');
    expect(compareStat({ bestFig: [4, 30] }, { bestFig: [4, 22] }, 'bestFig')).toBe('p2');
  });

  test('bestFig: identical → tie', () => {
    expect(compareStat({ bestFig: [3, 20] }, { bestFig: [3, 20] }, 'bestFig')).toBe('tie');
  });

  test('unknown stat key → tie', () => {
    expect(compareStat({ foo: 99 }, { foo: 1 }, 'foo')).toBe('tie');
  });

  test('higher strike rate wins', () => {
    expect(compareStat({ sr: 180 }, { sr: 130 }, 'sr')).toBe('p1');
  });

  test('higher wickets wins', () => {
    expect(compareStat({ wkts: 200 }, { wkts: 150 }, 'wkts')).toBe('p1');
  });
});

// ── GameRoom helpers ──────────────────────────────────────────────────────────

function makeRoom() {
  const room = new GameRoom('TSTCDE', 300);
  room.addPlayer('sock1', 'Alice');
  room.addPlayer('sock2', 'Bob');
  room.startGame('all');
  return room;
}

function forceTurn(room, idx) {
  room.currentTurn = idx;
}

// ── Turn alternation ──────────────────────────────────────────────────────────

describe('GameRoom — alternating turns', () => {
  test('turn switches to the other player after a win', () => {
    const room = makeRoom();
    const initial = room.currentTurn;
    // Find a stat where player[currentTurn]'s card wins
    const card = room.players[initial].deck[0];
    const statKey = card.roleObj?.stats?.[0] || 'runs';
    room.resolveRound(statKey);
    expect(room.currentTurn).toBe(1 - initial);
  });

  test('turn switches even when p2 wins', () => {
    const room = makeRoom();
    forceTurn(room, 0);
    room.resolveRound('matches'); // doesn't matter who wins
    expect(room.currentTurn).toBe(1);
  });

  test('turn switches on a tie (pot round)', () => {
    const room = makeRoom();
    // Force both top cards to have identical runs → guaranteed tie on 'runs'
    room.players[0].deck[0].runs = 999;
    room.players[1].deck[0].runs = 999;
    const initial = room.currentTurn;
    room.resolveRound('runs');
    expect(room.currentTurn).toBe(1 - initial);
    expect(room.pot.length).toBe(2);
  });

  test('alternates correctly over multiple rounds', () => {
    const room = makeRoom();
    const turns = [];
    turns.push(room.currentTurn);
    for (let i = 0; i < 4; i++) {
      const card = room.players[room.currentTurn].deck[0];
      const stat = card.roleObj?.stats?.[0] || 'runs';
      room.resolveRound(stat);
      turns.push(room.currentTurn);
    }
    // Each consecutive turn should differ
    for (let i = 1; i < turns.length; i++) {
      expect(turns[i]).toBe(1 - turns[i - 1]);
    }
  });
});

// ── Pot mechanics ─────────────────────────────────────────────────────────────

describe('GameRoom — pot', () => {
  test('pot cards go to winner of next non-tie round', () => {
    const room = makeRoom();
    // Force a tie
    room.players[0].deck[0].runs = 500;
    room.players[1].deck[0].runs = 500;
    room.resolveRound('runs');
    expect(room.pot.length).toBe(2);

    // Force p0 to win the next round
    room.players[0].deck[0].runs = 9999;
    room.players[1].deck[0].runs = 1;
    const before = room.players[0].wonCount;
    room.resolveRound('runs');
    // p0 should have won 4 cards (2 pot + 2 new)
    expect(room.players[0].wonCount).toBe(before + 4);
    expect(room.pot.length).toBe(0);
  });
});

// ── Card dealing ──────────────────────────────────────────────────────────────

describe('GameRoom — startGame', () => {
  test('cards are split evenly', () => {
    const room = new GameRoom('TCODE2', 300);
    room.addPlayer('s1', 'P1');
    room.addPlayer('s2', 'P2');
    room.startGame('all');
    expect(room.players[0].deck.length).toBe(room.players[1].deck.length);
  });

  test('men filter returns only male players', () => {
    const room = new GameRoom('TCODE3', 300);
    room.addPlayer('s1', 'P1');
    room.addPlayer('s2', 'P2');
    room.startGame('men');
    const allMen = [...room.players[0].deck, ...room.players[1].deck].every(p => p.league === 'M');
    expect(allMen).toBe(true);
  });

  test('women filter returns only female players', () => {
    const room = new GameRoom('TCODE4', 300);
    room.addPlayer('s1', 'P1');
    room.addPlayer('s2', 'P2');
    room.startGame('women');
    const allWomen = [...room.players[0].deck, ...room.players[1].deck].every(p => p.league === 'W');
    expect(allWomen).toBe(true);
  });
});

// ── getResult ─────────────────────────────────────────────────────────────────

describe('GameRoom — getResult', () => {
  test('player with more cards wins', () => {
    const room = makeRoom();
    room.players[0].wonCount = 30;
    room.players[1].wonCount = 10;
    room.players[0].deck = [];
    room.players[1].deck = [];
    const res = room.getResult();
    expect(res.isDraw).toBe(false);
    expect(res.winner).toBe('Alice');
  });

  test('equal cards → draw', () => {
    const room = makeRoom();
    room.players[0].wonCount = 20;
    room.players[1].wonCount = 20;
    room.players[0].deck = [];
    room.players[1].deck = [];
    const res = room.getResult();
    expect(res.isDraw).toBe(true);
  });
});

// ── Bot ───────────────────────────────────────────────────────────────────────

describe('GameRoom — bot', () => {
  test('addBot sets botIdx correctly', () => {
    const room = new GameRoom('BOTTEST', 300);
    room.addPlayer('human', 'Alice');
    room.addBot();
    expect(room.botIdx).toBe(1);
    expect(room.players[1].name).toBe('Bot');
    expect(room.players[1].socketId).toBe('__bot__');
  });

  test('pickBotStat returns a valid non-null string', () => {
    const room = new GameRoom('BOTTEST2', 300);
    room.addPlayer('human', 'Alice');
    room.addBot();
    room.startGame('all');
    const stat = room.pickBotStat();
    expect(typeof stat).toBe('string');
    expect(stat.length).toBeGreaterThan(0);
  });

  test('pickBotStat returns stat from card role', () => {
    const room = new GameRoom('BOTTEST3', 300);
    room.addPlayer('human', 'Alice');
    room.addBot();
    room.startGame('all');
    const botCard = room.players[room.botIdx].deck[0];
    const roleStats = botCard.roleObj?.stats || [];
    const stat = room.pickBotStat();
    expect(roleStats).toContain(stat);
  });

  test('bot cannot be added twice', () => {
    const room = new GameRoom('BOTTEST4', 300);
    room.addPlayer('human', 'Alice');
    const first  = room.addBot();
    const second = room.addBot();
    expect(first).toBe(true);
    expect(second).toBe(false);
    expect(room.players.length).toBe(2);
  });

  test('getStateForPlayer reflects isVsBot', () => {
    const room = new GameRoom('BOTTEST5', 300);
    room.addPlayer('human', 'Alice');
    room.addBot();
    room.startGame('all');
    const state = room.getStateForPlayer(0);
    expect(state.isVsBot).toBe(true);
    expect(state.oppName).toBe('Bot');
  });
});

// ── Rematch votes (Set-based dedup) ──────────────────────────────────────────

describe('GameRoom — rematch vote dedup', () => {
  test('same socket cannot vote twice', () => {
    const room = makeRoom();
    room._rematchVotes.add('sock1');
    room._rematchVotes.add('sock1'); // duplicate
    expect(room._rematchVotes.size).toBe(1);
  });

  test('two different sockets complete the vote', () => {
    const room = makeRoom();
    room._rematchVotes.add('sock1');
    room._rematchVotes.add('sock2');
    expect(room._rematchVotes.size).toBe(2);
  });
});

// ── Room registry ─────────────────────────────────────────────────────────────

describe('createRoom / getRoom / deleteRoom', () => {
  test('created room is retrievable by code', () => {
    const code = createRoom(300);
    expect(code).toBeTruthy();
    const room = getRoom(code);
    expect(room).toBeTruthy();
    expect(room.code).toBe(code);
    deleteRoom(code);
  });

  test('getRoom returns null for unknown code', () => {
    expect(getRoom('XXXXXX')).toBeNull();
  });

  test('deleteRoom removes the room', () => {
    const code = createRoom(300);
    deleteRoom(code);
    expect(getRoom(code)).toBeNull();
  });

  test('room codes are 6 characters', () => {
    const code = createRoom(300);
    expect(code).toHaveLength(6);
    deleteRoom(code);
  });
});
