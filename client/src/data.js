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
  { id:'s1', name:'Smriti Mandhana', team:'RCBW', role:'BAT', league:'W', rarity:'LEGEND',
    matches:165,runs:4805,avg:32.70,sr:122.8,fifties:38,hundreds:1,hs:112,
    wkts:0,econ:0,bowlAvg:0,bestFig:[0,0],fiveFor:0,
    initials:'SM', jersey:18,
    teamObj:{name:'RCB Women',primary:'#EC1C24',secondary:'#1a1a1a',short:'RCB-W'},
    roleObj:{label:'Batter',stats:['matches','runs','avg','sr','fifties','hundreds','hs']},
    rarityObj:{label:'Legend',color:'#f4d36b',glow:'rgba(244,211,107,0.6)',border:'linear-gradient(135deg,#d4a340,#fff1c0,#f4d36b,#b98c26,#fff1c0)'}},
  { id:'s2', name:'Virat Kohli',     team:'RCB',  role:'BAT', league:'M', rarity:'LEGEND',
    matches:252,runs:8004,avg:37.25,sr:130.1,fifties:62,hundreds:8,hs:113,
    wkts:4,econ:8.28,bowlAvg:89.50,bestFig:[1,13],fiveFor:0,
    initials:'VK', jersey:18,
    teamObj:{name:'Royal Challengers Bengaluru',primary:'#EC1C24',secondary:'#1a1a1a',short:'RCB'},
    roleObj:{label:'Batter',stats:['matches','runs','avg','sr','fifties','hundreds','hs']},
    rarityObj:{label:'Legend',color:'#f4d36b',glow:'rgba(244,211,107,0.6)',border:'linear-gradient(135deg,#d4a340,#fff1c0,#f4d36b,#b98c26,#fff1c0)'}},
  { id:'s3', name:'Andre Russell',   team:'KKR',  role:'ALL', league:'M', rarity:'GOLD',
    matches:111,runs:2038,avg:29.68,sr:177.9,fifties:9,hundreds:0,hs:88,
    wkts:90,econ:9.10,bowlAvg:26.30,bestFig:[4,20],fiveFor:0,
    initials:'AR', jersey:12,
    teamObj:{name:'Kolkata Knight Riders',primary:'#3A225D',secondary:'#B3A123',short:'KKR'},
    roleObj:{label:'All-rounder',stats:['matches','runs','avg','sr','wkts','econ','bestFig']},
    rarityObj:{label:'Gold',color:'#e6b949',glow:'rgba(230,185,73,0.45)',border:'linear-gradient(135deg,#a8862e,#f4d36b,#b8922f)'}},
];
