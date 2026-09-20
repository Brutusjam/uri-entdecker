import { GRUND_ELEMENTE } from '../data/elemente';
import { istGutGelernt } from './leitner';
import type { FortschrittMap } from '../types/fortschritt';
import type { LernElement } from '../types/karte';

export const PROFI_SCHWELLE = 0.7;

export function elternAufgabe(zufall: () => number = Math.random): { a: number; b: number } {
  const a = 2 + Math.floor(zufall() * 8);
  const b = 2 + Math.floor(zufall() * 8);
  return { a, b };
}

export function profiAnteil(
  fortschritt: FortschrittMap,
  elemente: readonly LernElement[] = GRUND_ELEMENTE,
): number {
  if (elemente.length === 0) return 0;
  const gut = elemente.filter((e) => istGutGelernt(fortschritt[e.id]?.stufe ?? 0)).length;
  return gut / elemente.length;
}

export function profiBereit(
  fortschritt: FortschrittMap,
  elemente: readonly LernElement[] = GRUND_ELEMENTE,
): boolean {
  return profiAnteil(fortschritt, elemente) >= PROFI_SCHWELLE;
}

export function schwacheElemente(
  fortschritt: FortschrittMap,
  elemente: readonly LernElement[] = GRUND_ELEMENTE,
): LernElement[] {
  return elemente.filter((e) => !istGutGelernt(fortschritt[e.id]?.stufe ?? 0));
}

export function formatiereUebungszeit(sekunden: number): string {
  const s = Math.max(0, Math.floor(sekunden));
  const min = Math.floor(s / 60);
  if (min < 1) return `${s} Sek.`;
  return `${min} Min.`;
}
