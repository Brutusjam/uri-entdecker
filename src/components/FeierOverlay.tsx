import { useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Begleitung } from './ui/Begleitung';
import { ComicButton } from './ui/ComicButton';
import { feiereKonfetti } from '../logic/konfetti';
import { spieleKlang } from '../logic/sound';
import { useFortschrittStore } from '../store/fortschritt';

export function FeierOverlay() {
  const feier = useFortschrittStore((s) => s.feier);
  const tonAn = useFortschrittStore((s) => s.tonAn);
  const schliesseFeier = useFortschrittStore((s) => s.schliesseFeier);
  const reduziert = useReducedMotion() ?? false;

  useEffect(() => {
    if (!feier) return;
    const klang = feier.art === 'level' || feier.art === 'profi' ? 'level' : 'sticker';
    spieleKlang(klang, tonAn);
    if (feier.art === 'level' || feier.art === 'abzeichen' || feier.art === 'profi') {
      feiereKonfetti(reduziert);
    }
  }, [feier, reduziert, tonAn]);

  if (!feier) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-md rounded-comic-lg border-comic border-ink bg-paper p-5 shadow-comic">
        <Begleitung name="lia" pose="jubelt" text={feier.text} />
        <p className="mt-4 text-center font-display text-3xl font-extrabold text-ink">{feier.titel}</p>
        <div className="mt-5">
          <ComicButton fullWidth onClick={schliesseFeier}>
            Weiter
          </ComicButton>
        </div>
      </div>
    </div>
  );
}
