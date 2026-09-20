import { distance, point } from '@turf/turf';
import type { PunktFeature } from '../types/karte';
import type { Kategorie, KartenAuswahl } from '../types/karte';

/** Trefferradius um Pässe, Berge und Sagenorte (km). */
export const PUNKT_PUFFER_KM = 4;

export function istPunktKategorie(kategorie: Kategorie): boolean {
  return kategorie === 'pass' || kategorie === 'berg' || kategorie === 'sagenort';
}

export function punktHoehe(feature: PunktFeature | undefined): number | null {
  const ele = feature?.properties.ele;
  return typeof ele === 'number' && Number.isFinite(ele) ? ele : null;
}

export function formatiereHoehe(meter: number): string {
  return `${Math.round(meter)} m`;
}

export function findePunktAnPunkt(
  lng: number,
  lat: number,
  punkte: readonly PunktFeature[],
  maxKm = PUNKT_PUFFER_KM,
): PunktFeature | null {
  const hier = point([lng, lat]);
  let best: PunktFeature | null = null;
  let bestKm = maxKm;
  for (const p of punkte) {
    if (p.geometry.type !== 'Point') continue;
    const [x, y] = p.geometry.coordinates;
    const km = distance(hier, point([x, y]), { units: 'kilometers' });
    if (km <= bestKm) {
      best = p;
      bestKm = km;
    }
  }
  return best;
}

export function punktAlsAuswahl(feature: PunktFeature): KartenAuswahl {
  return {
    id: feature.properties.id,
    kategorie: feature.properties.art,
    name: feature.properties.name,
  };
}
