import { FANGFRAGEN, istFangfrage } from '../data/fangfragen';
import { GRUND_ELEMENTE } from '../data/elemente';
import { GEMEINDEN } from '../data/gemeinden';
import { KANTONE } from '../data/kantone';
import { GEWAESSER } from '../data/gewaesser';
import { TAELER } from '../data/taeler';
import { PAESSE } from '../data/paesse';
import { BERGE } from '../data/berge';
import { SAGENORTE } from '../data/sagenorte';
import type { Kategorie, KartenBlick, KartenEbenen, LernElement, PunktArt } from '../types/karte';
import type { ElementFortschritt, FortschrittMap } from '../types/fortschritt';
import { istFaellig, neuerFortschritt } from './leitner';

export function elementeFuer(kategorie: Kategorie): LernElement[] {
  if (kategorie === 'kanton') return [...KANTONE];
  if (kategorie === 'gewaesser' || kategorie === 'tal') return [...TAELER, ...GEWAESSER];
  if (kategorie === 'pass') return [...PAESSE];
  if (kategorie === 'berg') return [...BERGE];
  if (kategorie === 'sagenort') return [...SAGENORTE];
  return [...GEMEINDEN];
}

export function kartenModus(kategorie: Kategorie): {
  ebenen: KartenEbenen[];
  blick: KartenBlick;
  talOderSee: boolean;
  punktArten: PunktArt[];
} {
  if (kategorie === 'kanton') {
    return { ebenen: ['kantone', 'seen'], blick: 'nachbarn', talOderSee: false, punktArten: [] };
  }
  if (kategorie === 'pass') {
    return {
      ebenen: ['kantone', 'gemeinden', 'seen', 'punkte'],
      blick: 'nachbarn',
      talOderSee: true,
      punktArten: ['pass'],
    };
  }
  if (kategorie === 'berg') {
    return {
      ebenen: ['kantone', 'gemeinden', 'seen', 'punkte'],
      blick: 'uri',
      talOderSee: false,
      punktArten: ['berg'],
    };
  }
  if (kategorie === 'sagenort') {
    return {
      ebenen: ['kantone', 'gemeinden', 'seen', 'punkte'],
      blick: 'nachbarn',
      talOderSee: false,
      punktArten: ['sagenort'],
    };
  }
  return {
    ebenen: ['kantone', 'gemeinden', 'seen'],
    blick: 'uri',
    talOderSee: kategorie === 'tal' || kategorie === 'gewaesser',
    punktArten: [],
  };
}

/** Jede fünfte Kantonsfrage darf eine Fangfrage (Luzern/Zug) sein. */
export const FANGFRAGE_WAHRSCHEINLICHKEIT = 0.2;

function zufallAus<T>(liste: T[]): T {
  return liste[Math.floor(Math.random() * liste.length)];
}

function fortschrittVon(map: FortschrittMap, id: string): ElementFortschritt {
  return map[id] ?? neuerFortschritt();
}

/**
 * Wählt das nächste Lern-Element: fällige und schwache zuerst, nie zweimal hintereinander gleich.
 */
export function waehleNaechstesElement(
  elemente: LernElement[],
  fortschritt: FortschrittMap,
  letztesId?: string | null,
  datum?: string,
): LernElement {
  if (elemente.length === 0) throw new Error('Keine Elemente');
  const ohneLetztes =
    letztesId && elemente.length > 1 ? elemente.filter((e) => e.id !== letztesId) : elemente;
  if (ohneLetztes.length === 1) return ohneLetztes[0]!;

  const faellig = ohneLetztes.filter((e) => istFaellig(fortschrittVon(fortschritt, e.id), datum));
  const pool = faellig.length > 0 ? faellig : ohneLetztes;

  const minStufe = Math.min(...pool.map((e) => fortschrittVon(fortschritt, e.id).stufe));
  const schwach = pool.filter((e) => fortschrittVon(fortschritt, e.id).stufe === minStufe);
  return zufallAus(schwach);
}

export function findeElement(elemente: LernElement[], id: string): LernElement | undefined {
  return elemente.find((e) => e.id === id);
}

/** Nächstes fälliges Element für «Weiter üben» auf dem Startbildschirm. */
export function waehleWeiterUebenZiel(fortschritt: FortschrittMap): LernElement {
  return waehleNaechstesElement(GRUND_ELEMENTE, fortschritt);
}

export function kartenElementId(el: LernElement): string {
  if (el.kategorie === 'kanton') return `kt-${el.geo}`;
  return el.id;
}

export function findenFrageText(ziel: LernElement): string {
  if (istFangfrage(ziel)) return `Wo liegt ${ziel.name}? Grenzt er an Uri?`;
  if (ziel.kategorie === 'kanton') return `Wo liegt der Kanton «${ziel.name}»?`;
  return `Wo liegt «${ziel.name}»?`;
}

/**
 * Wie waehleNaechstesElement, bei Kantonen gelegentlich Luzern oder Zug als Fangfrage.
 */
export function waehleFindenFrage(
  elemente: LernElement[],
  fortschritt: FortschrittMap,
  letztesId?: string | null,
  zufall: () => number = Math.random,
): LernElement {
  const kantone = elemente.length > 0 && elemente.every((e) => e.kategorie === 'kanton');
  if (kantone && zufall() < FANGFRAGE_WAHRSCHEINLICHKEIT) {
    const kandidaten = FANGFRAGEN.filter((f) => f.id !== letztesId);
    const pool = kandidaten.length > 0 ? kandidaten : FANGFRAGEN;
    const index = Math.min(pool.length - 1, Math.floor(zufall() * pool.length));
    return pool[index]!;
  }
  return waehleNaechstesElement(elemente, fortschritt, letztesId);
}
