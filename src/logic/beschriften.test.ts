import { describe, expect, it } from 'vitest';
import type { LernElement } from '../types/karte';
import { beschriftenPool, darfBlinken, BESCHRIFTEN_LEICHT_ANZAHL } from './beschriften';

const el = (id: string): LernElement => ({
  id,
  kategorie: 'gemeinde',
  name: id,
  geo: id,
  tipps: [],
});

const pool = Array.from({ length: 19 }, (_, i) => el(`gem-${i}`));
const fest = () => 0;

describe('beschriften', () => {
  it('nimmt in Leicht nur 8 Schilder', () => {
    expect(beschriftenPool(pool, 'leicht', fest)).toHaveLength(BESCHRIFTEN_LEICHT_ANZAHL);
  });

  it('nimmt in Mittel und Profi alle', () => {
    expect(beschriftenPool(pool, 'mittel', fest)).toHaveLength(19);
    expect(beschriftenPool(pool, 'profi', fest)).toHaveLength(19);
  });

  it('blinkt nach zwei Fehlern, ausser in Profi', () => {
    expect(darfBlinken('leicht', 1)).toBe(false);
    expect(darfBlinken('leicht', 2)).toBe(true);
    expect(darfBlinken('profi', 5)).toBe(false);
  });
});
