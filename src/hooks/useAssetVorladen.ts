import { useEffect, useState } from 'react';
import {
  alleVorladeUrls,
  festeVorladeUrls,
  figurenUrls,
  istBildUrl,
  ladeAlsBild,
  legeBilderImKopfVor,
  type WappenManifest,
  wappenUrls,
  WAPPEN_MANIFEST_URL,
} from '../logic/vorladen';

async function ladeDatei(url: string): Promise<Response> {
  const antwort = await fetch(url, { cache: 'force-cache' });
  if (!antwort.ok) throw new Error(`${url} nicht gefunden`);
  return antwort;
}

async function ladeUrl(url: string): Promise<void> {
  if (istBildUrl(url)) {
    await ladeAlsBild(url);
    return;
  }
  await ladeDatei(url);
}

async function wappenUndFiguren(manifest: WappenManifest): Promise<void> {
  const bilder = [...figurenUrls(), ...wappenUrls(manifest)];
  legeBilderImKopfVor(bilder);
  await Promise.all(bilder.map((url) => ladeAlsBild(url)));
}

export function useAssetVorladen(aktiv: boolean) {
  const [fortschritt, setFortschritt] = useState(aktiv ? 0 : 1);

  useEffect(() => {
    let abgebrochen = false;
    let geladen = 0;
    let total = festeVorladeUrls().length;

    const meld = () => {
      geladen += 1;
      if (!abgebrochen) {
        setFortschritt(Math.min(1, geladen / Math.max(total, 1)));
      }
    };

    (async () => {
      try {
        const manifestAntwort = await ladeDatei(WAPPEN_MANIFEST_URL);
        const manifest = (await manifestAntwort.json()) as WappenManifest;
        if (abgebrochen) return;
        legeBilderImKopfVor([...figurenUrls(), ...wappenUrls(manifest)]);

        if (!aktiv) {
          setFortschritt(1);
          await wappenUndFiguren(manifest);
          return;
        }

        meld();
        const rest = alleVorladeUrls(manifest).filter((url) => url !== WAPPEN_MANIFEST_URL);
        total = 1 + rest.length;
        if (!abgebrochen) {
          setFortschritt(Math.min(1, geladen / total));
        }

        await Promise.all(
          rest.map(async (url) => {
            try {
              await ladeUrl(url);
            } catch {
              /* einzelne Datei darf den Start nicht blockieren */
            } finally {
              meld();
            }
          }),
        );
      } catch {
        if (!abgebrochen) setFortschritt(1);
      }
    })();

    return () => {
      abgebrochen = true;
    };
  }, [aktiv]);

  return { fortschritt };
}
