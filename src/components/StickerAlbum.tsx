import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Bildschirm } from './StatusSeite';
import { Header } from './ui/Header';
import { Begleitung } from './ui/Begleitung';
import { Badge } from './ui/Badge';
import { ComicButton } from './ui/ComicButton';
import { Sticker } from './ui/Sticker';
import { GEMEINDEN } from '../data/gemeinden';
import { KANTONE } from '../data/kantone';
import { PAESSE } from '../data/paesse';
import { BERGE } from '../data/berge';
import { SAGENORTE } from '../data/sagenorte';
import { SPRUECHE } from '../data/sprueche';
import { istGesehen, seiteGlanzVoll, seiteVoll, stickerArt } from '../logic/sticker';
import { waehleSpruch } from '../logic/sprueche';
import { useFortschrittStore } from '../store/fortschritt';
import { heuteIso } from '../logic/leitner';
import { feiereKonfetti } from '../logic/konfetti';
import type { LernElement } from '../types/karte';

interface StickerAlbumProps {
  eingebettet?: boolean;
  onZurueck?: () => void;
}

const GRUND_SEITEN: { id: string; titel: string; elemente: LernElement[] }[] = [
  { id: 'gemeinden', titel: 'Urner Gemeinden', elemente: GEMEINDEN },
  { id: 'kantone', titel: 'Uri & Nachbarn', elemente: KANTONE },
];

const PROFI_SEITEN: { id: string; titel: string; elemente: LernElement[] }[] = [
  { id: 'paesse', titel: 'Pässe', elemente: PAESSE },
  { id: 'berge', titel: 'Berge', elemente: BERGE },
  { id: 'sagen', titel: 'Sagen', elemente: SAGENORTE },
];

const bereitsGeklebt = new Set<string>();

export function StickerAlbum({ eingebettet = false, onZurueck }: StickerAlbumProps) {
  const fortschritt = useFortschrittStore((s) => s.fortschritt);
  const name = useFortschrittStore((s) => s.name);
  const profiFrei = useFortschrittStore((s) => s.profiFreigeschaltet);
  const reduziert = useReducedMotion();
  const [seite, setSeite] = useState(0);
  const begruessung = useMemo(() => waehleSpruch(SPRUECHE, 'sticker', null, 'lia'), []);
  const seiten = profiFrei ? [...GRUND_SEITEN, ...PROFI_SEITEN] : GRUND_SEITEN;
  const aktuell = seiten[Math.min(seite, seiten.length - 1)]!;
  const voll = seiteVoll(aktuell.elemente, fortschritt);
  const glanzVoll = seiteGlanzVoll(aktuell.elemente, fortschritt);
  const albumVoll = seiten.every((s) => seiteVoll(s.elemente, fortschritt));

  useEffect(() => {
    if (voll) feiereKonfetti(!!reduziert);
  }, [voll, seite, reduziert]);

  const inhalt = (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 p-4">
        <Begleitung
          name="lia"
          pose={albumVoll ? 'jubelt' : 'zeigt'}
          text={albumVoll ? 'Wow – das Album ist voll! Du kennst schon ganz viele Wappen!' : begruessung.text}
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-2xl font-extrabold">{aktuell.titel}</h2>
          {glanzVoll ? (
            <Badge variante="gold">Seite in Glanz</Badge>
          ) : voll ? (
            <Badge variante="erfolg">Seite voll</Badge>
          ) : null}
        </div>

        {albumVoll ? (
          <div className="rounded-comic-lg border-comic border-ink bg-uri-gelb p-4 text-center shadow-comic">
            <p className="font-display text-2xl font-extrabold">Urkunde</p>
            <p className="mt-1 font-display text-lg">
              {name || 'Eine Entdeckerin'}{' '}
              {profiFrei
                ? 'kennt Uri als Profi: Gemeinden, Kantone, Pässe, Berge und Sagenorte.'
                : 'kennt alle Gemeinde- und Kantonswappen.'}
            </p>
            <p className="mt-1 text-base">{heuteIso()}</p>
          </div>
        ) : null}

        <div className="flex-1 rounded-comic-lg border-comic border-ink bg-weiss p-4 shadow-comic">
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {aktuell.elemente.map((el, i) => {
              const stand = fortschritt[el.id];
              const art = stickerArt(stand?.stufe ?? 0);
              const gesehen = istGesehen(stand);
              const klebeKey = `${el.id}-${art}`;
              const einkleben = art !== 'leer' && !bereitsGeklebt.has(klebeKey);
              if (einkleben) bereitsGeklebt.add(klebeKey);
              const dreh = ((i % 3) - 1) * 3;

              return (
                <li key={el.id} className="flex flex-col items-center gap-1">
                  <motion.div
                    initial={einkleben && !reduziert ? { scale: 1.45, rotate: dreh - 8, y: -18 } : false}
                    animate={{ scale: 1, rotate: dreh, y: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18, delay: i * 0.03 }}
                  >
                    <Sticker
                      src={art === 'leer' ? undefined : (el.wappen ?? el.bild)}
                      alt={art === 'leer' ? undefined : el.name}
                      leer={art === 'leer'}
                      glanz={art === 'glanz'}
                      groesse={88}
                    />
                  </motion.div>
                  <p className="max-w-[88px] text-center font-display text-sm font-bold leading-tight text-ink">
                    {gesehen || art !== 'leer' ? el.name : '\u00a0'}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex items-center justify-between gap-3">
          <ComicButton variante="neutral" disabled={seite === 0} onClick={() => setSeite((s) => s - 1)}>
            Vorher
          </ComicButton>
          <p className="font-display text-lg font-bold">
            Seite {Math.min(seite, seiten.length - 1) + 1} von {seiten.length}
          </p>
          <ComicButton
            variante="neutral"
            disabled={seite >= seiten.length - 1}
            onClick={() => setSeite((s) => s + 1)}
          >
            Weiter
          </ComicButton>
        </div>
      </div>
  );

  if (eingebettet) return inhalt;

  return (
    <Bildschirm>
      <Header titel="Sticker-Album" leitfarbe="uri-gelb" onZurueck={onZurueck} />
      {inhalt}
    </Bildschirm>
  );
}
