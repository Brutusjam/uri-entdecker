export interface PassReise {
  passId: string;
  kantonKuerzel: string;
  kantonName: string;
  talId: string;
  talName: string;
  zielText: string;
}

export const PASS_REISEN: PassReise[] = [
  {
    passId: 'pass-gotthard',
    kantonKuerzel: 'TI',
    kantonName: 'Tessin',
    talId: 'tal-urserntal',
    talName: 'Urserntal',
    zielText: 'Stierli will ins Tessin. Welcher Weg?',
  },
  {
    passId: 'pass-furka',
    kantonKuerzel: 'VS',
    kantonName: 'Wallis',
    talId: 'tal-urserntal',
    talName: 'Urserntal',
    zielText: 'Stierli will ins Wallis. Welcher Weg?',
  },
  {
    passId: 'pass-oberalp',
    kantonKuerzel: 'GR',
    kantonName: 'Graubünden',
    talId: 'tal-urserntal',
    talName: 'Urserntal',
    zielText: 'Stierli will nach Graubünden. Welcher Weg?',
  },
  {
    passId: 'pass-susten',
    kantonKuerzel: 'BE',
    kantonName: 'Bern',
    talId: 'tal-meiental',
    talName: 'Meiental',
    zielText: 'Stierli will nach Bern. Welcher Weg?',
  },
  {
    passId: 'pass-klausen',
    kantonKuerzel: 'GL',
    kantonName: 'Glarus',
    talId: 'tal-schaechental',
    talName: 'Schächental',
    zielText: 'Stierli will nach Glarus. Welcher Weg?',
  },
];

export type PassReiseSchritt = 'tal' | 'pass' | 'kanton';

export const PASS_REISE_SCHRITTE: PassReiseSchritt[] = ['tal', 'pass', 'kanton'];

export function passReiseZielId(reise: PassReise, schritt: PassReiseSchritt): string {
  if (schritt === 'tal') return reise.talId;
  if (schritt === 'pass') return reise.passId;
  return `kt-${reise.kantonKuerzel}`;
}

export function passReiseFrage(reise: PassReise, schritt: PassReiseSchritt): string {
  if (schritt === 'tal') return `Zuerst das Tal: Wo liegt das ${reise.talName}?`;
  if (schritt === 'pass') return `Dann der Pass: Wo liegt der ${passName(reise.passId)}?`;
  return `Und der Nachbarkanton: Wo liegt ${reise.kantonName}?`;
}

function passName(id: string): string {
  const fund = PASS_REISEN.find((r) => r.passId === id);
  if (id === 'pass-gotthard') return 'Gotthardpass';
  if (id === 'pass-furka') return 'Furkapass';
  if (id === 'pass-oberalp') return 'Oberalppass';
  if (id === 'pass-susten') return 'Sustenpass';
  if (id === 'pass-klausen') return 'Klausenpass';
  return fund?.passId ?? id;
}

export function naechsterPassSchritt(schritt: PassReiseSchritt): PassReiseSchritt | null {
  if (schritt === 'tal') return 'pass';
  if (schritt === 'pass') return 'kanton';
  return null;
}
