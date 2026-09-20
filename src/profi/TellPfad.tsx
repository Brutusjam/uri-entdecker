import { useState } from 'react';
import { Bildschirm, FehlerBildschirm, LadeBildschirm } from '../components/StatusSeite';
import { Header } from '../components/ui/Header';
import { Begleitung } from '../components/ui/Begleitung';
import { ComicButton } from '../components/ui/ComicButton';
import { UriKarte } from '../components/UriKarte';
import { useGeoDaten } from '../hooks/useGeoDaten';
import { naechsteTellStation, TELL_STATIONEN, tellPfadFertig, tellStationRichtig } from '../logic/tellpfad';
import { useFortschrittStore } from '../store/fortschritt';
import type { KartenAuswahl } from '../types/karte';

interface TellPfadProps {
  onZurueck: () => void;
}

export function TellPfad({ onZurueck }: TellPfadProps) {
  const { daten, fehler, laden } = useGeoDaten();
  const antwortRichtig = useFortschrittStore((s) => s.antwortRichtig);
  const antwortFalsch = useFortschrittStore((s) => s.antwortFalsch);
  const [index, setIndex] = useState(0);
  const [hinweis, setHinweis] = useState('');
  const station = naechsteTellStation(index);
  const fertig = tellPfadFertig(index);

  if (laden) return <LadeBildschirm />;
  if (fehler || !daten) return <FehlerBildschirm meldung={`Fehler: ${fehler}`} onZurueck={onZurueck} />;

  const tippe = (auswahl: KartenAuswahl | null) => {
    if (!station || fertig) return;
    if (tellStationRichtig(station, auswahl?.id ?? null)) {
      antwortRichtig(station.id);
      setIndex((i) => i + 1);
      setHinweis(`Ja, ${station.name}!`);
      return;
    }
    antwortFalsch(station.id);
    setHinweis('Noch nicht. Folge der Sage der Reihe nach.');
  };

  return (
    <Bildschirm>
      <Header titel="Tell-Pfad" leitfarbe="sagen-lila" onZurueck={onZurueck} />
      <div className="mx-auto flex w-full max-w-[1400px] min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4 lg:flex-row lg:items-stretch">
        <div className="min-h-0 flex-1 overflow-hidden rounded-comic-lg border-comic border-ink bg-sky shadow-comic lg:w-[65%]">
          <UriKarte
            daten={daten}
            ebenen={['kantone', 'gemeinden', 'seen', 'punkte']}
            blick="nachbarn"
            punktArten={['sagenort']}
            onAuswahl={tippe}
          />
        </div>
        <div className="flex flex-col gap-3 lg:w-[35%] lg:shrink-0">
          {fertig ? (
            <Begleitung
              name="lia"
              pose="jubelt"
              text="Der Tell-Pfad sitzt: Bürglen, Altdorf, Tellsplatte, Rütli. Man erzählt sich diese Stationen."
            />
          ) : (
            <Begleitung
              name="lia"
              pose="zeigt"
              text={`Station ${index + 1} von ${TELL_STATIONEN.length}: ${station?.name}. ${station?.text}`}
            />
          )}
          {hinweis ? <p className="font-display text-lg">{hinweis}</p> : null}
          {fertig ? (
            <ComicButton fullWidth onClick={onZurueck}>
              Fertig
            </ComicButton>
          ) : null}
        </div>
      </div>
    </Bildschirm>
  );
}
