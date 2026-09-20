import { booleanPointInPolygon, buffer, point } from '@turf/turf';
import type { Feature, Geometry, Polygon, MultiPolygon } from 'geojson';
import type { GemeindeFeature, KantonFeature, GewaesserFeature, KartenAuswahl } from '../types/karte';

/** Kleine Gemeinden mit vergrösserter Trefferzone (km) */
export const KLEINE_GEMEINDEN = new Set([1201, 1207, 1213, 1217]);
const TREFFER_PUFFER_KM = 1.5;

/** Mindest-Trefferradius in Kartenpixeln (DESIGN: 48 px Touch-Ziel). */
export const MIN_GEMEINDE_TREFFER_PX = 24;

export function findeKleineGemeindeAnPixel(
  mapX: number,
  mapY: number,
  gemeinden: GemeindeFeature[],
  zentrum: (g: GemeindeFeature) => [number, number] | null,
): GemeindeFeature | null {
  let best: { gem: GemeindeFeature; dist: number } | null = null;
  for (const g of gemeinden) {
    if (!KLEINE_GEMEINDEN.has(g.properties.bfs)) continue;
    const c = zentrum(g);
    if (!c) continue;
    const dist = Math.hypot(mapX - c[0], mapY - c[1]);
    if (dist <= MIN_GEMEINDE_TREFFER_PX && (!best || dist < best.dist)) {
      best = { gem: g, dist };
    }
  }
  return best?.gem ?? null;
}

/** Kleine Seen, die sonst auf der Uri-Karte nur wenige Pixel gross sind. */
export const KLEINE_SEEN = new Set(['goescheneralpsee']);
export const SEE_PUFFER_KM = 3;

type Flaeche = Feature<Polygon | MultiPolygon>;

function punktInFlaeche(lng: number, lat: number, feature: Flaeche): boolean {
  return booleanPointInPolygon(point([lng, lat]), feature);
}

export function findeGemeindeAnPunkt(
  lng: number,
  lat: number,
  gemeinden: GemeindeFeature[],
): GemeindeFeature | null {
  const p = point([lng, lat]);
  const exakt = gemeinden.find((g) => booleanPointInPolygon(p, g as Flaeche));
  if (exakt) return exakt;
  for (const g of gemeinden) {
    if (!KLEINE_GEMEINDEN.has(g.properties.bfs)) continue;
    const zone = buffer(g as Flaeche, TREFFER_PUFFER_KM, { units: 'kilometers' });
    if (zone && booleanPointInPolygon(p, zone)) return g;
  }
  return null;
}

export function findeKantonAnPunkt(lng: number, lat: number, kantone: KantonFeature[]): KantonFeature | null {
  return kantone.find((k) => punktInFlaeche(lng, lat, k as Flaeche)) ?? null;
}

export function seePuffer(feature: GewaesserFeature): Feature<Polygon | MultiPolygon> | null {
  if (!KLEINE_SEEN.has(feature.properties.id)) return null;
  try {
    return buffer(feature as Flaeche, SEE_PUFFER_KM, { units: 'kilometers' }) ?? null;
  } catch {
    return null;
  }
}

export function findeGewaesserAnPunkt(
  lng: number,
  lat: number,
  seen: GewaesserFeature[],
): GewaesserFeature | null {
  const p = point([lng, lat]);
  const exakt = seen.find((s) => punktInFlaeche(lng, lat, s as Flaeche));
  if (exakt) return exakt;
  for (const s of seen) {
    const zone = seePuffer(s);
    if (zone && booleanPointInPolygon(p, zone)) return s;
  }
  return null;
}

/** Priorität: Gewässer > Gemeinde > Kanton (Nachbar) */
export function findeFeatureAnPunkt(
  lng: number,
  lat: number,
  gemeinden: GemeindeFeature[],
  kantone: KantonFeature[],
  seen: GewaesserFeature[],
): KartenAuswahl | null {
  const see = findeGewaesserAnPunkt(lng, lat, seen);
  if (see) {
    return { id: `see-${see.properties.id}`, kategorie: 'gewaesser', name: see.properties.name };
  }
  const gem = findeGemeindeAnPunkt(lng, lat, gemeinden);
  if (gem) {
    return { id: `gem-${gem.properties.bfs}`, kategorie: 'gemeinde', name: gem.properties.name, bfs: gem.properties.bfs };
  }
  const kt = findeKantonAnPunkt(lng, lat, kantone);
  if (kt && (kt.properties.kuerzel !== 'UR' || gemeinden.length === 0)) {
    return {
      id: `kt-${kt.properties.kuerzel}`,
      kategorie: 'kanton',
      name: kt.properties.name,
      kuerzel: kt.properties.kuerzel,
    };
  }
  return null;
}

/** [west, south, east, north] in WGS84. */
export type GeoBbox = readonly [number, number, number, number];

export function reliefBildKasten(
  projection: (punkt: [number, number]) => [number, number] | null,
  bbox: GeoBbox,
): { x: number; y: number; width: number; height: number } | null {
  const [west, south, east, north] = bbox;
  const nw = projection([west, north]);
  const se = projection([east, south]);
  if (!nw || !se) return null;
  const width = se[0] - nw[0];
  const height = se[1] - nw[1];
  if (!(width > 0) || !(height > 0)) return null;
  return { x: nw[0], y: nw[1], width, height };
}

/** Shoelace: positiv = Uhrzeigersinn (lng/lat). */
export function ringSumme(ring: number[][]): number {
  let s = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    s += (ring[i + 1][0] - ring[i][0]) * (ring[i + 1][1] + ring[i][1]);
  }
  return s;
}

function ringMitSinn(ring: number[][], uhrzeiger: boolean): number[][] {
  const istUhrzeiger = ringSumme(ring) > 0;
  return istUhrzeiger === uhrzeiger ? ring : [...ring].reverse();
}

/**
 * d3-geo füllt gegen den Uhrzeigersinn gewickelte Polygone als ganze Welt.
 * Gemeinden/Kantone sind Uhrzeigersinn – Seen werden beim Zeichnen angeglichen.
 */
export function mitD3Windung<T extends Feature<Geometry>>(feature: T): T {
  const g = feature.geometry;
  if (g.type === 'Polygon') {
    return {
      ...feature,
      geometry: {
        ...g,
        coordinates: g.coordinates.map((ring, i) => ringMitSinn(ring, i === 0)),
      },
    };
  }
  if (g.type === 'MultiPolygon') {
    return {
      ...feature,
      geometry: {
        ...g,
        coordinates: g.coordinates.map((poly) => poly.map((ring, i) => ringMitSinn(ring, i === 0))),
      },
    };
  }
  return feature;
}

