import type { ReactNode } from 'react';
import { cn } from './cn';

export interface StickerProps {
  src?: string;
  alt?: string;
  leer?: boolean;
  glanz?: boolean;
  drehung?: number;
  groesse?: number;
  children?: ReactNode;
  className?: string;
}

export function Sticker({
  src,
  alt = '',
  leer = false,
  glanz = false,
  drehung = 0,
  groesse = 112,
  children,
  className,
}: StickerProps) {
  const istLeer = leer || (!src && !children);

  return (
    <div
      className={cn(
        'relative shrink-0 bg-weiss shadow-comic',
        istLeer
          ? 'border-comic-sm border-dashed border-ink/40 bg-nachbar-grau'
          : glanz
            ? 'border-sticker border-gold'
            : 'border-sticker border-weiss',
        className,
      )}
      style={{
        width: groesse,
        height: groesse,
        transform: `rotate(${drehung}deg)`,
      }}
    >
      {istLeer ? (
        <div className="flex h-full w-full flex-col items-center justify-center text-neu-grau">
          <span className="font-display text-4xl font-extrabold leading-none">?</span>
          {alt ? <span className="mt-1 px-1 text-center font-body text-base text-ink/50">{alt}</span> : null}
        </div>
      ) : src ? (
        <img
          src={src}
          alt={alt}
          width={groesse}
          height={groesse}
          decoding="async"
          loading="eager"
          fetchPriority="high"
          className="h-full w-full object-contain p-1"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center p-1">{children}</div>
      )}
      {glanz && !istLeer ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="sticker-shine-bar" />
        </div>
      ) : null}
    </div>
  );
}
