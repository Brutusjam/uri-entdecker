import { describe, expect, it } from 'vitest';
import { merkeAbzeichen, neueAbzeichen, verdienteAbzeichen } from './abzeichen';
import { NACHBAR_KUERZEL } from '../data/kantone';
import { beiRichtig, neuerFortschritt } from './leitner';

describe('abzeichen', () => {
  it('vergibt Nachbarn, wenn alle acht gefunden sind', () => {
    const fortschritt = Object.fromEntries(
      NACHBAR_KUERZEL.map((k) => [`kt-${k}`, { ...neuerFortschritt(), stufe: 1 as const }]),
    );
    expect(verdienteAbzeichen({ fortschritt, serieTage: 0, puzzleBest: {}, memoryBestZuege: null })).toContain(
      'nachbarn',
    );
  });

  it('vergibt 10er-Serie', () => {
    expect(
      verdienteAbzeichen({ fortschritt: {}, serieTage: 10, puzzleBest: {}, memoryBestZuege: null }),
    ).toContain('serie-10');
  });

  it('vergibt Puzzle-Tempo unter 2 Minuten', () => {
    expect(
      verdienteAbzeichen({
        fortschritt: {},
        serieTage: 0,
        puzzleBest: { 'gemeinden-leicht': 90_000 },
        memoryBestZuege: null,
      }),
    ).toContain('puzzle-tempo');
  });

  it('vergibt Memory unter 20 Zügen', () => {
    expect(
      verdienteAbzeichen({ fortschritt: {}, serieTage: 0, puzzleBest: {}, memoryBestZuege: 18 }),
    ).toContain('memory-flink');
  });

  it('findet nur neue Abzeichen', () => {
    expect(neueAbzeichen(['nachbarn'], ['nachbarn', 'serie-10'])).toEqual(['serie-10']);
  });

  it('behält verdiente Abzeichen', () => {
    expect(merkeAbzeichen(['serie-10'], ['nachbarn'])).toEqual(['serie-10', 'nachbarn']);
  });

  it('nutzt Leitner-Stufen', () => {
    expect(beiRichtig(neuerFortschritt()).stufe).toBe(1);
  });
});
