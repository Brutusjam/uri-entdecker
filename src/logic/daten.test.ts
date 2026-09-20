import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { LIA_POSEN, STIERLI_POSEN } from '../data/figuren';
import { PAESSE } from '../data/paesse';
import { BERGE } from '../data/berge';
import { SAGENORTE, HOHLE_GASSE } from '../data/sagenorte';
import { oeffentlicherPfad } from '../lib/assetUrl';

const ROOT = process.cwd();
const geo = (name: string) => join(ROOT, 'public', 'geo', name);
const wappen = (subdir: string) => join(ROOT, 'public', 'wappen', subdir);

function readGeo(name: string) {
  const path = geo(name);
  expect(existsSync(path), `${name} fehlt`).toBe(true);
  return JSON.parse(readFileSync(path, 'utf8'));
}

describe('Geodaten Phase 0', () => {
  it('hat 19 Urner Gemeinden', () => {
    const fc = readGeo('uri-gemeinden.geojson');
    expect(fc.features).toHaveLength(19);
    for (const f of fc.features) {
      expect(f.properties.name).toBeTruthy();
      expect(f.properties.bfs).toBeTruthy();
    }
  });

  it('hat alle 26 Kantone der Schweiz', () => {
    const fc = readGeo('kantone.geojson');
    expect(fc.features).toHaveLength(26);
    const kuerzel = fc.features.map((f: { properties: { kuerzel: string } }) => f.properties.kuerzel);
    expect(kuerzel).toContain('UR');
    expect(kuerzel).toContain('SZ');
    expect(kuerzel).toContain('LU');
    expect(kuerzel).toContain('ZG');
    expect(new Set(kuerzel).size).toBe(26);
  });

  it('hat Urnersee und Göscheneralpsee', () => {
    const urnersee = readGeo('urnersee.geojson');
    const goeschenen = readGeo('goescheneralpsee.geojson');
    expect(urnersee.features).toHaveLength(1);
    expect(urnersee.features[0].properties.name).toBe('Urnersee');
    expect(goeschenen.features).toHaveLength(1);
    expect(goeschenen.features[0].properties.name).toBe('Göscheneralpsee');
  });
});

describe('Figuren', () => {
  it('hat alle Lia- und Stierli-Posen als SVG', () => {
    const dir = join(ROOT, 'public', 'figuren');
    for (const pose of LIA_POSEN) {
      expect(existsSync(join(dir, `lia-${pose}.svg`)), `lia-${pose}.svg fehlt`).toBe(true);
    }
    for (const pose of STIERLI_POSEN) {
      expect(existsSync(join(dir, `stierli-${pose}.svg`)), `stierli-${pose}.svg fehlt`).toBe(true);
    }
  });
});

describe('Wappendaten Phase 0', () => {
  it('hat 28 Wappen (19 Gemeinden + 9 Kantone)', () => {
    const manifestPath = join(ROOT, 'public', 'wappen', 'manifest.json');
    expect(existsSync(manifestPath), 'manifest.json fehlt – nach manuellem Download: npm run data:manifest').toBe(true);
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

    expect(Object.keys(manifest.gemeinden)).toHaveLength(19);
    expect(Object.keys(manifest.kantone)).toHaveLength(9);

    const gemFiles = readdirSync(wappen('gemeinden')).filter((f: string) => f.endsWith('.svg'));
    const ktFiles = readdirSync(wappen('kantone')).filter((f: string) => f.endsWith('.svg'));
    expect(gemFiles).toHaveLength(19);
    expect(ktFiles).toHaveLength(9);

    for (const datei of [...gemFiles.map((f: string) => join(wappen('gemeinden'), f)), ...ktFiles.map((f: string) => join(wappen('kantone'), f))]) {
      const kopf = readFileSync(datei, 'utf8').slice(0, 80);
      expect(kopf.includes('<svg') || kopf.includes('<?xml'), `${datei} ist kein SVG`).toBe(true);
    }
  });
});

describe('Punktdaten Phase 9', () => {
  it('hat 20 Punkte: 5 Pässe, 8 Berge, 7 Sagenorte', () => {
    const fc = readGeo('punkte.geojson');
    expect(fc.features).toHaveLength(20);
    const ids = fc.features.map((f: { properties: { id: string } }) => f.properties.id);
    expect(new Set(ids).size).toBe(20);
    expect(ids.filter((id: string) => id.startsWith('pass-'))).toHaveLength(5);
    expect(ids.filter((id: string) => id.startsWith('berg-'))).toHaveLength(8);
    expect(ids.filter((id: string) => id.startsWith('sage-'))).toHaveLength(7);

    for (const el of [...PAESSE, ...BERGE, ...SAGENORTE, HOHLE_GASSE]) {
      const feature = fc.features.find((f: { properties: { id: string } }) => f.properties.id === el.id);
      expect(feature, `${el.id} fehlt in punkte.geojson`).toBeTruthy();
      expect(feature!.properties.name).toBe(el.name);
      expect(existsSync(join(ROOT, 'public', oeffentlicherPfad(el.bild!).slice(1))), `${el.bild} fehlt`).toBe(true);
    }

    const paesse = fc.features.filter((f: { properties: { art: string } }) => f.properties.art === 'pass');
    const berge = fc.features.filter((f: { properties: { art: string } }) => f.properties.art === 'berg');
    for (const f of [...paesse, ...berge]) {
      expect(typeof f.properties.ele).toBe('number');
    }
  });
});
