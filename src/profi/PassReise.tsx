import { useMemo, useState } from 'react';
import { Bildschirm, FehlerBildschirm, LadeBildschirm } from '../components/StatusSeite';
import { Header } from '../components/ui/Header';
import { Begleitung } from '../components/ui/Begleitung';
import { ComicButton } from '../components/ui/ComicButton';
import { UriKarte } from '../components/UriKarte';
import { useGeoDaten } from '../hooks/useGeoDaten';
import { TAELER_GEO } from '../logic/taeler';
import {
  naechsterPassSchritt,
  PASS_REISEN,
  passReiseFrage,
  passReiseZielId,
  type PassReise,
  type PassReiseSchritt,
} from '../logic/passreise';
import { passtKartenAuswahl } from '../logic/wappen';
import { PAESSE_MAP } from '../data/paesse';
import { TAELER_MAP } from '../data/taeler';
import { KANTONE_MAP } from '../data/kantone';
import { useFortschrittStore } from '../store/fortschritt';
import type { KartenAuswahl } from '../types/karte';

interface PassReiseProps {
  onZurueck: () => void;
}

export function PassReise({ onZurueck }: PassReiseProps) {
  const { daten, fehler, laden } = useGeoDaten();
  const antwortRichtig = useFortschrittStore((s) => s.antwortRichtig);
  const antwortFalsch = useFortschrittStore((s) => s.antwortFalsch);
  const [reise, setReise] = useState<PassReise | null>(null);
  const [schritt, setSchritt] = useState<PassReiseSchritt>('tal');
  const [hinweis, setHinweis] = useState('');

  const ziel = useMemo(() => {
    if (!reise) return null;
    const id = passReiseZielId(reise, schritt);
    if (schritt === 'tal') return TAELER_MAP.get(id) ?? null;
    if (schritt === 'pass') return PAESSE_MAP.get(id) ?? null;
    return KANTONE_MAP.get(reise.kantonKuerzel) ?? null;
  }, [reise, schritt]);

  if (laden) return <LadeBildschirm />;
  if (fehler || !daten) return <FehlerBildschirm meldung={`Fehler: ${fehler}`} onZurueck={onZurueck} />;

  if (!reise) {
    return (
      <Bildschirm>
        <Header titel="Pass-Reise" leitfarbe="sagen-lila" onZurueck={onZurueck} />
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 p-4">
          <Begleitung name="stierli" pose="zeigt" text="Ich will über den Pass! Tal, dann Pass, dann Nachbarkanton." />
          {PASS_REISEN.map((r) => (
            <ComicButton
              key={r.passId}
              fullWidth
              variante="profi"
              onClick={() => {
                setReise(r);
                setSchritt('tal');
                setHinweis('');
              }}
            >
              {r.zielText}
            </ComicButton>
          ))}
        </div>
      </Bildschirm>
    );
  }

  const tippe = (auswahl: KartenAuswahl | null) => {
    if (!ziel || !auswahl) return;
    if (passtKartenAuswahl(auswahl, ziel)) {
      antwortRichtig(ziel.id);
      const weiter = naechsterPassSchritt(schritt);
      if (!weiter) {
        setHinweis(`Geschafft! Über den Pass nach ${reise.kantonName}.`);
        setReise(null);
        return;
      }
      setSchritt(weiter);
      setHinweis('Genau! Weiter.');
      return;
    }
    antwortFalsch(ziel.id);
    setHinweis('Noch nicht – schau nochmal.');
  };

  return (
    <Bildschirm>
      <Header titel="Pass-Reise" leitfarbe="sagen-lila" onZurueck={() => setReise(null)} />
      <div className="mx-auto flex w-full max-w-[1400px] min-h-0 flex-1 flex-col gap-3 p-4 lg:flex-row">
        <div className="h-[50vh] min-h-[280px] flex-1 overflow-hidden rounded-comic-lg border-comic border-ink bg-sky shadow-comic lg:h-auto lg:w-[65%]">
          <UriKarte
            daten={daten}
            ebenen={['kantone', 'gemeinden', 'seen', 'punkte']}
            blick="nachbarn"
            taeler={TAELER_GEO}
            talNamen={false}
            punktArten={['pass']}
            onAuswahl={tippe}
          />
        </div>
        <div className="flex flex-col gap-3 lg:w-[35%] lg:shrink-0">
          <Begleitung name="stierli" pose="zeigt" text={passReiseFrage(reise, schritt)} />
          {hinweis ? <p className="font-display text-lg">{hinweis}</p> : null}
        </div>
      </div>
    </Bildschirm>
  );
}
