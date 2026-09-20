import { useEffect, useMemo, useState } from 'react';
import { UriKarte } from '../components/UriKarte';
import { KategorieWahl } from '../components/KategorieWahl';
import { Bildschirm, FehlerBildschirm, LadeBildschirm } from '../components/StatusSeite';
import { Header } from '../components/ui/Header';
import { Begleitung } from '../components/ui/Begleitung';
import { ComicButton } from '../components/ui/ComicButton';
import { useGeoDaten } from '../hooks/useGeoDaten';
import { TAELER_GEO } from '../logic/taeler';
import { elementeFuer, findenFrageText, kartenModus } from '../logic/fragen';
import { formatiereNote, noteSpruch, pruefungBestKey, schweizerNote } from '../logic/pruefung';
import { passtKartenAuswahl } from '../logic/wappen';
import { mische } from '../logic/zufall';
import { useFortschrittStore } from '../store/fortschritt';
import { feiereKonfetti } from '../logic/konfetti';
import { useReducedMotion } from 'framer-motion';
import type { KartenAuswahl, Kategorie, LernElement } from '../types/karte';

interface PruefungProps {
  onZurueck: () => void;
  onUeben: (elementId: string) => void;
}

export function Pruefung({ onZurueck, onUeben }: PruefungProps) {
  const { daten, fehler, laden } = useGeoDaten();
  const { antwortRichtig, antwortFalsch, merkePruefungNote, pruefungBest, profiFreigeschaltet } = useFortschrittStore();
  const reduziert = useReducedMotion() ?? false;
  const [phase, setPhase] = useState<'setup' | 'spiel' | 'fertig'>('setup');
  const [kategorie, setKategorie] = useState<Kategorie>('gemeinde');
  const [reihe, setReihe] = useState<LernElement[]>([]);
  const [index, setIndex] = useState(0);
  const [richtigIds, setRichtigIds] = useState<string[]>([]);
  const [fehlerListe, setFehlerListe] = useState<LernElement[]>([]);

  const karte = kartenModus(kategorie);
  const frage = reihe[index] ?? null;
  const note = schweizerNote(richtigIds.length, reihe.length);
  const best = pruefungBest?.[pruefungBestKey(kategorie)];

  useEffect(() => {
    if (phase === 'fertig' && note >= 5) feiereKonfetti(reduziert);
  }, [phase, note, reduziert]);

  const starte = () => {
    setReihe(mische(elementeFuer(kategorie)));
    setIndex(0);
    setRichtigIds([]);
    setFehlerListe([]);
    setPhase('spiel');
  };

  const weiter = (ids: string[], falsch: LernElement[]) => {
    if (index + 1 >= reihe.length) {
      const n = schweizerNote(ids.length, reihe.length);
      merkePruefungNote(pruefungBestKey(kategorie), n);
      setRichtigIds(ids);
      setFehlerListe(falsch);
      setPhase('fertig');
      return;
    }
    setIndex((i) => i + 1);
  };

  const tippe = (auswahl: KartenAuswahl | null) => {
    if (!frage || !auswahl || phase !== 'spiel') return;
    if (passtKartenAuswahl(auswahl, frage)) {
      antwortRichtig(frage.id);
      const ids = [...richtigIds, frage.id];
      setRichtigIds(ids);
      weiter(ids, fehlerListe);
      return;
    }
    antwortFalsch(frage.id);
    const falsch = [...fehlerListe, frage];
    setFehlerListe(falsch);
    weiter(richtigIds, falsch);
  };

  const sprech = useMemo(() => {
    if (!frage) return '';
    return findenFrageText(frage);
  }, [frage]);

  if (laden) return <LadeBildschirm />;
  if (fehler || !daten) return <FehlerBildschirm meldung={`Fehler: ${fehler}`} onZurueck={onZurueck} />;

  if (phase === 'setup') {
    return (
      <Bildschirm>
        <Header titel="Prüfung" leitfarbe="ink" onZurueck={onZurueck} />
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 p-4">
          <Begleitung
            name="lia"
            pose="denkt"
            text="Alles einmal, ohne Tipp. Am Schluss gibt es eine Note von 1 bis 6."
          />
          <KategorieWahl wert={kategorie} onChange={setKategorie} profi={profiFreigeschaltet} />
          {best ? <p className="font-display text-lg">Beste Note: {formatiereNote(best)}</p> : null}
          <ComicButton fullWidth onClick={starte}>
            Prüfung starten
          </ComicButton>
        </div>
      </Bildschirm>
    );
  }

  if (phase === 'fertig') {
    return (
      <Bildschirm>
        <Header titel="Prüfung" leitfarbe="ink" onZurueck={onZurueck} />
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 p-4">
          <Begleitung name={note >= 4 ? 'lia' : 'stierli'} pose={note >= 4 ? 'jubelt' : 'troestet'} text={noteSpruch(note)} />
          <p className="text-center font-display text-5xl font-extrabold">Note {formatiereNote(note)}</p>
          <p className="text-center font-display text-lg">
            {richtigIds.length} von {reihe.length} richtig
          </p>
          {fehlerListe.length > 0 ? (
            <div className="space-y-2">
              <h2 className="font-display text-xl font-extrabold">Noch üben</h2>
              <ul className="space-y-2">
                {fehlerListe.map((el) => (
                  <li key={el.id}>
                    <ComicButton fullWidth variante="neutral" onClick={() => onUeben(el.id)}>
                      {el.name}
                    </ComicButton>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="font-display text-lg">Keine Fehler – die Karte sitzt!</p>
          )}
          <ComicButton fullWidth onClick={starte}>
            Noch einmal
          </ComicButton>
          <ComicButton fullWidth variante="neutral" onClick={() => setPhase('setup')}>
            Andere Prüfung
          </ComicButton>
        </div>
      </Bildschirm>
    );
  }

  if (!frage) return <LadeBildschirm />;

  return (
    <Bildschirm>
      <Header titel="Prüfung" leitfarbe="ink" onZurueck={() => setPhase('setup')} />
      <div className="mx-auto flex w-full max-w-[1400px] min-h-0 flex-1 flex-col gap-3 p-4 lg:flex-row">
        <div className="h-[50vh] min-h-[280px] flex-1 overflow-hidden rounded-comic-lg border-comic border-ink bg-sky shadow-comic lg:h-auto lg:w-[65%]">
          <UriKarte
            daten={daten}
            ebenen={karte.ebenen}
            blick={karte.blick}
            taeler={karte.talOderSee ? TAELER_GEO : []}
            talNamen={false}
            punktArten={karte.punktArten}
            onAuswahl={tippe}
          />
        </div>
        <div className="flex flex-col gap-3 lg:w-[35%] lg:shrink-0">
          <p className="font-display text-lg font-extrabold">
            Frage {index + 1} von {reihe.length}
          </p>
          <Begleitung name="lia" pose="zeigt" text={sprech} />
          <p className="font-body text-lg">Ohne Tipp – tippe direkt auf die Karte.</p>
        </div>
      </div>
    </Bildschirm>
  );
}
