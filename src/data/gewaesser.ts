import type { LernElement } from '../types/karte';

export const GEWAESSER: LernElement[] = [
  {
    id: 'see-urnersee',
    kategorie: 'gewaesser',
    name: 'Urnersee',
    geo: 'urnersee',
    tipps: [
      'Der See liegt im Kanton Uri – wo könnte er sein?',
      'Schau entlang des Urnersees und in den Bergen.',
      'Das Gewässer blinkt kurz auf!',
    ],
    funFact: 'Der Urnersee ist der östliche Arm des Vierwaldstättersees – von Brunnen bis Flüelen.',
  },
];

export const GEWAESSER_MAP = new Map(GEWAESSER.map((g) => [g.geo, g]));
