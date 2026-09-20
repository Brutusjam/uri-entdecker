import { describe, expect, it } from 'vitest';
import { istSagenAntwort, SAGEN, SAGEN_FRAGEN, TEUFELSBRUECKE_SAGE, TELL_SAGE } from './sagen';

describe('sagen', () => {
  it('hat zwei Geschichten mit Kennzeichnung', () => {
    expect(SAGEN).toHaveLength(2);
    expect(TEUFELSBRUECKE_SAGE.kennzeichnung).toBe('Man erzählt sich …');
    expect(TELL_SAGE.seiten.length).toBeGreaterThanOrEqual(4);
    expect(TEUFELSBRUECKE_SAGE.seiten.length).toBeGreaterThanOrEqual(4);
  });

  it('prüft Quiz-Antworten', () => {
    const fluss = SAGEN_FRAGEN.find((f) => f.id === 'fluss')!;
    expect(istSagenAntwort('Reuss', fluss)).toBe(true);
    expect(istSagenAntwort('Schächen', fluss)).toBe(false);
    expect(SAGEN_FRAGEN.some((f) => f.id === 'hohle')).toBe(true);
  });
});
