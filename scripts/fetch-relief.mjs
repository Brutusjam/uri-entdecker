// Holt die swissALTI3D-Reliefschattierung (swisstopo, Open Data) als Bild für Uri.
// Ausführen: npm run data:relief
import fs from 'node:fs';

const UA = 'UriLernApp/0.1 (privates Lernprojekt)';
const LAYER = 'ch.swisstopo.swissalti3d-reliefschattierung';
const DATEI = 'public/geo/relief.jpg';
const META = 'public/geo/relief.json';

/** [west, south, east, north] WGS84 – muss mit src/data/relief.ts übereinstimmen. */
const BBOX = [8.1, 46.28, 9.26, 47.24];
const BREITE = 2400;

function nachMercator(lng, lat) {
  const r = 6378137;
  const x = (lng * Math.PI) / 180 * r;
  const y = Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 180 / 2)) * r;
  return [x, y];
}

const [west, south, east, north] = BBOX;
const [minx, miny] = nachMercator(west, south);
const [maxx, maxy] = nachMercator(east, north);
const hoehe = Math.round(BREITE * ((maxy - miny) / (maxx - minx)));

const params = new URLSearchParams({
  SERVICE: 'WMS',
  VERSION: '1.3.0',
  REQUEST: 'GetMap',
  LAYERS: LAYER,
  STYLES: '',
  CRS: 'EPSG:3857',
  BBOX: `${minx},${miny},${maxx},${maxy}`,
  WIDTH: String(BREITE),
  HEIGHT: String(hoehe),
  FORMAT: 'image/jpeg',
  TRANSPARENT: 'false',
});
const url = `https://wms.geo.admin.ch/?${params.toString()}`;

const res = await fetch(url, { headers: { 'User-Agent': UA } });
if (!res.ok) throw new Error(`WMS ${res.status} ${res.statusText}`);
const buf = Buffer.from(await res.arrayBuffer());
if (buf[0] !== 0xff || buf[1] !== 0xd8) {
  throw new Error(`Keine JPEG-Antwort (${buf.slice(0, 80).toString('utf8')})`);
}

fs.mkdirSync('public/geo', { recursive: true });
fs.writeFileSync(DATEI, buf);
fs.writeFileSync(
  META,
  `${JSON.stringify(
    {
      src: '/geo/relief.jpg',
      bbox: BBOX,
      width: BREITE,
      height: hoehe,
      layer: LAYER,
      quelle: 'swissALTI3D Reliefschattierung, Bundesamt für Landestopografie swisstopo',
    },
    null,
    2,
  )}\n`,
);
console.log('OK:', DATEI, `${BREITE}×${hoehe}`, `${(buf.length / 1024).toFixed(0)} KB`);
