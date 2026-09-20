import { union } from '@turf/turf';
import type { Feature, Geometry, MultiPolygon, Polygon } from 'geojson';
import { KLEINE_GEMEINDEN } from './karte';
import { formatiereZeit } from './memory';

export type PuzzleVariante = 'gemeinden' | 'kantone';
export type PuzzleStufe = 'leicht' | 'mittel' | 'profi';

export const PUZZLE_STUFEN: PuzzleStufe[] = ['leicht', 'mittel', 'profi'];

/** Anteil der Kartenbreite; mindestens Finger-freundlich. */
export const PUZZLE_TOLERANZ = 0.04;
export const PUZZLE_TOLERANZ_KLEIN = 0.06;
export const PUZZLE_TOLERANZ_MIN_PX = 28;
export const PUZZLE_GREIF_MIN_PX = 48;

export function puzzleBestKey(variante: PuzzleVariante, stufe: PuzzleStufe): string {
  return `${variante}-${stufe}`;
}

export function puzzleToleranzPx(kartenbreite: number, klein: boolean): number {
  const anteil = klein ? PUZZLE_TOLERANZ_KLEIN : PUZZLE_TOLERANZ;
  const min = klein ? 36 : PUZZLE_TOLERANZ_MIN_PX;
  return Math.max(kartenbreite * anteil, min);
}

export function teilSitzt(
  teil: readonly [number, number],
  ziel: readonly [number, number],
  kartenbreite: number,
  klein = false,
): boolean {
  const max = puzzleToleranzPx(kartenbreite, klein);
  return Math.hypot(teil[0] - ziel[0], teil[1] - ziel[1]) < max;
}

export function istKleinesPuzzleTeil(variante: PuzzleVariante, geo: string): boolean {
  if (variante !== 'gemeinden') return false;
  const bfs = Number(geo);
  return Number.isFinite(bfs) && KLEINE_GEMEINDEN.has(bfs);
}

/**
 * 3 Sterne: wenig Fehler und zügig (ca. 2 Min. bei 19 Teilen).
 * 2 Sterne: höchstens ein Viertel Fehlversuche.
 * Sonst 1 Stern – fertig zählt immer.
 */
export function puzzleSterne(fehlversuche: number, dauerMs: number, teile: number): 1 | 2 | 3 {
  const n = Math.max(teile, 1);
  const sekundenProTeil = dauerMs / 1000 / n;
  if (fehlversuche <= 2 && sekundenProTeil <= 6) return 3;
  if (fehlversuche <= 2) return 2;
  if (fehlversuche <= Math.ceil(n * 0.25) && sekundenProTeil <= 12) return 2;
  return 1;
}

export function bestePuzzleZeit(best: Record<string, number>): number | null {
  const zeiten = Object.values(best);
  if (zeiten.length === 0) return null;
  return Math.min(...zeiten);
}

export { formatiereZeit };

type Flaeche = Feature<Polygon | MultiPolygon>;

export function vereinigeFlaechen(features: Feature<Geometry>[]): Flaeche | null {
  const polygone = features.filter(
    (f): f is Flaeche => f.geometry?.type === 'Polygon' || f.geometry?.type === 'MultiPolygon',
  );
  if (polygone.length === 0) return null;
  if (polygone.length === 1) return polygone[0]!;
  try {
    const vereint = union({
      type: 'FeatureCollection',
      features: polygone,
    });
    return vereint ?? null;
  } catch {
    return null;
  }
}
