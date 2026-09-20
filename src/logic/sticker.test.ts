import { describe, it, expect } from 'vitest';
import { beiRichtig, neuerFortschritt } from './leitner';
import { istGesehen, seiteVoll, stickerArt } from './sticker';
import type { LernElement } from '../types/karte';

const mini: LernElement[] = [
  { id: 'a', kategorie: 'gemeinde', name: 'A', geo: '1', tipps: [] },
  { id: 'b', kategorie: 'gemeinde', name: 'B', geo: '2', tipps: [] },
];

describe('sticker', () => {
  it('gibt Stufe 3 einen normalen Sticker und Stufe 5 Glanz', () => {
    expect(stickerArt(0)).toBe('leer');
    expect(stickerArt(2)).toBe('leer');
    expect(stickerArt(3)).toBe('normal');
    expect(stickerArt(5)).toBe('glanz');
  });

  it('zählt ein Element als gesehen nach der ersten Antwort', () => {
    expect(istGesehen(neuerFortschritt())).toBe(false);
    expect(istGesehen({ ...neuerFortschritt(), falsch: 1 })).toBe(true);
  });

  it('ist eine Seite voll, wenn alle Stufe 3 haben', () => {
    let a = neuerFortschritt();
    a = beiRichtig(beiRichtig(beiRichtig(a)));
    const b = beiRichtig(beiRichtig(beiRichtig(neuerFortschritt())));
    expect(seiteVoll(mini, { a, b })).toBe(true);
    expect(seiteVoll(mini, { a })).toBe(false);
  });
});
