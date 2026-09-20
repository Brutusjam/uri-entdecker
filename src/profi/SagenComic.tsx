import { useState } from 'react';
import { Bildschirm } from '../components/StatusSeite';
import { Header } from '../components/ui/Header';
import { Begleitung } from '../components/ui/Begleitung';
import { ComicButton } from '../components/ui/ComicButton';
import { Badge } from '../components/ui/Badge';
import { SAGEN, type Sage } from '../logic/sagen';
import { SageBild } from './SageBild';

interface SagenComicProps {
  onZurueck: () => void;
  onQuiz: (sageId: string) => void;
}

export function SagenComic({ onZurueck, onQuiz }: SagenComicProps) {
  const [sage, setSage] = useState<Sage | null>(null);
  const [seite, setSeite] = useState(0);

  if (!sage) {
    return (
      <Bildschirm>
        <Header titel="Sagen" leitfarbe="sagen-lila" onZurueck={onZurueck} />
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 p-4">
          <Begleitung name="lia" pose="zeigt" text="Man erzählt sich diese Geschichten in Uri – nicht als Tatsachenbericht." />
          {SAGEN.map((s) => (
            <ComicButton
              key={s.id}
              fullWidth
              variante="profi"
              onClick={() => {
                setSage(s);
                setSeite(0);
              }}
            >
              {s.titel}
            </ComicButton>
          ))}
        </div>
      </Bildschirm>
    );
  }

  const aktuell = sage.seiten[seite]!;
  const letzte = seite >= sage.seiten.length - 1;

  return (
    <Bildschirm>
      <Header titel={sage.titel} leitfarbe="sagen-lila" onZurueck={() => setSage(null)} />
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 p-4">
        <Badge variante="profi">{sage.kennzeichnung}</Badge>
        <div className="overflow-hidden rounded-comic-lg border-comic border-ink bg-weiss shadow-comic">
          <SageBild bild={aktuell.bild} />
        </div>
        <Begleitung name="lia" pose="zeigt" text={aktuell.lia} />
        {aktuell.stierli ? <Begleitung name="stierli" pose="erschrocken" text={aktuell.stierli} /> : null}
        <div className="flex gap-3">
          <ComicButton variante="neutral" disabled={seite === 0} onClick={() => setSeite((s) => s - 1)}>
            Zurück
          </ComicButton>
          {letzte ? (
            <ComicButton fullWidth variante="profi" onClick={() => onQuiz(sage.id)}>
              Zum Quiz
            </ComicButton>
          ) : (
            <ComicButton fullWidth onClick={() => setSeite((s) => s + 1)}>
              Weiter
            </ComicButton>
          )}
        </div>
      </div>
    </Bildschirm>
  );
}
