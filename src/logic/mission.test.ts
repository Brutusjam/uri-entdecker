import { describe, expect, it } from 'vitest';
import {
  leererMissionStand,
  missionErledigt,
  tagesMissionen,
  zaehleMission,
} from './mission';

describe('mission', () => {
  it('liefert drei Missionen, am selben Tag gleich', () => {
    const a = tagesMissionen('2026-09-19');
    const b = tagesMissionen('2026-09-19');
    expect(a).toHaveLength(3);
    expect(a).toEqual(b);
  });

  it('wechselt an einem anderen Tag', () => {
    expect(tagesMissionen('2026-09-19')).not.toEqual(tagesMissionen('2026-09-20'));
  });

  it('zählt Fortschritt und erkennt erledigt', () => {
    let stand = leererMissionStand('2026-09-19');
    stand = zaehleMission(stand, 'finden', '2026-09-19');
    stand = zaehleMission(stand, 'finden', '2026-09-19');
    stand = zaehleMission(stand, 'finden', '2026-09-19');
    expect(missionErledigt({ art: 'finden', ziel: 3, text: '' }, stand)).toBe(true);
  });

  it('setzt den Stand an einem neuen Tag zurück', () => {
    const alt = zaehleMission(leererMissionStand('2026-09-19'), 'wappen', '2026-09-19');
    const neu = zaehleMission(alt, 'finden', '2026-09-20');
    expect(neu.datum).toBe('2026-09-20');
    expect(neu.zaehler.wappen).toBeUndefined();
    expect(neu.zaehler.finden).toBe(1);
  });
});
