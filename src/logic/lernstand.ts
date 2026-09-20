import { KATEGORIEN, type KategorieInfo } from '../data/kategorien';
import { istGemeistert, istGutGelernt } from './leitner';
import type { FortschrittMap, LeitnerStufe } from '../types/fortschritt';

export interface KategorieStand {
  info: KategorieInfo;
  /** Elemente auf Leitner-Stufe 3 oder höher. */
  gelernt: number;
  gesamt: number;
  gemeistert: number;
  /** Alle Elemente der Gruppe sitzen. */
  fertig: boolean;
}

function stufeVon(fortschritt: FortschrittMap, id: string): LeitnerStufe {
  return (fortschritt[id]?.stufe ?? 0) as LeitnerStufe;
}

export function standFuerKategorie(
  info: KategorieInfo,
  fortschritt: FortschrittMap,
): KategorieStand {
  let gelernt = 0;
  let gemeistert = 0;
  for (const el of info.elemente) {
    const stufe = stufeVon(fortschritt, el.id);
    if (istGutGelernt(stufe)) gelernt += 1;
    if (istGemeistert(stufe)) gemeistert += 1;
  }
  const gesamt = info.elemente.length;
  return { info, gelernt, gesamt, gemeistert, fertig: gesamt > 0 && gelernt === gesamt };
}

export function lernstand(fortschritt: FortschrittMap, profiFrei: boolean): KategorieStand[] {
  return KATEGORIEN.filter((k) => !k.profi || profiFrei).map((k) =>
    standFuerKategorie(k, fortschritt),
  );
}

export function gesamtStand(staende: KategorieStand[]): { gelernt: number; gesamt: number } {
  return staende.reduce(
    (summe, s) => ({ gelernt: summe.gelernt + s.gelernt, gesamt: summe.gesamt + s.gesamt }),
    { gelernt: 0, gesamt: 0 },
  );
}

/** Kindgerechter Statussatz zu einer Lerngruppe. */
export function standSatz(stand: KategorieStand): string {
  if (stand.gesamt === 0) return 'Kommt bald.';
  if (stand.gelernt === 0) return 'Noch nicht angefangen – probier es aus!';
  if (stand.fertig) return 'Alle sitzen. Super gemacht!';
  const offen = stand.gesamt - stand.gelernt;
  if (offen === 1) return 'Nur noch eines – das schaffst du!';
  if (stand.gelernt >= stand.gesamt / 2) return `Über die Hälfte! Noch ${offen}.`;
  return `Noch ${offen} zu lernen. Weiter so!`;
}
