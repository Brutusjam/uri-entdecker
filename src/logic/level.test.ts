import { describe, expect, it } from 'vitest';
import { XP_PRO_RICHTIG, levelAufstieg, levelVonXp } from './level';

describe('level', () => {
  it('startet als Wanderin', () => {
    expect(levelVonXp(0).titel).toBe('Wanderin');
    expect(levelVonXp(49).titel).toBe('Wanderin');
  });

  it('steigt bei 50 XP zur Alphirtin', () => {
    expect(levelVonXp(50).titel).toBe('Alphirtin');
    expect(levelVonXp(50).naechstesXp).toBe(150);
  });

  it('erreicht den höchsten Titel', () => {
    const oben = levelVonXp(700);
    expect(oben.titel).toBe('Urner Landammann');
    expect(oben.naechstesXp).toBeNull();
  });

  it('erkennt einen Aufstieg', () => {
    expect(levelAufstieg(40, 40 + XP_PRO_RICHTIG)).toBe(true);
    expect(levelAufstieg(50, 60)).toBe(false);
  });
});
