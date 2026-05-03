// Pitch Perfect — 80 IPL/WPL players with real career stats
'use strict';

const TEAMS = {
  // Men's IPL
  CSK:  { name: 'Chennai Super Kings',        primary: '#f5c542', secondary: '#1e2c56', short: 'CSK'  },
  MI:   { name: 'Mumbai Indians',             primary: '#005DA0', secondary: '#d4a017', short: 'MI'   },
  RCB:  { name: 'Royal Challengers Bengaluru',primary: '#EC1C24', secondary: '#1a1a1a', short: 'RCB'  },
  KKR:  { name: 'Kolkata Knight Riders',      primary: '#3A225D', secondary: '#B3A123', short: 'KKR'  },
  SRH:  { name: 'Sunrisers Hyderabad',        primary: '#F7A721', secondary: '#1a1a1a', short: 'SRH'  },
  DC:   { name: 'Delhi Capitals',             primary: '#17479E', secondary: '#EF1E25', short: 'DC'   },
  PBKS: { name: 'Punjab Kings',               primary: '#ED1F27', secondary: '#1a1a1a', short: 'PBKS' },
  RR:   { name: 'Rajasthan Royals',           primary: '#E91F7E', secondary: '#254AA5', short: 'RR'   },
  GT:   { name: 'Gujarat Titans',             primary: '#C8A951', secondary: '#1B2133', short: 'GT'   },
  LSG:  { name: 'Lucknow Super Giants',       primary: '#54B3D6', secondary: '#A72B1E', short: 'LSG'  },
  // Women's WPL
  MIW:  { name: 'MI Women',                   primary: '#005DA0', secondary: '#d4a017', short: 'MI-W' },
  DCW:  { name: 'Delhi Capitals Women',       primary: '#17479E', secondary: '#EF1E25', short: 'DC-W' },
  RCBW: { name: 'RCB Women',                  primary: '#EC1C24', secondary: '#1a1a1a', short: 'RCB-W'},
  UPW:  { name: 'UP Warriorz',               primary: '#8B0000', secondary: '#FFD700', short: 'UP-W' },
  GTW:  { name: 'Gujarat Giants',             primary: '#C8A951', secondary: '#1B2133', short: 'GG-W' },
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

// ── 80 players: 50 men (IPL) + 30 women (WPL / career T20) ──────────────────
// Stats: IPL career through IPL 2026 for men; WPL 2025 + career T20 for women
const RAW_PLAYERS = [

  // ════════════════════════════════ MEN · LEGEND (6) ════════════════════════════
  { id:'m01', name:'Virat Kohli',       team:'RCB',  role:'BAT', league:'M', rarity:'LEGEND',
    matches:267, runs:8661, avg:39.55, sr:132.9, fifties:63, hundreds:8,  hs:113,
    wkts:4,   econ:8.28, bowlAvg:89.50, bestFig:[1,13], fiveFor:0, nationality:'Indian', basePrice:200 },

  { id:'m02', name:'MS Dhoni',          team:'CSK',  role:'WK',  league:'M', rarity:'LEGEND',
    matches:278, runs:5439, avg:38.30, sr:135.9, fifties:24, hundreds:0,  hs:84,
    wkts:0,   econ:0,    bowlAvg:0,     bestFig:[0,0],  fiveFor:0, nationality:'Indian', basePrice:200 },

  { id:'m03', name:'Rohit Sharma',      team:'MI',   role:'BAT', league:'M', rarity:'LEGEND',
    matches:276, runs:7183, avg:29.93, sr:140.0, fifties:48, hundreds:2,  hs:109,
    wkts:15,  econ:8.31, bowlAvg:35.20, bestFig:[2,22], fiveFor:0, nationality:'Indian', basePrice:200 },

  { id:'m04', name:'AB de Villiers',    team:'RCB',  role:'WK',  league:'M', rarity:'LEGEND',
    matches:184, runs:5162, avg:39.71, sr:151.7, fifties:40, hundreds:3,  hs:133,
    wkts:0,   econ:0,    bowlAvg:0,     bestFig:[0,0],  fiveFor:0, nationality:'Foreign', basePrice:175 },

  { id:'m05', name:'David Warner',      team:'SRH',  role:'BAT', league:'M', rarity:'LEGEND',
    matches:184, runs:6565, avg:40.52, sr:139.8, fifties:62, hundreds:4,  hs:126,
    wkts:1,   econ:8.00, bowlAvg:56.00, bestFig:[1,20], fiveFor:0, nationality:'Foreign', basePrice:175 },

  { id:'m06', name:'Lasith Malinga',    team:'MI',   role:'BWL', league:'M', rarity:'LEGEND',
    matches:122, runs:38,   avg:4.75,  sr:62.0,  fifties:0,  hundreds:0,  hs:14,
    wkts:170, econ:7.14, bowlAvg:19.80, bestFig:[5,13], fiveFor:1, nationality:'Foreign', basePrice:175 },

  // ════════════════════════════════ MEN · GOLD (12) ═════════════════════════════
  { id:'m07', name:'Suresh Raina',      team:'CSK',  role:'ALL', league:'M', rarity:'GOLD',
    matches:205, runs:5528, avg:32.52, sr:136.7, fifties:38, hundreds:1,  hs:100,
    wkts:36,  econ:8.06, bowlAvg:31.00, bestFig:[2,13], fiveFor:0, nationality:'Indian', basePrice:125 },

  { id:'m08', name:'Andre Russell',     team:'KKR',  role:'ALL', league:'M', rarity:'GOLD',
    matches:134, runs:2604, avg:28.30, sr:174.1, fifties:12, hundreds:0,  hs:88,
    wkts:121, econ:9.50, bowlAvg:27.00, bestFig:[4,20], fiveFor:0, nationality:'Foreign', basePrice:150 },

  { id:'m09', name:'Jasprit Bumrah',    team:'MI',   role:'BWL', league:'M', rarity:'GOLD',
    matches:145, runs:52,   avg:5.78,  sr:75.0,  fifties:0,  hundreds:0,  hs:10,
    wkts:183, econ:7.25, bowlAvg:22.02, bestFig:[5,10], fiveFor:2, nationality:'Indian', basePrice:150 },

  { id:'m10', name:'Rashid Khan',       team:'GT',   role:'BWL', league:'M', rarity:'GOLD',
    matches:141, runs:424,  avg:16.40, sr:145.0, fifties:0,  hundreds:0,  hs:40,
    wkts:164, econ:7.11, bowlAvg:23.90, bestFig:[4,24], fiveFor:0, nationality:'Foreign', basePrice:150 },

  { id:'m11', name:'Ravindra Jadeja',   team:'CSK',  role:'ALL', league:'M', rarity:'GOLD',
    matches:256, runs:3000, avg:26.20, sr:127.6, fifties:9,  hundreds:0,  hs:62,
    wkts:172, econ:7.80, bowlAvg:29.70, bestFig:[5,16], fiveFor:1, nationality:'Indian', basePrice:150 },

  { id:'m12', name:'Yuzvendra Chahal',  team:'RR',   role:'BWL', league:'M', rarity:'GOLD',
    matches:179, runs:78,   avg:5.20,  sr:86.7,  fifties:0,  hundreds:0,  hs:18,
    wkts:224, econ:8.00, bowlAvg:23.03, bestFig:[5,40], fiveFor:1, nationality:'Indian', basePrice:125 },

  { id:'m13', name:'KL Rahul',          team:'LSG',  role:'WK',  league:'M', rarity:'GOLD',
    matches:155, runs:5410, avg:45.08, sr:136.1, fifties:42, hundreds:5,  hs:132,
    wkts:0,   econ:0,    bowlAvg:0,     bestFig:[0,0],  fiveFor:0, nationality:'Indian', basePrice:150 },

  { id:'m14', name:'Jos Buttler',       team:'RR',   role:'WK',  league:'M', rarity:'GOLD',
    matches:126, runs:4321, avg:40.01, sr:163.0, fifties:26, hundreds:7,  hs:124,
    wkts:0,   econ:0,    bowlAvg:0,     bestFig:[0,0],  fiveFor:0, nationality:'Foreign', basePrice:150 },

  { id:'m15', name:'Suryakumar Yadav',  team:'MI',   role:'BAT', league:'M', rarity:'GOLD',
    matches:150, runs:3594, avg:32.10, sr:145.3, fifties:24, hundreds:2,  hs:117,
    wkts:0,   econ:0,    bowlAvg:0,     bestFig:[0,0],  fiveFor:0, nationality:'Indian', basePrice:150 },

  { id:'m16', name:'Shubman Gill',      team:'GT',   role:'BAT', league:'M', rarity:'GOLD',
    matches:118, runs:3866, avg:37.22, sr:138.7, fifties:26, hundreds:4,  hs:130,
    wkts:0,   econ:0,    bowlAvg:0,     bestFig:[0,0],  fiveFor:0, nationality:'Indian', basePrice:125 },

  { id:'m17', name:'Bhuvneshwar Kumar', team:'SRH',  role:'BWL', league:'M', rarity:'GOLD',
    matches:195, runs:120,  avg:7.06,  sr:78.4,  fifties:0,  hundreds:0,  hs:19,
    wkts:205, econ:7.72, bowlAvg:27.25, bestFig:[5,19], fiveFor:1, nationality:'Indian', basePrice:125 },

  { id:'m18', name:'Hardik Pandya',     team:'MI',   role:'ALL', league:'M', rarity:'GOLD',
    matches:155, runs:2816, avg:28.44, sr:163.5, fifties:10, hundreds:0,  hs:91,
    wkts:80,  econ:9.23, bowlAvg:35.10, bestFig:[3,17], fiveFor:0, nationality:'Indian', basePrice:150 },

  // ════════════════════════════════ MEN · SILVER (18) ═══════════════════════════
  { id:'m19', name:'Faf du Plessis',    team:'RCB',  role:'BAT', league:'M', rarity:'SILVER',
    matches:130, runs:4773, avg:39.00, sr:136.2, fifties:39, hundreds:2,  hs:96,
    wkts:0,   econ:0,    bowlAvg:0,     bestFig:[0,0],  fiveFor:0, nationality:'Foreign', basePrice:100 },

  { id:'m20', name:'Rishabh Pant',      team:'DC',   role:'WK',  league:'M', rarity:'SILVER',
    matches:131, runs:3700, avg:33.94, sr:140.0, fifties:20, hundreds:2,  hs:128,
    wkts:0,   econ:0,    bowlAvg:0,     bestFig:[0,0],  fiveFor:0, nationality:'Indian', basePrice:100 },

  { id:'m21', name:'Ruturaj Gaikwad',   team:'CSK',  role:'BAT', league:'M', rarity:'SILVER',
    matches:91,  runs:2970, avg:38.00, sr:140.8, fifties:22, hundreds:2,  hs:108,
    wkts:0,   econ:0,    bowlAvg:0,     bestFig:[0,0],  fiveFor:0, nationality:'Indian', basePrice:100 },

  { id:'m22', name:'Ishan Kishan',      team:'MI',   role:'WK',  league:'M', rarity:'SILVER',
    matches:105, runs:2644, avg:28.72, sr:136.8, fifties:14, hundreds:2,  hs:99,
    wkts:0,   econ:0,    bowlAvg:0,     bestFig:[0,0],  fiveFor:0, nationality:'Indian', basePrice:75 },

  { id:'m23', name:'Shreyas Iyer',      team:'KKR',  role:'BAT', league:'M', rarity:'SILVER',
    matches:115, runs:3217, avg:32.84, sr:130.5, fifties:24, hundreds:1,  hs:96,
    wkts:0,   econ:0,    bowlAvg:0,     bestFig:[0,0],  fiveFor:0, nationality:'Indian', basePrice:100 },

  { id:'m24', name:'Axar Patel',        team:'DC',   role:'ALL', league:'M', rarity:'SILVER',
    matches:162, runs:1420, avg:19.73, sr:133.5, fifties:2,  hundreds:0,  hs:64,
    wkts:132, econ:6.88, bowlAvg:26.70, bestFig:[4,21], fiveFor:0, nationality:'Indian', basePrice:75 },

  { id:'m25', name:'Kuldeep Yadav',     team:'DC',   role:'BWL', league:'M', rarity:'SILVER',
    matches:90,  runs:42,   avg:5.25,  sr:72.4,  fifties:0,  hundreds:0,  hs:12,
    wkts:104, econ:7.82, bowlAvg:23.90, bestFig:[5,24], fiveFor:1, nationality:'Indian', basePrice:75 },

  { id:'m26', name:'Mohammed Shami',    team:'GT',   role:'BWL', league:'M', rarity:'SILVER',
    matches:95,  runs:68,   avg:5.67,  sr:72.3,  fifties:0,  hundreds:0,  hs:14,
    wkts:102, econ:8.36, bowlAvg:26.70, bestFig:[4,16], fiveFor:0, nationality:'Indian', basePrice:75 },

  { id:'m27', name:'Arshdeep Singh',    team:'PBKS', role:'BWL', league:'M', rarity:'SILVER',
    matches:78,  runs:32,   avg:4.57,  sr:67.0,  fifties:0,  hundreds:0,  hs:10,
    wkts:95,  econ:8.43, bowlAvg:25.00, bestFig:[4,23], fiveFor:0, nationality:'Indian', basePrice:75 },

  { id:'m28', name:'Deepak Chahar',     team:'CSK',  role:'BWL', league:'M', rarity:'SILVER',
    matches:113, runs:148,  avg:10.57, sr:107.2, fifties:0,  hundreds:0,  hs:33,
    wkts:103, econ:7.76, bowlAvg:24.10, bestFig:[5,7],  fiveFor:1, nationality:'Indian', basePrice:75 },

  { id:'m29', name:'Trent Boult',       team:'RR',   role:'BWL', league:'M', rarity:'SILVER',
    matches:80,  runs:28,   avg:4.67,  sr:64.0,  fifties:0,  hundreds:0,  hs:9,
    wkts:104, econ:8.20, bowlAvg:22.70, bestFig:[4,18], fiveFor:0, nationality:'Foreign', basePrice:100 },

  { id:'m30', name:'Pat Cummins',       team:'KKR',  role:'ALL', league:'M', rarity:'SILVER',
    matches:60,  runs:484,  avg:22.00, sr:148.2, fifties:2,  hundreds:0,  hs:56,
    wkts:61,  econ:9.10, bowlAvg:33.00, bestFig:[4,14], fiveFor:0, nationality:'Foreign', basePrice:100 },

  { id:'m31', name:'Sanju Samson',      team:'RR',   role:'WK',  league:'M', rarity:'SILVER',
    matches:186, runs:4844, avg:29.78, sr:136.0, fifties:31, hundreds:5,  hs:119,
    wkts:0,   econ:0,    bowlAvg:0,     bestFig:[0,0],  fiveFor:0, nationality:'Indian', basePrice:100 },

  { id:'m32', name:'Quinton de Kock',   team:'LSG',  role:'WK',  league:'M', rarity:'SILVER',
    matches:95,  runs:2882, avg:34.12, sr:136.8, fifties:24, hundreds:2,  hs:140,
    wkts:0,   econ:0,    bowlAvg:0,     bestFig:[0,0],  fiveFor:0, nationality:'Foreign', basePrice:100 },

  { id:'m33', name:'Travis Head',       team:'SRH',  role:'BAT', league:'M', rarity:'SILVER',
    matches:34,  runs:1302, avg:41.35, sr:180.6, fifties:8,  hundreds:2,  hs:101,
    wkts:0,   econ:0,    bowlAvg:0,     bestFig:[0,0],  fiveFor:0, nationality:'Foreign', basePrice:100 },

  { id:'m34', name:'Heinrich Klaasen',  team:'SRH',  role:'WK',  league:'M', rarity:'SILVER',
    matches:72,  runs:2206, avg:37.40, sr:166.9, fifties:15, hundreds:1,  hs:104,
    wkts:0,   econ:0,    bowlAvg:0,     bestFig:[0,0],  fiveFor:0, nationality:'Foreign', basePrice:100 },

  { id:'m35', name:'Tilak Varma',       team:'MI',   role:'BAT', league:'M', rarity:'SILVER',
    matches:52,  runs:1456, avg:32.36, sr:140.2, fifties:9,  hundreds:1,  hs:84,
    wkts:0,   econ:0,    bowlAvg:0,     bestFig:[0,0],  fiveFor:0, nationality:'Indian', basePrice:75 },

  { id:'m36', name:'Washington Sundar', team:'SRH',  role:'ALL', league:'M', rarity:'SILVER',
    matches:82,  runs:836,  avg:18.58, sr:118.5, fifties:1,  hundreds:0,  hs:52,
    wkts:60,  econ:7.44, bowlAvg:30.80, bestFig:[3,16], fiveFor:0, nationality:'Indian', basePrice:75 },

  // ════════════════════════════════ MEN · BRONZE (14) ═══════════════════════════
  { id:'m37', name:'Liam Livingstone',  team:'PBKS', role:'ALL', league:'M', rarity:'BRONZE',
    matches:48,  runs:1226, avg:29.19, sr:155.5, fifties:7,  hundreds:1,  hs:117,
    wkts:20,  econ:8.54, bowlAvg:32.50, bestFig:[2,12], fiveFor:0, nationality:'Foreign', basePrice:50 },

  { id:'m38', name:'Rinku Singh',       team:'KKR',  role:'BAT', league:'M', rarity:'BRONZE',
    matches:48,  runs:1078, avg:38.50, sr:148.7, fifties:4,  hundreds:0,  hs:74,
    wkts:0,   econ:0,    bowlAvg:0,     bestFig:[0,0],  fiveFor:0, nationality:'Indian', basePrice:50 },

  { id:'m39', name:'Nitish Kumar Reddy',team:'SRH',  role:'ALL', league:'M', rarity:'BRONZE',
    matches:14,  runs:303,  avg:30.30, sr:142.0, fifties:1,  hundreds:0,  hs:76,
    wkts:8,   econ:9.10, bowlAvg:38.00, bestFig:[2,26], fiveFor:0, nationality:'Indian', basePrice:30 },

  { id:'m40', name:'Robin Uthappa',     team:'CSK',  role:'WK',  league:'M', rarity:'BRONZE',
    matches:218, runs:4952, avg:26.33, sr:130.7, fifties:28, hundreds:0,  hs:88,
    wkts:0,   econ:0,    bowlAvg:0,     bestFig:[0,0],  fiveFor:0, nationality:'Indian', basePrice:50 },

  { id:'m41', name:'Manish Pandey',     team:'SRH',  role:'BAT', league:'M', rarity:'BRONZE',
    matches:172, runs:3810, avg:28.65, sr:123.2, fifties:26, hundreds:1,  hs:114,
    wkts:0,   econ:0,    bowlAvg:0,     bestFig:[0,0],  fiveFor:0, nationality:'Indian', basePrice:50 },

  { id:'m42', name:'Yusuf Pathan',      team:'KKR',  role:'ALL', league:'M', rarity:'BRONZE',
    matches:174, runs:3204, avg:28.12, sr:156.9, fifties:17, hundreds:0,  hs:100,
    wkts:62,  econ:8.25, bowlAvg:32.50, bestFig:[3,22], fiveFor:0, nationality:'Indian', basePrice:50 },

  { id:'m43', name:'Ambati Rayudu',     team:'CSK',  role:'BAT', league:'M', rarity:'BRONZE',
    matches:191, runs:4349, avg:28.07, sr:125.0, fifties:24, hundreds:0,  hs:100,
    wkts:4,   econ:9.10, bowlAvg:46.00, bestFig:[1,14], fiveFor:0, nationality:'Indian', basePrice:50 },

  { id:'m44', name:'Rahul Chahar',      team:'PBKS', role:'BWL', league:'M', rarity:'BRONZE',
    matches:68,  runs:28,   avg:4.67,  sr:77.8,  fifties:0,  hundreds:0,  hs:8,
    wkts:72,  econ:8.08, bowlAvg:25.40, bestFig:[4,27], fiveFor:0, nationality:'Indian', basePrice:30 },

  { id:'m45', name:'Umesh Yadav',       team:'DC',   role:'BWL', league:'M', rarity:'BRONZE',
    matches:98,  runs:62,   avg:5.17,  sr:76.5,  fifties:0,  hundreds:0,  hs:11,
    wkts:91,  econ:9.11, bowlAvg:32.10, bestFig:[4,25], fiveFor:0, nationality:'Indian', basePrice:30 },

  { id:'m46', name:'Sam Curran',        team:'PBKS', role:'ALL', league:'M', rarity:'BRONZE',
    matches:44,  runs:522,  avg:23.73, sr:140.0, fifties:2,  hundreds:0,  hs:55,
    wkts:41,  econ:9.20, bowlAvg:33.80, bestFig:[3,12], fiveFor:0, nationality:'Foreign', basePrice:50 },

  { id:'m47', name:'Dinesh Karthik',    team:'RCB',  role:'WK',  league:'M', rarity:'BRONZE',
    matches:257, runs:4843, avg:25.76, sr:134.4, fifties:18, hundreds:0,  hs:83,
    wkts:0,   econ:0,    bowlAvg:0,     bestFig:[0,0],  fiveFor:0, nationality:'Indian', basePrice:50 },

  { id:'m48', name:'Mohammed Siraj',    team:'RCB',  role:'BWL', league:'M', rarity:'BRONZE',
    matches:100, runs:50,   avg:4.55,  sr:72.5,  fifties:0,  hundreds:0,  hs:9,
    wkts:85,  econ:8.84, bowlAvg:29.20, bestFig:[4,32], fiveFor:0, nationality:'Indian', basePrice:50 },

  { id:'m49', name:'Nicholas Pooran',   team:'LSG',  role:'WK',  league:'M', rarity:'BRONZE',
    matches:95,  runs:2152, avg:26.90, sr:152.7, fifties:12, hundreds:1,  hs:94,
    wkts:0,   econ:0,    bowlAvg:0,     bestFig:[0,0],  fiveFor:0, nationality:'Foreign', basePrice:50 },

  { id:'m50', name:'Wriddhiman Saha',   team:'GT',   role:'WK',  league:'M', rarity:'BRONZE',
    matches:190, runs:3890, avg:24.91, sr:127.0, fifties:25, hundreds:0,  hs:94,
    wkts:0,   econ:0,    bowlAvg:0,     bestFig:[0,0],  fiveFor:0, nationality:'Indian', basePrice:30 },

  // ═══════════════════════════════ WOMEN · LEGEND (4) ═══════════════════════════
  // Stats: combined WPL + international T20 career
  { id:'w01', name:'Smriti Mandhana',   team:'RCBW', role:'BAT', league:'W', rarity:'LEGEND',
    matches:165, runs:4805, avg:32.70, sr:122.8, fifties:38, hundreds:1,  hs:112,
    wkts:0,   econ:0,    bowlAvg:0,     bestFig:[0,0],  fiveFor:0, nationality:'Indian', basePrice:200 },

  { id:'w02', name:'Meg Lanning',       team:'DCW',  role:'BAT', league:'W', rarity:'LEGEND',
    matches:148, runs:4673, avg:38.45, sr:120.2, fifties:37, hundreds:4,  hs:133,
    wkts:0,   econ:0,    bowlAvg:0,     bestFig:[0,0],  fiveFor:0, nationality:'Foreign', basePrice:175 },

  { id:'w03', name:'Ellyse Perry',      team:'RCBW', role:'ALL', league:'W', rarity:'LEGEND',
    matches:155, runs:3143, avg:29.56, sr:110.8, fifties:17, hundreds:0,  hs:84,
    wkts:100, econ:6.03, bowlAvg:20.20, bestFig:[4,16], fiveFor:0, nationality:'Foreign', basePrice:175 },

  { id:'w04', name:'Harmanpreet Kaur',  team:'MIW',  role:'BAT', league:'W', rarity:'LEGEND',
    matches:176, runs:4553, avg:32.28, sr:126.3, fifties:32, hundreds:2,  hs:103,
    wkts:24,  econ:7.50, bowlAvg:29.00, bestFig:[3,14], fiveFor:0, nationality:'Indian', basePrice:175 },

  // ═══════════════════════════════ WOMEN · GOLD (8) ═════════════════════════════
  { id:'w05', name:'Nat Sciver-Brunt',  team:'MIW',  role:'ALL', league:'W', rarity:'GOLD',
    matches:130, runs:3020, avg:31.80, sr:124.6, fifties:21, hundreds:1,  hs:89,
    wkts:62,  econ:6.60, bowlAvg:23.80, bestFig:[4,19], fiveFor:0, nationality:'Foreign', basePrice:150 },

  { id:'w06', name:'Sophie Ecclestone', team:'UPW',  role:'BWL', league:'W', rarity:'GOLD',
    matches:110, runs:120,  avg:8.00,  sr:95.0,  fifties:0,  hundreds:0,  hs:22,
    wkts:148, econ:5.42, bowlAvg:14.80, bestFig:[5,10], fiveFor:3, nationality:'Foreign', basePrice:150 },

  { id:'w07', name:'Beth Mooney',       team:'GTW',  role:'WK',  league:'W', rarity:'GOLD',
    matches:100, runs:2648, avg:34.00, sr:117.5, fifties:22, hundreds:1,  hs:117,
    wkts:0,   econ:0,    bowlAvg:0,     bestFig:[0,0],  fiveFor:0, nationality:'Foreign', basePrice:125 },

  { id:'w08', name:'Richa Ghosh',       team:'RCBW', role:'WK',  league:'W', rarity:'GOLD',
    matches:85,  runs:1640, avg:25.00, sr:130.0, fifties:6,  hundreds:0,  hs:68,
    wkts:0,   econ:0,    bowlAvg:0,     bestFig:[0,0],  fiveFor:0, nationality:'Indian', basePrice:125 },

  { id:'w09', name:'Shafali Verma',     team:'DCW',  role:'BAT', league:'W', rarity:'GOLD',
    matches:120, runs:3040, avg:28.40, sr:142.0, fifties:20, hundreds:1,  hs:113,
    wkts:0,   econ:0,    bowlAvg:0,     bestFig:[0,0],  fiveFor:0, nationality:'Indian', basePrice:150 },

  { id:'w10', name:'Deepti Sharma',     team:'UPW',  role:'ALL', league:'W', rarity:'GOLD',
    matches:145, runs:2184, avg:24.27, sr:105.0, fifties:10, hundreds:0,  hs:78,
    wkts:140, econ:6.24, bowlAvg:21.00, bestFig:[5,15], fiveFor:3, nationality:'Indian', basePrice:125 },

  { id:'w11', name:'Alyssa Healy',      team:'UPW',  role:'WK',  league:'W', rarity:'GOLD',
    matches:148, runs:3979, avg:31.35, sr:126.8, fifties:34, hundreds:3,  hs:148,
    wkts:0,   econ:0,    bowlAvg:0,     bestFig:[0,0],  fiveFor:0, nationality:'Foreign', basePrice:125 },

  { id:'w12', name:'Jemimah Rodrigues', team:'DCW',  role:'BAT', league:'W', rarity:'GOLD',
    matches:110, runs:2580, avg:29.09, sr:117.0, fifties:16, hundreds:0,  hs:78,
    wkts:0,   econ:0,    bowlAvg:0,     bestFig:[0,0],  fiveFor:0, nationality:'Indian', basePrice:125 },

  // ═══════════════════════════════ WOMEN · SILVER (11) ══════════════════════════
  { id:'w13', name:'Pooja Vastrakar',   team:'MIW',  role:'ALL', league:'W', rarity:'SILVER',
    matches:90,  runs:960,  avg:24.00, sr:130.0, fifties:5,  hundreds:0,  hs:68,
    wkts:65,  econ:7.10, bowlAvg:25.00, bestFig:[3,18], fiveFor:0, nationality:'Indian', basePrice:75 },

  { id:'w14', name:'Amelia Kerr',       team:'DCW',  role:'ALL', league:'W', rarity:'SILVER',
    matches:95,  runs:1320, avg:20.94, sr:113.0, fifties:5,  hundreds:0,  hs:64,
    wkts:112, econ:6.10, bowlAvg:17.20, bestFig:[5,17], fiveFor:2, nationality:'Foreign', basePrice:100 },

  { id:'w15', name:'Hayley Matthews',   team:'UPW',  role:'ALL', league:'W', rarity:'SILVER',
    matches:100, runs:2160, avg:26.83, sr:125.6, fifties:14, hundreds:1,  hs:99,
    wkts:75,  econ:6.60, bowlAvg:22.00, bestFig:[4,26], fiveFor:0, nationality:'Foreign', basePrice:100 },

  { id:'w16', name:'Laura Wolvaardt',   team:'UPW',  role:'BAT', league:'W', rarity:'SILVER',
    matches:80,  runs:2028, avg:33.67, sr:118.8, fifties:17, hundreds:1,  hs:105,
    wkts:0,   econ:0,    bowlAvg:0,     bestFig:[0,0],  fiveFor:0, nationality:'Foreign', basePrice:75 },

  { id:'w17', name:'Chamari Athapaththu',team:'MIW', role:'BAT', league:'W', rarity:'SILVER',
    matches:125, runs:3340, avg:31.23, sr:120.2, fifties:24, hundreds:2,  hs:125,
    wkts:8,   econ:7.40, bowlAvg:36.00, bestFig:[1,14], fiveFor:0, nationality:'Foreign', basePrice:75 },

  { id:'w18', name:'Renuka Singh',      team:'MIW',  role:'BWL', league:'W', rarity:'SILVER',
    matches:65,  runs:30,   avg:5.00,  sr:72.0,  fifties:0,  hundreds:0,  hs:8,
    wkts:80,  econ:6.97, bowlAvg:18.80, bestFig:[5,11], fiveFor:2, nationality:'Indian', basePrice:100 },

  { id:'w19', name:'Kate Cross',        team:'GTW',  role:'BWL', league:'W', rarity:'SILVER',
    matches:60,  runs:24,   avg:4.80,  sr:68.0,  fifties:0,  hundreds:0,  hs:9,
    wkts:66,  econ:7.12, bowlAvg:20.50, bestFig:[4,19], fiveFor:0, nationality:'Foreign', basePrice:75 },

  { id:'w20', name:'Marizanne Kapp',    team:'DCW',  role:'ALL', league:'W', rarity:'SILVER',
    matches:115, runs:1640, avg:22.76, sr:116.0, fifties:9,  hundreds:0,  hs:75,
    wkts:98,  econ:6.60, bowlAvg:19.80, bestFig:[4,14], fiveFor:0, nationality:'Foreign', basePrice:100 },

  { id:'w21', name:'Yastika Bhatia',    team:'MIW',  role:'WK',  league:'W', rarity:'SILVER',
    matches:65,  runs:1240, avg:22.55, sr:110.0, fifties:7,  hundreds:0,  hs:74,
    wkts:0,   econ:0,    bowlAvg:0,     bestFig:[0,0],  fiveFor:0, nationality:'Indian', basePrice:75 },

  { id:'w22', name:'Radha Yadav',       team:'MIW',  role:'BWL', league:'W', rarity:'SILVER',
    matches:80,  runs:140,  avg:7.78,  sr:82.0,  fifties:0,  hundreds:0,  hs:20,
    wkts:98,  econ:6.42, bowlAvg:19.70, bestFig:[4,19], fiveFor:0, nationality:'Indian', basePrice:75 },

  { id:'w23', name:'Tahlia McGrath',    team:'UPW',  role:'ALL', league:'W', rarity:'SILVER',
    matches:90,  runs:1480, avg:26.43, sr:118.0, fifties:10, hundreds:0,  hs:72,
    wkts:58,  econ:7.10, bowlAvg:24.80, bestFig:[4,20], fiveFor:0, nationality:'Foreign', basePrice:75 },

  // ═══════════════════════════════ WOMEN · BRONZE (7) ═══════════════════════════
  { id:'w24', name:'Dayalan Hemalatha', team:'MIW',  role:'BAT', league:'W', rarity:'BRONZE',
    matches:50,  runs:860,  avg:22.11, sr:112.0, fifties:4,  hundreds:0,  hs:68,
    wkts:0,   econ:0,    bowlAvg:0,     bestFig:[0,0],  fiveFor:0, nationality:'Indian', basePrice:30 },

  { id:'w25', name:'Minnu Mani',        team:'DCW',  role:'BWL', league:'W', rarity:'BRONZE',
    matches:45,  runs:40,   avg:5.71,  sr:72.0,  fifties:0,  hundreds:0,  hs:12,
    wkts:48,  econ:6.72, bowlAvg:21.00, bestFig:[4,23], fiveFor:0, nationality:'Indian', basePrice:30 },

  { id:'w26', name:'Sneh Rana',         team:'DCW',  role:'ALL', league:'W', rarity:'BRONZE',
    matches:70,  runs:680,  avg:16.58, sr:104.0, fifties:2,  hundreds:0,  hs:54,
    wkts:58,  econ:6.88, bowlAvg:23.20, bestFig:[4,28], fiveFor:0, nationality:'Indian', basePrice:30 },

  { id:'w27', name:'Sabbhineni Meghana',team:'RCBW', role:'BAT', league:'W', rarity:'BRONZE',
    matches:42,  runs:880,  avg:23.24, sr:108.0, fifties:5,  hundreds:0,  hs:72,
    wkts:0,   econ:0,    bowlAvg:0,     bestFig:[0,0],  fiveFor:0, nationality:'Indian', basePrice:30 },

  { id:'w28', name:'Mansi Joshi',       team:'RCBW', role:'BWL', league:'W', rarity:'BRONZE',
    matches:48,  runs:36,   avg:6.00,  sr:75.0,  fifties:0,  hundreds:0,  hs:10,
    wkts:52,  econ:7.14, bowlAvg:23.80, bestFig:[4,18], fiveFor:0, nationality:'Indian', basePrice:30 },

  { id:'w29', name:'Georgia Wareham',   team:'RCBW', role:'BWL', league:'W', rarity:'BRONZE',
    matches:55,  runs:80,   avg:7.27,  sr:82.0,  fifties:0,  hundreds:0,  hs:18,
    wkts:60,  econ:6.72, bowlAvg:22.10, bestFig:[4,20], fiveFor:0, nationality:'Foreign', basePrice:50 },

  { id:'w30', name:'Simran Shaikh',     team:'MIW',  role:'BAT', league:'W', rarity:'BRONZE',
    matches:32,  runs:624,  avg:22.29, sr:112.0, fifties:3,  hundreds:0,  hs:58,
    wkts:0,   econ:0,    bowlAvg:0,     bestFig:[0,0],  fiveFor:0, nationality:'Indian', basePrice:30 },
];

// Enrich every player with derived objects and jersey number
const PLAYERS = RAW_PLAYERS.map((p, idx) => ({
  ...p,
  initials: p.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase(),
  jersey:   ((idx * 7 + 11) % 89) + 1,
  teamObj:   TEAMS[p.team],
  roleObj:   ROLES[p.role],
  rarityObj: RARITIES[p.rarity],
}));

module.exports = { PLAYERS, TEAMS, ROLES, RARITIES, STATS, STAT_BY_KEY };
