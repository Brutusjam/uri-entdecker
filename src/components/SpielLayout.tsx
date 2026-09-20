import type { ReactNode } from 'react';
import { cn } from './ui/cn';

interface SpielLayoutProps {
  karte: ReactNode;
  panel: ReactNode;
  className?: string;
}

/** Karte + Panel: passt auf Tablet-Höhe, Panel scrollt intern wenn nötig. */
export function SpielLayout({ karte, panel, className }: SpielLayoutProps) {
  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-[1400px] flex-1 min-h-0 flex-col gap-4 overflow-hidden p-4 lg:flex-row lg:items-stretch',
        className,
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col lg:w-[65%]">
        <div className="min-h-[180px] flex-1 overflow-hidden rounded-comic-lg border-comic border-ink bg-sky shadow-comic">
          {karte}
        </div>
      </div>
      <div className="flex min-h-0 max-h-[42vh] flex-col gap-4 overflow-y-auto lg:max-h-none lg:w-[35%] lg:shrink-0 lg:overflow-y-auto">
        {panel}
      </div>
    </div>
  );
}
