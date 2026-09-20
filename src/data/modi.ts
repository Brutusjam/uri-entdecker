import type { Leitfarbe } from '../components/ui/leitfarbe';

export type ModusId =
  | 'finden'
  | 'entdecken'
  | 'wappen'
  | 'memory'
  | 'puzzle'
  | 'beschriften'
  | 'pruefung'
  | 'blitz'
  | 'duell'
  | 'pass-reise'
  | 'gipfel'
  | 'sagen'
  | 'tell-pfad';

export type ModusGruppeId = 'ueben' | 'spielen' | 'pruefung' | 'profi';

export interface ModusInfo {
  id: ModusId;
  titel: string;
  /** Untertitel auf der Modus-Karte. */
  kurz: string;
  /** Satz für «Neu für dich» auf der Startseite. */
  einladung: string;
  leitfarbe: Leitfarbe;
  gruppe: ModusGruppeId;
  profi: boolean;
}

export const MODI: ModusInfo[] = [
  {
    id: 'finden',
    titel: 'Wo liegt das?',
    kurz: 'Ort auf der Karte antippen',
    einladung: 'Ich sage einen Namen, du tippst ihn auf der Karte an.',
    leitfarbe: 'see-blau',
    gruppe: 'ueben',
    profi: false,
  },
  {
    id: 'entdecken',
    titel: 'Karte anschauen',
    kurz: 'Frei stöbern, ohne Fragen',
    einladung: 'Tippe herum und lies, was es über jeden Ort zu wissen gibt.',
    leitfarbe: 'alp-gruen',
    gruppe: 'ueben',
    profi: false,
  },
  {
    id: 'wappen',
    titel: 'Wappen',
    kurz: '28 Wappen zuordnen',
    einladung: 'Welches Wappen gehört zu welcher Gemeinde?',
    leitfarbe: 'stier-rot',
    gruppe: 'spielen',
    profi: false,
  },
  {
    id: 'memory',
    titel: 'Memory',
    kurz: 'Paare finden',
    einladung: 'Wappen und Namen als Paare aufdecken.',
    leitfarbe: 'koralle',
    gruppe: 'spielen',
    profi: false,
  },
  {
    id: 'puzzle',
    titel: 'Puzzle',
    kurz: 'Teile in den Umriss',
    einladung: 'Setze Uri aus seinen Gemeinden zusammen.',
    leitfarbe: 'alp-gruen',
    gruppe: 'spielen',
    profi: false,
  },
  {
    id: 'blitz',
    titel: 'Blitzrunde',
    kurz: '60 Sekunden Tempo',
    einladung: 'Eine Minute, so viele Orte wie möglich.',
    leitfarbe: 'koralle',
    gruppe: 'spielen',
    profi: false,
  },
  {
    id: 'duell',
    titel: 'Duell',
    kurz: 'Zu zweit am Tablet',
    einladung: 'Hol jemanden dazu und spielt gegeneinander.',
    leitfarbe: 'sagen-lila',
    gruppe: 'spielen',
    profi: false,
  },
  {
    id: 'beschriften',
    titel: 'Beschriften',
    kurz: 'Schilder auf die Karte',
    einladung: 'Namensschilder auf die stumme Karte ziehen – wie im Test.',
    leitfarbe: 'uri-gelb',
    gruppe: 'pruefung',
    profi: false,
  },
  {
    id: 'pruefung',
    titel: 'Übungstest',
    kurz: 'Wie in der Schule, mit Note',
    einladung: 'Schau, wie gut du im Test schon wärst.',
    leitfarbe: 'ink',
    gruppe: 'pruefung',
    profi: false,
  },
  {
    id: 'pass-reise',
    titel: 'Pass-Reise',
    kurz: 'Tal, Pass, Nachbarkanton',
    einladung: 'Reise über die Pässe in die Nachbarkantone.',
    leitfarbe: 'sagen-lila',
    gruppe: 'profi',
    profi: true,
  },
  {
    id: 'gipfel',
    titel: 'Gipfel-Quiz',
    kurz: 'Welcher Berg ist höher?',
    einladung: 'Zwei Berge, einer ist höher – welcher?',
    leitfarbe: 'sagen-lila',
    gruppe: 'profi',
    profi: true,
  },
  {
    id: 'sagen',
    titel: 'Sagen',
    kurz: 'Comics und Quiz',
    einladung: 'Lies die Sagen von Tell und der Teufelsbrücke.',
    leitfarbe: 'sagen-lila',
    gruppe: 'profi',
    profi: true,
  },
  {
    id: 'tell-pfad',
    titel: 'Tell-Pfad',
    kurz: 'Stationen in der richtigen Reihenfolge',
    einladung: 'Bring die Stationen der Tell-Sage in die richtige Reihenfolge.',
    leitfarbe: 'sagen-lila',
    gruppe: 'profi',
    profi: true,
  },
];

export const MODUS_GRUPPEN: { id: ModusGruppeId; titel: string; hinweis: string }[] = [
  { id: 'ueben', titel: 'Üben', hinweis: 'Ohne Druck lernen und schauen.' },
  { id: 'spielen', titel: 'Spielen', hinweis: 'Quiz, Tempo und zu zweit.' },
  { id: 'pruefung', titel: 'Für die Prüfung', hinweis: 'Namen auf die stumme Karte legen.' },
  { id: 'profi', titel: 'Uri-Profi', hinweis: 'Pässe, Berge und Sagen – wenn freigeschaltet.' },
];

const NACH_ID = new Map<ModusId, ModusInfo>(MODI.map((m) => [m.id, m]));

export function modusInfo(id: ModusId): ModusInfo | undefined {
  return NACH_ID.get(id);
}

export function modiDerGruppe(gruppe: ModusGruppeId, profiFrei: boolean): ModusInfo[] {
  return MODI.filter((m) => m.gruppe === gruppe && (!m.profi || profiFrei));
}
