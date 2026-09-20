import { describe, expect, it } from 'vitest';
import { elternAufgabe, formatiereUebungszeit, profiBereit, schwacheElemente } from './eltern';
import type { LernElement } from '../types/karte';
import { beiRichtig, neuerFortschritt } from './leitner';

const el = (id: string): LernElement => ({
  id,
  kategorie: 'gemeinde',
  name: id,
  geo: id,
  tipps: [],
});

describe('eltern', () => {
  it('stellt eine Additionsaufgabe', () => {
    const aufgabe = elternAufgabe(() => 0);
    expect(aufgabe.a).toBe(2);
    expect(aufgabe.b).toBe(2);
  });

  it('erkennt 70 Prozent gut gelernt', () => {
    const elemente = [el('a'), el('b'), el('c'), el('d'), el('e'), el('f'), el('g'), el('h'), el('i'), el('j')];
    let f = neuerFortschritt();
    f = beiRichtig(beiRichtig(beiRichtig(f)));
    const fortschritt = Object.fromEntries(elemente.slice(0, 7).map((e) => [e.id, f]));
    expect(profiBereit(fortschritt, elemente)).toBe(true);
    expect(schwacheElemente(fortschritt, elemente)).toHaveLength(3);
  });

  it('formatiert Übungszeit', () => {
    expect(formatiereUebungszeit(40)).toBe('40 Sek.');
    expect(formatiereUebungszeit(125)).toBe('2 Min.');
  });
});
