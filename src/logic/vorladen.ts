import { LIA_POSEN, STIERLI_POSEN, figurDatei } from '../data/figuren';
import { PAESSE } from '../data/paesse';
import { BERGE } from '../data/berge';
import { SAGENORTE, HOHLE_GASSE } from '../data/sagenorte';
import { assetUrl, oeffentlicherPfad } from '../lib/assetUrl';

export const GEO_URLS = [
  '/geo/uri-gemeinden.geojson',
  '/geo/kantone.geojson',
  '/geo/urnersee.geojson',
  '/geo/vierwaldstaettersee.geojson',
  '/geo/goescheneralpsee.geojson',
  '/geo/punkte.geojson',
] as const;

export const RELIEF_URLS = ['/geo/relief.jpg', '/geo/relief.json'] as const;

export const WAPPEN_MANIFEST_URL = assetUrl('/wappen/manifest.json');

export const SPLASH_SESSION_KEY = 'uri-entdecker-splash-gesehen';

export type WappenEintrag = { datei: string };

export type WappenManifest = {
  gemeinden: Record<string, WappenEintrag>;
  kantone: Record<string, WappenEintrag>;
};

export function figurenUrls(): string[] {
  return [
    ...LIA_POSEN.map((pose) => figurDatei('lia', pose)),
    ...STIERLI_POSEN.map((pose) => figurDatei('stierli', pose)),
  ];
}

export function profiBildUrls(): string[] {
  return [...PAESSE, ...BERGE, ...SAGENORTE, HOHLE_GASSE]
    .map((e) => e.bild)
    .filter((url): url is string => Boolean(url));
}

export function wappenUrls(manifest: WappenManifest): string[] {
  return [
    ...Object.values(manifest.gemeinden).map((eintrag) => assetUrl(eintrag.datei)),
    ...Object.values(manifest.kantone).map((eintrag) => assetUrl(eintrag.datei)),
  ];
}

export function festeVorladeUrls(): string[] {
  return [...GEO_URLS.map(assetUrl), ...figurenUrls(), WAPPEN_MANIFEST_URL];
}

export function alleVorladeUrls(manifest: WappenManifest): string[] {
  return [...festeVorladeUrls(), ...wappenUrls(manifest), ...profiBildUrls()];
}

export function istBildUrl(url: string): boolean {
  const pfad = oeffentlicherPfad(url);
  return (
    pfad.startsWith('/wappen/') ||
    pfad.startsWith('/figuren/') ||
    pfad.startsWith('/logo/') ||
    pfad.startsWith('/icons/') ||
    pfad.startsWith('/profi/') ||
    pfad.startsWith('/geo/relief.')
  );
}

/** Sagt dem Browser früh, welche Bilder gleich gebraucht werden. */
export function legeBilderImKopfVor(urls: string[]): void {
  if (typeof document === 'undefined') return;
  for (const url of urls) {
    if (document.querySelector(`link[rel="preload"][href="${url}"]`)) continue;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  }
}

/** Füllt den Bild-Cache des Browsers – fetch allein reicht für <img> oft nicht. */
export function ladeAlsBild(url: string): Promise<void> {
  if (typeof Image === 'undefined') {
    return fetch(url)
      .then(() => undefined)
      .catch(() => undefined);
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    const fertig = () => {
      if (typeof img.decode === 'function') {
        img.decode().finally(() => resolve());
        return;
      }
      resolve();
    };
    img.onload = fertig;
    img.onerror = () => resolve();
    img.src = url;
  });
}

export function splashSchonGesehen(): boolean {
  try {
    return sessionStorage.getItem(SPLASH_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function merkeSplashGesehen(): void {
  try {
    sessionStorage.setItem(SPLASH_SESSION_KEY, '1');
  } catch {
    /* privater Modus oder blockierter Speicher */
  }
}
