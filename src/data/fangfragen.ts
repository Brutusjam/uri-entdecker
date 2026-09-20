import type { LernElement } from '../types/karte';

/** Kantone, die oft für Nachbarn gehalten werden, aber nicht an Uri grenzen. */
export const FANGFRAGEN: LernElement[] = [
  {
    id: 'fang-LU',
    kategorie: 'kanton',
    name: 'Luzern',
    geo: 'LU',
    tipps: [
      'Luzern liegt westlich von Uri – aber berühren sich die beiden?',
      'Zwischen Luzern und Uri liegt noch mindestens ein anderer Kanton.',
      'Luzern blinkt. Er grenzt nicht an Uri!',
    ],
    funFact: 'Luzern grenzt nicht an Uri. Dazwischen liegen Nidwalden, Obwalden oder Schwyz.',
  },
  {
    id: 'fang-ZG',
    kategorie: 'kanton',
    name: 'Zug',
    geo: 'ZG',
    tipps: [
      'Zug liegt nördlich von Uri – berühren sie sich wirklich?',
      'Zwischen Zug und Uri liegt der Kanton Schwyz.',
      'Zug blinkt. Er grenzt nicht an Uri!',
    ],
    funFact: 'Zug grenzt nicht an Uri. Dazwischen liegt Schwyz.',
  },
];

export function istFangfrage(el: { id: string }): boolean {
  return el.id.startsWith('fang-');
}
