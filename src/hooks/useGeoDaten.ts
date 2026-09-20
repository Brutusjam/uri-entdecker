import { useEffect, useState } from 'react';
import type { GeoDaten } from '../types/karte';
import { assetUrl } from '../lib/assetUrl';

const DATEIEN: Record<keyof GeoDaten, string> = {
  gemeinden: assetUrl('/geo/uri-gemeinden.geojson'),
  kantone: assetUrl('/geo/kantone.geojson'),
  urnersee: assetUrl('/geo/urnersee.geojson'),
  vierwaldstaettersee: assetUrl('/geo/vierwaldstaettersee.geojson'),
  goescheneralpsee: assetUrl('/geo/goescheneralpsee.geojson'),
  punkte: assetUrl('/geo/punkte.geojson'),
};

export function useGeoDaten() {
  const [daten, setDaten] = useState<GeoDaten | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);

  useEffect(() => {
    let abgebrochen = false;
    (async () => {
      try {
        const eintraege = await Promise.all(
          Object.entries(DATEIEN).map(async ([key, url]) => {
            const r = await fetch(url);
            if (!r.ok) throw new Error(`${url} nicht gefunden`);
            return [key, await r.json()] as const;
          }),
        );
        if (!abgebrochen) {
          setDaten(Object.fromEntries(eintraege) as GeoDaten);
        }
      } catch (e) {
        if (!abgebrochen) setFehler(e instanceof Error ? e.message : 'Ladefehler');
      }
    })();
    return () => {
      abgebrochen = true;
    };
  }, []);

  return { daten, fehler, laden: !daten && !fehler };
}
