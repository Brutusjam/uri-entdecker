import { describe, it, expect } from 'vitest';
import { SPRUECHE } from '../data/sprueche';
import { spruchKandidaten, waehleSpruch } from './sprueche';

describe('sprueche', () => {
  it('hat mehrere Varianten pro Pflicht-Anlass', () => {
    for (const anlass of ['begruessung', 'tipp', 'richtig', 'falsch'] as const) {
      const n = SPRUECHE.filter((s) => s.anlass === anlass).length;
      expect(n, anlass).toBeGreaterThanOrEqual(3);
    }
  });

  it('lässt Lia begrüssen und Stierli bei Fehlern sprechen', () => {
    expect(SPRUECHE.filter((s) => s.anlass === 'begruessung').every((s) => s.sprecher === 'lia')).toBe(
      true,
    );
    expect(SPRUECHE.filter((s) => s.anlass === 'falsch').every((s) => s.sprecher === 'stierli')).toBe(
      true,
    );
  });

  it('nimmt nicht zweimal hintereinander denselben Text, wenn es Alternativen gibt', () => {
    const letzter = SPRUECHE.find((s) => s.anlass === 'richtig')!.text;
    const kandidaten = spruchKandidaten(SPRUECHE, 'richtig', letzter);
    expect(kandidaten.every((s) => s.text !== letzter)).toBe(true);
    expect(kandidaten.length).toBeGreaterThan(0);
  });

  it('fällt auf den einzigen Spruch zurück, wenn es keine Alternative gibt', () => {
    const mini = [{ anlass: 'sage' as const, sprecher: 'lia' as const, text: 'Nur dieser.' }];
    const kandidaten = spruchKandidaten(mini, 'sage', 'Nur dieser.');
    expect(kandidaten).toHaveLength(1);
    expect(kandidaten[0]?.text).toBe('Nur dieser.');
  });

  it('würfelt deterministisch mit gegebenem Zufall', () => {
    const spruch = waehleSpruch(SPRUECHE, 'begruessung', null, 'lia', () => 0);
    expect(spruch.anlass).toBe('begruessung');
    expect(spruch.sprecher).toBe('lia');
    expect(spruch.text.length).toBeGreaterThan(0);
  });

  it('hält Sprüche kurz', () => {
    for (const s of SPRUECHE) {
      const saetze = s.text.split(/[.!?]/).filter((t) => t.trim().length > 0);
      expect(saetze.length, s.text).toBeLessThanOrEqual(2);
    }
  });
});
