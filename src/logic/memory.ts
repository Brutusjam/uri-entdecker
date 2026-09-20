import type { LernElement } from '../types/karte';
import type { FortschrittMap } from '../types/fortschritt';
import { waehleNaechstesElement } from './fragen';
import { mische } from './zufall';

export type MemoryPaarTyp = 'wappen-name' | 'wappen-umriss' | 'kanton-name' | 'bild-name';
export type MemoryGroesse = '4x4' | '5x4' | '6x5';
export type MemorySeite = 'wappen' | 'name' | 'umriss' | 'bild';

export const MEMORY_GROESSEN: Record<
  MemoryGroesse,
  { spalten: number; zeilen: number; paare: number }
> = {
  '4x4': { spalten: 4, zeilen: 4, paare: 8 },
  '5x4': { spalten: 5, zeilen: 4, paare: 10 },
  '6x5': { spalten: 6, zeilen: 5, paare: 15 },
};

export interface MemoryKarte {
  id: string;
  elementId: string;
  seite: MemorySeite;
}

export function waehleMemoryElemente(
  pool: LernElement[],
  fortschritt: FortschrittMap,
  anzahl: number,
): LernElement[] {
  const n = Math.min(anzahl, pool.length);
  const genommen: LernElement[] = [];
  let letzte: string | null = null;
  const rest = [...pool];
  while (genommen.length < n && rest.length > 0) {
    const el = waehleNaechstesElement(rest, fortschritt, letzte);
    genommen.push(el);
    letzte = el.id;
    const i = rest.findIndex((r) => r.id === el.id);
    rest.splice(i, 1);
  }
  return genommen;
}

export function baueMemoryKarten(
  elemente: LernElement[],
  paarTyp: MemoryPaarTyp,
  zufall: () => number = Math.random,
): MemoryKarte[] {
  const karten: MemoryKarte[] = [];
  for (const el of elemente) {
    if (paarTyp === 'bild-name') {
      karten.push({ id: `${el.id}-bild`, elementId: el.id, seite: 'bild' });
      karten.push({ id: `${el.id}-name`, elementId: el.id, seite: 'name' });
      continue;
    }
    karten.push({ id: `${el.id}-wappen`, elementId: el.id, seite: 'wappen' });
    const zweite: MemorySeite = paarTyp === 'wappen-umriss' ? 'umriss' : 'name';
    karten.push({ id: `${el.id}-${zweite}`, elementId: el.id, seite: zweite });
  }
  return mische(karten, zufall);
}

export function istMemoryPaar(a: MemoryKarte, b: MemoryKarte): boolean {
  return a.elementId === b.elementId && a.id !== b.id;
}

/** 3 Sterne: fast ohne Umweg. 2 Sterne: höchstens doppelt so viele Züge. Sonst 1. */
export function memorySterne(zuege: number, paare: number): 1 | 2 | 3 {
  if (zuege <= paare + 2) return 3;
  if (zuege <= paare * 2) return 2;
  return 1;
}

export function memoryRaster(
  kartenAnzahl: number,
  gewuenscht: MemoryGroesse,
): { spalten: number; zeilen: number } {
  const g = MEMORY_GROESSEN[gewuenscht];
  if (kartenAnzahl === g.spalten * g.zeilen) {
    return { spalten: g.spalten, zeilen: g.zeilen };
  }
  for (const spalten of [g.spalten, 6, 5, 4]) {
    if (kartenAnzahl % spalten === 0) {
      return { spalten, zeilen: kartenAnzahl / spalten };
    }
  }
  const spalten = kartenAnzahl > 20 ? 6 : kartenAnzahl > 16 ? 5 : 4;
  return { spalten, zeilen: Math.ceil(kartenAnzahl / spalten) };
}

export function formatiereZeit(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

/** Quadratische Kartenkante, damit das ganze Raster in das Feld passt. */
export function memoryZellenGroesse(
  feldBreite: number,
  feldHoehe: number,
  spalten: number,
  zeilen: number,
  abstand: number,
): number {
  if (spalten <= 0 || zeilen <= 0 || feldBreite <= 0 || feldHoehe <= 0) return 0;
  const nachBreite = (feldBreite - abstand * (spalten - 1)) / spalten;
  const nachHoehe = (feldHoehe - abstand * (zeilen - 1)) / zeilen;
  return Math.max(0, Math.floor(Math.min(nachBreite, nachHoehe)));
}
