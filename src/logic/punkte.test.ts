import { describe, expect, it } from 'vitest';
import { findePunktAnPunkt, formatiereHoehe, istPunktKategorie, punktAlsAuswahl } from './punkte';
import type { PunktFeature } from '../types/karte';

const punkt = (id: string, lng: number, lat: number, art: 'pass' | 'berg' | 'sagenort' = 'berg'): PunktFeature => ({
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [lng, lat] },
  properties: { id, name: id, art, ele: 1000 },
});

describe('punkte', () => {
  it('erkennt Punkt-Kategorien', () => {
    expect(istPunktKategorie('pass')).toBe(true);
    expect(istPunktKategorie('gemeinde')).toBe(false);
  });

  it('trifft einen nahen Punkt', () => {
    const features = [punkt('berg-bristen', 8.69, 46.75)];
    const treffer = findePunktAnPunkt(8.691, 46.751, features);
    expect(treffer?.properties.id).toBe('berg-bristen');
  });

  it('lehnt zu weite Klicks ab', () => {
    const features = [punkt('berg-bristen', 8.69, 46.75)];
    expect(findePunktAnPunkt(8.4, 46.5, features)).toBeNull();
  });

  it('formatiert Höhe und Auswahl', () => {
    expect(formatiereHoehe(3630.4)).toBe('3630 m');
    expect(punktAlsAuswahl(punkt('pass-gotthard', 8.56, 46.56, 'pass')).kategorie).toBe('pass');
  });
});
