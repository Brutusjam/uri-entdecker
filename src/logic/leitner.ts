import type { ElementFortschritt, LeitnerStufe } from '../types/fortschritt';

/** Tage bis zur nächsten Wiederholung je Leitner-Stufe */
const INTERVALLE: Record<LeitnerStufe, number> = {
  0: 0,
  1: 1,
  2: 2,
  3: 4,
  4: 7,
  5: 14,
};

export function heuteIso(datum = new Date()): string {
  return datum.toISOString().slice(0, 10);
}

export function inTagen(tage: number, von = new Date()): string {
  const d = new Date(von);
  d.setDate(d.getDate() + tage);
  return heuteIso(d);
}

export function neuerFortschritt(datum = heuteIso()): ElementFortschritt {
  return {
    stufe: 0,
    richtig: 0,
    falsch: 0,
    zuletzt: datum,
    naechsteWiederholung: datum,
  };
}

export function beiRichtig(f: ElementFortschritt, datum = heuteIso()): ElementFortschritt {
  const neueStufe = Math.min(5, f.stufe + 1) as LeitnerStufe;
  return {
    stufe: neueStufe,
    richtig: f.richtig + 1,
    falsch: f.falsch,
    zuletzt: datum,
    naechsteWiederholung: inTagen(INTERVALLE[neueStufe], new Date(datum)),
  };
}

/** Keine Stufen-Strafe – nur mehr Wiederholung */
export function beiFalsch(f: ElementFortschritt, datum = heuteIso()): ElementFortschritt {
  return {
    ...f,
    falsch: f.falsch + 1,
    zuletzt: datum,
    naechsteWiederholung: datum,
  };
}

export function istFaellig(f: ElementFortschritt, datum = heuteIso()): boolean {
  return f.naechsteWiederholung <= datum;
}

export function stufeFarbe(stufe: LeitnerStufe): string {
  if (stufe === 0) return 'var(--color-neu-grau)';
  if (stufe <= 2) return 'var(--color-wiese)';
  if (stufe <= 4) return 'var(--color-alp-gruen-dunkel)';
  return 'var(--color-gold)';
}

export function stufeLabel(stufe: LeitnerStufe): string {
  if (stufe === 0) return 'Noch nicht gesehen';
  if (stufe <= 2) return 'Am Lernen';
  if (stufe <= 4) return 'Gut bekannt';
  return 'Gemeistert';
}

export function istGemeistert(stufe: LeitnerStufe): boolean {
  return stufe >= 5;
}

export function istGutGelernt(stufe: LeitnerStufe): boolean {
  return stufe >= 3;
}
