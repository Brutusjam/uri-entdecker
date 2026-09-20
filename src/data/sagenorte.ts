import type { LernElement } from '../types/karte';
import { assetUrl } from '../lib/assetUrl';

const ort = (id: string, name: string, tipps: [string, string, string], funFact: string): LernElement => ({
  id,
  kategorie: 'sagenort',
  name,
  geo: id,
  bild: assetUrl(`/profi/${id}.svg`),
  tipps: [...tipps],
  funFact,
});

/** Sagenorte in Uri (L9). Die Hohle Gasse liegt nicht in Uri – nur als Fangfrage. */
export const SAGENORTE: LernElement[] = [
  ort(
    'sage-teufelsbruecke',
    'Teufelsbrücke',
    [
      'Die Brücke steht in einer engen Schlucht.',
      'Zwischen Göschenen und Andermatt, in der Schöllenen.',
      'Der Ort blinkt kurz auf!',
    ],
    'Man erzählt sich die Sage von der Teufelsbrücke in der Schöllenenschlucht.',
  ),
  ort(
    'sage-teufelsstein',
    'Teufelsstein',
    [
      'Ein riesiger Stein neben der Gotthardstrasse.',
      'Er liegt bei Göschenen.',
      'Der Ort blinkt kurz auf!',
    ],
    'Man erzählt sich: Der Teufelsstein landete bei Göschenen, neben der Brücke.',
  ),
  ort(
    'sage-telldenkmal',
    'Telldenkmal',
    [
      'Hier soll der Apfelschuss geschehen sein.',
      'Das Denkmal steht in Altdorf.',
      'Der Ort blinkt kurz auf!',
    ],
    'In Altdorf steht das Telldenkmal – laut Sage der Ort des Apfelschusses.',
  ),
  ort(
    'sage-tellmuseum',
    'Tell-Museum',
    [
      'Laut Sage kommt Tell aus diesem Dorf.',
      'Das Museum steht in Bürglen.',
      'Der Ort blinkt kurz auf!',
    ],
    'Laut Sage ist Bürglen Tells Heimat. Dort steht das Tell-Museum.',
  ),
  ort(
    'sage-tellskapelle',
    'Tellskapelle',
    [
      'Hier soll Tell aus dem Boot gesprungen sein.',
      'Die Kapelle steht an der Tellsplatte bei Sisikon.',
      'Der Ort blinkt kurz auf!',
    ],
    'Bei Sisikon steht die Tellskapelle an der Tellsplatte. Die Kapelle ist auch im Wappen von Sisikon.',
  ),
  ort(
    'sage-ruetli',
    'Rütli',
    [
      'Hier soll der Rütlischwur geschehen sein.',
      'Die Wiese liegt bei Seelisberg am Urnersee.',
      'Der Ort blinkt kurz auf!',
    ],
    'Das Rütli liegt bei Seelisberg. Man erzählt sich dort den Rütlischwur.',
  ),
];

/** Bonus-Fangfrage: liegt in Küssnacht, Kanton Schwyz – nicht in Uri. */
export const HOHLE_GASSE: LernElement = ort(
  'sage-hohle-gasse',
  'Hohle Gasse',
  [
    'Dieser Ort liegt nicht in Uri.',
    'Er liegt in Küssnacht, im Kanton Schwyz.',
    'Der Ort blinkt kurz auf!',
  ],
  'Die Hohle Gasse liegt in Küssnacht (Kanton Schwyz) – nicht in Uri.',
);

export const SAGENORTE_MAP = new Map([...SAGENORTE, HOHLE_GASSE].map((s) => [s.id, s]));
