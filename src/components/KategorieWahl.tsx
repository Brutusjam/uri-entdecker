import { ComicButton } from './ui/ComicButton';
import { cn } from './ui/cn';
import { sichtbareKategorien } from '../data/kategorien';
import type { Kategorie } from '../types/karte';

interface KategorieWahlProps {
  wert: Kategorie;
  onChange: (kategorie: Kategorie) => void;
  profi?: boolean;
  /** Schmale Pillenreihe ohne Titel – für Modi mit Karte (Entdecken). */
  kompakt?: boolean;
  titel?: string;
  className?: string;
}

export function KategorieWahl({
  wert,
  onChange,
  profi = false,
  kompakt = false,
  titel = 'Was üben?',
  className,
}: KategorieWahlProps) {
  const optionen = sichtbareKategorien(profi);
  const aktiv = (id: Kategorie) => (wert === 'tal' ? id === 'gewaesser' : wert === id);

  if (kompakt) {
    return (
      <div className={cn('flex gap-2 overflow-x-auto pb-1', className)} role="group" aria-label={titel}>
        {optionen.map((o) => (
          <ComicButton
            key={o.id}
            aria-pressed={aktiv(o.id)}
            className="shrink-0 text-lg"
            variante={aktiv(o.id) ? 'primaer' : o.profi ? 'profi' : 'neutral'}
            onClick={() => onChange(o.id)}
          >
            {o.titel}
          </ComicButton>
        ))}
      </div>
    );
  }

  return (
    <section className={cn('space-y-2', className)}>
      <h2 className="font-display text-xl font-extrabold">{titel}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {optionen.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={aktiv(o.id)}
            onClick={() => onChange(o.id)}
            className={cn(
              'flex min-h-16 flex-col justify-center rounded-comic border-comic border-ink px-4 py-2 text-left shadow-button',
              'cursor-pointer transition-[transform,box-shadow] duration-150',
              'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-uri-gelb',
              'active:translate-y-[5px] active:shadow-none',
              aktiv(o.id)
                ? 'bg-uri-gelb text-ink'
                : o.profi
                  ? 'bg-sagen-lila text-weiss'
                  : 'bg-weiss text-ink hover:bg-paper',
            )}
          >
            <span className="font-display text-xl font-extrabold leading-tight">{o.titel}</span>
            <span
              className={cn(
                'font-body text-sm font-semibold',
                aktiv(o.id) ? 'text-ink/70' : o.profi ? 'text-weiss/80' : 'text-ink/70',
              )}
            >
              {o.erklaerung}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
