import type { Feature, FeatureCollection, Geometry } from 'geojson';

export type Kategorie = 'gemeinde' | 'kanton' | 'tal' | 'gewaesser' | 'pass' | 'berg' | 'sagenort';

export interface LernElement {
  id: string;
  kategorie: Kategorie;
  name: string;
  aliase?: string[];
  geo: string;
  wappen?: string;
  tipps: string[];
  wappenTipp?: string;
  /** Kindgerechte Erklärung, warum das Wappen so aussieht. */
  wappenHintergrund?: string;
  funFact?: string;
  /** Comic-Bild für Sticker (Pässe, Berge, Sagenorte). */
  bild?: string;
  /** Ständige Wohnbevölkerung (BFS). */
  einwohner?: number;
  /** Gemeindefläche in km² (BFS). */
  flaecheKm2?: number;
  /** Stichtag der Einwohnerzahl, z. B. «Ende 2025». */
  einwohnerStand?: string;
  istHauptort?: boolean;
}

export interface GemeindeProperties {
  bfs: number;
  name: string;
}

export interface KantonProperties {
  id: number;
  name: string;
  kuerzel: string;
}

export interface GewaesserProperties {
  id: string;
  name: string;
}

export type GemeindeFeature = Feature<Geometry, GemeindeProperties>;
export type KantonFeature = Feature<Geometry, KantonProperties>;
export type GewaesserFeature = Feature<Geometry, GewaesserProperties>;

export interface GeoDaten {
  gemeinden: FeatureCollection<Geometry, GemeindeProperties>;
  kantone: FeatureCollection<Geometry, KantonProperties>;
  urnersee: FeatureCollection<Geometry, GewaesserProperties>;
  vierwaldstaettersee: FeatureCollection<Geometry, GewaesserProperties>;
  goescheneralpsee: FeatureCollection<Geometry, GewaesserProperties>;
  punkte: FeatureCollection<Geometry, PunktProperties>;
}

export type PunktArt = 'pass' | 'berg' | 'sagenort';

export interface PunktProperties {
  id: string;
  name: string;
  art: PunktArt;
  ele: number | null;
}

export type PunktFeature = Feature<Geometry, PunktProperties>;

export type KartenEbenen = 'kantone' | 'gemeinden' | 'seen' | 'punkte';

export type KartenBlick = 'uri' | 'nachbarn';

export interface KartenAuswahl {
  id: string;
  kategorie: Kategorie;
  name: string;
  bfs?: number;
  kuerzel?: string;
}
