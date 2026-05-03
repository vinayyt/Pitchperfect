// One-time script: adds nationality + basePrice to every player in players.js
'use strict';
const fs   = require('fs');
const path = require('path');

const fields = {
  // Men - LEGEND
  m01: { nationality:'Indian',  basePrice:200 },
  m02: { nationality:'Indian',  basePrice:200 },
  m03: { nationality:'Indian',  basePrice:200 },
  m04: { nationality:'Foreign', basePrice:175 },
  m05: { nationality:'Foreign', basePrice:175 },
  m06: { nationality:'Foreign', basePrice:175 },
  // Men - GOLD
  m07: { nationality:'Indian',  basePrice:125 },
  m08: { nationality:'Foreign', basePrice:150 },
  m09: { nationality:'Indian',  basePrice:150 },
  m10: { nationality:'Foreign', basePrice:150 },
  m11: { nationality:'Indian',  basePrice:150 },
  m12: { nationality:'Indian',  basePrice:125 },
  m13: { nationality:'Indian',  basePrice:150 },
  m14: { nationality:'Foreign', basePrice:150 },
  m15: { nationality:'Indian',  basePrice:150 },
  m16: { nationality:'Indian',  basePrice:125 },
  m17: { nationality:'Indian',  basePrice:125 },
  m18: { nationality:'Indian',  basePrice:150 },
  // Men - SILVER
  m19: { nationality:'Foreign', basePrice:100 },
  m20: { nationality:'Indian',  basePrice:100 },
  m21: { nationality:'Indian',  basePrice:100 },
  m22: { nationality:'Indian',  basePrice: 75 },
  m23: { nationality:'Indian',  basePrice:100 },
  m24: { nationality:'Indian',  basePrice: 75 },
  m25: { nationality:'Indian',  basePrice: 75 },
  m26: { nationality:'Indian',  basePrice: 75 },
  m27: { nationality:'Indian',  basePrice: 75 },
  m28: { nationality:'Indian',  basePrice: 75 },
  m29: { nationality:'Foreign', basePrice:100 },
  m30: { nationality:'Foreign', basePrice:100 },
  m31: { nationality:'Indian',  basePrice:100 },
  m32: { nationality:'Foreign', basePrice:100 },
  m33: { nationality:'Foreign', basePrice:100 },
  m34: { nationality:'Foreign', basePrice:100 },
  m35: { nationality:'Indian',  basePrice: 75 },
  m36: { nationality:'Indian',  basePrice: 75 },
  // Men - BRONZE
  m37: { nationality:'Foreign', basePrice: 50 },
  m38: { nationality:'Indian',  basePrice: 50 },
  m39: { nationality:'Indian',  basePrice: 30 },
  m40: { nationality:'Indian',  basePrice: 50 },
  m41: { nationality:'Indian',  basePrice: 50 },
  m42: { nationality:'Indian',  basePrice: 50 },
  m43: { nationality:'Indian',  basePrice: 50 },
  m44: { nationality:'Indian',  basePrice: 30 },
  m45: { nationality:'Indian',  basePrice: 30 },
  m46: { nationality:'Foreign', basePrice: 50 },
  m47: { nationality:'Indian',  basePrice: 50 },
  m48: { nationality:'Indian',  basePrice: 50 },
  m49: { nationality:'Foreign', basePrice: 50 },
  m50: { nationality:'Indian',  basePrice: 30 },
  // Women - LEGEND
  w01: { nationality:'Indian',  basePrice:200 },
  w02: { nationality:'Foreign', basePrice:175 },
  w03: { nationality:'Foreign', basePrice:175 },
  w04: { nationality:'Indian',  basePrice:175 },
  // Women - GOLD
  w05: { nationality:'Foreign', basePrice:150 },
  w06: { nationality:'Foreign', basePrice:150 },
  w07: { nationality:'Foreign', basePrice:125 },
  w08: { nationality:'Indian',  basePrice:125 },
  w09: { nationality:'Indian',  basePrice:150 },
  w10: { nationality:'Indian',  basePrice:125 },
  w11: { nationality:'Foreign', basePrice:125 },
  w12: { nationality:'Indian',  basePrice:125 },
  // Women - SILVER
  w13: { nationality:'Indian',  basePrice: 75 },
  w14: { nationality:'Foreign', basePrice:100 },
  w15: { nationality:'Foreign', basePrice:100 },
  w16: { nationality:'Foreign', basePrice: 75 },
  w17: { nationality:'Foreign', basePrice: 75 },
  w18: { nationality:'Indian',  basePrice:100 },
  w19: { nationality:'Foreign', basePrice: 75 },
  w20: { nationality:'Foreign', basePrice:100 },
  w21: { nationality:'Indian',  basePrice: 75 },
  w22: { nationality:'Indian',  basePrice: 75 },
  w23: { nationality:'Foreign', basePrice: 75 },
  // Women - BRONZE
  w24: { nationality:'Indian',  basePrice: 30 },
  w25: { nationality:'Indian',  basePrice: 30 },
  w26: { nationality:'Indian',  basePrice: 30 },
  w27: { nationality:'Indian',  basePrice: 30 },
  w28: { nationality:'Indian',  basePrice: 30 },
  w29: { nationality:'Foreign', basePrice: 50 },
  w30: { nationality:'Indian',  basePrice: 30 },
};

const file = path.join(__dirname, 'data/players.js');
let src = fs.readFileSync(file, 'utf8');

for (const [id, { nationality, basePrice }] of Object.entries(fields)) {
  // Find the line with this id and append nationality + basePrice after the existing fields
  // Match pattern: id:'m01', ... fiveFor:N }  (end of player object)
  const idPat = new RegExp(`(\\{ id:'${id}',[\\s\\S]*?fiveFor:\\d+ \\})`, 'g');
  src = src.replace(idPat, (match) => {
    // Remove any existing nationality/basePrice to avoid duplicates
    match = match.replace(/,\s*nationality:'[^']*'/g, '');
    match = match.replace(/,\s*basePrice:\d+/g, '');
    // Insert before closing brace
    return match.replace(/ \}$/, `, nationality:'${nationality}', basePrice:${basePrice} }`);
  });
}

fs.writeFileSync(file, src, 'utf8');
console.log('Patched players.js with nationality + basePrice for', Object.keys(fields).length, 'players');
