import type { ElementFortschritt, FortschrittMap } from '../types/fortschritt';
import type { LernElement } from '../types/karte';
import { neuerFortschritt } from './leitner';

export type StickerArt = 'leer' | 'normal' | 'glanz';

export function stickerArt(stufe: number): StickerArt {
  if (stufe >= 5) return 'glanz';
  if (stufe >= 3) return 'normal';
  return 'leer';
}

export function istGesehen(f: ElementFortschritt | undefined): boolean {
  const stand = f ?? neuerFortschritt();
  return stand.richtig + stand.falsch > 0 || stand.stufe > 0;
}

export function seiteVoll(elemente: readonly LernElement[], fortschritt: FortschrittMap): boolean {
  return elemente.every((e) => (fortschritt[e.id]?.stufe ?? 0) >= 3);
}

export function seiteGlanzVoll(
  elemente: readonly LernElement[],
  fortschritt: FortschrittMap,
): boolean {
  return elemente.every((e) => (fortschritt[e.id]?.stufe ?? 0) >= 5);
}
