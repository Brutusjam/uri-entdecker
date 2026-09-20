import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  bestePuzzleZeit,
  istKleinesPuzzleTeil,
  puzzleBestKey,
  puzzleSterne,
  puzzleToleranzPx,
  teilSitzt,
  vereinigeFlaechen,
} from './puzzle';
import type { KantonFeature } from '../types/karte';
import { FANGFRAGE_WAHRSCHEINLICHKEIT, findenFrageText, kartenElementId, waehleFindenFrage } from './fragen';
import { FANGFRAGEN, istFangfrage } from '../data/fangfragen';
import { KANTONE } from '../data/kantone';

describe('Puzzle', () => {
  it('rastet ein, wenn der Schwerpunkt nah genug am Ziel liegt', () => {
    expect(teilSitzt([100, 100], [110, 100], 400)).toBe(true);
    expect(teilSitzt([100, 100], [200, 100], 400)).toBe(false);
  });

  it('gibt kleinen Gemeinden mehr Toleranz', () => {
    expect(puzzleToleranzPx(400, true)).toBeGreaterThan(puzzleToleranzPx(400, false));
    expect(istKleinesPuzzleTeil('gemeinden', '1207')).toBe(true);
    expect(istKleinesPuzzleTeil('gemeinden', '1218')).toBe(false);
    expect(istKleinesPuzzleTeil('kantone', 'SZ')).toBe(false);
  });

  it('vergibt 1–3 Sterne nach Fehlern und Zeit', () => {
    expect(puzzleSterne(0, 90_000, 19)).toBe(3);
    expect(puzzleSterne(2, 90_000, 19)).toBe(3);
    expect(puzzleSterne(0, 200_000, 19)).toBe(2);
    expect(puzzleSterne(4, 90_000, 19)).toBe(2);
    expect(puzzleSterne(10, 400_000, 19)).toBe(1);
  });

  it('merkt die Bestzeit-Schlüssel', () => {
    expect(puzzleBestKey('gemeinden', 'leicht')).toBe('gemeinden-leicht');
    expect(bestePuzzleZeit({})).toBeNull();
    expect(bestePuzzleZeit({ a: 12000, b: 8000 })).toBe(8000);
  });

  it('vereinigt Kantonsflächen zu einem Umriss', () => {
    const kantone: KantonFeature[] = JSON.parse(
      readFileSync(join(process.cwd(), 'public/geo/kantone.geojson'), 'utf8'),
    ).features;
    const neun = kantone.filter((k) =>
      ['UR', 'BE', 'SZ', 'OW', 'NW', 'GL', 'GR', 'TI', 'VS'].includes(k.properties.kuerzel),
    );
    const umriss = vereinigeFlaechen(neun);
    expect(umriss).not.toBeNull();
    expect(umriss?.geometry.type === 'Polygon' || umriss?.geometry.type === 'MultiPolygon').toBe(true);
  });
});

describe('Finden-Fangfragen', () => {
  it('stellt Luzern und Zug als Fangfragen bereit', () => {
    expect(FANGFRAGEN.map((f) => f.geo).sort()).toEqual(['LU', 'ZG']);
    expect(FANGFRAGEN.every(istFangfrage)).toBe(true);
    expect(findenFrageText(FANGFRAGEN[0]!)).toContain('Grenzt er an Uri');
    expect(kartenElementId(FANGFRAGEN[0]!)).toBe('kt-LU');
  });

  it('würfelt bei Kantonen gelegentlich eine Fangfrage', () => {
    const immer = waehleFindenFrage(KANTONE, {}, null, () => 0);
    expect(istFangfrage(immer)).toBe(true);
    const nie = waehleFindenFrage(KANTONE, {}, null, () => FANGFRAGE_WAHRSCHEINLICHKEIT);
    expect(istFangfrage(nie)).toBe(false);
  });
});
