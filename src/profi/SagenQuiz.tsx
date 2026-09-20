import { useState } from 'react';
import { Bildschirm } from '../components/StatusSeite';
import { Header } from '../components/ui/Header';
import { Begleitung } from '../components/ui/Begleitung';
import { ComicButton } from '../components/ui/ComicButton';
import { istSagenAntwort, SAGEN_FRAGEN, type SagenFrage } from '../logic/sagen';
import { mische } from '../logic/zufall';

interface SagenQuizProps {
  onZurueck: () => void;
}

export function SagenQuiz({ onZurueck }: SagenQuizProps) {
  const [index, setIndex] = useState(0);
  const [fragen] = useState(() => mische(SAGEN_FRAGEN));
  const [richtig, setRichtig] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [fertig, setFertig] = useState(false);

  const frage: SagenFrage | undefined = fragen[index];

  if (fertig || !frage) {
    return (
      <Bildschirm>
        <Header titel="Sagen-Quiz" leitfarbe="sagen-lila" onZurueck={onZurueck} />
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 p-4">
          <Begleitung
            name="lia"
            pose="jubelt"
            text={`${richtig} von ${fragen.length} sitzen. Man erzählt sich diese Geschichten – du kennst sie jetzt.`}
          />
          <ComicButton fullWidth onClick={onZurueck}>
            Fertig
          </ComicButton>
        </div>
      </Bildschirm>
    );
  }

  return (
    <Bildschirm>
      <Header titel="Sagen-Quiz" leitfarbe="sagen-lila" onZurueck={onZurueck} />
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 p-4">
        <p className="font-display text-lg">
          Frage {index + 1} von {fragen.length}
        </p>
        <Begleitung name="lia" pose="denkt" text={frage.text} />
        {frage.optionen.map((o) => (
          <ComicButton
            key={o}
            fullWidth
            variante="profi"
            disabled={Boolean(feedback)}
            onClick={() => {
              const gut = istSagenAntwort(o, frage);
              setFeedback(gut ? 'Richtig!' : frage.hinweis);
              if (gut) setRichtig((n) => n + 1);
            }}
          >
            {o}
          </ComicButton>
        ))}
        {feedback ? (
          <>
            <p className="font-display text-lg">{feedback}</p>
            <ComicButton
              fullWidth
              onClick={() => {
                setFeedback(null);
                if (index + 1 >= fragen.length) setFertig(true);
                else setIndex((i) => i + 1);
              }}
            >
              Weiter
            </ComicButton>
          </>
        ) : null}
      </div>
    </Bildschirm>
  );
}
