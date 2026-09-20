import { describe, expect, it } from 'vitest';
import { neuerModusVorschlag } from './vorschlag';
import { MODI } from '../data/modi';

describe('neuerModusVorschlag', () => {
  it('schlägt den ersten Modus vor, wenn noch nichts gespielt wurde', () => {
    expect(neuerModusVorschlag([], false)?.id).toBe('finden');
  });

  it('überspringt schon gespielte Modi', () => {
    expect(neuerModusVorschlag(['finden', 'entdecken'], false)?.id).toBe('wappen');
  });

  it('schlägt keine Profi-Modi vor, solange sie gesperrt sind', () => {
    const grund = MODI.filter((m) => !m.profi).map((m) => m.id);
    expect(neuerModusVorschlag(grund, false)).toBeNull();
    expect(neuerModusVorschlag(grund, true)?.profi).toBe(true);
  });

  it('gibt null zurück, wenn alles probiert wurde', () => {
    expect(neuerModusVorschlag(MODI.map((m) => m.id), true)).toBeNull();
  });
});
