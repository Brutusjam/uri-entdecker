import { describe, expect, it } from 'vitest';
import { DUELL_FRAGEN_PRO_SPIELER, duellFertig, duellGewinner, naechsterSpieler } from './duell';

describe('duell', () => {
  it('wechselt den Spieler', () => {
    expect(naechsterSpieler(0)).toBe(1);
    expect(naechsterSpieler(1)).toBe(0);
  });

  it('ermittelt Gewinner oder Unentschieden', () => {
    expect(duellGewinner([5, 3])).toBe(0);
    expect(duellGewinner([2, 6])).toBe(1);
    expect(duellGewinner([4, 4])).toBeNull();
  });

  it('ist nach 16 Fragen fertig', () => {
    expect(duellFertig(DUELL_FRAGEN_PRO_SPIELER * 2 - 1)).toBe(false);
    expect(duellFertig(16)).toBe(true);
  });
});
