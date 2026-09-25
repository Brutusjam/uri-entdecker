import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from './cn';

export type ZipfelSeite = 'unten-links' | 'unten-rechts' | 'links' | 'rechts';

export interface SpeechBubbleProps {
  children: ReactNode;
  zipfel?: ZipfelSeite;
  className?: string;
}

export function SpeechBubble({
  children,
  zipfel = 'unten-links',
  className,
}: SpeechBubbleProps) {
  const reduziert = useReducedMotion();

  return (
    <motion.div
      className={cn('relative inline-block max-w-sm', className)}
      initial={reduziert ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={
        reduziert
          ? { duration: 0.15 }
          : { type: 'spring', stiffness: 420, damping: 16, mass: 0.7 }
      }
    >
      <div className="rounded-bubble border-comic border-ink bg-weiss px-4 py-3 font-body text-lg font-semibold leading-snug text-ink shadow-comic md:text-xl">
        {children}
      </div>
      <Zipfel seite={zipfel} />
    </motion.div>
  );
}

/**
 * Zipfel als zwei Flächen statt Strich: die Kontur ist eine gefüllte Form,
 * das Weiss liegt darüber und reicht in die Blase. So bleibt keine feine
 * Innenlinie, die den Pfeil als geschlossenes Dreieck zeichnet.
 * Die Basis liegt nur noch knapp in der Blase, damit das Dreieck die Umrandung
 * auf einer breiteren Strecke überdeckt.
 */
function Zipfel({ seite }: { seite: ZipfelSeite }) {
  if (seite === 'links' || seite === 'rechts') {
    const nachLinks = seite === 'links';
    return (
      <svg
        width="24"
        height="36"
        viewBox="0 0 24 36"
        className={cn(
          'pointer-events-none absolute top-1/2 z-10 -translate-y-1/2',
          nachLinks ? '-left-[19px]' : '-right-[19px]',
        )}
        aria-hidden
      >
        <polygon points={nachLinks ? '24,2 2,18 24,34' : '0,2 22,18 0,34'} className="fill-ink" />
        <polygon points={nachLinks ? '24,6 8,18 24,30' : '0,6 16,18 0,30'} className="fill-weiss" />
      </svg>
    );
  }

  return (
    <svg
      width="36"
      height="24"
      viewBox="0 0 36 24"
      className={cn(
        'pointer-events-none absolute -bottom-[19px] z-10',
        seite === 'unten-links' ? 'left-6' : 'right-6',
      )}
      aria-hidden
    >
      <polygon points="2,0 18,22 34,0" className="fill-ink" />
      <polygon points="6,0 18,16 30,0" className="fill-weiss" />
    </svg>
  );
}
