import { useCallback, useEffect, useRef, useState } from 'react';
import { UriKarte } from '../components/UriKarte';
import { KategorieWahl } from '../components/KategorieWahl';
import { Bildschirm, FehlerBildschirm, LadeBildschirm } from '../components/StatusSeite';
import { Header } from '../components/ui/Header';
import { Begleitung } from '../components/ui/Begleitung';
import { ComicButton } from '../components/ui/ComicButton';
import { useGeoDaten } from '../hooks/useGeoDaten';
import { TAELER_GEO } from '../logic/taeler';
import { BLITZ_SEKUNDEN, blitzBestKey, restSekunden } from '../logic/blitz';
import { elementeFuer, findenFrageText, kartenModus, waehleFindenFrage } from '../logic/fragen';
import { passtKartenAuswahl } from '../logic/wappen';
import { useFortschrittStore } from '../store/fortschritt';
import type { KartenAuswahl, Kategorie, LernElement } from '../types/karte';

interface BlitzProps {
  onZurueck: () => void;
}

export function Blitz({ onZurueck }: BlitzProps) {
  const { daten, fehler, laden } = useGeoDaten();
  const { fortschritt, letzteFrageId, antwortRichtig, antwortFalsch, merkeBlitzPunkte, blitzBest, profiFreigeschaltet } =
    useFortschrittStore();
  const [phase, setPhase] = useState<'setup' | 'spiel' | 'fertig'>('setup');
  const [kategorie, setKategorie] = useState<Kategorie>('gemeinde');
  const [frage, setFrage] = useState<LernElement | null>(null);
  const [punkte, setPunkte] = useState(0);
  const [startMs, setStartMs] = useState<number | null>(null);
  const [rest, setRest] = useState(BLITZ_SEKUNDEN);
  const letzterId = useRef<string | null>(null);
  const punkteRef = useRef(0);

  const karte = kartenModus(kategorie);
  const pool = elementeFuer(kategorie);
  const best = blitzBest?.[blitzBestKey(kategorie)] ?? 0;

  const naechste = useCallback(
    (ausgenommen?: string | null) => {
      const el = waehleFindenFrage(pool, fortschritt, ausgenommen ?? letzterId.current ?? letzteFrageId);
      letzterId.current = el.id;
      setFrage(el);
    },
    [fortschritt, letzteFrageId, pool],
  );

  const starte = () => {
    punkteRef.current = 0;
    setPunkte(0);
    setStartMs(Date.now());
    setRest(BLITZ_SEKUNDEN);
    setPhase('spiel');
    naechste(null);
  };

  useEffect(() => {
    if (phase !== 'spiel' || startMs === null) return;
    const t = window.setInterval(() => {
      const r = restSekunden(startMs, Date.now());
      setRest(r);
      if (r <= 0) {
        window.clearInterval(t);
        merkeBlitzPunkte(blitzBestKey(kategorie), punkteRef.current);
        setPhase('fertig');
      }
    }, 200);
    return () => window.clearInterval(t);
  }, [phase, startMs, kategorie, merkeBlitzPunkte]);

  const tippe = (auswahl: KartenAuswahl | null) => {
    if (!frage || !auswahl || phase !== 'spiel' || rest <= 0) return;
    if (passtKartenAuswahl(auswahl, frage)) {
      antwortRichtig(frage.id);
      punkteRef.current += 1;
      setPunkte(punkteRef.current);
    } else {
      antwortFalsch(frage.id);
    }
    naechste(frage.id);
  };

  if (laden) return <LadeBildschirm />;
  if (fehler || !daten) return <FehlerBildschirm meldung={`Fehler: ${fehler}`} onZurueck={onZurueck} />;

  if (phase === 'setup') {
    return (
      <Bildschirm>
        <Header titel="Blitzrunde" leitfarbe="koralle" onZurueck={onZurueck} />
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 p-4">
          <Begleitung
            name="lia"
            pose="zeigt"
            text="60 Sekunden – so viele richtige Orte wie möglich. Keine Tipps, einfach tippen!"
          />
          <KategorieWahl wert={kategorie} onChange={setKategorie} profi={profiFreigeschaltet} />
          {best > 0 ? <p className="font-display text-lg">Dein Rekord: {best} richtig</p> : null}
          <ComicButton fullWidth onClick={starte}>
            Los
          </ComicButton>
        </div>
      </Bildschirm>
    );
  }

  if (phase === 'fertig') {
    return (
      <Bildschirm>
        <Header titel="Blitzrunde" leitfarbe="koralle" onZurueck={onZurueck} />
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-5 p-4">
          <Begleitung
            name="lia"
            pose="jubelt"
            text={`Zeit um! ${punkte} richtig${punkte > 0 && punkte >= best ? ' – neuer Rekord!' : '.'}`}
          />
          <p className="font-display text-3xl font-extrabold">{punkte} Punkte</p>
          {best > 0 ? <p className="font-display text-lg">Rekord: {Math.max(best, punkte)}</p> : null}
          <ComicButton fullWidth onClick={starte}>
            Noch einmal
          </ComicButton>
          <ComicButton fullWidth variante="neutral" onClick={() => setPhase('setup')}>
            Andere Runde
          </ComicButton>
        </div>
      </Bildschirm>
    );
  }

  if (!frage) return <LadeBildschirm />;

  return (
    <Bildschirm>
      <Header titel="Blitzrunde" leitfarbe="koralle" onZurueck={() => setPhase('setup')} />
      <div className="mx-auto flex w-full max-w-[1400px] min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4 lg:flex-row lg:items-stretch">
        <div className="min-h-0 flex-1 overflow-hidden rounded-comic-lg border-comic border-ink bg-sky shadow-comic lg:w-[65%]">
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
          <p className="font-display text-3xl font-extrabold tabular-nums">{rest}s</p>
          <Begleitung name="lia" pose="zeigt" text={findenFrageText(frage)} />
          <p className="font-display text-xl font-extrabold">Richtig: {punkte}</p>
        </div>
      </div>
    </Bildschirm>
  );
}
