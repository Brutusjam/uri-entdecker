// Holt Gewässer von OpenStreetMap via Overpass-API und speichert sie als GeoJSON.
// Phase 0: Göscheneralpsee. Bonus-Gewässer optional per --bonus.
// Ausführen: node scripts/fetch-osm.mjs
import fs from 'node:fs';
import osmtogeojson from 'osmtogeojson';

const UA = 'UriLernApp/0.1 (privates Lernprojekt)';
const BONUS = process.argv.includes('--bonus');

// Bbox Kanton Uri (Süd-West, Nord-Ost)
const BBOX = '46.5,8.35,47.05,8.95';

const GEWAESSER = [
  { id: 'goescheneralpsee', name: 'Göscheneralpsee', datei: 'goescheneralpsee.geojson', tags: 'water' },
];

const BONUS_GEWAESSER = [
  { id: 'reuss', name: 'Reuss', datei: 'reuss.geojson', tags: 'river' },
  { id: 'schaechen', name: 'Schächen', datei: 'schaechen.geojson', tags: 'river' },
  { id: 'oberalpsee', name: 'Oberalpsee', datei: 'oberalpsee.geojson', tags: 'water' },
  { id: 'seelisbergsee', name: 'Seelisbergsee', datei: 'seelisbergsee.geojson', tags: 'water' },
  { id: 'golzernsee', name: 'Golzernsee', datei: 'golzernsee.geojson', tags: 'water' },
  { id: 'arnisee', name: 'Arnisee', datei: 'arnisee.geojson', tags: 'water' },
];

async function overpass(query) {
  const servers = [
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass-api.de/api/interpreter',
  ];
  for (const url of servers) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(query),
        signal: AbortSignal.timeout(30000),
      });
      if (r.ok) return r.json();
      console.warn(url, '→', r.status);
    } catch (e) {
      console.warn(url, '→', e.message);
    }
  }
  return null;
}

/** Fallback: Nominatim liefert GeoJSON-Polygon direkt */
async function nominatimFallback(name) {
  const url =
    'https://nominatim.openstreetmap.org/search?' +
    new URLSearchParams({ q: name + ', Uri, Schweiz', format: 'json', polygon_geojson: 1, limit: '1' });
  const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(15000) });
  if (!r.ok) return null;
  const results = await r.json();
  if (!results.length || !results[0].geojson) return null;
  return {
    type: 'Feature',
    geometry: results[0].geojson,
    properties: { name: results[0].name, osm_id: results[0].osm_id, osm_type: results[0].osm_type },
  };
}

function queryForGewaesser({ name, tags }) {
  if (tags === 'river') {
    return `[out:json][timeout:30];
(
  way["waterway"="river"]["name"="${name}"](${BBOX});
  relation["waterway"="river"]["name"="${name}"](${BBOX});
);
out geom;`;
  }
  return `[out:json][timeout:30];
(
  way["name"="${name}"]["natural"="water"](${BBOX});
  relation["name"="${name}"]["natural"="water"](${BBOX});
  way["name"="${name}"]["water"="reservoir"](${BBOX});
  relation["name"="${name}"]["water"="reservoir"](${BBOX});
  way["name"="${name}"]["landuse"="reservoir"](${BBOX});
  relation["name"="${name}"]["landuse"="reservoir"](${BBOX});
);
out geom;`;
}

function extractFeature(osmJson, name) {
  const gj = osmtogeojson(osmJson);
  const features = gj.features.filter(
    (f) => f.properties?.name === name || f.properties?.['name:de'] === name,
  );
  return features[0] ?? null;
}

const liste = BONUS ? [...GEWAESSER, ...BONUS_GEWAESSER] : GEWAESSER;
fs.mkdirSync('public/geo', { recursive: true });

for (const g of liste) {
  let feature = null;
  const osm = await overpass(queryForGewaesser(g));
  if (osm) feature = extractFeature(osm, g.name);

  if (!feature) {
    console.warn('Overpass ohne Treffer für', g.name, '– Nominatim-Fallback');
    feature = await nominatimFallback(g.name);
  }

  if (!feature) {
    console.error('FEHLT:', g.name, '– auf map.geo.admin.ch prüfen');
    if (!BONUS) process.exit(1);
    continue;
  }

  const out = {
    type: 'FeatureCollection',
    features: [
      {
        ...feature,
        properties: {
          id: g.id,
          name: g.name,
          quelle: '© OpenStreetMap-Mitwirkende (ODbL)',
        },
      },
    ],
  };
  fs.writeFileSync(`public/geo/${g.datei}`, JSON.stringify(out));
  console.log('✓', g.name, '→', g.datei);
  await new Promise((r) => setTimeout(r, 1000));
}

console.log('Fertig:', liste.length, 'Gewässer verarbeitet.');
