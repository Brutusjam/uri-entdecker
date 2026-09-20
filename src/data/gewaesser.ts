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
  {
    id: 'see-goescheneralpsee',
    kategorie: 'gewaesser',
    name: 'Göscheneralpsee',
    geo: 'goescheneralpsee',
    tipps: [
      'Der See liegt hoch in den Bergen – nicht am Urnersee.',
      'Schau am Ende des Göschenertals, über Göschenen.',
      'Das Gewässer blinkt kurz auf!',
    ],
    funFact: 'Der Stausee liegt am Ende des Göschenertals, hoch über Göschenen.',
  },
];

export const GEWAESSER_MAP = new Map(GEWAESSER.map((g) => [g.geo, g]));
