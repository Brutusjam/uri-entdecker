import { MODI, type ModusInfo } from '../data/modi';

/**
 * Erster noch nie gestarteter Modus – Grundlage für «Neu für dich»
 * auf der Startseite. Gibt null zurück, wenn alles schon probiert wurde.
 */
export function neuerModusVorschlag(
  gespielteModi: string[],
  profiFrei: boolean,
  modi: ModusInfo[] = MODI,
): ModusInfo | null {
  const gespielt = new Set(gespielteModi);
  return modi.find((m) => (!m.profi || profiFrei) && !gespielt.has(m.id)) ?? null;
}
