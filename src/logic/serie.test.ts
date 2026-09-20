import { describe, expect, it } from 'vitest';
import { aktualisiereSerie, leereSerie, tageZwischen } from './serie';

describe('serie', () => {
  it('startet am ersten Spieltag', () => {
    expect(aktualisiereSerie(leereSerie(), '2026-09-19')).toEqual({
      tage: 1,
      letzterTag: '2026-09-19',
      frostBereit: true,
    });
  });

  it('zählt aufeinanderfolgende Tage', () => {
    const tag1 = aktualisiereSerie(leereSerie(), '2026-09-19');
    const tag2 = aktualisiereSerie(tag1, '2026-09-20');
    expect(tag2.tage).toBe(2);
    expect(tag2.frostBereit).toBe(true);
  });

  it('verzeiht einen Pausentag', () => {
    const tag1 = aktualisiereSerie(leereSerie(), '2026-09-19');
    const nachPause = aktualisiereSerie(tag1, '2026-09-21');
    expect(nachPause.tage).toBe(2);
    expect(nachPause.frostBereit).toBe(false);
  });

  it('setzt nach zwei Pausentagen zurück', () => {
    const tag1 = aktualisiereSerie(leereSerie(), '2026-09-19');
    const neu = aktualisiereSerie(tag1, '2026-09-22');
    expect(neu.tage).toBe(1);
  });

  it('ändert am selben Tag nichts', () => {
    const tag1 = aktualisiereSerie(leereSerie(), '2026-09-19');
    expect(aktualisiereSerie(tag1, '2026-09-19')).toEqual(tag1);
  });

  it('zählt Kalendertage', () => {
    expect(tageZwischen('2026-09-19', '2026-09-21')).toBe(2);
  });
});
