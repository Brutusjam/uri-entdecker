import { describe, expect, it } from 'vitest';
import { formatiereNote, noteSpruch, pruefungBestKey, schweizerNote } from './pruefung';

describe('prüfung', () => {
  it('gibt Note 6 bei allem richtig', () => {
    expect(schweizerNote(19, 19)).toBe(6);
  });

  it('gibt Note 1 bei nichts richtig', () => {
    expect(schweizerNote(0, 19)).toBe(1);
  });

  it('rundet auf halbe Noten', () => {
    expect(schweizerNote(10, 19)).toBe(3.5);
    expect(schweizerNote(15, 19)).toBe(5);
  });

  it('formatiert mit Komma', () => {
    expect(formatiereNote(5.5)).toBe('5,5');
    expect(formatiereNote(6)).toBe('6,0');
  });

  it('hat einen Schlüssel pro Kategorie', () => {
    expect(pruefungBestKey('gemeinde')).toBe('pruefung-gemeinde');
  });

  it('bleibt bei schlechter Note freundlich', () => {
    expect(noteSpruch(3)).toMatch(/Übe/);
    expect(noteSpruch(6)).toMatch(/beste Note/);
  });
});
