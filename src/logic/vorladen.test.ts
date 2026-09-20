import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  alleVorladeUrls,
  festeVorladeUrls,
  figurenUrls,
  GEO_URLS,
  RELIEF_URLS,
  wappenUrls,
  profiBildUrls,
  istBildUrl,
  type WappenManifest,
} from './vorladen';

const ROOT = process.cwd();

function dateienIn(ordner: string): string[] {
  return readdirSync(join(ROOT, 'public', ordner)).filter((name) => !name.startsWith('.'));
}

describe('Vorladen', () => {
  it('deckt alle Dateien in public/geo ab', () => {
    const aufDisk = dateienIn('geo').sort();
    const imCode = [...GEO_URLS, ...RELIEF_URLS].map((url) => url.replace('/geo/', '')).sort();
    expect(imCode).toEqual(aufDisk);
  });

  it('deckt alle Dateien in public/figuren ab', () => {
    const aufDisk = dateienIn('figuren').sort();
    const imCode = figurenUrls()
      .map((url) => url.replace('/figuren/', ''))
      .sort();
    expect(imCode).toEqual(aufDisk);
  });

  it('nimmt Wappen aus dem Manifest', () => {
    const manifest = JSON.parse(
      readFileSync(join(ROOT, 'public', 'wappen', 'manifest.json'), 'utf8'),
    ) as WappenManifest;
    const urls = wappenUrls(manifest);
    expect(urls).toHaveLength(28);
    for (const url of urls) {
      expect(existsSync(join(ROOT, 'public', url))).toBe(true);
    }
  });

  it('zaehlt Manifest, Geo, Figuren und Wappen', () => {
    const manifest = JSON.parse(
      readFileSync(join(ROOT, 'public', 'wappen', 'manifest.json'), 'utf8'),
    ) as WappenManifest;
    const alle = alleVorladeUrls(manifest);
    expect(alle).toContain('/wappen/manifest.json');
    expect(alle.length).toBe(festeVorladeUrls().length + wappenUrls(manifest).length + profiBildUrls().length);
    expect(new Set(alle).size).toBe(alle.length);
  });

  it('erkennt Wappen und Figuren als Bilder', () => {
    expect(istBildUrl('/wappen/gemeinden/1201.svg')).toBe(true);
    expect(istBildUrl('/figuren/lia-neutral.svg')).toBe(true);
    expect(istBildUrl('/profi/pass-gotthard.svg')).toBe(true);
    expect(istBildUrl('/geo/relief.jpg')).toBe(true);
    expect(istBildUrl('/geo/kantone.geojson')).toBe(false);
  });

  it('hat die PWA-Icons', () => {
    const icons = join(ROOT, 'public', 'icons');
    for (const name of [
      'icon-192.png',
      'icon-512.png',
      'icon-maskable-512.png',
      'apple-touch-icon.png',
      'favicon-32.png',
      'favicon-48.png',
    ]) {
      expect(existsSync(join(icons, name)), `${name} fehlt`).toBe(true);
    }
    expect(existsSync(join(ROOT, 'public', 'favicon.svg'))).toBe(true);
    expect(existsSync(join(ROOT, 'public', 'logo', 'uri-entdecker-logo.svg'))).toBe(true);
  });
});
