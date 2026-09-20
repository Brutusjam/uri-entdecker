import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pointOnFeature } from '@turf/turf';
import {
  findeGemeindeAnPunkt,
  findeFeatureAnPunkt,
  findeGewaesserAnPunkt,
  findeKleineGemeindeAnPixel,
  KLEINE_GEMEINDEN,
  MIN_GEMEINDE_TREFFER_PX,
  KLEINE_SEEN,
  mitD3Windung,
  reliefBildKasten,
  ringSumme,
  seePuffer,
} from './karte';
import { geoMercator } from 'd3-geo';
import { RELIEF_BBOX } from '../data/relief';
import type { GemeindeFeature, KantonFeature, GewaesserFeature } from '../types/karte';

const ROOT = process.cwd();

function ladeGemeinden(): GemeindeFeature[] {
  const fc = JSON.parse(readFileSync(join(ROOT, 'public/geo/uri-gemeinden.geojson'), 'utf8'));
  return fc.features;
}

describe('karte – Trefferlogik', () => {
  const gemeinden = ladeGemeinden();

  it('findet Flüelen (kleine Gemeinde) am Zentrum', () => {
    const fluelen = gemeinden.find((g) => g.properties.bfs === 1207)!;
    const coords = fluelen.geometry.type === 'Polygon'
      ? fluelen.geometry.coordinates[0][0]
      : fluelen.geometry.coordinates[0][0][0];
    const treffer = findeGemeindeAnPunkt(coords[0], coords[1], gemeinden);
    expect(treffer?.properties.name).toBe('Flüelen');
  });

  it('markiert Flüelen, Sisikon, Altdorf und Schattdorf als kleine Gemeinden', () => {
    expect(KLEINE_GEMEINDEN).toEqual(new Set([1201, 1207, 1213, 1217]));
  });

  it('findet kleine Gemeinden auch per Pixel-Trefferzone neben der Fläche', () => {
    const fluelen = gemeinden.find((g) => g.properties.bfs === 1207)!;
    const zentrum: [number, number] = [200, 300];
    const zentrumFn = (g: GemeindeFeature) =>
      g.properties.bfs === 1207 ? zentrum : [0, 0];
    const daneben = findeKleineGemeindeAnPixel(
      zentrum[0] + MIN_GEMEINDE_TREFFER_PX - 2,
      zentrum[1],
      gemeinden,
      zentrumFn,
    );
    expect(daneben?.properties.name).toBe('Flüelen');
    const zuWeit = findeKleineGemeindeAnPixel(
      zentrum[0] + MIN_GEMEINDE_TREFFER_PX + 10,
      zentrum[1],
      gemeinden,
      zentrumFn,
    );
    expect(zuWeit).toBeNull();
  });

  it('liefert für jede Gemeinde einen Treffer innerhalb der Fläche', () => {
    for (const g of gemeinden) {
      const [lng, lat] = pointOnFeature(g).geometry.coordinates;
      const treffer = findeGemeindeAnPunkt(lng, lat, gemeinden);
      expect(treffer?.properties.name, `Kein Treffer für ${g.properties.name}`).toBe(g.properties.name);
    }
  });

  it('vergrössert den Göscheneralpsee, damit er sichtbar und treffbar bleibt', () => {
    const goeschen: GewaesserFeature[] = JSON.parse(
      readFileSync(join(ROOT, 'public/geo/goescheneralpsee.geojson'), 'utf8'),
    ).features;
    expect(KLEINE_SEEN.has('goescheneralpsee')).toBe(true);
    expect(seePuffer(goeschen[0]!)).not.toBeNull();
    const [lng, lat] = pointOnFeature(goeschen[0]!).geometry.coordinates;
    const daneben = findeGewaesserAnPunkt(lng, lat + 2 / 111, goeschen);
    expect(daneben?.properties.name).toBe('Göscheneralpsee');
  });

  it('priorisiert Gewässer vor Gemeinden', () => {
    const kantone: KantonFeature[] = JSON.parse(
      readFileSync(join(ROOT, 'public/geo/kantone.geojson'), 'utf8'),
    ).features;
    const goeschen: GewaesserFeature[] = JSON.parse(
      readFileSync(join(ROOT, 'public/geo/goescheneralpsee.geojson'), 'utf8'),
    ).features;
    const [lng, lat] = pointOnFeature(goeschen[0]).geometry.coordinates;
    const treffer = findeFeatureAnPunkt(lng, lat, gemeinden, kantone, goeschen);
    expect(treffer?.kategorie).toBe('gewaesser');
    expect(treffer?.name).toBe('Göscheneralpsee');
  });

  it('findet Urnersee auf offener Wasserfläche', () => {
    const kantone: KantonFeature[] = JSON.parse(
      readFileSync(join(ROOT, 'public/geo/kantone.geojson'), 'utf8'),
    ).features;
    const urnersee: GewaesserFeature[] = JSON.parse(
      readFileSync(join(ROOT, 'public/geo/urnersee.geojson'), 'utf8'),
    ).features;
    const [lng, lat] = pointOnFeature(urnersee[0]).geometry.coordinates;
    const treffer = findeFeatureAnPunkt(lng, lat, gemeinden, kantone, urnersee);
    expect(treffer?.kategorie).toBe('gewaesser');
    expect(treffer?.name).toBe('Urnersee');
  });

  it('findet Uri als Kanton, wenn keine Gemeinden geprüft werden', () => {
    const kantone: KantonFeature[] = JSON.parse(
      readFileSync(join(ROOT, 'public/geo/kantone.geojson'), 'utf8'),
    ).features;
    const uri = kantone.find((k) => k.properties.kuerzel === 'UR')!;
    const [lng, lat] = pointOnFeature(uri).geometry.coordinates;
    const treffer = findeFeatureAnPunkt(lng, lat, [], kantone, []);
    expect(treffer?.kategorie).toBe('kanton');
    expect(treffer?.kuerzel).toBe('UR');
  });

  it('enthält Luzern und Zug für die Fangfragen', () => {
    const kantone: KantonFeature[] = JSON.parse(
      readFileSync(join(ROOT, 'public/geo/kantone.geojson'), 'utf8'),
    ).features;
    expect(kantone.some((k) => k.properties.kuerzel === 'LU')).toBe(true);
    expect(kantone.some((k) => k.properties.kuerzel === 'ZG')).toBe(true);
  });
});

describe('karte – d3-Windung', () => {
  it('wickelt den Urnersee im Uhrzeigersinn, damit d3 ihn nicht als Welt füllt', () => {
    const fc = JSON.parse(readFileSync(join(ROOT, 'public/geo/urnersee.geojson'), 'utf8'));
    const see = fc.features[0];
    expect(see.geometry.type).toBe('Polygon');
    const vorher = ringSumme(see.geometry.coordinates[0]);
    expect(vorher).toBeLessThan(0);
    const korrigiert = mitD3Windung(see);
    expect(ringSumme(korrigiert.geometry.coordinates[0])).toBeGreaterThan(0);
    expect(ringSumme(see.geometry.coordinates[0])).toBe(vorher);
  });
});

describe('karte – Relief', () => {
  it('legt das Reliefbild als Rechteck über die Mercator-Bbox', () => {
    const projection = geoMercator().fitExtent(
      [
        [0, 0],
        [400, 500],
      ],
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [RELIEF_BBOX[0], RELIEF_BBOX[1]],
            [RELIEF_BBOX[2], RELIEF_BBOX[1]],
            [RELIEF_BBOX[2], RELIEF_BBOX[3]],
            [RELIEF_BBOX[0], RELIEF_BBOX[3]],
            [RELIEF_BBOX[0], RELIEF_BBOX[1]],
          ]],
        },
      },
    );
    const kasten = reliefBildKasten(projection, RELIEF_BBOX);
    expect(kasten).not.toBeNull();
    expect(kasten!.width).toBeGreaterThan(0);
    expect(kasten!.height).toBeGreaterThan(0);
    const nw = projection([RELIEF_BBOX[0], RELIEF_BBOX[3]])!;
    const se = projection([RELIEF_BBOX[2], RELIEF_BBOX[1]])!;
    expect(kasten!.x).toBeCloseTo(nw[0], 6);
    expect(kasten!.y).toBeCloseTo(nw[1], 6);
    expect(kasten!.width).toBeCloseTo(se[0] - nw[0], 6);
    expect(kasten!.height).toBeCloseTo(se[1] - nw[1], 6);
  });

  it('hat dieselbe Bbox wie das heruntergeladene Reliefbild', () => {
    const meta = JSON.parse(readFileSync(join(ROOT, 'public/geo/relief.json'), 'utf8')) as {
      bbox: number[];
    };
    expect(meta.bbox).toEqual([...RELIEF_BBOX]);
  });
});
