import type { ReactNode } from 'react';
import { useFortschrittStore } from '../../store/fortschritt';
import { cn } from './cn';
import {
  IconFlamme,
  IconHome,
  IconPfeilLinks,
  IconStern,
  IconTonAn,
  IconTonAus,
} from './icons';
import { LEITFARBE_CHIP, type Leitfarbe } from './leitfarbe';

export interface HeaderProps {
  titel: string;
  /** Ersetzt den Titel-Chip durch ein Logo (Startbildschirm). */
  logoSrc?: string;
  leitfarbe?: Leitfarbe;
  xp?: number;
  serieTage?: number;
  tonAn?: boolean;
  onTonUmschalten?: () => void;
  onZurueck?: () => void;
  onHome?: () => void;
  klebend?: boolean;
  className?: string;
}

export function Header({
  titel,
  logoSrc,
  leitfarbe = 'ink',
  xp,
  serieTage,
  tonAn,
  onTonUmschalten,
  onZurueck,
  onHome,
  klebend = true,
  className,
}: HeaderProps) {
  const storeXp = useFortschrittStore((s) => s.xp);
  const storeSerie = useFortschrittStore((s) => s.serie.tage);
  const storeTon = useFortschrittStore((s) => s.tonAn);
  const setTonAn = useFortschrittStore((s) => s.setTonAn);
  const xpWert = xp ?? storeXp;
  const serieWert = serieTage ?? storeSerie;
  const tonWert = tonAn ?? storeTon;
  const tonKlick = onTonUmschalten ?? (() => setTonAn(!tonWert));

  return (
    <header
      className={cn(
        'overflow-visible border-b-comic-sm border-ink bg-paper py-2',
        klebend && 'sticky top-0 z-20',
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-[1400px] items-center gap-3 overflow-visible px-4">
        <div className={cn('flex shrink-0 items-center gap-2', !logoSrc && 'min-w-12')}>
          {onZurueck ? (
            <IconButton label="Zurück" onClick={onZurueck}>
              <IconPfeilLinks className="h-7 w-7" />
            </IconButton>
          ) : null}
          {onHome ? (
            <IconButton label="Home" onClick={onHome}>
              <IconHome className="h-7 w-7" />
            </IconButton>
          ) : null}
          {logoSrc ? (
            <h1 className="min-w-0">
              <img
                src={logoSrc}
                alt={titel}
                className="h-12 w-auto max-w-full object-contain sm:h-14"
              />
            </h1>
          ) : null}
        </div>

        {logoSrc ? (
          <div className="min-w-0 flex-1" />
        ) : (
          <h1 className="min-w-0 flex-1 text-center">
            <span
              className={cn(
                'inline-block max-w-full truncate rounded-pill border-comic-sm border-ink px-3 py-1',
                'font-display text-2xl font-extrabold md:text-3xl',
                LEITFARBE_CHIP[leitfarbe],
              )}
            >
              {titel}
            </span>
          </h1>
        )}

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <span
            className="inline-flex min-h-12 items-center gap-1 rounded-pill border-comic-sm border-ink bg-weiss px-2"
            title="Erfahrungspunkte"
          >
            <IconStern gefuellt className="h-5 w-5 text-gold" />
            <span className="font-display text-xl font-extrabold tabular-nums text-ink">{xpWert}</span>
          </span>
          <span
            className="inline-flex min-h-12 items-center gap-1 rounded-pill border-comic-sm border-ink bg-weiss px-2"
            title="Tage in Folge"
          >
            <IconFlamme className="h-5 w-5 text-stier-rot" />
            <span className="font-display text-xl font-extrabold tabular-nums text-ink">{serieWert}</span>
          </span>
          <IconButton label={tonWert ? 'Ton aus' : 'Ton an'} onClick={tonKlick}>
            {tonWert ? <IconTonAn className="h-7 w-7" /> : <IconTonAus className="h-7 w-7" />}
          </IconButton>
        </div>
      </div>
    </header>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex pb-[5px]">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className={cn(
          'inline-flex h-12 w-12 items-center justify-center rounded-comic border-comic border-ink bg-weiss text-ink shadow-button',
          'cursor-pointer transition-[transform,box-shadow] duration-150',
          'hover:bg-paper focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-uri-gelb',
          'active:translate-y-[5px] active:shadow-none',
        )}
      >
        {children}
      </button>
    </span>
  );
}
