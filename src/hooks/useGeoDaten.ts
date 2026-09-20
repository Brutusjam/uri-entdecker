import { useEffect, useState } from 'react';
import type { GeoDaten } from '../types/karte';

const DATEIEN: Record<keyof GeoDaten, string> = {
  gemeinden: '/geo/uri-gemeinden.geojson',
  kantone: '/geo/kantone.geojson',
  urnersee: '/geo/urnersee.geojson',
  vierwaldstaettersee: '/geo/vierwaldstaettersee.geojson',
  goescheneralpsee: '/geo/goescheneralpsee.geojson',
  punkte: '/geo/punkte.geojson',
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
