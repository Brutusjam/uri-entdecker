import type { ReactNode } from 'react';
import { ComicButton } from './ui/ComicButton';
import { cn } from './ui/cn';

export function LadeBildschirm({ text = 'Karte wird geladen …' }: { text?: string }) {
  return (
    <div className="flex h-dvh items-center justify-center bg-paper p-6">
      <p className="font-display text-2xl font-extrabold text-ink">{text}</p>
    </div>
  );
}

export function FehlerBildschirm({
  meldung,
  onZurueck,
}: {
  meldung: string;
  onZurueck?: () => void;
}) {
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-6 bg-paper p-6">
      <p className="max-w-md text-center font-display text-2xl font-extrabold text-koralle">{meldung}</p>
      {onZurueck ? (
        <ComicButton onClick={onZurueck}>Zurück</ComicButton>
      ) : null}
    </div>
  );
}

export function Bildschirm({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex h-dvh min-h-0 flex-col overflow-hidden bg-paper', className)}>{children}</div>
  );
}
