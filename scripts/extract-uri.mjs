// Extrahiert Uri-Gemeinden, alle Schweizer Kantone und den Vierwaldstättersee aus swiss-maps
import fs from 'node:fs';
import * as topojson from 'topojson-client';

const YEAR = '2026';
const topo = JSON.parse(fs.readFileSync(`node_modules/swiss-maps/${YEAR}/ch-combined.json`, 'utf8'));
const feat = (obj) => topojson.feature(topo, topo.objects[obj]).features;

// BFS-Nummern der 19 Urner Gemeinden (Stand 2021 ff., Bauen 1204 in Seedorf fusioniert)
const GEMEINDEN = {
  1201: 'Altdorf', 1202: 'Andermatt', 1203: 'Attinghausen', 1205: 'Bürglen',
  1206: 'Erstfeld', 1207: 'Flüelen', 1208: 'Göschenen', 1209: 'Gurtnellen',
  1210: 'Hospental', 1211: 'Isenthal', 1212: 'Realp', 1213: 'Schattdorf',
  1214: 'Seedorf', 1215: 'Seelisberg', 1216: 'Silenen', 1217: 'Sisikon',
  1218: 'Spiringen', 1219: 'Unterschächen', 1220: 'Wassen',
};
// Kantonsnummern BFS (1–26). Nachbarn von Uri: BE, SZ, OW, NW, GL, GR, TI, VS.
const KANTONE = {
  1: ['Zürich', 'ZH'], 2: ['Bern', 'BE'], 3: ['Luzern', 'LU'], 4: ['Uri', 'UR'],
  5: ['Schwyz', 'SZ'], 6: ['Obwalden', 'OW'], 7: ['Nidwalden', 'NW'], 8: ['Glarus', 'GL'],
  9: ['Zug', 'ZG'], 10: ['Freiburg', 'FR'], 11: ['Solothurn', 'SO'], 12: ['Basel-Stadt', 'BS'],
  13: ['Basel-Landschaft', 'BL'], 14: ['Schaffhausen', 'SH'],
  15: ['Appenzell Ausserrhoden', 'AR'], 16: ['Appenzell Innerrhoden', 'AI'],
  17: ['St. Gallen', 'SG'], 18: ['Graubünden', 'GR'], 19: ['Aargau', 'AG'], 20: ['Thurgau', 'TG'],
  21: ['Tessin', 'TI'], 22: ['Waadt', 'VD'], 23: ['Wallis', 'VS'], 24: ['Neuenburg', 'NE'],
  25: ['Genf', 'GE'], 26: ['Jura', 'JU'],
};

const gem = feat('municipalities').filter(f => GEMEINDEN[f.id])
  .map(f => ({ ...f, properties: { bfs: f.id, name: GEMEINDEN[f.id] } }));
const kt = feat('cantons').filter(f => KANTONE[f.id])
  .map(f => ({ ...f, properties: { id: f.id, name: KANTONE[f.id][0], kuerzel: KANTONE[f.id][1] } }));
const lakes = feat('lakes').filter(f => f.id === 9179)
  .map(f => ({ ...f, properties: { id: f.id, name: 'Vierwaldstättersee' } }));

if (gem.length !== 19) throw new Error(`Erwartet 19 Gemeinden, gefunden ${gem.length}`);
if (kt.length !== 26) throw new Error(`Erwartet 26 Kantone, gefunden ${kt.length}`);

fs.mkdirSync('public/geo', { recursive: true });
const fc = (features) => JSON.stringify({ type: 'FeatureCollection', features });
fs.writeFileSync('public/geo/uri-gemeinden.geojson', fc(gem));
fs.writeFileSync('public/geo/kantone.geojson', fc(kt));
fs.writeFileSync('public/geo/vierwaldstaettersee.geojson', fc(lakes));
console.log('OK:', gem.length, 'Gemeinden,', kt.length, 'Kantone,', lakes.length, 'See');
console.log('Beispielkoordinate:', JSON.stringify(gem[0].geometry.coordinates).slice(0, 80));
