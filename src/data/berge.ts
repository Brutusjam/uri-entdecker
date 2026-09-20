import type { LernElement } from '../types/karte';

const berg = (id: string, name: string, tipps: [string, string, string], funFact: string): LernElement => ({
  id,
  kategorie: 'berg',
  name,
  geo: id,
  bild: `/profi/${id}.svg`,
  tipps: [...tipps],
  funFact,
});

/** Acht Berge (L8), Auswahl laut PLAN.md. Höhen kommen aus den OSM-Punktdaten. */
export const BERGE: LernElement[] = [
  berg(
    'berg-dammastock',
    'Dammastock',
    [
      'Der höchste Berg von Uri liegt an der Grenze zum Wallis.',
      'Die Gemeinde ist Göschenen.',
      'Der Gipfel blinkt kurz auf!',
    ],
    'Der Dammastock ist der höchste Berg von Uri. Er liegt bei Göschenen, an der Grenze zum Wallis.',
  ),
  berg(
    'berg-galenstock',
    'Galenstock',
    [
      'Dieser Berg steht im hinteren Urserntal.',
      'Er gehört zur Gemeinde Realp, beim Rhonegletscher.',
      'Der Gipfel blinkt kurz auf!',
    ],
    'Der Galenstock steht bei Realp, beim Rhonegletscher.',
  ),
  berg(
    'berg-oberalpstock',
    'Oberalpstock',
    [
      'Dieser Berg steht an der Grenze zu Graubünden.',
      'Die Gemeinde ist Silenen.',
      'Der Gipfel blinkt kurz auf!',
    ],
    'Der Oberalpstock steht bei Silenen, an der Grenze zu Graubünden.',
  ),
  berg(
    'berg-schaerhorn',
    'Schärhorn',
    [
      'Dieser Berg steht über dem Schächental.',
      'Die Gemeinde ist Unterschächen.',
      'Der Gipfel blinkt kurz auf!',
    ],
    'Das Schärhorn steht bei Unterschächen.',
  ),
  berg(
    'berg-clariden',
    'Clariden',
    [
      'Dieser Berg steht an der Grenze zu Glarus.',
      'Die Gemeinde ist Spiringen.',
      'Der Gipfel blinkt kurz auf!',
    ],
    'Der Clariden steht bei Spiringen, an der Grenze zu Glarus.',
  ),
  berg(
    'berg-spannort',
    'Gross Spannort',
    [
      'Dieser Berg steht zwischen zwei Gemeinden.',
      'Er liegt an der Grenze Attinghausen / Erstfeld.',
      'Der Gipfel blinkt kurz auf!',
    ],
    'Das Grosse Spannort steht an der Grenze zwischen Attinghausen und Erstfeld.',
  ),
  berg(
    'berg-bristen',
    'Bristen',
    [
      'Ein markanter Berg über einem Seitentäl.',
      'Er steht über dem Maderanertal.',
      'Der Gipfel blinkt kurz auf!',
    ],
    'Der Bristen ist der markante Berg über dem Maderanertal.',
  ),
  berg(
    'berg-urirotstock',
    'Uri Rotstock',
    [
      'Dieser Berg steht im Westen von Uri.',
      'Die Gemeinde ist Isenthal.',
      'Der Gipfel blinkt kurz auf!',
    ],
    'Der Uri Rotstock steht bei Isenthal.',
  ),
];

export const BERGE_MAP = new Map(BERGE.map((b) => [b.id, b]));
