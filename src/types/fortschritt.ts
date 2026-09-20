export type LeitnerStufe = 0 | 1 | 2 | 3 | 4 | 5;

export interface ElementFortschritt {
  stufe: LeitnerStufe;
  richtig: number;
  falsch: number;
  zuletzt: string;
  naechsteWiederholung: string;
}

export type FortschrittMap = Record<string, ElementFortschritt>;

export type FortschrittEbene = 'gemeinden' | 'kantone' | 'gewaesser' | 'passe-berge' | 'sagen';

export type CapFarbe = 'uri-gelb' | 'see-blau' | 'alp-gruen' | 'koralle' | 'stier-rot';

export interface Avatar {
  heimatgemeinde?: string;
  capFarbe?: CapFarbe;
}

export interface Feier {
  art: 'level' | 'abzeichen' | 'serie' | 'profi';
  titel: string;
  text: string;
}
