import { IconStern } from './icons';
import { cn } from './cn';

type LegendeStufe = { farbe: string; label: string; stern?: boolean };

const STUFEN: LegendeStufe[] = [
  { farbe: 'bg-neu-grau', label: 'Neu' },
  { farbe: 'bg-wiese', label: 'Am Lernen' },
  { farbe: 'bg-alp-gruen-dunkel', label: 'Gut bekannt' },
  { farbe: 'bg-gold', label: 'Gemeistert', stern: true },
];

export function FortschrittLegende({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-2 rounded-comic border-comic-sm border-ink bg-weiss px-3 py-2 shadow-comic',
        className,
      )}
      aria-label="Legende Lernstand"
    >
      {STUFEN.map((stufe) => (
        <span key={stufe.label} className="inline-flex items-center gap-2 font-body text-sm font-semibold text-ink">
          <span className={cn('h-4 w-4 shrink-0 rounded-sm border-comic-sm border-ink', stufe.farbe)} />
          {stufe.label}
          {stufe.stern ? <IconStern gefuellt className="h-4 w-4 text-gold" aria-hidden /> : null}
        </span>
      ))}
    </div>
  );
}
