import { describe, expect, it } from 'vitest';
import { TAL_KATALOG, TAELER } from '../data/taeler';
import {
  findeTalAnPunkt,
  istTalFertig,
  leereTaeler,
  parseTaelerDatei,
  talPuffer,
  taelerJson,
  TAELER_GEO,
  type TalGeo,
} from './taeler';

/** Grobe Linie Schächental: Bürglen → Klausen. */
const SCHAECHEN: TalGeo = {
  id: 'tal-schaechental',
  name: 'Schächental',
  linie: [
    [8.655, 46.874],
    [8.72, 46.86],
    [8.8, 46.852],
  ],
  label: [8.72, 46.86],
};

/** Urserntal: Andermatt – Realp. */
const URSERN: TalGeo = {
  id: 'tal-urserntal',
  name: 'Urserntal',
  linie: [
    [8.614, 46.634],
    [8.56, 46.602],
    [8.505, 46.598],
  ],
  label: [8.56, 46.602],
};

describe('Täler', () => {
  it('hat genau die zehn Täler aus dem Plan', () => {
    expect(TAL_KATALOG).toHaveLength(10);
    expect(TAL_KATALOG.map((t) => t.name)).toEqual([
      'Riemenstaldnertal',
      'Grosstal',
      'Schächental',
      'Erstfeldertal',
      'Maderanertal',
      'Fellital',
      'Meiental',
      'Göschenertal',
      'Unteralptal',
      'Urserntal',
    ]);
    expect(leereTaeler()).toHaveLength(10);
    expect(TAELER).toHaveLength(10);
    expect(TAELER.every((t) => t.kategorie === 'tal' && t.tipps.length === 3)).toBe(true);
  });

  it('gilt als fertig mit Linie und Label', () => {
    expect(istTalFertig({ ...SCHAECHEN, linie: [[8.6, 46.8]], label: [8.6, 46.8] })).toBe(false);
    expect(istTalFertig({ ...SCHAECHEN, label: null })).toBe(false);
    expect(istTalFertig(SCHAECHEN)).toBe(true);
  });

  it('trifft einen Punkt auf dem Talboden, nicht weit daneben', () => {
    expect(talPuffer(SCHAECHEN.linie)).not.toBeNull();
    expect(findeTalAnPunkt(8.72, 46.86, [SCHAECHEN])?.id).toBe('tal-schaechental');
    expect(findeTalAnPunkt(9.5, 47.5, [SCHAECHEN])).toBeNull();
  });

  it('wählt bei Überlappung das nähere Tal', () => {
    const a: TalGeo = {
      id: 'tal-a',
      name: 'A',
      linie: [
        [8.6, 46.63],
        [8.62, 46.64],
      ],
      label: [8.61, 46.635],
    };
    const b: TalGeo = {
      id: 'tal-b',
      name: 'B',
      linie: [
        [8.61, 46.635],
        [8.63, 46.62],
      ],
      label: [8.62, 46.627],
    };
    const treffer = findeTalAnPunkt(8.601, 46.631, [a, b]);
    expect(treffer?.id).toBe('tal-a');
  });

  it('liest JSON ein und füllt fehlende Katalog-Täler auf', () => {
    const datei = parseTaelerDatei({
      taeler: [{ id: 'tal-schaechental', name: 'Schächental', linie: SCHAECHEN.linie, label: SCHAECHEN.label }],
    });
    expect(datei.taeler).toHaveLength(10);
    const schaechen = datei.taeler.find((t) => t.id === 'tal-schaechental')!;
    expect(schaechen.linie).toHaveLength(3);
    expect(datei.taeler.find((t) => t.id === 'tal-urserntal')?.linie).toEqual([]);
  });

  it('schreibt gültiges JSON', () => {
    const text = taelerJson([SCHAECHEN, URSERN]);
    const zurück = parseTaelerDatei(JSON.parse(text));
    expect(zurück.taeler.find((t) => t.id === 'tal-schaechental')?.linie).toEqual(SCHAECHEN.linie);
  });

  it('hat alle zehn Täler mit Linie und Name in der Datei', () => {
    expect(TAELER_GEO).toHaveLength(10);
    expect(TAELER_GEO.every(istTalFertig)).toBe(true);
    expect(findeTalAnPunkt(8.768, 46.876, TAELER_GEO)?.id).toBe('tal-schaechental');
  });
});
