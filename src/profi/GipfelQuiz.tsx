import { useMemo, useState } from 'react';
import { Bildschirm, FehlerBildschirm, LadeBildschirm } from '../components/StatusSeite';
import { Header } from '../components/ui/Header';
import { Begleitung } from '../components/ui/Begleitung';
import { ComicButton } from '../components/ui/ComicButton';
import { useGeoDaten } from '../hooks/useGeoDaten';
import { formatiereHoehe, punktHoehe } from '../logic/punkte';
import { istHoeher, waehleGipfelPaar, type GipfelPaar } from '../logic/gipfel';
import { BERGE_MAP } from '../data/berge';
import { useFortschrittStore } from '../store/fortschritt';

interface GipfelQuizProps {
  onZurueck: () => void;
}

export function GipfelQuiz({ onZurueck }: GipfelQuizProps) {
  const { daten, fehler, laden } = useGeoDaten();
  const antwortRichtig = useFortschrittStore((s) => s.antwortRichtig);
  const antwortFalsch = useFortschrittStore((s) => s.antwortFalsch);
  const [paar, setPaar] = useState<GipfelPaar | null>(null);
  const [aufgeloest, setAufgeloest] = useState(false);

  const berge = daten?.punkte.features.filter((p) => p.properties.art === 'berg') ?? [];

  const starte = () => {
    setPaar(waehleGipfelPaar(berge));
    setAufgeloest(false);
  };

  const namen = useMemo(() => {
    if (!paar) return null;
    return {
      a: BERGE_MAP.get(paar.a.properties.id)?.name ?? paar.a.properties.name,
      b: BERGE_MAP.get(paar.b.properties.id)?.name ?? paar.b.properties.name,
    };
  }, [paar]);

  if (laden) return <LadeBildschirm />;
  if (fehler || !daten) return <FehlerBildschirm meldung={`Fehler: ${fehler}`} onZurueck={onZurueck} />;

  if (!paar || !namen) {
    return (
      <Bildschirm>
        <Header titel="Gipfel-Quiz" leitfarbe="sagen-lila" onZurueck={onZurueck} />
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 p-4">
          <Begleitung name="lia" pose="denkt" text="Welcher Berg ist höher? Die Höhen kommen von der Karte." />
          <ComicButton fullWidth variante="profi" onClick={starte}>
            Los
          </ComicButton>
        </div>
      </Bildschirm>
    );
  }

  const waehle = (id: string) => {
    if (aufgeloest) return;
    const richtig = istHoeher(id, paar);
    if (richtig) antwortRichtig(id);
    else antwortFalsch(id);
    setAufgeloest(true);
  };

  const ha = punktHoehe(paar.a);
  const hb = punktHoehe(paar.b);

  return (
    <Bildschirm>
      <Header titel="Gipfel-Quiz" leitfarbe="sagen-lila" onZurueck={onZurueck} />
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 p-4">
        <Begleitung
          name="lia"
          pose={aufgeloest ? 'jubelt' : 'denkt'}
          text={aufgeloest ? 'Die Höhen stehen unter den Namen.' : 'Welcher Berg ist höher?'}
        />
        <ComicButton fullWidth variante="profi" onClick={() => waehle(paar.a.properties.id)}>
          {namen.a}
          {aufgeloest && ha != null ? ` · ${formatiereHoehe(ha)}` : ''}
        </ComicButton>
        <ComicButton fullWidth variante="profi" onClick={() => waehle(paar.b.properties.id)}>
          {namen.b}
          {aufgeloest && hb != null ? ` · ${formatiereHoehe(hb)}` : ''}
        </ComicButton>
        {aufgeloest ? (
          <ComicButton fullWidth onClick={starte}>
            Nächstes Paar
          </ComicButton>
        ) : null}
      </div>
    </Bildschirm>
  );
}
