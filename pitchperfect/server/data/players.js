// Pitch Perfect — fictional player catalogue (22 cards, 4 rarities)
'use strict';

const TEAMS = {
  CKS: { name: 'Coastal Kings',   primary: '#d4a03a', secondary: '#0b1a3a', short: 'CKS' },
  NNW: { name: 'Northern Nawabs', primary: '#b8442e', secondary: '#1a1220', short: 'NNW' },
  HHK: { name: 'Highland Hawks',  primary: '#2e7d5a', secondary: '#0d1e18', short: 'HHK' },
  DTR: { name: 'Delta Tigers',    primary: '#e0752b', secondary: '#1a0f06', short: 'DTR' },
  SBL: { name: 'Stormbreakers',   primary: '#4a6fb8', secondary: '#0a1428', short: 'SBL' },
  VRC: { name: 'Valley Royals',   primary: '#6b3f8f', secondary: '#150a22', short: 'VRC' },
};

const ROLES = {
  BAT: { label: 'Batter',       stats: ['matches','runs','avg','sr','fifties','hundreds','hs'] },
  BWL: { label: 'Bowler',       stats: ['matches','wkts','econ','bowlAvg','bestFig','fiveFor'] },
  ALL: { label: 'All-rounder',  stats: ['matches','runs','avg','sr','wkts','econ','bestFig'] },
  WK:  { label: 'Keeper-Bat',   stats: ['matches','runs','avg','sr','fifties','hundreds','hs'] },
};

const RARITIES = {
  BRONZE: { label: 'Bronze', key: 'BRONZE', color: '#b87333', glow: 'rgba(184,115,51,0.3)',   order: 0 },
  SILVER: { label: 'Silver', key: 'SILVER', color: '#c7ccd1', glow: 'rgba(199,204,209,0.35)', order: 1 },
  GOLD:   { label: 'Gold',   key: 'GOLD',   color: '#e6b949', glow: 'rgba(230,185,73,0.45)',  order: 2 },
  LEGEND: { label: 'Legend', key: 'LEGEND', color: '#f4d36b', glow: 'rgba(244,211,107,0.6)',  order: 3 },
};

const STATS = [
  { key: 'matches',  label: 'Matches',        hi: true,  fmt: v => String(v) },
  { key: 'runs',     label: 'Runs',           hi: true,  fmt: v => v.toLocaleString() },
  { key: 'avg',      label: 'Batting Avg',    hi: true,  fmt: v => v.toFixed(2) },
  { key: 'sr',       label: 'Strike Rate',    hi: true,  fmt: v => v.toFixed(1) },
  { key: 'fifties',  label: '50s',            hi: true,  fmt: v => String(v) },
  { key: 'hundreds', label: '100s',           hi: true,  fmt: v => String(v) },
  { key: 'hs',       label: 'Highest Score',  hi: true,  fmt: v => String(v) },
  { key: 'wkts',     label: 'Wickets',        hi: true,  fmt: v => String(v) },
  { key: 'econ',     label: 'Economy',        hi: false, fmt: v => v.toFixed(2) },
  { key: 'bowlAvg',  label: 'Bowling Avg',    hi: false, fmt: v => v.toFixed(2) },
  { key: 'bestFig',  label: 'Best Figures',   hi: true,  fmt: v => Array.isArray(v) ? `${v[0]}/${v[1]}` : String(v) },
  { key: 'fiveFor',  label: '5-wicket Hauls', hi: true,  fmt: v => String(v) },
];

const STAT_BY_KEY = Object.fromEntries(STATS.map(s => [s.key, s]));

const RAW_PLAYERS = [
  // LEGENDS
  { id:'p01', name:'Arjun Verenka',   team:'CKS', role:'BAT', league:'M', rarity:'LEGEND',
    matches:248, runs:8420, avg:45.78, sr:148.2, fifties:62, hundreds:11, hs:164,
    wkts:12,  econ:9.10, bowlAvg:38.20, bestFig:[2,18], fiveFor:0 },
  { id:'p02', name:'Priya Saldanha',  team:'HHK', role:'ALL', league:'W', rarity:'LEGEND',
    matches:186, runs:4120, avg:38.50, sr:131.4, fifties:28, hundreds:3,  hs:121,
    wkts:148, econ:6.24, bowlAvg:19.80, bestFig:[5,12], fiveFor:4 },
  { id:'p03', name:'Rehan Qureshi',   team:'NNW', role:'BWL', league:'M', rarity:'LEGEND',
    matches:212, runs:410,  avg:11.20, sr:102.5, fifties:0,  hundreds:0,  hs:32,
    wkts:284, econ:6.89, bowlAvg:21.40, bestFig:[6,14], fiveFor:8 },
  { id:'p04', name:'Nadia Oyelaran',  team:'DTR', role:'BAT', league:'W', rarity:'LEGEND',
    matches:164, runs:5980, avg:48.20, sr:142.8, fifties:44, hundreds:9,  hs:138,
    wkts:4,   econ:8.60, bowlAvg:42.10, bestFig:[1,12], fiveFor:0 },
  // GOLD
  { id:'p05', name:'Kavi Ambrose',    team:'SBL', role:'ALL', league:'M', rarity:'GOLD',
    matches:158, runs:2840, avg:32.10, sr:138.0, fifties:18, hundreds:2,  hs:104,
    wkts:96,  econ:7.42, bowlAvg:24.50, bestFig:[4,22], fiveFor:0 },
  { id:'p06', name:'Harini Velasco',  team:'CKS', role:'BWL', league:'W', rarity:'GOLD',
    matches:142, runs:280,  avg:9.60,  sr:96.2,  fifties:0,  hundreds:0,  hs:24,
    wkts:198, econ:5.84, bowlAvg:18.10, bestFig:[5,9],  fiveFor:6 },
  { id:'p07', name:'Dinuka Perera',   team:'VRC', role:'BAT', league:'M', rarity:'GOLD',
    matches:132, runs:4210, avg:41.20, sr:136.5, fifties:30, hundreds:5,  hs:128,
    wkts:0,   econ:0,    bowlAvg:0,    bestFig:[0,0],  fiveFor:0 },
  { id:'p08', name:'Meera Colaco',    team:'HHK', role:'WK',  league:'W', rarity:'GOLD',
    matches:128, runs:3640, avg:39.80, sr:144.1, fifties:24, hundreds:4,  hs:115,
    wkts:0,   econ:0,    bowlAvg:0,    bestFig:[0,0],  fiveFor:0 },
  { id:'p09', name:'Lokesh Thoriya',  team:'NNW', role:'BAT', league:'M', rarity:'GOLD',
    matches:174, runs:5120, avg:36.40, sr:152.9, fifties:38, hundreds:6,  hs:142,
    wkts:2,   econ:9.80, bowlAvg:58.0,  bestFig:[1,8],  fiveFor:0 },
  { id:'p10', name:'Surya Balakrish', team:'DTR', role:'BWL', league:'M', rarity:'GOLD',
    matches:156, runs:340,  avg:12.10, sr:108.4, fifties:0,  hundreds:0,  hs:28,
    wkts:214, econ:7.12, bowlAvg:22.60, bestFig:[5,18], fiveFor:5 },
  // SILVER
  { id:'p11', name:'Tendai Mwangi',   team:'SBL', role:'ALL', league:'M', rarity:'SILVER',
    matches:96,  runs:1820, avg:28.40, sr:128.6, fifties:10, hundreds:1,  hs:89,
    wkts:62,  econ:7.80, bowlAvg:26.40, bestFig:[3,19], fiveFor:0 },
  { id:'p12', name:'Yasmin al-Rawi',  team:'CKS', role:'BAT', league:'W', rarity:'SILVER',
    matches:88,  runs:2140, avg:31.60, sr:124.8, fifties:14, hundreds:1,  hs:102,
    wkts:0,   econ:0,    bowlAvg:0,    bestFig:[0,0],  fiveFor:0 },
  { id:'p13', name:'Freya Lindqvist', team:'VRC', role:'BWL', league:'W', rarity:'SILVER',
    matches:82,  runs:180,  avg:7.80,  sr:84.4,  fifties:0,  hundreds:0,  hs:18,
    wkts:112, econ:6.42, bowlAvg:20.80, bestFig:[4,14], fiveFor:2 },
  { id:'p14', name:'Javi Montes',     team:'NNW', role:'WK',  league:'M', rarity:'SILVER',
    matches:102, runs:2480, avg:29.80, sr:139.2, fifties:16, hundreds:1,  hs:94,
    wkts:0,   econ:0,    bowlAvg:0,    bestFig:[0,0],  fiveFor:0 },
  { id:'p15', name:'Oyinda Bassey',   team:'HHK', role:'ALL', league:'W', rarity:'SILVER',
    matches:78,  runs:1640, avg:26.80, sr:118.4, fifties:8,  hundreds:0,  hs:72,
    wkts:74,  econ:6.92, bowlAvg:23.60, bestFig:[4,26], fiveFor:1 },
  { id:'p16', name:'Bharat Solanki',  team:'DTR', role:'BAT', league:'M', rarity:'SILVER',
    matches:94,  runs:2680, avg:32.20, sr:130.5, fifties:20, hundreds:2,  hs:118,
    wkts:0,   econ:0,    bowlAvg:0,    bestFig:[0,0],  fiveFor:0 },
  // BRONZE
  { id:'p17', name:'Ishan Goyal',     team:'SBL', role:'BWL', league:'M', rarity:'BRONZE',
    matches:42,  runs:88,   avg:6.20,  sr:78.4,  fifties:0,  hundreds:0,  hs:14,
    wkts:48,  econ:8.24, bowlAvg:28.60, bestFig:[3,24], fiveFor:0 },
  { id:'p18', name:'Chetna Dubey',    team:'VRC', role:'BAT', league:'W', rarity:'BRONZE',
    matches:38,  runs:840,  avg:24.60, sr:114.2, fifties:5,  hundreds:0,  hs:68,
    wkts:0,   econ:0,    bowlAvg:0,    bestFig:[0,0],  fiveFor:0 },
  { id:'p19', name:'Rustam Okonkwo',  team:'CKS', role:'ALL', league:'M', rarity:'BRONZE',
    matches:46,  runs:720,  avg:21.40, sr:122.8, fifties:3,  hundreds:0,  hs:64,
    wkts:32,  econ:8.12, bowlAvg:30.20, bestFig:[3,28], fiveFor:0 },
  { id:'p20', name:'Amara Nkosi',     team:'HHK', role:'WK',  league:'W', rarity:'BRONZE',
    matches:34,  runs:680,  avg:22.80, sr:120.4, fifties:3,  hundreds:0,  hs:58,
    wkts:0,   econ:0,    bowlAvg:0,    bestFig:[0,0],  fiveFor:0 },
  { id:'p21', name:'Kabir Thackeray', team:'NNW', role:'BAT', league:'M', rarity:'BRONZE',
    matches:52,  runs:1140, avg:23.20, sr:118.6, fifties:6,  hundreds:0,  hs:72,
    wkts:0,   econ:0,    bowlAvg:0,    bestFig:[0,0],  fiveFor:0 },
  { id:'p22', name:'Zara Hoxha',      team:'DTR', role:'BWL', league:'W', rarity:'BRONZE',
    matches:36,  runs:42,   avg:5.20,  sr:72.8,  fifties:0,  hundreds:0,  hs:11,
    wkts:52,  econ:7.14, bowlAvg:24.80, bestFig:[4,19], fiveFor:1 },
];

// Enrich every player with derived objects and jersey number
const PLAYERS = RAW_PLAYERS.map(p => {
  const n = parseInt(p.id.slice(1), 10);
  return {
    ...p,
    initials: p.name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase(),
    jersey: ((n * 7) % 89) + 1,
    teamObj:   TEAMS[p.team],
    roleObj:   ROLES[p.role],
    rarityObj: RARITIES[p.rarity],
  };
});

module.exports = { PLAYERS, TEAMS, ROLES, RARITIES, STATS, STAT_BY_KEY };
