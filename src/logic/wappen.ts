import { GEMEINDEN } from '../data/gemeinden';
import { KANTONE } from '../data/kantone';
import type { KartenAuswahl, LernElement } from '../types/karte';
import type { FortschrittMap } from '../types/fortschritt';
import { waehleNaechstesElement } from './fragen';
import { mische } from './zufall';

export const WAPPEN_ELEMENTE: LernElement[] = [...GEMEINDEN, ...KANTONE];

export type QuizVariante = 'wappen-name' | 'name-wappen' | 'wappen-karte';
export type WappenPool = 'gemeinden' | 'kantone';

export function wappenPool(art: WappenPool): LernElement[] {
  return art === 'kantone' ? [...KANTONE] : [...GEMEINDEN];
}

export function waehleDistraktoren(
  ziel: LernElement,
  pool: readonly LernElement[],
  anzahl: number,
  zufall: () => number = Math.random,
): LernElement[] {
  const kandidaten = pool.filter((e) => e.id !== ziel.id);
  return mische(kandidaten, zufall).slice(0, anzahl);
}

export interface WappenFrage {
  ziel: LernElement;
  variante: QuizVariante;
  optionen: LernElement[];
}

export function neueWappenFrage(
  pool: LernElement[],
  fortschritt: FortschrittMap,
  letzteId: string | null,
  variante: QuizVariante,
  zufall: () => number = Math.random,
): WappenFrage {
  const ziel = waehleNaechstesElement(pool, fortschritt, letzteId);
  const andere = waehleDistraktoren(ziel, pool, 3, zufall);
  const optionen = mische([ziel, ...andere], zufall);
  return { ziel, variante, optionen };
}

export function istWappenAntwort(wahlId: string, ziel: LernElement): boolean {
  return wahlId === ziel.id;
}

export function passtKartenAuswahl(auswahl: KartenAuswahl, ziel: LernElement): boolean {
  if (ziel.kategorie === 'gemeinde') {
    return auswahl.kategorie === 'gemeinde' && auswahl.bfs === Number(ziel.geo);
  }
  if (ziel.kategorie === 'kanton') {
    return auswahl.kategorie === 'kanton' && auswahl.kuerzel === ziel.geo;
  }
  if (ziel.kategorie === 'tal' || ziel.kategorie === 'gewaesser') {
    return auswahl.kategorie === ziel.kategorie && auswahl.id === ziel.id;
  }
  if (ziel.kategorie === 'pass' || ziel.kategorie === 'berg' || ziel.kategorie === 'sagenort') {
    return auswahl.kategorie === ziel.kategorie && auswahl.id === ziel.id;
  }
  return false;
}
