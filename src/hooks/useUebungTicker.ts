import { useEffect } from 'react';
import { useFortschrittStore } from '../store/fortschritt';

/** Zählt sichtbare Übungszeit in ganzen Sekunden. */
export function useUebungTicker(): void {
  const tickUebung = useFortschrittStore((s) => s.tickUebung);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') tickUebung(1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [tickUebung]);
}
