import { describe, expect, it } from 'vitest';
import { naechsterPassSchritt, PASS_REISEN, passReiseFrage, passReiseZielId } from './passreise';

describe('passreise', () => {
  it('hat fünf Reisen', () => {
    expect(PASS_REISEN).toHaveLength(5);
    expect(PASS_REISEN.map((r) => r.kantonKuerzel).sort()).toEqual(['BE', 'GL', 'GR', 'TI', 'VS']);
  });

  it('liefert Tal, Pass, Kanton in dieser Reihenfolge', () => {
    const reise = PASS_REISEN.find((r) => r.passId === 'pass-gotthard')!;
    expect(passReiseZielId(reise, 'tal')).toBe('tal-urserntal');
    expect(passReiseZielId(reise, 'pass')).toBe('pass-gotthard');
    expect(passReiseZielId(reise, 'kanton')).toBe('kt-TI');
    expect(naechsterPassSchritt('tal')).toBe('pass');
    expect(naechsterPassSchritt('kanton')).toBeNull();
    expect(passReiseFrage(reise, 'tal')).toContain('Urserntal');
  });
});
