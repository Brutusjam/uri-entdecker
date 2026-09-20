import type { LernElement } from '../types/karte';
import { mische } from './zufall';

export type BeschriftenStufe = 'leicht' | 'mittel' | 'profi';

export const BESCHRIFTEN_LEICHT_ANZAHL = 8;
export const BESCHRIFTEN_BLINK_NACH = 2;

export function beschriftenPool(
  elemente: readonly LernElement[],
  stufe: BeschriftenStufe,
  zufall: () => number = Math.random,
): LernElement[] {
  const gemischt = mische(elemente, zufall);
  if (stufe === 'leicht') return gemischt.slice(0, Math.min(BESCHRIFTEN_LEICHT_ANZAHL, gemischt.length));
  return gemischt;
}

export function darfBlinken(stufe: BeschriftenStufe, fehlversuche: number): boolean {
  if (stufe === 'profi') return false;
  return fehlversuche >= BESCHRIFTEN_BLINK_NACH;
}
