import { useMemo, useState } from 'react';
import { Bildschirm } from './StatusSeite';
import { Header } from './ui/Header';
import { Begleitung } from './ui/Begleitung';
import { ComicButton } from './ui/ComicButton';
import { Badge } from './ui/Badge';
import { elternAufgabe, formatiereUebungszeit, profiAnteil, schwacheElemente } from '../logic/eltern';
import { heuteIso } from '../logic/leitner';
import { useFortschrittStore } from '../store/fortschritt';

interface ElternAnsichtProps {
  eingebettet?: boolean;
  onZurueck: () => void;
  onUeben: (elementId: string) => void;
}

export function ElternAnsicht({ eingebettet = false, onZurueck, onUeben }: ElternAnsichtProps) {
  const [aufgabe] = useState(() => elternAufgabe());
  const [eingabe, setEingabe] = useState('');
  const [offen, setOffen] = useState(false);
  const [hinweis, setHinweis] = useState('');

  const fortschritt = useFortschrittStore((s) => s.fortschritt);
  const uebungSekunden = useFortschrittStore((s) => s.uebungSekunden);
  const profiFreigeschaltet = useFortschrittStore((s) => s.profiFreigeschaltet);
  const setProfiFreigeschaltet = useFortschrittStore((s) => s.setProfiFreigeschaltet);

  const schwach = useMemo(() => schwacheElemente(fortschritt), [fortschritt]);
  const anteil = profiAnteil(fortschritt);
  const heute = heuteIso();
  const heuteSek = uebungSekunden[heute] ?? 0;
  const tage = Object.keys(uebungSekunden).sort().slice(-7).reverse();
  const wocheSek = tage.reduce((sum, tag) => sum + (uebungSekunden[tag] ?? 0), 0);

  if (!offen) {
    const gate = (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 p-4">
        {eingebettet ? (
          <ComicButton variante="neutral" onClick={onZurueck}>
            Zurück zum Profil
          </ComicButton>
        ) : null}
        <Begleitung
            name="stierli"
            pose="denkt"
            text="Kurze Rechenaufgabe – dann siehst du den Fortschritt."
          />
          <p className="text-center font-display text-4xl font-extrabold">
            {aufgabe.a} + {aufgabe.b} = ?
          </p>
          <label className="space-y-1">
            <span className="sr-only">Ergebnis</span>
            <input
              inputMode="numeric"
              value={eingabe}
              onChange={(e) => setEingabe(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
              className="min-h-12 w-full rounded-comic border-comic-sm border-ink bg-weiss px-3 text-center font-display text-3xl font-extrabold text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-uri-gelb"
            />
          </label>
          {hinweis ? <p className="text-center font-display text-lg">{hinweis}</p> : null}
          <ComicButton
            fullWidth
            onClick={() => {
              if (Number(eingabe) === aufgabe.a + aufgabe.b) {
                setOffen(true);
                return;
              }
              setHinweis('Nochmals versuchen – du schaffst das.');
            }}
          >
            Weiter
          </ComicButton>
        </div>
    );

    if (eingebettet) return gate;

    return (
      <Bildschirm>
        <Header titel="Eltern" leitfarbe="ink" onZurueck={onZurueck} />
        {gate}
      </Bildschirm>
    );
  }

  const ansicht = (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 p-4">
      {eingebettet ? (
        <ComicButton variante="neutral" onClick={onZurueck}>
          Zurück zum Profil
        </ComicButton>
      ) : null}
        <p className="font-display text-xl font-extrabold">
          Gut gelernt: {Math.round(anteil * 100)} %
        </p>
        <p className="font-display text-lg">Heute geübt: {formatiereUebungszeit(heuteSek)}</p>
        <p className="font-display text-lg">Letzte Tage: {formatiereUebungszeit(wocheSek)}</p>

        {tage.length > 0 ? (
          <ul className="space-y-1 rounded-comic border-comic-sm border-ink bg-weiss p-3">
            {tage.map((tag) => (
              <li key={tag} className="flex justify-between font-display text-lg">
                <span>{tag}</span>
                <span>{formatiereUebungszeit(uebungSekunden[tag] ?? 0)}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="space-y-2">
          <h2 className="font-display text-2xl font-extrabold">Noch unsicher</h2>
          {schwach.length === 0 ? (
            <p className="font-display text-lg">Alles sitzt – super!</p>
          ) : (
            <ul className="space-y-2">
              {schwach.slice(0, 10).map((el) => (
                <li key={el.id}>
                  <ComicButton fullWidth variante="neutral" onClick={() => onUeben(el.id)}>
                    {el.name}
                  </ComicButton>
                </li>
              ))}
            </ul>
          )}
          {schwach.length > 10 ? (
            <p className="text-base text-ink/70">… und {schwach.length - 10} weitere.</p>
          ) : null}
        </div>

        <div className="rounded-comic-lg border-comic border-ink bg-weiss p-4 shadow-comic">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xl font-extrabold">Uri-Profi</h2>
            <Badge variante={profiFreigeschaltet ? 'profi' : 'neu'}>
              {profiFreigeschaltet ? 'frei' : 'gesperrt'}
            </Badge>
          </div>
          <p className="mt-2 text-base">
            Ab 70 % gut gelernt öffnet sich der Profi-Modus von allein. Du kannst ihn auch jetzt
            freischalten.
          </p>
          <div className="mt-3">
            <ComicButton
              fullWidth
              variante="profi"
              disabled={profiFreigeschaltet}
              onClick={() => setProfiFreigeschaltet(true)}
            >
              {profiFreigeschaltet ? 'Schon frei' : 'Profi freischalten'}
            </ComicButton>
          </div>
        </div>
      </div>
  );

  if (eingebettet) return ansicht;

  return (
    <Bildschirm>
      <Header titel="Eltern" leitfarbe="ink" onZurueck={onZurueck} />
      {ansicht}
    </Bildschirm>
  );
}
