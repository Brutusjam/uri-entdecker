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

function Zipfel({ seite }: { seite: ZipfelSeite }) {
  if (seite === 'links' || seite === 'rechts') {
    const nachLinks = seite === 'links';
    return (
      <svg
        width="16"
        height="28"
        viewBox="0 0 16 28"
        className={cn(
          'pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink',
          nachLinks ? '-left-[13px]' : '-right-[13px]',
        )}
        aria-hidden
      >
        <path
          d={nachLinks ? 'M15 2 L2 14 L15 26' : 'M1 2 L14 14 L1 26'}
          className="fill-weiss"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      width="28"
      height="16"
      viewBox="0 0 28 16"
      className={cn(
        'pointer-events-none absolute -bottom-[10px] text-ink',
        seite === 'unten-links' ? 'left-8' : 'right-8',
      )}
      aria-hidden
    >
      <path
        d="M2 1 L14 14 L26 1"
        className="fill-weiss"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
