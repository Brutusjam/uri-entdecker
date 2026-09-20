import type { Anlass, Sprecher } from '../data/sprueche';
import type { FigurName, FigurPose } from '../data/figuren';

export interface FindenBegleitung {
  name: FigurName;
  pose: FigurPose;
  anlass: Anlass | null;
  sprecher: Sprecher;
}

export function findenBegleitung(
  ergebnis: 'richtig' | 'falsch' | null,
  versuche: number,
  fertig: boolean,
): FindenBegleitung {
  if (fertig && ergebnis === 'richtig') {
    return { name: 'lia', pose: 'jubelt', anlass: 'richtig', sprecher: 'lia' };
  }
  if (fertig && ergebnis === 'falsch') {
    return { name: 'stierli', pose: 'troestet', anlass: 'falsch', sprecher: 'stierli' };
  }
  if (ergebnis === 'falsch' && versuche >= 2) {
    return { name: 'stierli', pose: 'zeigt', anlass: 'tipp', sprecher: 'stierli' };
  }
  if (ergebnis === 'falsch') {
    return { name: 'stierli', pose: 'troestet', anlass: 'falsch', sprecher: 'stierli' };
  }
  return { name: 'lia', pose: 'zeigt', anlass: null, sprecher: 'lia' };
}
