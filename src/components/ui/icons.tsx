import type { ReactNode } from 'react';
import { cn } from './cn';

interface IconProps {
  className?: string;
  titel?: string;
}

function Svg({ className, titel, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('h-6 w-6 shrink-0', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={titel ? undefined : true}
      role={titel ? 'img' : undefined}
    >
      {titel ? <title>{titel}</title> : null}
      {children}
    </svg>
  );
}

export function IconPfeilLinks(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M15 5 L7 12 L15 19" />
      <path d="M8 12 H20" />
    </Svg>
  );
}

export function IconHome(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 11 L12 4 L20 11" />
      <path d="M6 10.5 V20 H18 V10.5" />
    </Svg>
  );
}

export function IconStern({ gefuellt = false, ...props }: IconProps & { gefuellt?: boolean }) {
  return (
    <Svg {...props}>
      <path
        d="M12 3.5 L14.4 9.1 L20.5 9.6 L16 13.7 L17.5 19.7 L12 16.6 L6.5 19.7 L8 13.7 L3.5 9.6 L9.6 9.1 Z"
        fill={gefuellt ? 'currentColor' : 'none'}
      />
    </Svg>
  );
}

export function IconFlamme(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3 C12 3 7 8 7 13 a5 5 0 0 0 10 0 C17 10 14 7 12 3 Z" />
      <path d="M12 13 c0 0-2 1.5-2 3 a2 2 0 0 0 4 0 c0-1.2-1-2.2-2-3 Z" />
    </Svg>
  );
}

export function IconTonAn(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 10 H8 L13 6 V18 L8 14 H4 Z" />
      <path d="M16.5 9 a4 4 0 0 1 0 6" />
      <path d="M18.5 7 a7 7 0 0 1 0 10" />
    </Svg>
  );
}

export function IconTonAus(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 10 H8 L13 6 V18 L8 14 H4 Z" />
      <path d="M17 10 L21 14" />
      <path d="M21 10 L17 14" />
    </Svg>
  );
}

export function IconSuche(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="6" />
      <path d="M16 16 L20 20" />
    </Svg>
  );
}

export function IconSchild(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3 L20 6 V12 c0 5-3.5 8-8 9 C7.5 20 4 17 4 12 V6 Z" />
    </Svg>
  );
}

export function IconKarten(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="6" width="12" height="14" rx="1.5" />
      <rect x="9" y="4" width="12" height="14" rx="1.5" />
    </Svg>
  );
}

export function IconAlbum(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 5 H11 V20 H5 a1 1 0 0 1-1-1 Z" />
      <path d="M13 5 H20 V19 a1 1 0 0 1-1 1 H13 Z" />
      <path d="M12 5 V20" />
    </Svg>
  );
}

export function IconBlitz(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M13 3 L6 13 H12 L11 21 L18 11 H12 Z" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function IconPuzzle(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 8 H9 a2.5 2.5 0 1 1 0 4 H4 V20 H10 a2.5 2.5 0 1 0 4 0 H20 V13 H16 a2.5 2.5 0 1 1 0-4 H20 V4 H14 a2.5 2.5 0 1 0-4 0 H4 Z" />
    </Svg>
  );
}

export function IconKarte(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 6 L9 4 L15 7 L20 5 V18 L15 20 L9 17 L4 19 Z" />
      <path d="M9 4 V17" />
      <path d="M15 7 V20" />
    </Svg>
  );
}

export function IconStift(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 19 L8 18 L19 7 L16 4 L5 15 Z" />
      <path d="M14 6 L17 9" />
    </Svg>
  );
}

export function IconPruefung(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 4 H16 A2 2 0 0 1 18 6 V20 H6 V6 A2 2 0 0 1 8 4 Z" />
      <path d="M9 10 H15" />
      <path d="M9 14 H13" />
    </Svg>
  );
}

export function IconProfi(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 18 L12 6 L16 12 L20 8 L20 18 Z" />
      <path d="M10 18 H20" />
    </Svg>
  );
}

export function IconDuell(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="8" cy="7" r="3" />
      <path d="M3 19 C3 14 13 14 13 19" />
      <circle cx="16" cy="7" r="3" />
      <path d="M11 19 C11 14 21 14 21 19" />
    </Svg>
  );
}

export function IconProfil(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20 C6 15 18 15 19 20" />
    </Svg>
  );
}

export function IconEltern(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20 C3 15 15 15 15 20" />
      <path d="M16 11 H21" />
      <path d="M18.5 8.5 V13.5" />
    </Svg>
  );
}

export function IconBerge(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 19 L9 8 L13 14 L16 11 L21 19 Z" />
      <path d="M11.5 11.2 L13 8 L15.2 11.5" />
    </Svg>
  );
}

export function IconPass(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 18 C8 12 10 14 13 10 C16 6 18 8 20 5" />
      <path d="M4 20 C9 14 11 16 14 12" />
    </Svg>
  );
}

export function IconSage(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 5 H12 V19 H7 a1 1 0 0 1-1-1 Z" />
      <path d="M12 5 H18 V18 a1 1 0 0 1-1 1 H12 Z" />
      <path d="M12 5 V19" />
    </Svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12 L10 17 L19 7" />
    </Svg>
  );
}

export function IconKreuz(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7 7 L17 17" />
      <path d="M17 7 L7 17" />
    </Svg>
  );
}
