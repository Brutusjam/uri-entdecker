import { describe, it, expect } from 'vitest';
import { GEMEINDEN } from '../data/gemeinden';
import { KANTONE } from '../data/kantone';
import {
  WAPPEN_ELEMENTE,
  istWappenAntwort,
  neueWappenFrage,
  passtKartenAuswahl,
  waehleDistraktoren,
  wappenPool,
} from './wappen';

describe('wappen', () => {
  it('hat 28 Wappen (19 Gemeinden + 9 Kantone)', () => {
    expect(GEMEINDEN).toHaveLength(19);
    expect(KANTONE).toHaveLength(9);
    expect(WAPPEN_ELEMENTE).toHaveLength(28);
    expect(WAPPEN_ELEMENTE.every((e) => Boolean(e.wappen))).toBe(true);
  });

  it('nimmt keine Distraktoren vom gesuchten Element', () => {
    const ziel = GEMEINDEN[0]!;
    const andere = waehleDistraktoren(ziel, GEMEINDEN, 3, () => 0);
    expect(andere).toHaveLength(3);
    expect(andere.every((e) => e.id !== ziel.id)).toBe(true);
  });

  it('baut eine Frage mit vier Optionen inklusive der Lösung', () => {
    const frage = neueWappenFrage(wappenPool('gemeinden'), {}, null, 'wappen-name', () => 0);
    expect(frage.optionen).toHaveLength(4);
    expect(frage.optionen.some((e) => e.id === frage.ziel.id)).toBe(true);
    expect(istWappenAntwort(frage.ziel.id, frage.ziel)).toBe(true);
    expect(istWappenAntwort('falsch', frage.ziel)).toBe(false);
  });

  it('prüft Karten-Tipps für Gemeinde und Kanton', () => {
    const gemeinde = GEMEINDEN[0]!;
    expect(
      passtKartenAuswahl(
        { id: gemeinde.id, kategorie: 'gemeinde', name: gemeinde.name, bfs: Number(gemeinde.geo) },
        gemeinde,
      ),
    ).toBe(true);
    expect(
      passtKartenAuswahl(
        { id: 'kt-UR', kategorie: 'kanton', name: 'Uri', kuerzel: 'UR' },
        gemeinde,
      ),
    ).toBe(false);
    expect(
      passtKartenAuswahl({ id: 'kt-SZ', kategorie: 'kanton', name: 'Schwyz', kuerzel: 'SZ' }, KANTONE[2]!),
    ).toBe(true);
  });
});
