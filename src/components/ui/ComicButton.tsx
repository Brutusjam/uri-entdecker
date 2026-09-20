import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

export type ComicButtonVariante = 'primaer' | 'sekundaer' | 'neutral' | 'profi';

const VARIANTEN: Record<ComicButtonVariante, string> = {
  primaer: 'bg-uri-gelb text-ink hover:bg-uri-gelb-dunkel',
  sekundaer: 'bg-see-blau text-weiss hover:bg-see-blau-dunkel',
  neutral: 'bg-weiss text-ink hover:bg-paper',
  profi: 'bg-sagen-lila text-weiss',
};

export interface ComicButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: ComicButtonVariante;
  icon?: ReactNode;
  /** Zeigt den gedrückten Zustand dauerhaft (für den Styleguide). */
  gedrueckt?: boolean;
  fullWidth?: boolean;
}

export function ComicButton({
  variante = 'primaer',
  icon,
  gedrueckt = false,
  fullWidth = false,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ComicButtonProps) {
  return (
    <span className={cn('inline-flex pb-[5px]', fullWidth && 'w-full')}>
      <button
        type={type}
        disabled={disabled}
        className={cn(
          'inline-flex min-h-12 min-w-12 items-center justify-center gap-2',
          'rounded-comic border-comic border-ink px-5 font-display text-xl font-extrabold',
          'shadow-button transition-[transform,box-shadow,background-color] duration-150',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-uri-gelb',
          !disabled && VARIANTEN[variante],
          gedrueckt && !disabled && 'translate-y-[5px] shadow-none',
          !gedrueckt &&
            !disabled &&
            'active:translate-y-[5px] active:shadow-none active:duration-75',
          disabled && 'cursor-not-allowed bg-neu-grau text-ink/50 shadow-none',
          !disabled && 'cursor-pointer',
          fullWidth && 'w-full',
          className,
        )}
        {...rest}
      >
        {icon}
        {children}
      </button>
    </span>
  );
}
