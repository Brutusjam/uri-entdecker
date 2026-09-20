export type Leitfarbe =
  | 'see-blau'
  | 'uri-gelb'
  | 'stier-rot'
  | 'alp-gruen'
  | 'koralle'
  | 'ink'
  | 'sagen-lila';

export const LEITFARBE_BG: Record<Leitfarbe, string> = {
  'see-blau': 'bg-see-blau',
  'uri-gelb': 'bg-uri-gelb',
  'stier-rot': 'bg-stier-rot',
  'alp-gruen': 'bg-alp-gruen',
  koralle: 'bg-koralle',
  ink: 'bg-ink',
  'sagen-lila': 'bg-sagen-lila',
};

export const LEITFARBE_TEXT: Record<Leitfarbe, string> = {
  'see-blau': 'text-see-blau',
  'uri-gelb': 'text-uri-gelb-dunkel',
  'stier-rot': 'text-stier-rot',
  'alp-gruen': 'text-alp-gruen-dunkel',
  koralle: 'text-koralle',
  ink: 'text-ink',
  'sagen-lila': 'text-sagen-lila',
};

/** Titel-Chip: Leitfarbe als Fläche, Text mit ausreichendem Kontrast. */
export const LEITFARBE_CHIP: Record<Leitfarbe, string> = {
  'see-blau': 'bg-see-blau text-weiss',
  'uri-gelb': 'bg-uri-gelb text-ink',
  'stier-rot': 'bg-stier-rot text-weiss',
  'alp-gruen': 'bg-alp-gruen text-weiss',
  koralle: 'bg-koralle text-ink',
  ink: 'bg-ink text-weiss',
  'sagen-lila': 'bg-sagen-lila text-weiss',
};

export const LEITFARBE_LABEL: Record<Leitfarbe, string> = {
  'see-blau': 'Finden',
  'uri-gelb': 'Beschriften',
  'stier-rot': 'Wappen',
  'alp-gruen': 'Puzzle',
  koralle: 'Blitzrunde',
  ink: 'Prüfung',
  'sagen-lila': 'Profi / Sagen',
};
