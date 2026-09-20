import { GEMEINDEN } from '../data/gemeinden';
import { TAELER } from '../data/taeler';
import { NACHBAR_KUERZEL } from '../data/kantone';
import { WAPPEN_ELEMENTE } from './wappen';
import { istGutGelernt, istGemeistert } from './leitner';
import type { FortschrittMap } from '../types/fortschritt';

export interface AbzeichenDef {
  id: string;
  titel: string;
  text: string;
}

export interface AbzeichenKontext {
  fortschritt: FortschrittMap;
  serieTage: number;
  puzzleBest: Record<string, number>;
  memoryBestZuege: number | null;
}

export const ABZEICHEN: AbzeichenDef[] = [
  {
    id: 'nachbarn',
    titel: 'Alle Nachbarn gefunden',
    text: 'Die acht Nachbarkantone sitzen.',
  },
  {
    id: 'serie-10',
    titel: '10er-Serie',
    text: 'Zehn Tage in Folge geübt.',
  },
  {
    id: 'taeler',
    titel: 'Ohne Tipp durch alle Täler',
    text: 'Alle zehn Täler sind gut gelernt.',
  },
  {
    id: 'puzzle-tempo',
    titel: 'Puzzle unter 2 Minuten',
    text: 'Ein Puzzle in unter zwei Minuten geschafft.',
  },
  {
    id: 'memory-flink',
    titel: 'Memory in unter 20 Zügen',
    text: 'Eine Memory-Runde in wenigen Zügen.',
  },
  {
    id: 'wappen-kennerin',
    titel: 'Wappen-Kennerin',
    text: 'Alle Gemeinde- und Kantonswappen ab Stufe 3.',
  },
  {
    id: 'gemeinden-gold',
    titel: 'Goldene Gemeinden',
    text: 'Alle 19 Gemeinden gemeistert.',
  },
];

export function abzeichenDef(id: string): AbzeichenDef | undefined {
  return ABZEICHEN.find((a) => a.id === id);
}

function alleStufe(elemente: { id: string }[], fortschritt: FortschrittMap, min: number): boolean {
  return elemente.every((e) => (fortschritt[e.id]?.stufe ?? 0) >= min);
}

export function verdienteAbzeichen(ctx: AbzeichenKontext): string[] {
  const ids: string[] = [];
  const nachbarn = NACHBAR_KUERZEL.map((k) => `kt-${k}`);
  if (nachbarn.every((id) => (ctx.fortschritt[id]?.stufe ?? 0) >= 1)) ids.push('nachbarn');
  if (ctx.serieTage >= 10) ids.push('serie-10');
  if (TAELER.every((t) => istGutGelernt(ctx.fortschritt[t.id]?.stufe ?? 0))) ids.push('taeler');
  const puzzleZeiten = Object.values(ctx.puzzleBest);
  if (puzzleZeiten.some((ms) => ms > 0 && ms < 120_000)) ids.push('puzzle-tempo');
  if (ctx.memoryBestZuege !== null && ctx.memoryBestZuege > 0 && ctx.memoryBestZuege < 20) {
    ids.push('memory-flink');
  }
  if (alleStufe(WAPPEN_ELEMENTE, ctx.fortschritt, 3)) ids.push('wappen-kennerin');
  if (GEMEINDEN.every((g) => istGemeistert(ctx.fortschritt[g.id]?.stufe ?? 0))) ids.push('gemeinden-gold');
  return ids;
}

export function neueAbzeichen(vorher: readonly string[], jetzt: readonly string[]): string[] {
  const alt = new Set(vorher);
  return jetzt.filter((id) => !alt.has(id));
}

/** Einmal verdient bleibt verdient, auch wenn die Serie später abbricht. */
export function merkeAbzeichen(vorher: readonly string[], verdient: readonly string[]): string[] {
  return [...new Set([...vorher, ...verdient])];
}
