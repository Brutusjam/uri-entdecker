import { booleanPointInPolygon, buffer, lineString, point, pointToLineDistance } from '@turf/turf';
import type { Feature, Polygon, MultiPolygon } from 'geojson';
import { TAL_KATALOG } from '../data/taeler';
import taelerRoh from '../data/taeler.json' with { type: 'json' };

/** Trefferzone um den Talboden (PLAN: 1–1.5 km). */
export const TAL_PUFFER_KM = 1.25;

export type Koordinate = [number, number];

export interface TalGeo {
  id: string;
  name: string;
  linie: Koordinate[];
  label: Koordinate | null;
}

export interface TaelerDatei {
  taeler: TalGeo[];
}

export function leereTaeler(): TalGeo[] {
  return TAL_KATALOG.map((k) => ({ id: k.id, name: k.name, linie: [], label: null }));
}

export function istTalFertig(tal: TalGeo): boolean {
  return tal.linie.length >= 2 && tal.label !== null;
}

export function talKatalogHinweis(id: string): string {
  return TAL_KATALOG.find((k) => k.id === id)?.hinweis ?? '';
}

function istKoordinate(wert: unknown): wert is Koordinate {
  return (
    Array.isArray(wert) &&
    wert.length === 2 &&
    typeof wert[0] === 'number' &&
    typeof wert[1] === 'number' &&
    Number.isFinite(wert[0]) &&
    Number.isFinite(wert[1])
  );
}

export function parseTaelerDatei(roh: unknown): TaelerDatei {
  const leer = { taeler: leereTaeler() };
  if (!roh || typeof roh !== 'object' || !('taeler' in roh)) return leer;
  const liste = (roh as { taeler: unknown }).taeler;
  if (!Array.isArray(liste)) return leer;

  const nachId = new Map<string, TalGeo>();
  for (const eintrag of liste) {
    if (!eintrag || typeof eintrag !== 'object') continue;
    const e = eintrag as Record<string, unknown>;
    if (typeof e.id !== 'string' || typeof e.name !== 'string') continue;
    const linie = Array.isArray(e.linie) ? e.linie.filter(istKoordinate) : [];
    const label = istKoordinate(e.label) ? e.label : null;
    nachId.set(e.id, { id: e.id, name: e.name, linie, label });
  }

  return {
    taeler: TAL_KATALOG.map((k) => nachId.get(k.id) ?? { id: k.id, name: k.name, linie: [], label: null }),
  };
}

export function taelerJson(taeler: TalGeo[]): string {
  return `${JSON.stringify({ taeler }, null, 2)}\n`;
}

export function talPuffer(linie: Koordinate[]): Feature<Polygon | MultiPolygon> | null {
  if (linie.length < 2) return null;
  try {
    return buffer(lineString(linie), TAL_PUFFER_KM, { units: 'kilometers' }) ?? null;
  } catch {
    return null;
  }
}

export function findeTalAnPunkt(lng: number, lat: number, taeler: TalGeo[]): TalGeo | null {
  const p = point([lng, lat]);
  const treffer = taeler.filter((tal) => {
    const puffer = talPuffer(tal.linie);
    return puffer ? booleanPointInPolygon(p, puffer) : false;
  });
  if (treffer.length === 0) return null;
  if (treffer.length === 1) return treffer[0]!;
  return treffer.slice().sort((a, b) => {
    const da = pointToLineDistance(p, lineString(a.linie), { units: 'kilometers' });
    const db = pointToLineDistance(p, lineString(b.linie), { units: 'kilometers' });
    return da - db;
  })[0]!;
}

export function liniePfad(
  linie: Koordinate[],
  projektion: (c: Koordinate) => [number, number] | null | undefined,
): string {
  const pts = linie
    .map((c) => projektion(c))
    .filter((p): p is [number, number] => Array.isArray(p) && p.length === 2);
  if (pts.length === 0) return '';
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]} ${p[1]}`).join(' ');
}

export const TAELER_SPEICHER_KEY = 'uri-entdecker-taeler-entwurf';

export const TAELER_GEO: TalGeo[] = parseTaelerDatei(taelerRoh).taeler.filter(istTalFertig);
