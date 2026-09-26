import { useLayoutEffect, useRef, useState } from 'react';
import { GEMEINDEN } from '../data/gemeinden';
import { Bildschirm } from './StatusSeite';
import { Header } from './ui/Header';
import { Begleitung } from './ui/Begleitung';
import { ComicButton } from './ui/ComicButton';
import { ProgressBar } from './ui/ProgressBar';
import { Badge } from './ui/Badge';
import { Figur } from './ui/Figur';
import { IconEltern } from './ui/icons';
import { cn } from './ui/cn';
import { ElternAnsicht } from './ElternAnsicht';
import { UeberApp } from './UeberApp';
import { ABZEICHEN } from '../logic/abzeichen';
import { levelVonXp } from '../logic/level';
import { useFortschrittStore } from '../store/fortschritt';
import type { CapFarbe } from '../types/fortschritt';

interface ProfilProps {
  eingebettet?: boolean;
  onZurueck?: () => void;
  onUeben?: (elementId: string) => void;
}

const CAP_FARBEN: { id: CapFarbe; label: string; klasse: string }[] = [
  { id: 'uri-gelb', label: 'Gelb', klasse: 'bg-uri-gelb' },
  { id: 'see-blau', label: 'Blau', klasse: 'bg-see-blau' },
  { id: 'alp-gruen', label: 'Grün', klasse: 'bg-alp-gruen' },
  { id: 'koralle', label: 'Koralle', klasse: 'bg-koralle' },
  { id: 'stier-rot', label: 'Rot', klasse: 'bg-stier-rot' },
];

export function Profil({ eingebettet = false, onZurueck, onUeben }: ProfilProps) {
  const [elternOffen, setElternOffen] = useState(false);
  const [ueberOffen, setUeberOffen] = useState(false);
  const name = useFortschrittStore((s) => s.name);
  const setName = useFortschrittStore((s) => s.setName);
  const avatar = useFortschrittStore((s) => s.avatar);
  const setAvatar = useFortschrittStore((s) => s.setAvatar);
  const xp = useFortschrittStore((s) => s.xp);
  const abzeichen = useFortschrittStore((s) => s.abzeichen);
  const level = levelVonXp(xp);
  const heimat = GEMEINDEN.find((g) => g.id === avatar.heimatgemeinde);
  const cap = avatar.capFarbe ?? 'uri-gelb';
  const naechstes = level.naechstesXp;
  const xpBis = naechstes ?? level.xp;
  const xpVon = level.xp;

  const ansichtRef = useRef<HTMLDivElement>(null);
  const spruch = heimat
    ? `Lia kommt aus ${heimat.name} – wie du!`
    : 'Sag Lia, wie du heisst und wo du wohnst.';

  useLayoutEffect(() => {
    ansichtRef.current?.closest('main')?.scrollTo(0, 0);
  }, [ueberOffen]);

  if (ueberOffen) {
    return (
      <div ref={ansichtRef}>
        <UeberApp eingebettet={eingebettet} onZurueck={() => setUeberOffen(false)} />
      </div>
    );
  }

  if (elternOffen && onUeben) {
    return (
      <ElternAnsicht
        eingebettet
        onZurueck={() => setElternOffen(false)}
        onUeben={onUeben}
      />
    );
  }

  const inhalt = (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5 p-4">
      <div className="flex items-start justify-end gap-2">
        <Begleitung name="lia" pose="freut-sich" text={spruch} className="flex-1" />
      </div>

      <div className="flex items-center gap-3 rounded-comic-lg border-comic border-ink bg-weiss p-4 shadow-comic">
        <span className="relative">
          <span
            className={cn(
              'absolute left-1/2 top-1 z-10 h-6 w-10 -translate-x-1/2 rounded-t-comic border-comic-sm border-ink',
              CAP_FARBEN.find((c) => c.id === cap)?.klasse,
            )}
            aria-hidden
          />
          <Figur name="lia" pose="neutral" className="h-28 w-28 md:h-28 md:w-28" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-2xl font-extrabold">{name || 'Entdeckerin'}</p>
          <p className="font-display text-lg">{level.titel}</p>
          <ProgressBar
            className="mt-2"
            wert={naechstes === null ? 1 : Math.max(0, xp - xpVon)}
            max={naechstes === null ? 1 : Math.max(1, xpBis - xpVon)}
            label={naechstes === null ? 'Höchstes Level' : `${xp} / ${naechstes} XP`}
          />
        </div>
      </div>

      <label className="space-y-1">
        <span className="font-display text-lg font-bold">Dein Name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 20))}
          maxLength={20}
          placeholder="Wie heisst du?"
          className="min-h-12 w-full rounded-comic border-comic-sm border-ink bg-weiss px-3 font-display text-xl font-bold text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-uri-gelb"
        />
        <span className="block font-body text-base font-semibold text-ink/70">
          Der Name bleibt nur auf diesem Gerät.
        </span>
      </label>

      <label className="space-y-1">
        <span className="font-display text-lg font-bold">Heimatgemeinde</span>
        <select
          value={avatar.heimatgemeinde ?? ''}
          onChange={(e) => setAvatar({ ...avatar, heimatgemeinde: e.target.value || undefined })}
          className="min-h-12 w-full rounded-comic border-comic-sm border-ink bg-weiss px-3 font-display text-xl font-bold text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-uri-gelb"
        >
          <option value="">Noch offen</option>
          {GEMEINDEN.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </label>

      <div className="space-y-2">
        <p className="font-display text-lg font-bold">Cap-Farbe</p>
        <div className="flex flex-wrap gap-2">
          {CAP_FARBEN.map((farbe) => (
            <button
              key={farbe.id}
              type="button"
              aria-label={`Cap ${farbe.label}`}
              aria-pressed={cap === farbe.id}
              onClick={() => setAvatar({ ...avatar, capFarbe: farbe.id })}
              className={cn(
                'inline-flex min-h-12 min-w-12 items-center justify-center rounded-comic border-comic border-ink shadow-button',
                farbe.klasse,
                cap === farbe.id && 'ring-4 ring-uri-gelb',
              )}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="font-display text-2xl font-extrabold">Abzeichen</h2>
        {ABZEICHEN.length === 0 ? null : (
          <ul className="space-y-2">
            {ABZEICHEN.map((a) => {
              const verdient = abzeichen.includes(a.id);
              return (
                <li
                  key={a.id}
                  className="flex items-start justify-between gap-3 rounded-comic border-comic-sm border-ink bg-weiss p-3"
                >
                  <div>
                    <p className="font-display text-lg font-extrabold">{a.titel}</p>
                    <p className="text-base text-ink/70">{a.text}</p>
                  </div>
                  <Badge variante={verdient ? 'gold' : 'neu'}>{verdient ? 'Ja!' : 'Bald'}</Badge>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {eingebettet && onUeben ? (
        <ComicButton fullWidth variante="neutral" icon={<IconEltern />} onClick={() => setElternOffen(true)}>
          Eltern-Ansicht
        </ComicButton>
      ) : null}

      <ComicButton fullWidth variante="neutral" onClick={() => setUeberOffen(true)}>
        Über die App
      </ComicButton>

      {!eingebettet && onZurueck ? (
        <ComicButton fullWidth variante="neutral" onClick={onZurueck}>
          Zurück
        </ComicButton>
      ) : null}
    </div>
  );

  if (eingebettet) return <div ref={ansichtRef}>{inhalt}</div>;

  return (
    <div ref={ansichtRef}>
      <Bildschirm>
        <Header titel="Profil" leitfarbe="uri-gelb" onZurueck={onZurueck} />
        {inhalt}
      </Bildschirm>
    </div>
  );
}
