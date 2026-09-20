import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { beiFalsch, beiRichtig, heuteIso, neuerFortschritt } from '../logic/leitner';
import { XP_PRO_RICHTIG, levelAufstieg, levelVonXp } from '../logic/level';
import { aktualisiereSerie, leereSerie, type SerieStand } from '../logic/serie';
import { abzeichenDef, merkeAbzeichen, neueAbzeichen, verdienteAbzeichen } from '../logic/abzeichen';
import {
  leererMissionStand,
  missionStandFuerTag,
  zaehleMission,
  type MissionArt,
  type MissionStand,
} from '../logic/mission';
import { profiBereit } from '../logic/eltern';
import { spieleKlang } from '../logic/sound';
import type { Avatar, ElementFortschritt, Feier, FortschrittMap } from '../types/fortschritt';

export type SpielQuelle = MissionArt;

interface FortschrittState {
  fortschritt: FortschrittMap;
  letzteFrageId: string | null;
  puzzleBest: Record<string, number>;
  blitzBest: Record<string, number>;
  pruefungBest: Record<string, number>;
  memoryBestZuege: number | null;
  xp: number;
  name: string;
  avatar: Avatar;
  abzeichen: string[];
  serie: SerieStand;
  mission: MissionStand;
  uebungSekunden: Record<string, number>;
  tonAn: boolean;
  profiFreigeschaltet: boolean;
  feier: Feier | null;
  antwortRichtig: (elementId: string, quelle?: SpielQuelle) => void;
  antwortFalsch: (elementId: string) => void;
  getFortschritt: (elementId: string) => ElementFortschritt;
  setLetzteFrage: (id: string | null) => void;
  merkePuzzleZeit: (schluessel: string, zeitMs: number) => void;
  merkeBlitzPunkte: (schluessel: string, punkte: number) => void;
  merkePruefungNote: (schluessel: string, note: number) => void;
  merkeMemoryZuege: (zuege: number) => void;
  zaehleMissionArt: (art: SpielQuelle) => void;
  tickUebung: (sekunden: number) => void;
  setTonAn: (an: boolean) => void;
  setName: (name: string) => void;
  setAvatar: (avatar: Avatar) => void;
  setProfiFreigeschaltet: (an: boolean) => void;
  schliesseFeier: () => void;
}

function abzeichenKontext(state: {
  fortschritt: FortschrittMap;
  serie: SerieStand;
  puzzleBest: Record<string, number>;
  memoryBestZuege: number | null;
}) {
  return {
    fortschritt: state.fortschritt,
    serieTage: state.serie.tage,
    puzzleBest: state.puzzleBest ?? {},
    memoryBestZuege: state.memoryBestZuege,
  };
}

const PROFI_FEIER: Feier = {
  art: 'profi',
  titel: 'Profi-Pass',
  text: 'Lia und Stierli überreichen dir den Profi-Pass. Pässe, Berge und Sagen sind frei!',
};

function feierFuer(
  alt: { xp: number; abzeichen: string[]; serie: SerieStand; profi: boolean },
  neu: { xp: number; abzeichen: string[]; serie: SerieStand; profi: boolean },
): Feier | null {
  if (!alt.profi && neu.profi) return PROFI_FEIER;
  if (levelAufstieg(alt.xp, neu.xp)) {
    const titel = levelVonXp(neu.xp).titel;
    return { art: 'level', titel, text: `Du bist jetzt ${titel}!` };
  }
  const frisch = neueAbzeichen(alt.abzeichen, neu.abzeichen);
  if (frisch[0]) {
    const def = abzeichenDef(frisch[0]);
    return {
      art: 'abzeichen',
      titel: def?.titel ?? 'Neues Abzeichen',
      text: def?.text ?? 'Das hast du dir verdient!',
    };
  }
  if (neu.serie.tage > alt.serie.tage && (neu.serie.tage === 3 || neu.serie.tage === 7 || neu.serie.tage === 10)) {
    return { art: 'serie', titel: `${neu.serie.tage} Tage Serie`, text: 'Du bleibst dran – stark!' };
  }
  return null;
}

export const useFortschrittStore = create<FortschrittState>()(
  persist(
    (set, get) => ({
      fortschritt: {},
      letzteFrageId: null,
      puzzleBest: {},
      blitzBest: {},
      pruefungBest: {},
      memoryBestZuege: null,
      xp: 0,
      name: '',
      avatar: {},
      abzeichen: [],
      serie: leereSerie(),
      mission: leererMissionStand(),
      uebungSekunden: {},
      tonAn: true,
      profiFreigeschaltet: false,
      feier: null,

      getFortschritt: (elementId) => get().fortschritt[elementId] ?? neuerFortschritt(),

      antwortRichtig: (elementId, quelle) =>
        set((state) => {
          spieleKlang('richtig', state.tonAn);
          const altFortschritt = state.fortschritt[elementId] ?? neuerFortschritt();
          const fortschritt = { ...state.fortschritt, [elementId]: beiRichtig(altFortschritt) };
          const xp = state.xp + XP_PRO_RICHTIG;
          const serie = aktualisiereSerie(state.serie);
          const mission = zaehleMission(state.mission, quelle);
          const memoryBestZuege = state.memoryBestZuege ?? null;
          const puzzleBest = state.puzzleBest ?? {};
          const abzeichen = merkeAbzeichen(
            state.abzeichen,
            verdienteAbzeichen(abzeichenKontext({ fortschritt, serie, puzzleBest, memoryBestZuege })),
          );
          const profiFreigeschaltet = state.profiFreigeschaltet || profiBereit(fortschritt);
          const feier =
            feierFuer(
              { xp: state.xp, abzeichen: state.abzeichen, serie: state.serie, profi: state.profiFreigeschaltet },
              { xp, abzeichen, serie, profi: profiFreigeschaltet },
            ) ?? state.feier;
          return {
            fortschritt,
            xp,
            serie,
            mission,
            abzeichen,
            profiFreigeschaltet,
            feier,
            letzteFrageId: elementId,
          };
        }),

      antwortFalsch: (elementId) =>
        set((state) => {
          spieleKlang('falsch', state.tonAn);
          const alt = state.fortschritt[elementId] ?? neuerFortschritt();
          const serie = aktualisiereSerie(state.serie);
          return {
            fortschritt: { ...state.fortschritt, [elementId]: beiFalsch(alt) },
            serie,
          };
        }),

      setLetzteFrage: (id) => set({ letzteFrageId: id }),

      merkePuzzleZeit: (schluessel, zeitMs) =>
        set((state) => {
          const best = state.puzzleBest ?? {};
          const bisher = best[schluessel];
          const neuerBest = bisher === undefined || zeitMs < bisher;
          const puzzleBest = neuerBest ? { ...best, [schluessel]: zeitMs } : best;
          const abzeichen = merkeAbzeichen(
            state.abzeichen,
            verdienteAbzeichen(abzeichenKontext({ ...state, puzzleBest })),
          );
          const frisch = neueAbzeichen(state.abzeichen, abzeichen);
          const def = frisch[0] ? abzeichenDef(frisch[0]) : undefined;
          return {
            puzzleBest,
            abzeichen,
            mission: zaehleMission(state.mission, 'puzzle'),
            feier: def ? { art: 'abzeichen' as const, titel: def.titel, text: def.text } : state.feier,
          };
        }),

      merkeBlitzPunkte: (schluessel, punkte) =>
        set((state) => {
          const best = state.blitzBest ?? {};
          const bisher = best[schluessel] ?? 0;
          const blitzBest = punkte > bisher ? { ...best, [schluessel]: punkte } : best;
          return {
            blitzBest,
            mission: zaehleMission(state.mission, 'blitz'),
          };
        }),

      merkePruefungNote: (schluessel, note) =>
        set((state) => {
          const best = state.pruefungBest ?? {};
          const bisher = best[schluessel] ?? 0;
          if (note <= bisher) return state;
          return { pruefungBest: { ...best, [schluessel]: note } };
        }),

      merkeMemoryZuege: (zuege) =>
        set((state) => {
          const bisher = state.memoryBestZuege;
          const memoryBestZuege = bisher === null || zuege < bisher ? zuege : bisher;
          const abzeichen = merkeAbzeichen(
            state.abzeichen,
            verdienteAbzeichen(abzeichenKontext({ ...state, memoryBestZuege })),
          );
          const frisch = neueAbzeichen(state.abzeichen, abzeichen);
          const def = frisch[0] ? abzeichenDef(frisch[0]) : undefined;
          return {
            memoryBestZuege,
            abzeichen,
            mission: zaehleMission(state.mission, 'memory'),
            feier: def ? { art: 'abzeichen' as const, titel: def.titel, text: def.text } : state.feier,
          };
        }),

      zaehleMissionArt: (art) =>
        set((state) => ({ mission: zaehleMission(state.mission, art) })),

      tickUebung: (sekunden) =>
        set((state) => {
          const tag = heuteIso();
          const bisher = state.uebungSekunden ?? {};
          return { uebungSekunden: { ...bisher, [tag]: (bisher[tag] ?? 0) + sekunden } };
        }),

      setTonAn: (an) => set({ tonAn: an }),
      setName: (name) => set({ name }),
      setAvatar: (avatar) => set({ avatar }),
      setProfiFreigeschaltet: (an) =>
        set((state) => {
          if (an === state.profiFreigeschaltet) return state;
          if (!an) return { profiFreigeschaltet: false };
          return { profiFreigeschaltet: true, feier: PROFI_FEIER };
        }),
      schliesseFeier: () => set({ feier: null }),
    }),
    {
      name: 'uri-entdecker-fortschritt',
      merge: (persisted, current) => {
        const alt = (persisted as Partial<FortschrittState> | undefined) ?? {};
        return {
          ...current,
          ...alt,
          feier: null,
          puzzleBest: { ...current.puzzleBest, ...(alt.puzzleBest ?? {}) },
          blitzBest: { ...current.blitzBest, ...(alt.blitzBest ?? {}) },
          pruefungBest: { ...current.pruefungBest, ...(alt.pruefungBest ?? {}) },
          serie: alt.serie ?? current.serie,
          mission: missionStandFuerTag(alt.mission),
          uebungSekunden: { ...current.uebungSekunden, ...(alt.uebungSekunden ?? {}) },
          avatar: { ...current.avatar, ...(alt.avatar ?? {}) },
          abzeichen: alt.abzeichen ?? current.abzeichen,
        };
      },
      partialize: (state) => ({
        fortschritt: state.fortschritt,
        letzteFrageId: state.letzteFrageId,
        puzzleBest: state.puzzleBest,
        blitzBest: state.blitzBest,
        pruefungBest: state.pruefungBest,
        memoryBestZuege: state.memoryBestZuege,
        xp: state.xp,
        name: state.name,
        avatar: state.avatar,
        abzeichen: state.abzeichen,
        serie: state.serie,
        mission: state.mission,
        uebungSekunden: state.uebungSekunden,
        tonAn: state.tonAn,
        profiFreigeschaltet: state.profiFreigeschaltet,
      }),
    },
  ),
);
