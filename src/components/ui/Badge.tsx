import type { ReactNode } from 'react';
import { cn } from './cn';

export type BadgeVariante = 'standard' | 'gold' | 'erfolg' | 'profi' | 'neu' | 'warnung' | 'serie';

const VARIANTEN: Record<BadgeVariante, string> = {
  standard: 'bg-weiss text-ink',
  gold: 'bg-gold text-ink',
  erfolg: 'bg-alp-gruen text-weiss',
  profi: 'bg-sagen-lila text-weiss',
  neu: 'bg-neu-grau text-ink',
  warnung: 'bg-koralle text-ink',
  serie: 'bg-stier-rot text-weiss',
};

export interface BadgeProps {
  children: ReactNode;
  variante?: BadgeVariante;
  icon?: ReactNode;
  className?: string;
}

export function Badge({ children, variante = 'standard', icon, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex min-h-8 items-center gap-1.5 rounded-pill border-comic-sm border-ink',
        'px-3 py-1 font-display text-base font-bold leading-none',
        VARIANTEN[variante],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
