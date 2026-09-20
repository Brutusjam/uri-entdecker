import { describe, it, expect } from 'vitest';
import { GEMEINDEN } from '../data/gemeinden';
import { formatiereEinwohner, formatiereFlaeche, gemeindeMerkmale } from './gemeinde-infos';

function gemeinde(name: string) {
  const gefunden = GEMEINDEN.find((g) => g.name === name);
  if (!gefunden) throw new Error(`Gemeinde ${name} fehlt`);
  return gefunden;
}

describe('Gemeindedaten Entdecken', () => {
  it('hat für jede Gemeinde Einwohner, Fläche, Wappentext und Fun-Fact', () => {
    expect(GEMEINDEN).toHaveLength(19);
    for (const g of GEMEINDEN) {
      expect(g.einwohner, g.name).toBeGreaterThan(0);
      expect(g.flaecheKm2, g.name).toBeGreaterThan(0);
      expect(g.einwohnerStand, g.name).toBe('Ende 2025');
      expect(g.wappenTipp, g.name).toBeTruthy();
      expect(g.wappenHintergrund, g.name).toBeTruthy();
      expect(g.funFact, g.name).toBeTruthy();
    }
  });

  it('hat genau einen Hauptort: Altdorf', () => {
    const hauptorte = GEMEINDEN.filter((g) => g.istHauptort);
    expect(hauptorte.map((g) => g.name)).toEqual(['Altdorf']);
  });
});

describe('gemeindeMerkmale', () => {
  it('markiert Altdorf als Hauptort mit den meisten Einwohnern und der kleinsten Fläche', () => {
    const labels = gemeindeMerkmale(gemeinde('Altdorf'), GEMEINDEN).map((m) => m.label);
    expect(labels).toEqual(['Hauptort', 'Meiste Einwohner', 'Kleinste Fläche']);
  });

  it('markiert Silenen als grösste Fläche', () => {
    const labels = gemeindeMerkmale(gemeinde('Silenen'), GEMEINDEN).map((m) => m.label);
    expect(labels).toContain('Grösste Fläche');
    expect(labels).not.toContain('Hauptort');
  });

  it('markiert Schattdorf als zweite bei den Einwohnern', () => {
    const labels = gemeindeMerkmale(gemeinde('Schattdorf'), GEMEINDEN).map((m) => m.label);
    expect(labels).toEqual(['2. bei den Einwohnern']);
  });

  it('markiert Realp als Gemeinde mit den wenigsten Einwohnern', () => {
    const labels = gemeindeMerkmale(gemeinde('Realp'), GEMEINDEN).map((m) => m.label);
    expect(labels).toContain('Wenigste Einwohner');
  });

  it('liefert für eine normale Gemeinde keine Superlativ-Badges', () => {
    expect(gemeindeMerkmale(gemeinde('Flüelen'), GEMEINDEN)).toEqual([]);
  });
});

describe('Zahlenformat', () => {
  it('formatiert Einwohner mit Apostroph', () => {
    expect(formatiereEinwohner(10618)).toBe("10'618");
    expect(formatiereEinwohner(157)).toBe('157');
  });

  it('formatiert Fläche mit Komma', () => {
    expect(formatiereFlaeche(10.21)).toBe('10,21 km²');
    expect(formatiereFlaeche(144.78)).toBe('144,78 km²');
  });
});
