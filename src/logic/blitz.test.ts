import { describe, expect, it } from 'vitest';
import { BLITZ_SEKUNDEN, blitzBestKey, blitzVorbei, restSekunden } from './blitz';

describe('blitz', () => {
  it('zählt 60 Sekunden herunter', () => {
    const start = 1_000_000;
    expect(restSekunden(start, start)).toBe(BLITZ_SEKUNDEN);
    expect(restSekunden(start, start + 15_000)).toBe(45);
    expect(restSekunden(start, start + 60_000)).toBe(0);
    expect(restSekunden(start, start + 90_000)).toBe(0);
  });

  it('ist vorbei bei 0', () => {
    expect(blitzVorbei(0)).toBe(true);
    expect(blitzVorbei(1)).toBe(false);
  });

  it('hat einen Schlüssel pro Kategorie', () => {
    expect(blitzBestKey('kanton')).toBe('blitz-kanton');
  });
});
