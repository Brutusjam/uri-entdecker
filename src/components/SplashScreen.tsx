import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Splash-Screen «Aufbruch» (Uri-Entdecker)
 * - Logo fällt federnd ein, Lia und Stierli kommen von links/rechts ins Bild.
 * - Solange geladen wird: Ladebalken mit wechselnden Sprüchen.
 * - Wenn fortschritt >= 1: grosser «Los geht’s!»-Knopf.
 * Farben/Schriften kommen aus den Design-Tokens (DESIGN.md, Kapitel 10).
 */

const LADE_SPRUECHE = [
  'Karte wird gezeichnet …',
  'Wappen werden eingepackt …',
  'Stierli sucht seine Hörner …',
  'Lia schnürt die Wanderschuhe …',
];

type Props = {
  /** Ladefortschritt von 0 bis 1 */
  fortschritt: number;
  onStart: () => void;
};

export default function SplashScreen({ fortschritt, onStart }: Props) {
  const ruhig = useReducedMotion() ?? false;
  const bereit = fortschritt >= 1;
  const [spruch, setSpruch] = useState(0);

  useEffect(() => {
    if (bereit) return;
    const id = window.setInterval(() => setSpruch((s) => (s + 1) % LADE_SPRUECHE.length), 1800);
    return () => window.clearInterval(id);
  }, [bereit]);

  const feder = ruhig
    ? { duration: 0.2 }
    : { type: 'spring' as const, bounce: 0.45, duration: 0.8 };

  return (
    <main
      className="fixed inset-0 overflow-hidden bg-sky font-body text-ink"
      aria-label="Uri-Entdecker wird gestartet"
    >
      {/* Hintergrund: Himmel, Berge, Urnersee, Hügel – unten verankert */}
      <img
        src="/splash/hintergrund.svg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-bottom"
      />

      {/* Logo + Untertitel */}
      <div className="absolute inset-x-0 top-[4%] flex flex-col items-center gap-2 px-6">
        <motion.img
          src="/logo/uri-entdecker-schriftzug.svg"
          alt="Uri-Entdecker"
          className="w-[min(78vw,460px)] landscape:w-[min(38vw,460px)]"
          initial={{ y: ruhig ? 0 : -180, opacity: 0, rotate: ruhig ? 0 : -6 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{ ...feder, delay: 0.1 }}
        />
        <motion.p
          className="font-display text-xl font-extrabold sm:text-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          Kanton Uri spielend entdecken
        </motion.p>
      </div>

      {/* Lia mit Sprechblase */}
      <motion.div
        className="absolute bottom-0 left-[4%] w-[min(60vw,380px)] landscape:w-[min(32vw,380px)]"
        initial={{ x: ruhig ? 0 : -320, opacity: ruhig ? 0 : 1 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ ...feder, delay: 0.35 }}
      >
        <img src="/figuren/lia-neutral.svg" alt="Lia" className="block w-full" />
        <motion.div
          className="absolute -top-[16%] left-[22%] whitespace-nowrap rounded-[20px] border-4 border-ink bg-white px-4 py-2 text-lg font-extrabold shadow-comic landscape:left-[78%] landscape:top-0 landscape:text-xl"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...feder, delay: 1.0 }}
          style={{ transformOrigin: 'bottom left' }}
        >
          Hoi! Bereit für Uri?
        </motion.div>
      </motion.div>

      {/* Stierli: kommt von rechts, atmet leicht, hüpft wenn alles geladen ist */}
      <motion.div
        className="absolute bottom-[3%] right-[5%] w-[min(40vw,290px)] landscape:w-[min(24vw,290px)]"
        initial={{ x: ruhig ? 0 : 320, opacity: ruhig ? 0 : 1 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ ...feder, delay: 0.5 }}
      >
        <motion.img
          src="/figuren/stierli-neutral.svg"
          alt="Stierli"
          className="block w-full"
          style={{ transformOrigin: 'bottom center' }}
          animate={
            ruhig
              ? undefined
              : bereit
                ? { y: [0, -30, 0, -14, 0] }
                : { scale: [1, 1.03, 1] }
          }
          transition={
            bereit
              ? { duration: 0.9, ease: 'easeOut' }
              : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
          }
        />
      </motion.div>

      {/* Start-Knopf bzw. Ladebalken */}
      <div className="absolute inset-x-0 flex flex-col items-center gap-3 portrait:top-[44%] landscape:bottom-[9%]">
        {bereit ? (
          <motion.button
            type="button"
            onClick={onStart}
            autoFocus
            className="h-[76px] w-[280px] rounded-[22px] border-4 border-ink bg-uri-gelb font-display text-4xl font-extrabold text-ink shadow-button transition-transform active:translate-y-[6px] active:shadow-none"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={feder}
          >
            Los geht’s!
          </motion.button>
        ) : (
          <>
            <div
              role="progressbar"
              aria-label="Laden"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(fortschritt * 100)}
              className="h-[22px] w-[280px] overflow-hidden rounded-full border-4 border-ink bg-white"
            >
              <div
                className="h-full bg-[repeating-linear-gradient(135deg,var(--color-alp-gruen)_0_12px,var(--color-alp-gruen-dunkel)_12px_24px)] transition-[width] duration-300"
                style={{ width: `${Math.max(6, fortschritt * 100)}%` }}
              />
            </div>
            <p className="text-base font-extrabold" aria-live="polite">
              {LADE_SPRUECHE[spruch]}
            </p>
          </>
        )}
      </div>
    </main>
  );
}
