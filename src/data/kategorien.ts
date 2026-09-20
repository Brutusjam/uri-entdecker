import { GEMEINDEN } from './gemeinden';
import { KANTONE } from './kantone';
import { GEWAESSER } from './gewaesser';
import { TAELER } from './taeler';
import { PAESSE } from './paesse';
import { BERGE } from './berge';
import { SAGENORTE } from './sagenorte';
import type { FortschrittEbene } from '../types/fortschritt';
import type { Kategorie, KartenBlick, KartenEbenen, LernElement, PunktArt } from '../types/karte';

/**
 * Eine Lerngruppe, wie sie das Kind sieht: Titel in Kindersprache,
 * ein Erklärsatz und alles, was Karte und Spielmodi dazu brauchen.
 */
export interface KategorieInfo {
  id: Kategorie;
  titel: string;
  erklaerung: string;
  /** Sagt auf der Karte, wohin getippt werden soll. */
  tippHinweis: string;
  elemente: LernElement[];
  fortschrittEbene: FortschrittEbene;
  kartenEbenen: KartenEbenen[];
  blick: KartenBlick;
  punktArten: PunktArt[];
  profi: boolean;
}

export const KATEGORIEN: KategorieInfo[] = [
  {
    id: 'gemeinde',
    titel: 'Gemeinden',
    erklaerung: 'Die 19 Dörfer und Städte in Uri',
    tippHinweis: 'Tippe auf eine Fläche in Uri.',
    elemente: GEMEINDEN,
    fortschrittEbene: 'gemeinden',
    kartenEbenen: ['kantone', 'gemeinden', 'seen'],
    blick: 'uri',
    punktArten: [],
    profi: false,
  },
  {
    id: 'kanton',
    titel: 'Uris Nachbarn',
    erklaerung: 'Die 8 Kantone rundherum – und Uri selbst',
    tippHinweis: 'Tippe auf einen Kanton um Uri herum.',
    elemente: KANTONE,
    fortschrittEbene: 'kantone',
    kartenEbenen: ['kantone', 'seen'],
    blick: 'nachbarn',
    punktArten: [],
    profi: false,
  },
  {
    id: 'gewaesser',
    titel: 'Täler & Seen',
    erklaerung: 'Die 10 Täler, der Urnersee und der Göscheneralpsee',
    tippHinweis: 'Tippe direkt auf einen Talnamen oder auf einen See.',
    elemente: [...TAELER, ...GEWAESSER],
    fortschrittEbene: 'gewaesser',
    kartenEbenen: ['kantone', 'gemeinden', 'seen'],
    blick: 'uri',
    punktArten: [],
    profi: false,
  },
  {
    id: 'pass',
    titel: 'Pässe',
    erklaerung: 'Strassen über die Berge zum Nachbarkanton',
    tippHinweis: 'Tippe auf ein Pass-Zeichen auf der Karte.',
    elemente: PAESSE,
    fortschrittEbene: 'passe-berge',
    kartenEbenen: ['kantone', 'gemeinden', 'seen', 'punkte'],
    blick: 'nachbarn',
    punktArten: ['pass'],
    profi: true,
  },
  {
    id: 'berg',
    titel: 'Berge',
    erklaerung: 'Die höchsten Gipfel von Uri',
    tippHinweis: 'Tippe auf ein Gipfel-Zeichen auf der Karte.',
    elemente: BERGE,
    fortschrittEbene: 'passe-berge',
    kartenEbenen: ['kantone', 'gemeinden', 'seen', 'punkte'],
    blick: 'uri',
    punktArten: ['berg'],
    profi: true,
  },
  {
    id: 'sagenort',
    titel: 'Sagen-Orte',
    erklaerung: 'Orte aus Tell und der Teufelsbrücke',
    tippHinweis: 'Tippe auf einen Sagen-Ort auf der Karte.',
    elemente: SAGENORTE,
    fortschrittEbene: 'sagen',
    kartenEbenen: ['kantone', 'gemeinden', 'seen', 'punkte'],
    blick: 'nachbarn',
    punktArten: ['sagenort'],
    profi: true,
  },
];

const NACH_ID = new Map<Kategorie, KategorieInfo>(KATEGORIEN.map((k) => [k.id, k]));

/** 'tal' kommt nur aus Kartentreffern und gehört zur Gruppe «Täler & Seen». */
export function kategorieInfo(id: Kategorie): KategorieInfo {
  if (id === 'tal') return NACH_ID.get('gewaesser')!;
  return NACH_ID.get(id) ?? NACH_ID.get('gemeinde')!;
}

export function kategorieTitel(id: Kategorie): string {
  return kategorieInfo(id).titel;
}

export function sichtbareKategorien(profiFrei: boolean): KategorieInfo[] {
  return KATEGORIEN.filter((k) => !k.profi || profiFrei);
}
