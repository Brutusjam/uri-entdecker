import { cn } from './cn';

export interface ProgressBarProps {
  wert: number;
  max: number;
  label?: string;
  className?: string;
}

export function ProgressBar({ wert, max, label, className }: ProgressBarProps) {
  const sicherMax = max <= 0 ? 1 : max;
  const begrenzt = Math.min(Math.max(wert, 0), sicherMax);
  const prozent = (begrenzt / sicherMax) * 100;
  const zahl = `${begrenzt}/${max}`;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="min-w-0 flex-1">
        {label ? (
          <p className="mb-1 font-display text-lg font-bold text-ink">{label}</p>
        ) : null}
        <div
          className="h-8 overflow-hidden rounded-pill border-comic border-ink bg-weiss"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={begrenzt}
          aria-label={label ?? `Fortschritt ${zahl}`}
        >
          <div
            className={cn('h-full progress-stripes transition-[width] duration-300')}
            style={{ width: `${prozent}%` }}
          />
        </div>
      </div>
      <span className="shrink-0 font-display text-2xl font-extrabold tabular-nums text-ink">
        {zahl}
      </span>
    </div>
  );
}
