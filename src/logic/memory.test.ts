import { describe, it, expect } from 'vitest';
import { GEMEINDEN } from '../data/gemeinden';
import { PAESSE } from '../data/paesse';
import {
  baueMemoryKarten,
  formatiereZeit,
  istMemoryPaar,
  memoryRaster,
  memorySterne,
  memoryZellenGroesse,
  waehleMemoryElemente,
} from './memory';

describe('memory', () => {
  it('baut genau zwei Karten pro Element', () => {
    const karten = baueMemoryKarten(GEMEINDEN.slice(0, 4), 'wappen-name', () => 0);
    expect(karten).toHaveLength(8);
    expect(karten.filter((k) => k.seite === 'wappen')).toHaveLength(4);
    expect(karten.filter((k) => k.seite === 'name')).toHaveLength(4);
  });

  it('baut Bild-Name-Paare für Profi-Elemente', () => {
    const karten = baueMemoryKarten(PAESSE.slice(0, 2), 'bild-name', () => 0);
    expect(karten).toHaveLength(4);
    expect(karten.filter((k) => k.seite === 'bild')).toHaveLength(2);
    expect(karten.filter((k) => k.seite === 'name')).toHaveLength(2);
  });

  it('erkennt ein passendes Paar', () => {
    const [a, b] = baueMemoryKarten(GEMEINDEN.slice(0, 1), 'wappen-name', () => 0);
    expect(istMemoryPaar(a!, b!)).toBe(true);
    expect(istMemoryPaar(a!, a!)).toBe(false);
  });

  it('vergibt Sterne nach Zugzahl', () => {
    expect(memorySterne(8, 8)).toBe(3);
    expect(memorySterne(16, 8)).toBe(2);
    expect(memorySterne(30, 8)).toBe(1);
  });

  it('nimmt nicht mehr Elemente als der Pool hat', () => {
    const el = waehleMemoryElemente(GEMEINDEN.slice(0, 3), {}, 8);
    expect(el).toHaveLength(3);
  });

  it('legt ein kleineres Raster, wenn weniger Karten da sind', () => {
    expect(memoryRaster(18, '6x5')).toEqual({ spalten: 6, zeilen: 3 });
    expect(formatiereZeit(65000)).toBe('1:05');
  });

  it('wählt die Kartengrösse so, dass das Raster ins Feld passt', () => {
    const abstand = 6;
    const zelle = memoryZellenGroesse(360, 420, 6, 5, abstand);
    expect(zelle * 6 + abstand * 5).toBeLessThanOrEqual(360);
    expect(zelle * 5 + abstand * 4).toBeLessThanOrEqual(420);
    expect(zelle).toBeGreaterThan(0);
  });
});
