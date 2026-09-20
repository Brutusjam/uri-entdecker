import type { LernElement } from '../types/karte';

export interface TalKatalogEintrag {
  id: string;
  name: string;
  /** Orientierung zum Einzeichnen, aus PLAN.md. */
  hinweis: string;
}

/**
 * Die zehn Täler (L5). Geo-Linien liegen in taeler.json und werden im Editor gezeichnet.
 */
export const TAL_KATALOG: TalKatalogEintrag[] = [
  {
    id: 'tal-riemenstaldnertal',
    name: 'Riemenstaldnertal',
    hinweis: 'Riemenstaldner Bach, Ausgang bei Sisikon. Der grösste Teil des Tals liegt im Kanton Schwyz – ganzes Tal zeichnen.',
  },
  {
    id: 'tal-grosstal',
    name: 'Grosstal',
    hinweis: 'Talboden bei Isenthal.',
  },
  {
    id: 'tal-schaechental',
    name: 'Schächental',
    hinweis: 'Entlang des Schächen, von Bürglen Richtung Klausenpass.',
  },
  {
    id: 'tal-erstfeldertal',
    name: 'Erstfeldertal',
    hinweis: 'Alpbach, Ausgang Erstfeld, Richtung Schlossberg.',
  },
  {
    id: 'tal-maderanertal',
    name: 'Maderanertal',
    hinweis: 'Chärstelenbach, von Amsteg Richtung Bristen.',
  },
  {
    id: 'tal-fellital',
    name: 'Fellital',
    hinweis: 'Fellibach, Ausgang bei Gurtnellen.',
  },
  {
    id: 'tal-meiental',
    name: 'Meiental',
    hinweis: 'Meienreuss, von Wassen Richtung Sustenpass.',
  },
  {
    id: 'tal-goescheneral',
    name: 'Göschenertal',
    hinweis: 'Göschenerreuss, von Göschenen zum Göscheneralpsee.',
  },
  {
    id: 'tal-unteralptal',
    name: 'Unteralptal',
    hinweis: 'Unteralpreuss, von Andermatt nach Süden.',
  },
  {
    id: 'tal-urserntal',
    name: 'Urserntal',
    hinweis: 'Reuss, Andermatt – Hospental – Realp, Richtung Furkapass.',
  },
];

const TAL_LERNTEXTE: Record<string, { tipps: [string, string, string]; funFact?: string }> = {
  'tal-riemenstaldnertal': {
    tipps: [
      'Das Tal beginnt bei Sisikon.',
      'Schau über die Kantonsgrenze nach Schwyz!',
      'Das Tal blinkt kurz auf!',
    ],
    funFact: 'Der grösste Teil des Riemenstaldnertals liegt im Kanton Schwyz.',
  },
  'tal-grosstal': {
    tipps: [
      'Das Tal liegt im Kanton Uri – wo könnte es sein?',
      'Schau beim Dorf Isenthal.',
      'Das Tal blinkt kurz auf!',
    ],
    funFact: 'Das Grosstal liegt bei Isenthal.',
  },
  'tal-schaechental': {
    tipps: [
      'Das Tal liegt im Kanton Uri – wo könnte es sein?',
      'Folge dem Schächen von Bürglen zum Klausenpass.',
      'Das Tal blinkt kurz auf!',
    ],
    funFact: 'Das Schächental führt von Bürglen zum Klausenpass.',
  },
  'tal-erstfeldertal': {
    tipps: [
      'Das Tal liegt im Kanton Uri – wo könnte es sein?',
      'Schau bei Erstfeld, Richtung Schlossberg.',
      'Das Tal blinkt kurz auf!',
    ],
    funFact: 'Das Erstfeldertal beginnt in Erstfeld.',
  },
  'tal-maderanertal': {
    tipps: [
      'Das Tal liegt im Kanton Uri – wo könnte es sein?',
      'Von Amsteg geht es nach Bristen.',
      'Das Tal blinkt kurz auf!',
    ],
    funFact: 'Das Maderanertal führt von Amsteg nach Bristen.',
  },
  'tal-fellital': {
    tipps: [
      'Das Tal liegt im Kanton Uri – wo könnte es sein?',
      'Schau beim Dorf Gurtnellen.',
      'Das Tal blinkt kurz auf!',
    ],
    funFact: 'Das Fellital beginnt bei Gurtnellen.',
  },
  'tal-meiental': {
    tipps: [
      'Das Tal liegt im Kanton Uri – wo könnte es sein?',
      'Von Wassen geht es zum Sustenpass.',
      'Das Tal blinkt kurz auf!',
    ],
    funFact: 'Das Meiental führt von Wassen zum Sustenpass.',
  },
  'tal-goescheneral': {
    tipps: [
      'Das Tal liegt im Kanton Uri – wo könnte es sein?',
      'Von Göschenen geht es zum Göscheneralpsee.',
      'Das Tal blinkt kurz auf!',
    ],
    funFact: 'Das Göschenertal führt von Göschenen zum Göscheneralpsee.',
  },
  'tal-unteralptal': {
    tipps: [
      'Das Tal liegt im Kanton Uri – wo könnte es sein?',
      'Schau südlich von Andermatt.',
      'Das Tal blinkt kurz auf!',
    ],
    funFact: 'Das Unteralptal liegt südlich von Andermatt.',
  },
  'tal-urserntal': {
    tipps: [
      'Das Tal liegt im Kanton Uri – wo könnte es sein?',
      'Andermatt, Hospental und Realp liegen in diesem Tal.',
      'Das Tal blinkt kurz auf!',
    ],
    funFact: 'Im Urserntal liegen Andermatt, Hospental und Realp – Richtung Furkapass.',
  },
};

export const TAELER: LernElement[] = TAL_KATALOG.map((k) => {
  const texte = TAL_LERNTEXTE[k.id];
  if (!texte) throw new Error(`Lerntexte fehlen für ${k.id}`);
  return {
    id: k.id,
    kategorie: 'tal' as const,
    name: k.name,
    geo: k.id.replace(/^tal-/, ''),
    tipps: [...texte.tipps],
    funFact: texte.funFact,
  };
});

export const TAELER_MAP = new Map(TAELER.map((t) => [t.id, t]));
