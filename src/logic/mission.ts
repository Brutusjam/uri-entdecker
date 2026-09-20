import { heuteIso } from './leitner';

export type MissionArt = 'finden' | 'wappen' | 'beschriften' | 'memory' | 'puzzle' | 'blitz';

export interface TagesMission {
  art: MissionArt;
  ziel: number;
  text: string;
}

export interface MissionStand {
  datum: string;
  zaehler: Partial<Record<MissionArt, number>>;
}

export const MISSION_KATALOG: TagesMission[] = [
  { art: 'finden', ziel: 3, text: 'Finde 3 Orte im Modus Finden.' },
  { art: 'wappen', ziel: 3, text: 'Ordne 3 Wappen richtig zu.' },
  { art: 'beschriften', ziel: 3, text: 'Lege 3 Namensschilder richtig.' },
  { art: 'memory', ziel: 1, text: 'Beende eine Memory-Runde.' },
  { art: 'puzzle', ziel: 1, text: 'Lege ein Puzzle fertig.' },
  { art: 'blitz', ziel: 1, text: 'Spiele eine Blitzrunde zu Ende.' },
];

function tagHash(datum: string): number {
  let h = 2166136261;
  for (let i = 0; i < datum.length; i++) {
    h ^= datum.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Drei Missionen, stabil für denselben Kalendertag. */
export function tagesMissionen(datum = heuteIso()): TagesMission[] {
  const start = tagHash(datum) % MISSION_KATALOG.length;
  const liste: TagesMission[] = [];
  for (let i = 0; i < 3; i++) {
    liste.push(MISSION_KATALOG[(start + i) % MISSION_KATALOG.length]!);
  }
  return liste;
}

export function leererMissionStand(datum = heuteIso()): MissionStand {
  return { datum, zaehler: {} };
}

export function missionStandFuerTag(stand: MissionStand | undefined, datum = heuteIso()): MissionStand {
  if (!stand || stand.datum !== datum) return leererMissionStand(datum);
  return stand;
}

export function zaehleMission(stand: MissionStand, art: MissionArt | undefined, datum = heuteIso()): MissionStand {
  const aktuell = missionStandFuerTag(stand, datum);
  if (!art) return aktuell;
  return {
    datum,
    zaehler: { ...aktuell.zaehler, [art]: (aktuell.zaehler[art] ?? 0) + 1 },
  };
}

export function missionErledigt(mission: TagesMission, stand: MissionStand): boolean {
  return (stand.zaehler[mission.art] ?? 0) >= mission.ziel;
}

export function missionFortschritt(mission: TagesMission, stand: MissionStand): number {
  return Math.min(mission.ziel, stand.zaehler[mission.art] ?? 0);
}
