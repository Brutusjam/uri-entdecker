import { describe, it, expect } from 'vitest';
import { findenBegleitung } from './finden-begleitung';

describe('findenBegleitung', () => {
  it('lässt Lia die Frage stellen', () => {
    expect(findenBegleitung(null, 0, false)).toEqual({
      name: 'lia',
      pose: 'zeigt',
      anlass: null,
      sprecher: 'lia',
    });
  });

  it('lässt Stierli bei Fehlern trösten', () => {
    expect(findenBegleitung('falsch', 1, false).name).toBe('stierli');
    expect(findenBegleitung('falsch', 1, false).pose).toBe('troestet');
    expect(findenBegleitung('falsch', 1, false).anlass).toBe('falsch');
  });

  it('lässt Stierli den Notfall-Tipp zeigen', () => {
    expect(findenBegleitung('falsch', 2, false)).toMatchObject({
      name: 'stierli',
      pose: 'zeigt',
      anlass: 'tipp',
    });
  });

  it('lässt Lia bei Erfolg jubeln', () => {
    expect(findenBegleitung('richtig', 1, true)).toMatchObject({
      name: 'lia',
      pose: 'jubelt',
      anlass: 'richtig',
    });
  });
});
