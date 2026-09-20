import { mische } from './zufall';
import type { PunktFeature } from '../types/karte';
import { punktHoehe } from './punkte';

export interface GipfelPaar {
  a: PunktFeature;
  b: PunktFeature;
  hoeherId: string;
}

export function gipfelMitHoehe(punkte: readonly PunktFeature[]): PunktFeature[] {
  return punkte.filter((p) => p.properties.art === 'berg' && punktHoehe(p) !== null);
}

export function waehleGipfelPaar(
  berge: readonly PunktFeature[],
  zufall: () => number = Math.random,
): GipfelPaar | null {
  const mitHoehe = gipfelMitHoehe(berge);
  if (mitHoehe.length < 2) return null;
  const [a, b] = mische(mitHoehe, zufall);
  if (!a || !b) return null;
  const ha = punktHoehe(a) ?? 0;
  const hb = punktHoehe(b) ?? 0;
  if (ha === hb) return waehleGipfelPaar(mitHoehe.filter((p) => p.properties.id !== a.properties.id), zufall);
  return { a, b, hoeherId: ha > hb ? a.properties.id : b.properties.id };
}

export function istHoeher(wahlId: string, paar: GipfelPaar): boolean {
  return wahlId === paar.hoeherId;
}
