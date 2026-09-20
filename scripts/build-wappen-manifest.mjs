// Erstellt manifest.json aus vorhandenen SVG-Dateien (nach manuellem Download).
// Ausführen: node scripts/build-wappen-manifest.mjs
import fs from 'node:fs';

const GEMEINDEN = {
  1201: 'Altdorf', 1202: 'Andermatt', 1203: 'Attinghausen', 1205: 'Bürglen',
  1206: 'Erstfeld', 1207: 'Flüelen', 1208: 'Göschenen', 1209: 'Gurtnellen',
  1210: 'Hospental', 1211: 'Isenthal', 1212: 'Realp', 1213: 'Schattdorf',
  1214: 'Seedorf', 1215: 'Seelisberg', 1216: 'Silenen', 1217: 'Sisikon',
  1218: 'Spiringen', 1219: 'Unterschächen', 1220: 'Wassen',
};
const KANTONE = {
  ur: ['Uri', 'CH-UR'], be: ['Bern', 'CH-BE'], sz: ['Schwyz', 'CH-SZ'],
  ow: ['Obwalden', 'CH-OW'], nw: ['Nidwalden', 'CH-NW'], gl: ['Glarus', 'CH-GL'],
  gr: ['Graubünden', 'CH-GR'], ti: ['Tessin', 'CH-TI'], vs: ['Wallis', 'CH-VS'],
};

const manifest = { quelle: 'Wikimedia Commons (manuell)', gemeinden: {}, kantone: {} };

for (const [bfs, name] of Object.entries(GEMEINDEN)) {
  const file = `${bfs}.svg`;
  if (fs.existsSync(`public/wappen/gemeinden/${file}`)) {
    manifest.gemeinden[bfs] = { name, datei: `/wappen/gemeinden/${file}` };
  }
}
for (const [kuerzel, [name, code]] of Object.entries(KANTONE)) {
  const file = `${kuerzel}.svg`;
  if (fs.existsSync(`public/wappen/kantone/${file}`)) {
    manifest.kantone[code] = { name, datei: `/wappen/kantone/${file}` };
  }
}

fs.mkdirSync('public/wappen', { recursive: true });
fs.writeFileSync('public/wappen/manifest.json', JSON.stringify(manifest, null, 2));

const fehltGem = Object.keys(GEMEINDEN).filter((b) => !manifest.gemeinden[b]);
const fehltKt = Object.values(KANTONE).filter(([, code]) => !manifest.kantone[code]).map(([, code]) => code);

console.log('Gemeinden:', Object.keys(manifest.gemeinden).length, '/ 19');
console.log('Kantone:', Object.keys(manifest.kantone).length, '/ 9');
if (fehltGem.length) console.log('Fehlende Gemeinden (BFS):', fehltGem.join(', '));
if (fehltKt.length) console.log('Fehlende Kantone:', fehltKt.join(', '));
