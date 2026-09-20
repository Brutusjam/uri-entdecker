import { ComicButton } from './ui/ComicButton';
import type { Kategorie } from '../types/karte';

const GRUND: { id: Kategorie; label: string }[] = [
  { id: 'gemeinde', label: 'Gemeinden' },
  { id: 'kanton', label: 'Kantone' },
  { id: 'gewaesser', label: 'Täler & Seen' },
];

const PROFI: { id: Kategorie; label: string }[] = [
  { id: 'pass', label: 'Pässe' },
  { id: 'berg', label: 'Berge' },
  { id: 'sagenort', label: 'Sagen' },
];

export function KategorieWahl({
  wert,
  onChange,
  profi = false,
}: {
  wert: Kategorie;
  onChange: (kategorie: Kategorie) => void;
  profi?: boolean;
}) {
  const optionen = profi ? [...GRUND, ...PROFI] : GRUND;
  return (
    <section className="space-y-2">
      <h2 className="font-display text-xl font-extrabold">Was üben?</h2>
      <div className={profi ? 'grid grid-cols-2 gap-3 sm:grid-cols-3' : 'grid grid-cols-1 gap-3 sm:grid-cols-3'}>
        {optionen.map((o) => (
          <ComicButton
            key={o.id}
            variante={wert === o.id ? 'primaer' : o.id === 'pass' || o.id === 'berg' || o.id === 'sagenort' ? 'profi' : 'neutral'}
            fullWidth
            onClick={() => onChange(o.id)}
          >
            {o.label}
          </ComicButton>
        ))}
      </div>
    </section>
  );
}
