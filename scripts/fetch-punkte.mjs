// Holt Pässe, Berge und Sagenorte von OpenStreetMap.
// Primär Overpass (ein Request), Fallback Nominatim.
// Ausführen: node scripts/fetch-punkte.mjs
import fs from 'node:fs';

const UA = 'UriLernApp/0.1 (privates Lernprojekt)';
const URI = { lng: 8.64, lat: 46.78 };

const SUCHE = [
  { id: 'pass-gotthard', name: 'Gotthardpass', art: 'pass', namen: ['Gotthardpass'] },
  { id: 'pass-furka', name: 'Furkapass', art: 'pass', namen: ['Furkapass'] },
  { id: 'pass-oberalp', name: 'Oberalppass', art: 'pass', namen: ['Oberalppass'] },
  { id: 'pass-susten', name: 'Sustenpass', art: 'pass', namen: ['Sustenpass'] },
  { id: 'pass-klausen', name: 'Klausenpass', art: 'pass', namen: ['Klausenpass'] },
  { id: 'berg-dammastock', name: 'Dammastock', art: 'berg', namen: ['Dammastock'] },
  { id: 'berg-galenstock', name: 'Galenstock', art: 'berg', namen: ['Galenstock'] },
  { id: 'berg-oberalpstock', name: 'Oberalpstock', art: 'berg', namen: ['Oberalpstock'] },
  { id: 'berg-schaerhorn', name: 'Schärhorn', art: 'berg', namen: ['Schärhorn'] },
  { id: 'berg-clariden', name: 'Clariden', art: 'berg', namen: ['Clariden'] },
  { id: 'berg-spannort', name: 'Gross Spannort', art: 'berg', namen: ['Gross Spannort', 'Grosses Spannort'] },
  { id: 'berg-bristen', name: 'Bristen', art: 'berg', namen: ['Bristen'] },
  { id: 'berg-urirotstock', name: 'Uri Rotstock', art: 'berg', namen: ['Urirotstock', 'Uri Rotstock'] },
  { id: 'sage-teufelsbruecke', name: 'Teufelsbrücke', art: 'sagenort', namen: ['Teufelsbrücke'] },
  { id: 'sage-teufelsstein', name: 'Teufelsstein', art: 'sagenort', namen: ['Teufelsstein'] },
  { id: 'sage-telldenkmal', name: 'Telldenkmal', art: 'sagenort', namen: ['Telldenkmal'] },
  { id: 'sage-tellmuseum', name: 'Tell-Museum', art: 'sagenort', namen: ['Tell-Museum', 'Tellmuseum'] },
  { id: 'sage-tellskapelle', name: 'Tellskapelle', art: 'sagenort', namen: ['Tellskapelle'] },
  { id: 'sage-ruetli', name: 'Rütli', art: 'sagenort', namen: ['Rütli'] },
  { id: 'sage-hohle-gasse', name: 'Hohle Gasse', art: 'sagenort', namen: ['Hohle Gasse'] },
];

function distKm(lng, lat) {
  const dLng = ((lng - URI.lng) * Math.PI) / 180;
  const dLat = ((lat - URI.lat) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((URI.lat * Math.PI) / 180) * Math.cos((lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(a));
}

function eleVon(wert) {
  if (wert == null) return null;
  const n = Number(String(wert).replace(',', '.').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function zentrum(el) {
  if (typeof el.lat === 'number' && typeof el.lon === 'number') return { lng: el.lon, lat: el.lat };
  if (el.center) return { lng: el.center.lon, lat: el.center.lat };
  return null;
}

function maxDist(id) {
  return id === 'sage-hohle-gasse' ? 120 : 70;
}

function scoreOsm(el, eintrag) {
  const z = zentrum(el);
  if (!z) return -Infinity;
  const d = distKm(z.lng, z.lat);
  if (d > maxDist(eintrag.id)) return -Infinity;
  const t = el.tags ?? {};
  let s = 800 - d;
  if (eintrag.art === 'berg' && t.natural === 'peak') s += 300;
  if (eintrag.art === 'pass' && (t.mountain_pass === 'yes' || t.natural === 'saddle')) s += 300;
  if (eintrag.art === 'sagenort') s += 50;
  if (eleVon(t.ele) != null) s += 80;
  if (el.type === 'node') s += 20;
  return s;
}

function sammelQuery() {
  const teile = [];
  for (const e of SUCHE) {
    for (const n of e.namen) {
      teile.push(`node["name"="${n}"];`);
      teile.push(`node["name:de"="${n}"];`);
      teile.push(`way["name"="${n}"];`);
      teile.push(`way["name:de"="${n}"];`);
    }
  }
  return `[out:json][timeout:90];\n(\n${teile.join('\n')}\n);\nout center tags;`;
}

async function overpass(query) {
  const servers = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
  ];
  for (const url of servers) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(query),
        signal: AbortSignal.timeout(90000),
      });
      if (r.ok) return r.json();
      console.warn(url, '→', r.status);
    } catch (e) {
      console.warn(url, '→', e.message);
    }
  }
  return null;
}

async function nominatim(name) {
  const url =
    'https://nominatim.openstreetmap.org/search?' +
    new URLSearchParams({
      q: `${name}, Schweiz`,
      format: 'json',
      limit: '5',
      extratags: '1',
    });
  const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(15000) });
  if (!r.ok) return [];
  return r.json();
}

function nominatimTreffer(liste, eintrag) {
  const scored = liste
    .map((n) => {
      const lng = Number(n.lon);
      const lat = Number(n.lat);
      const d = distKm(lng, lat);
      if (d > maxDist(eintrag.id)) return null;
      let s = 500 - d;
      const cls = `${n.class}/${n.type}`;
      if (eintrag.art === 'berg' && (cls.includes('peak') || n.type === 'peak')) s += 300;
      if (eintrag.art === 'pass' && (n.type === 'saddle' || n.type === 'yes' || String(n.display_name).includes('pass'))) s += 200;
      if (eintrag.art === 'sagenort') s += 50;
      const ele = eleVon(n.extratags?.ele);
      if (ele != null) s += 80;
      return { lng, lat, ele, score: s, display: n.display_name };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
  return scored[0] ?? null;
}

const osm = await overpass(sammelQuery());
const elemente = osm?.elements ?? [];
console.log(elemente.length ? `${elemente.length} OSM-Elemente` : 'Overpass ohne Treffer – Nominatim');

const features = [];
const fehlend = [];

for (const eintrag of SUCHE) {
  const namen = new Set(eintrag.namen);
  const kandidaten = elemente.filter((el) => {
    const n = el.tags?.name || el.tags?.['name:de'];
    return n && namen.has(n);
  });
  kandidaten.sort((a, b) => scoreOsm(b, eintrag) - scoreOsm(a, eintrag));
  const best = kandidaten[0];
  const z = best && scoreOsm(best, eintrag) > -Infinity ? zentrum(best) : null;

  if (z) {
    const ele = eleVon(best.tags?.ele);
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [z.lng, z.lat] },
      properties: {
        id: eintrag.id,
        name: eintrag.name,
        art: eintrag.art,
        ele,
        quelle: '© OpenStreetMap-Mitwirkende (ODbL)',
      },
    });
    console.log('✓', eintrag.name, ele != null ? `${ele} m` : 'ohne Höhe', `${z.lat.toFixed(4)}, ${z.lng.toFixed(4)}`);
    continue;
  }

  console.warn('Nominatim für', eintrag.name);
  let treffer = null;
  for (const n of eintrag.namen) {
    const liste = await nominatim(n);
    treffer = nominatimTreffer(liste, eintrag);
    if (treffer) break;
    await new Promise((r) => setTimeout(r, 1100));
  }
  if (!treffer) {
    console.error('FEHLT:', eintrag.name);
    fehlend.push(eintrag.name);
    continue;
  }
  features.push({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [treffer.lng, treffer.lat] },
    properties: {
      id: eintrag.id,
      name: eintrag.name,
      art: eintrag.art,
      ele: treffer.ele,
      quelle: '© OpenStreetMap-Mitwirkende (ODbL)',
    },
  });
  console.log(
    '✓',
    eintrag.name,
    treffer.ele != null ? `${treffer.ele} m` : 'ohne Höhe',
    `${treffer.lat.toFixed(4)}, ${treffer.lng.toFixed(4)}`,
  );
  await new Promise((r) => setTimeout(r, 1100));
}

fs.mkdirSync('public/geo', { recursive: true });
fs.writeFileSync('public/geo/punkte.geojson', JSON.stringify({ type: 'FeatureCollection', features }, null, 2));
console.log('Geschrieben: public/geo/punkte.geojson', features.length, 'Punkte');
if (fehlend.length) {
  console.error('Fehlende Punkte:', fehlend.join(', '));
  process.exit(1);
}
