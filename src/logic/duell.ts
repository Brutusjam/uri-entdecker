export const DUELL_FRAGEN_PRO_SPIELER = 8;

export function naechsterSpieler(aktuell: 0 | 1): 0 | 1 {
  return aktuell === 0 ? 1 : 0;
}

export function duellGewinner(punkte: readonly [number, number]): 0 | 1 | null {
  if (punkte[0] === punkte[1]) return null;
  return punkte[0] > punkte[1] ? 0 : 1;
}

export function duellFertig(gestellt: number, proSpieler = DUELL_FRAGEN_PRO_SPIELER): boolean {
  return gestellt >= proSpieler * 2;
}
