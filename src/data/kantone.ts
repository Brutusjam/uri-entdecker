import type { LernElement } from '../types/karte';

const kt = (kuerzel: string, name: string, regionTipp?: string): LernElement => ({
  id: `kt-${kuerzel}`,
  kategorie: 'kanton',
  name,
  geo: kuerzel,
  wappen: `/wappen/kantone/${kuerzel.toLowerCase()}.svg`,
  tipps: [
    regionTipp ?? 'Der Kanton grenzt an Uri – wo liegt er auf der Karte?',
    'Schau, welche Kantone um Uri herum liegen.',
    'Der gesuchte Kanton blinkt kurz auf!',
  ],
});

/** Die acht Kantone, die an Uri grenzen (ohne Luzern und Zug). */
export const NACHBAR_KUERZEL = ['BE', 'SZ', 'OW', 'NW', 'GL', 'GR', 'TI', 'VS'] as const;

/** Luzern und Zug grenzen nicht an Uri – Fangfragen. */
export const FANGFRAGE_KUERZEL = ['LU', 'ZG'] as const;

/** Uri, Nachbarn und Fangfragen – Blick, in dem alle relevanten Kantone sichtbar sind. */
export const KARTEN_NACHBARN_KUERZEL = [
  'UR',
  ...NACHBAR_KUERZEL,
  ...FANGFRAGE_KUERZEL,
] as const;

export function istNachbarKanton(kuerzel: string): boolean {
  return (NACHBAR_KUERZEL as readonly string[]).includes(kuerzel);
}

export function istFangfrageKuerzel(kuerzel: string | undefined): boolean {
  return kuerzel === 'LU' || kuerzel === 'ZG';
}

/** Uri + 8 Nachbarkantone (Lernstoff L3/L4) */
export const KANTONE: LernElement[] = [
  kt('UR', 'Uri'),
  kt('BE', 'Bern'),
  kt('SZ', 'Schwyz'),
  kt('OW', 'Obwalden'),
  kt('NW', 'Nidwalden'),
  kt('GL', 'Glarus'),
  kt('GR', 'Graubünden'),
  kt('TI', 'Tessin'),
  kt('VS', 'Wallis'),
];

export const KANTONE_MAP = new Map(KANTONE.map((k) => [k.geo, k]));
