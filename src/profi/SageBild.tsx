import type { SageSeite } from '../logic/sagen';

const ink = 'var(--color-ink)';

export function SageBild({ bild }: { bild: SageSeite['bild'] }) {
  return (
    <svg viewBox="0 0 320 180" className="h-40 w-full" role="img" aria-hidden>
      <rect x="2" y="2" width="316" height="176" rx="16" fill="var(--color-sky)" stroke={ink} strokeWidth="4" />
      {bild === 'bruecke' || bild === 'geiss' ? (
        <>
          <path d="M20 140 L300 140" stroke="var(--color-see-blau-dunkel)" strokeWidth="10" />
          <path d="M70 140 C110 70 210 70 250 140" fill="none" stroke={ink} strokeWidth="6" />
          {bild === 'geiss' ? <circle cx="160" cy="88" r="14" fill="var(--color-weiss)" stroke={ink} strokeWidth="3" /> : null}
        </>
      ) : null}
      {bild === 'stein' || bild === 'kreuz' ? (
        <>
          <path d="M110 150 L160 70 L210 150 Z" fill="var(--color-neu-grau)" stroke={ink} strokeWidth="4" />
          {bild === 'kreuz' ? (
            <path d="M160 90 V130 M145 105 H175" stroke="var(--color-uri-gelb)" strokeWidth="6" />
          ) : null}
        </>
      ) : null}
      {bild === 'hut' ? (
        <>
          <rect x="150" y="50" width="8" height="80" fill={ink} />
          <ellipse cx="154" cy="48" rx="28" ry="10" fill="var(--color-ink)" />
        </>
      ) : null}
      {bild === 'apfel' ? (
        <>
          <circle cx="160" cy="100" r="28" fill="var(--color-stier-rot)" stroke={ink} strokeWidth="4" />
          <path d="M160 72 C160 60 172 58 174 68" fill="none" stroke={ink} strokeWidth="3" />
        </>
      ) : null}
      {bild === 'sturm' ? (
        <>
          <path d="M20 130 C80 110 120 150 180 130 C240 110 280 140 310 120" fill="none" stroke="var(--color-see-blau-dunkel)" strokeWidth="8" />
          <path d="M120 100 L200 110 L160 140 Z" fill="var(--color-weiss)" stroke={ink} strokeWidth="4" />
        </>
      ) : null}
      {bild === 'sprung' ? (
        <>
          <path d="M20 140 C80 130 140 150 200 140" fill="none" stroke="var(--color-see-blau)" strokeWidth="10" />
          <path d="M210 140 L280 90 L310 140 Z" fill="var(--color-neu-grau)" stroke={ink} strokeWidth="4" />
        </>
      ) : null}
    </svg>
  );
}
