import { describe, it, expect } from 'vitest';
import { elementeFuer, kartenModus, waehleNaechstesElement, waehleWeiterUebenZiel } from './fragen';
import type { LernElement } from '../types/karte';
import type { FortschrittMap } from '../types/fortschritt';
import { beiRichtig, neuerFortschritt } from './leitner';

const elemente: LernElement[] = [
  { id: 'gem-a', kategorie: 'gemeinde', name: 'A', geo: '1', tipps: [] },
  { id: 'gem-b', kategorie: 'gemeinde', name: 'B', geo: '2', tipps: [] },
  { id: 'gem-c', kategorie: 'gemeinde', name: 'C', geo: '3', tipps: [] },
];

describe('fragen', () => {
  it('liefert den Pool zur Kategorie', () => {
    expect(elementeFuer('gemeinde')).toHaveLength(19);
    expect(elementeFuer('kanton').every((e) => e.kategorie === 'kanton')).toBe(true);
    expect(elementeFuer('gewaesser').some((e) => e.kategorie === 'tal')).toBe(true);
    expect(elementeFuer('gewaesser').filter((e) => e.kategorie === 'gewaesser').map((e) => e.name)).toEqual([
      'Urnersee',
    ]);
    expect(elementeFuer('pass')).toHaveLength(5);
    expect(elementeFuer('berg')).toHaveLength(8);
    expect(elementeFuer('sagenort').every((e) => e.kategorie === 'sagenort')).toBe(true);
    expect(kartenModus('kanton').blick).toBe('nachbarn');
    expect(kartenModus('gewaesser').talOderSee).toBe(true);
    expect(kartenModus('pass').punktArten).toContain('pass');
  });

  it('wählt nie zweimal hintereinander dasselbe Element', () => {
    for (let i = 0; i < 20; i++) {
      const erstes = waehleNaechstesElement(elemente, {}, null);
      const zweites = waehleNaechstesElement(elemente, {}, erstes.id);
      expect(zweites.id).not.toBe(erstes.id);
    }
  });

  it('bevorzugt Elemente mit tieferer Stufe', () => {
    const fortschritt = {
      'gem-a': beiRichtig(beiRichtig(beiRichtig(neuerFortschritt()))),
      'gem-b': neuerFortschritt(),
      'gem-c': neuerFortschritt(),
    };
    const gewaehlt = waehleNaechstesElement(elemente, fortschritt, 'gem-a');
    expect(['gem-b', 'gem-c']).toContain(gewaehlt.id);
  });

  it('beginnt «Weiter üben» bei den Gemeinden', () => {
    for (let i = 0; i < 10; i++) {
      expect(waehleWeiterUebenZiel({}).kategorie).toBe('gemeinde');
    }
  });

  it('geht zu den Kantonen weiter, wenn alle Gemeinden sitzen', () => {
    const fortschritt: FortschrittMap = {};
    for (const gem of elementeFuer('gemeinde')) {
      fortschritt[gem.id] = { ...neuerFortschritt(), stufe: 3, naechsteWiederholung: '2999-01-01' };
    }
    expect(waehleWeiterUebenZiel(fortschritt).kategorie).toBe('kanton');
  });

  it('nimmt fällige Wiederholungen vor neuen Elementen', () => {
    const [ziel] = elementeFuer('gewaesser');
    const fortschritt: FortschrittMap = {
      [ziel!.id]: { ...neuerFortschritt(), stufe: 2, naechsteWiederholung: '2020-01-01' },
    };
    expect(waehleWeiterUebenZiel(fortschritt).id).toBe(ziel!.id);
  });

  it('nimmt ein anderes Element, auch wenn nur das letzte auf der tiefsten Stufe ist', () => {
    const fortschritt = {
      'gem-a': neuerFortschritt(),
      'gem-b': beiRichtig(neuerFortschritt()),
      'gem-c': beiRichtig(neuerFortschritt()),
    };
    for (let i = 0; i < 15; i++) {
      const gewaehlt = waehleNaechstesElement(elemente, fortschritt, 'gem-a');
      expect(gewaehlt.id).not.toBe('gem-a');
    }
  });
});
