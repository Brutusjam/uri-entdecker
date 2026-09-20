import { heuteIso } from './leitner';

export interface SerieStand {
  tage: number;
  letzterTag: string | null;
  /** true = ein Pausentag darf die Serie retten. */
  frostBereit: boolean;
}

export function leereSerie(): SerieStand {
  return { tage: 0, letzterTag: null, frostBereit: true };
}

export function tageZwischen(von: string, bis: string): number {
  const a = Date.parse(`${von}T00:00:00`);
  const b = Date.parse(`${bis}T00:00:00`);
  return Math.round((b - a) / 86_400_000);
}

/**
 * Serie: aufeinanderfolgende Tage. Ein Tag Pause wird verziehen (Frostschutz).
 */
export function aktualisiereSerie(stand: SerieStand, heute = heuteIso()): SerieStand {
  if (!stand.letzterTag) {
    return { tage: 1, letzterTag: heute, frostBereit: true };
  }
  if (stand.letzterTag === heute) return stand;
  const diff = tageZwischen(stand.letzterTag, heute);
  if (diff === 1) {
    return { tage: stand.tage + 1, letzterTag: heute, frostBereit: true };
  }
  if (diff === 2 && stand.frostBereit) {
    return { tage: stand.tage + 1, letzterTag: heute, frostBereit: false };
  }
  return { tage: 1, letzterTag: heute, frostBereit: true };
}
