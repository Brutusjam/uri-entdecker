import { describe, it, expect } from 'vitest';
import {
  neuerFortschritt,
  beiRichtig,
  beiFalsch,
  istFaellig,
  stufeFarbe,
  inTagen,
} from './leitner';

describe('leitner', () => {
  it('startet bei Stufe 0', () => {
    const f = neuerFortschritt('2026-01-01');
    expect(f.stufe).toBe(0);
    expect(f.richtig).toBe(0);
    expect(f.falsch).toBe(0);
  });

  it('steigert Stufe bei richtiger Antwort', () => {
    let f = neuerFortschritt('2026-01-01');
    f = beiRichtig(f, '2026-01-01');
    expect(f.stufe).toBe(1);
    expect(f.richtig).toBe(1);
    expect(f.naechsteWiederholung).toBe(inTagen(1, new Date('2026-01-01')));
  });

  it('erreicht Stufe 5 nach fünf richtigen Antworten', () => {
    let f = neuerFortschritt('2026-01-01');
    for (let i = 0; i < 5; i++) f = beiRichtig(f, '2026-01-01');
    expect(f.stufe).toBe(5);
    expect(f.richtig).toBe(5);
  });

  it('senkt Stufe bei falscher Antwort nicht', () => {
    let f = beiRichtig(beiRichtig(neuerFortschritt('2026-01-01'), '2026-01-01'), '2026-01-02');
    expect(f.stufe).toBe(2);
    f = beiFalsch(f, '2026-01-03');
    expect(f.stufe).toBe(2);
    expect(f.falsch).toBe(1);
    expect(f.naechsteWiederholung).toBe('2026-01-03');
  });

  it('prüft Fälligkeit', () => {
    const f = { ...neuerFortschritt('2026-01-01'), naechsteWiederholung: '2026-01-05' };
    expect(istFaellig(f, '2026-01-04')).toBe(false);
    expect(istFaellig(f, '2026-01-05')).toBe(true);
  });

  it('liefert Farben je Stufe', () => {
    expect(stufeFarbe(0)).toBe('var(--color-neu-grau)');
    expect(stufeFarbe(2)).toBe('var(--color-wiese)');
    expect(stufeFarbe(4)).toBe('var(--color-alp-gruen-dunkel)');
    expect(stufeFarbe(5)).toBe('var(--color-gold)');
  });
});
