// Schneidet den Vierwaldstättersee auf den Urner Teil zu (turf.intersect mit Kantonspolygon Uri).
// Ausführen: node scripts/clip-urnersee.mjs
import fs from 'node:fs';
import * as turf from '@turf/turf';

const see = JSON.parse(fs.readFileSync('public/geo/vierwaldstaettersee.geojson', 'utf8'));
const kantone = JSON.parse(fs.readFileSync('public/geo/kantone.geojson', 'utf8'));

const uri = kantone.features.find((f) => f.properties.kuerzel === 'UR');
if (!see.features.length) throw new Error('Vierwaldstättersee fehlt');
if (!uri) throw new Error('Kanton Uri fehlt in kantone.geojson');

const seeFeature = see.features[0];
const clipped = turf.intersect(
  turf.featureCollection([seeFeature, uri]),
);

if (!clipped) {
  throw new Error('Schnitt Urnersee ∩ Uri ergab keine Fläche – Geometrie prüfen');
}

const out = {
  type: 'FeatureCollection',
  features: [
    {
      ...clipped,
      properties: {
        id: 'urnersee',
        name: 'Urnersee',
        quelle: 'Vierwaldstättersee (swiss-maps) ∩ Kanton Uri',
      },
    },
  ],
};

fs.writeFileSync('public/geo/urnersee.geojson', JSON.stringify(out));
const area = turf.area(clipped);
console.log('OK: Urnersee gespeichert, Fläche ca.', Math.round(area / 1e6), 'km²');
