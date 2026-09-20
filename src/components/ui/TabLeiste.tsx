import { cn } from './cn';
import { IconAlbum, IconHome, IconKarten, IconProfil } from './icons';
import type { HauptTab } from '../../types/navigation';

const TABS: { id: HauptTab; label: string; icon: typeof IconHome }[] = [
  { id: 'start', label: 'Start', icon: IconHome },
  { id: 'spiele', label: 'Spiele', icon: IconKarten },
  { id: 'album', label: 'Album', icon: IconAlbum },
  { id: 'profil', label: 'Profil', icon: IconProfil },
];

export interface TabLeisteProps {
  aktiv: HauptTab;
  onWechsel: (tab: HauptTab) => void;
}

export function TabLeiste({ aktiv, onWechsel }: TabLeisteProps) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t-comic-sm border-ink bg-paper pb-[env(safe-area-inset-bottom)]"
      aria-label="Hauptnavigation"
    >
      <div className="mx-auto flex w-full max-w-[1400px]">
        {TABS.map(({ id, label, icon: Icon }) => {
          const istAktiv = aktiv === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onWechsel(id)}
              aria-current={istAktiv ? 'page' : undefined}
              className={cn(
                'flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 px-1',
                'font-display text-sm font-extrabold transition-colors',
                'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-uri-gelb',
                istAktiv ? 'bg-uri-gelb text-ink' : 'text-ink/70 hover:bg-paper hover:text-ink',
              )}
            >
              <Icon className="h-7 w-7" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
