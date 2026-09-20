import { describe, expect, it } from 'vitest';
import { istHoeher, waehleGipfelPaar } from './gipfel';
import type { PunktFeature } from '../types/karte';

const berg = (id: string, ele: number | null): PunktFeature => ({
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [8.6, 46.7] },
  properties: { id, name: id, art: 'berg', ele },
});

describe('gipfel', () => {
  it('wählt den höheren Berg', () => {
    const paar = waehleGipfelPaar([berg('a', 2000), berg('b', 3600)], () => 0);
    expect(paar?.hoeherId).toBe('b');
    expect(istHoeher('b', paar!)).toBe(true);
    expect(istHoeher('a', paar!)).toBe(false);
  });

  it('braucht zwei Höhen', () => {
    expect(waehleGipfelPaar([berg('a', 2000), berg('b', null)])).toBeNull();
  });
});
