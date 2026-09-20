import { describe, expect, it } from 'vitest';
import { gesamtStand, lernstand, standFuerKategorie, standSatz } from './lernstand';
import { kategorieInfo } from '../data/kategorien';
import { neuerFortschritt } from './leitner';
import type { FortschrittMap, LeitnerStufe } from '../types/fortschritt';

function mitStufen(stufen: Record<string, LeitnerStufe>): FortschrittMap {
  const map: FortschrittMap = {};
  for (const [id, stufe] of Object.entries(stufen)) {
    map[id] = { ...neuerFortschritt(), stufe };
  }
  return map;
}

describe('standFuerKategorie', () => {
  const gemeinden = kategorieInfo('gemeinde');

  it('zählt ab Stufe 3 als gelernt und ab Stufe 5 als gemeistert', () => {
    const erste = gemeinden.elemente[0]!;
    const zweite = gemeinden.elemente[1]!;
    const dritte = gemeinden.elemente[2]!;
    const stand = standFuerKategorie(
      gemeinden,
      mitStufen({ [erste.id]: 2, [zweite.id]: 3, [dritte.id]: 5 }),
    );

    expect(stand.gelernt).toBe(2);
    expect(stand.gemeistert).toBe(1);
    expect(stand.gesamt).toBe(gemeinden.elemente.length);
    expect(stand.fertig).toBe(false);
  });

  it('ist fertig, wenn alle Elemente sitzen', () => {
    const alle: Record<string, LeitnerStufe> = {};
    for (const el of gemeinden.elemente) alle[el.id] = 4;
    const stand = standFuerKategorie(gemeinden, mitStufen(alle));

    expect(stand.fertig).toBe(true);
    expect(stand.gelernt).toBe(stand.gesamt);
  });
});

describe('lernstand', () => {
  it('blendet Profi-Gruppen aus, solange sie gesperrt sind', () => {
    const ids = lernstand({}, false).map((s) => s.info.id);
    expect(ids).toEqual(['gemeinde', 'kanton', 'gewaesser']);
  });

  it('zeigt alle sechs Gruppen, wenn Profi frei ist', () => {
    const ids = lernstand({}, true).map((s) => s.info.id);
    expect(ids).toEqual(['gemeinde', 'kanton', 'gewaesser', 'pass', 'berg', 'sagenort']);
  });
});

describe('gesamtStand', () => {
  it('summiert über alle Gruppen', () => {
    const summe = gesamtStand(lernstand({}, false));
    expect(summe.gelernt).toBe(0);
    expect(summe.gesamt).toBeGreaterThan(19);
  });
});

describe('standSatz', () => {
  const info = kategorieInfo('gemeinde');

  it('macht Mut, wenn noch nichts sitzt', () => {
    expect(standSatz({ info, gelernt: 0, gesamt: 19, gemeistert: 0, fertig: false })).toContain(
      'Noch nicht angefangen',
    );
  });

  it('nennt die Einzahl, wenn nur eines offen ist', () => {
    expect(standSatz({ info, gelernt: 18, gesamt: 19, gemeistert: 0, fertig: false })).toContain(
      'Nur noch eines',
    );
  });

  it('lobt, wenn alles sitzt', () => {
    expect(standSatz({ info, gelernt: 19, gesamt: 19, gemeistert: 19, fertig: true })).toContain(
      'Alle sitzen',
    );
  });
});
