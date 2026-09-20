import type { ReactNode } from 'react';
import { cn } from './cn';
import { IconStern } from './icons';
import { LEITFARBE_BG, type Leitfarbe } from './leitfarbe';

export interface ComicCardProps {
  titel: string;
  leitfarbe?: Leitfarbe;
  icon?: ReactNode;
  sterne?: 0 | 1 | 2 | 3;
  bestwert?: string;
  kipp?: -1 | 0 | 1;
  children?: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ComicCard({
  titel,
  leitfarbe = 'see-blau',
  icon,
  sterne,
  bestwert,
  kipp = -1,
  children,
  onClick,
  className,
}: ComicCardProps) {
  const kippKlasse = kipp === 1 ? 'rotate-1' : kipp === -1 ? '-rotate-1' : 'rotate-0';
  const interaktiv = Boolean(onClick);
  const Klassen = cn(
    'flex w-full flex-col overflow-hidden rounded-comic-lg border-comic border-ink bg-weiss text-left shadow-comic',
    'transition-transform duration-200',
    kippKlasse,
    interaktiv && 'cursor-pointer hover:rotate-0 hover:-translate-y-1 active:rotate-0 active:-translate-y-1',
    className,
  );

  const inhalt = (
    <>
      <div className={cn('h-4 w-full', LEITFARBE_BG[leitfarbe])} />
      <div className="flex flex-1 flex-col gap-3 p-4">
        {icon ? <div className="text-ink">{icon}</div> : null}
        <h3 className="font-display text-2xl font-extrabold leading-tight text-ink">{titel}</h3>
        {sterne !== undefined ? (
          <div className="flex gap-1" aria-label={`${sterne} von 3 Sternen`}>
            {[1, 2, 3].map((n) => (
              <IconStern
                key={n}
                gefuellt={n <= sterne}
                className={n <= sterne ? 'text-gold' : 'text-neu-grau'}
              />
            ))}
          </div>
        ) : null}
        {bestwert ? <p className="font-display text-lg text-ink/80">{bestwert}</p> : null}
        {children}
      </div>
    </>
  );

  if (interaktiv) {
    return (
      <button type="button" onClick={onClick} className={Klassen}>
        {inhalt}
      </button>
    );
  }

  return <article className={Klassen}>{inhalt}</article>;
}
