import type { LernElement } from '../types/karte';
import { assetUrl } from '../lib/assetUrl';

const pass = (id: string, name: string, tipps: [string, string, string], funFact: string): LernElement => ({
  id,
  kategorie: 'pass',
  name,
  geo: id,
  bild: assetUrl(`/profi/${id}.svg`),
  tipps: [...tipps],
  funFact,
});

/** Fünf Urner Pässe (L7). Höhen kommen aus den OSM-Punktdaten. */
export const PAESSE: LernElement[] = [
  pass(
    'pass-gotthard',
    'Gotthardpass',
    [
      'Dieser Pass verbindet Uri mit dem Tessin.',
      'Der Weg geht durchs Urserntal, bei Hospental.',
      'Der Pass blinkt kurz auf!',
    ],
    'Vom Urserntal kommst du über den Gotthard ins Tessin.',
  ),
  pass(
    'pass-furka',
    'Furkapass',
    [
      'Dieser Pass verbindet Uri mit dem Wallis.',
      'Der Weg geht durchs Urserntal, bei Realp.',
      'Der Pass blinkt kurz auf!',
    ],
    'Bei Realp im Urserntal startet der Weg über die Furka.',
  ),
  pass(
    'pass-oberalp',
    'Oberalppass',
    [
      'Dieser Pass verbindet Uri mit Graubünden.',
      'Der Ausgangspunkt in Uri ist Andermatt.',
      'Der Pass blinkt kurz auf!',
    ],
    'Von Andermatt geht es über den Oberalp nach Graubünden.',
  ),
  pass(
    'pass-susten',
    'Sustenpass',
    [
      'Dieser Pass verbindet Uri mit Bern.',
      'Der Weg geht durchs Meiental, bei Wassen.',
      'Der Pass blinkt kurz auf!',
    ],
    'Von Wassen im Meiental kommst du über den Susten nach Bern.',
  ),
  pass(
    'pass-klausen',
    'Klausenpass',
    [
      'Dieser Pass verbindet Uri mit Glarus.',
      'Der Weg geht durchs Schächental, bei Unterschächen, über den Urnerboden.',
      'Der Pass blinkt kurz auf!',
    ],
    'Von Unterschächen im Schächental geht es über den Klausen nach Glarus.',
  ),
];

export const PAESSE_MAP = new Map(PAESSE.map((p) => [p.id, p]));
