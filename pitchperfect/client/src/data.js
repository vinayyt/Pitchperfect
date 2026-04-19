// Client-side stat/role metadata (players come from server)

export const STATS = [
  { key: 'matches',  label: 'Matches',        hi: true,  fmt: v => String(v ?? 0) },
  { key: 'runs',     label: 'Runs',           hi: true,  fmt: v => (v ?? 0).toLocaleString() },
  { key: 'avg',      label: 'Batting Avg',    hi: true,  fmt: v => (v ?? 0).toFixed(2) },
  { key: 'sr',       label: 'Strike Rate',    hi: true,  fmt: v => (v ?? 0).toFixed(1) },
  { key: 'fifties',  label: '50s',            hi: true,  fmt: v => String(v ?? 0) },
  { key: 'hundreds', label: '100s',           hi: true,  fmt: v => String(v ?? 0) },
  { key: 'hs',       label: 'Highest Score',  hi: true,  fmt: v => String(v ?? 0) },
  { key: 'wkts',     label: 'Wickets',        hi: true,  fmt: v => String(v ?? 0) },
  { key: 'econ',     label: 'Economy',        hi: false, fmt: v => (v ?? 0).toFixed(2) },
  { key: 'bowlAvg',  label: 'Bowling Avg',    hi: false, fmt: v => (v ?? 0).toFixed(2) },
  { key: 'bestFig',  label: 'Best Figures',   hi: true,  fmt: v => Array.isArray(v) ? `${v[0]}/${v[1]}` : (v || '—') },
  { key: 'fiveFor',  label: '5-wkt Hauls',    hi: true,  fmt: v => String(v ?? 0) },
];

export const STAT_BY_KEY = Object.fromEntries(STATS.map(s => [s.key, s]));

export const ROLES = {
  BAT: { label: 'Batter',      stats: ['matches','runs','avg','sr','fifties','hundreds','hs'] },
  BWL: { label: 'Bowler',      stats: ['matches','wkts','econ','bowlAvg','bestFig','fiveFor'] },
  ALL: { label: 'All-rounder', stats: ['matches','runs','avg','sr','wkts','econ','bestFig'] },
  WK:  { label: 'Keeper-Bat',  stats: ['matches','runs','avg','sr','fifties','hundreds','hs'] },
};

export const RARITIES = {
  BRONZE: { label: 'Bronze', color: '#b87333', glow: 'rgba(184,115,51,0.3)',   border: 'linear-gradient(135deg,#8a5424,#b87333,#6b3c19)' },
  SILVER: { label: 'Silver', color: '#c7ccd1', glow: 'rgba(199,204,209,0.35)', border: 'linear-gradient(135deg,#8d9298,#dfe3e6,#6d7278)' },
  GOLD:   { label: 'Gold',   color: '#e6b949', glow: 'rgba(230,185,73,0.45)',  border: 'linear-gradient(135deg,#a8862e,#f4d36b,#b8922f)' },
  LEGEND: { label: 'Legend', color: '#f4d36b', glow: 'rgba(244,211,107,0.6)',  border: 'linear-gradient(135deg,#d4a340,#fff1c0,#f4d36b,#b98c26,#fff1c0)' },
};

// 3 sample players for the home screen hero display (client-side only)
export const SAMPLE_PLAYERS = [
  { id:'s1', name:'Arjun Verenka',  team:'CKS', role:'BAT', league:'M', rarity:'LEGEND',
    matches:248,runs:8420,avg:45.78,sr:148.2,fifties:62,hundreds:11,hs:164,
    wkts:12,econ:9.10,bowlAvg:38.20,bestFig:[2,18],fiveFor:0,
    initials:'AV', jersey:8,
    teamObj:{name:'Coastal Kings',primary:'#d4a03a',secondary:'#0b1a3a',short:'CKS'},
    roleObj:{label:'Batter',stats:['matches','runs','avg','sr','fifties','hundreds','hs']},
    rarityObj:{label:'Legend',color:'#f4d36b',glow:'rgba(244,211,107,0.6)',border:'linear-gradient(135deg,#d4a340,#fff1c0,#f4d36b,#b98c26,#fff1c0)'}},
  { id:'s2', name:'Priya Saldanha', team:'HHK', role:'ALL', league:'W', rarity:'LEGEND',
    matches:186,runs:4120,avg:38.50,sr:131.4,fifties:28,hundreds:3,hs:121,
    wkts:148,econ:6.24,bowlAvg:19.80,bestFig:[5,12],fiveFor:4,
    initials:'PS', jersey:30,
    teamObj:{name:'Highland Hawks',primary:'#2e7d5a',secondary:'#0d1e18',short:'HHK'},
    roleObj:{label:'All-rounder',stats:['matches','runs','avg','sr','wkts','econ','bestFig']},
    rarityObj:{label:'Legend',color:'#f4d36b',glow:'rgba(244,211,107,0.6)',border:'linear-gradient(135deg,#d4a340,#fff1c0,#f4d36b,#b98c26,#fff1c0)'}},
  { id:'s3', name:'Rehan Qureshi',  team:'NNW', role:'BWL', league:'M', rarity:'LEGEND',
    matches:212,runs:410,avg:11.20,sr:102.5,fifties:0,hundreds:0,hs:32,
    wkts:284,econ:6.89,bowlAvg:21.40,bestFig:[6,14],fiveFor:8,
    initials:'RQ', jersey:15,
    teamObj:{name:'Northern Nawabs',primary:'#b8442e',secondary:'#1a1220',short:'NNW'},
    roleObj:{label:'Bowler',stats:['matches','wkts','econ','bowlAvg','bestFig','fiveFor']},
    rarityObj:{label:'Legend',color:'#f4d36b',glow:'rgba(244,211,107,0.6)',border:'linear-gradient(135deg,#d4a340,#fff1c0,#f4d36b,#b98c26,#fff1c0)'}},
];
