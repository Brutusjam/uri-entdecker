import { useCallback, useRef, useState } from 'react';
import { UriKarte } from '../components/UriKarte';
import { KategorieWahl } from '../components/KategorieWahl';
import { Bildschirm, FehlerBildschirm, LadeBildschirm } from '../components/StatusSeite';
import { Header } from '../components/ui/Header';
import { Begleitung } from '../components/ui/Begleitung';
import { ComicButton } from '../components/ui/ComicButton';
import { Badge } from '../components/ui/Badge';
import { useGeoDaten } from '../hooks/useGeoDaten';
import { TAELER_GEO } from '../logic/taeler';
import { DUELL_FRAGEN_PRO_SPIELER, duellFertig, duellGewinner, naechsterSpieler } from '../logic/duell';
import { elementeFuer, findenFrageText, kartenModus, waehleFindenFrage } from '../logic/fragen';
import { passtKartenAuswahl } from '../logic/wappen';
import { useFortschrittStore } from '../store/fortschritt';
import { cn } from '../components/ui/cn';
import type { KartenAuswahl, Kategorie, LernElement } from '../types/karte';

interface DuellProps {
  onZurueck: () => void;
}

const NAMEN = ['Spieler 1', 'Spieler 2'] as const;

export function Duell({ onZurueck }: DuellProps) {
  const { daten, fehler, laden } = useGeoDaten();
  const { fortschritt, letzteFrageId, antwortRichtig, antwortFalsch, profiFreigeschaltet } = useFortschrittStore();
  const [phase, setPhase] = useState<'setup' | 'spiel' | 'fertig'>('setup');
  const [kategorie, setKategorie] = useState<Kategorie>('gemeinde');
  const [frage, setFrage] = useState<LernElement | null>(null);
  const [spieler, setSpieler] = useState<0 | 1>(0);
  const [punkte, setPunkte] = useState<[number, number]>([0, 0]);
  const [gestellt, setGestellt] = useState(0);
  const letzterId = useRef<string | null>(null);

  const karte = kartenModus(kategorie);
  const pool = elementeFuer(kategorie);

  const naechste = useCallback(
    (ausgenommen?: string | null) => {
      const el = waehleFindenFrage(pool, fortschritt, ausgenommen ?? letzterId.current ?? letzteFrageId);
      letzterId.current = el.id;
      setFrage(el);
    },
    [fortschritt, letzteFrageId, pool],
  );

  const starte = () => {
    setSpieler(0);
    setPunkte([0, 0]);
    setGestellt(0);
    setPhase('spiel');
    naechste(null);
  };

  const tippe = (auswahl: KartenAuswahl | null) => {
    if (!frage || !auswahl || phase !== 'spiel') return;
    const treffer = passtKartenAuswahl(auswahl, frage);
    if (treffer) {
      antwortRichtig(frage.id);
      setPunkte((p) => {
        const n: [number, number] = [p[0], p[1]];
        n[spieler] += 1;
        return n;
      });
    } else {
      antwortFalsch(frage.id);
    }
    const neuGestellt = gestellt + 1;
    setGestellt(neuGestellt);
    if (duellFertig(neuGestellt)) {
      setPhase('fertig');
      return;
    }
    setSpieler(naechsterSpieler(spieler));
    naechste(frage.id);
  };

  const sieger = duellGewinner(punkte);

  if (laden) return <LadeBildschirm />;
  if (fehler || !daten) return <FehlerBildschirm meldung={`Fehler: ${fehler}`} onZurueck={onZurueck} />;

  if (phase === 'setup') {
    return (
      <Bildschirm>
        <Header titel="Duell" leitfarbe="sagen-lila" onZurueck={onZurueck} />
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 p-4">
          <Begleitung
            name="stierli"
            pose="zeigt"
            text={`Abwechselnd ${DUELL_FRAGEN_PRO_SPIELER} Fragen. Wer mehr Orte trifft, gewinnt.`}
          />
          <KategorieWahl wert={kategorie} onChange={setKategorie} profi={profiFreigeschaltet} />
          <ComicButton fullWidth onClick={starte}>
            Duell starten
          </ComicButton>
        </div>
      </Bildschirm>
    );
  }

  if (phase === 'fertig') {
    const text =
      sieger === null
        ? `Unentschieden ${punkte[0]} zu ${punkte[1]} – stark beide!`
        : `${NAMEN[sieger]} gewinnt ${punkte[sieger]} zu ${punkte[sieger === 0 ? 1 : 0]}!`;
    return (
      <Bildschirm>
        <Header titel="Duell" leitfarbe="sagen-lila" onZurueck={onZurueck} />
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-5 p-4">
          <Begleitung name="lia" pose="jubelt" text={text} />
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
      <Header titel="Duell" leitfarbe="sagen-lila" onZurueck={() => setPhase('setup')} />
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
          <div className="grid grid-cols-2 gap-2">
            {NAMEN.map((name, i) => (
              <div
                key={name}
                className={cn(
                  'rounded-comic border-comic-sm border-ink p-3 text-center shadow-comic',
                  spieler === i ? 'bg-sagen-lila text-weiss' : 'bg-weiss text-ink',
                )}
              >
                <p className="font-display text-lg font-extrabold">{name}</p>
                <p className="font-display text-2xl font-extrabold">{punkte[i as 0 | 1]}</p>
              </div>
            ))}
          </div>
          <Badge variante={spieler === 0 ? 'profi' : 'standard'}>{NAMEN[spieler]} ist dran</Badge>
          <Begleitung
            name={spieler === 0 ? 'lia' : 'stierli'}
            pose="zeigt"
            text={findenFrageText(frage)}
          />
          <p className="font-display text-lg">
            Frage {gestellt + 1} von {DUELL_FRAGEN_PRO_SPIELER * 2}
          </p>
        </div>
      </div>
    </Bildschirm>
  );
}
