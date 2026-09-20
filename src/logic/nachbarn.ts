import { booleanIntersects } from '@turf/turf';
import type { GemeindeFeature } from '../types/karte';

/** Ermittelt Nachbargemeinden (BFS → BFS[]) aus den Grenzen */
export function berechneNachbarn(gemeinden: GemeindeFeature[]): Map<number, number[]> {
  const map = new Map<number, number[]>();

  for (const a of gemeinden) {
    const nachbarn: number[] = [];
    for (const b of gemeinden) {
      if (a.properties.bfs === b.properties.bfs) continue;
      if (booleanIntersects(a as Parameters<typeof booleanIntersects>[0], b as Parameters<typeof booleanIntersects>[1])) {
        nachbarn.push(b.properties.bfs);
      }
    }
    map.set(a.properties.bfs, nachbarn);
  }
  return map;
}

export function nachbarIds(bfs: number, nachbarn: Map<number, number[]>): string[] {
  return (nachbarn.get(bfs) ?? []).map((n) => `gem-${n}`);
}
