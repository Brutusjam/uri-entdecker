import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { UriKarte } from '../components/UriKarte';
import { Bildschirm, FehlerBildschirm, LadeBildschirm } from '../components/StatusSeite';
import { Header } from '../components/ui/Header';
import { Begleitung } from '../components/ui/Begleitung';
import { Badge } from '../components/ui/Badge';
import { ComicButton } from '../components/ui/ComicButton';
import { Sticker } from '../components/ui/Sticker';
import { IconCheck, IconKreuz } from '../components/ui/icons';
import { useGeoDaten } from '../hooks/useGeoDaten';
import { SPRUECHE } from '../data/sprueche';
import { findenBegleitung } from '../logic/finden-begleitung';
import { waehleSpruch } from '../logic/sprueche';
import {
  neueWappenFrage,
  passtKartenAuswahl,
  wappenPool,
  type QuizVariante,
  type WappenFrage,
  type WappenPool,
} from '../logic/wappen';
import { useFortschrittStore } from '../store/fortschritt';
import { cn } from '../components/ui/cn';
import type { KartenAuswahl, LernElement } from '../types/karte';

interface WappenQuizProps {
  onZurueck: () => void;
}

const MAX_VERSUCHE = 3;

function frageSprech(frage: WappenFrage): string {
  if (frage.variante === 'wappen-name') return 'Schau genau hin – wessen Wappen ist das?';
  if (frage.variante === 'name-wappen') return `Finde das Wappen von ${frage.ziel.name}.`;
  return 'Tippe auf der Karte dorthin, wo das Wappen hinpasst.';
}

function richtigText(ziel: LernElement): string {
  if (ziel.wappenTipp) return `Super! ${ziel.wappenTipp}`;
  return `Super! Das ist ${ziel.name}!`;
}

export function WappenQuiz({ onZurueck }: WappenQuizProps) {
  const { daten, fehler, laden } = useGeoDaten();
  const { fortschritt, letzteFrageId, antwortRichtig, antwortFalsch, setLetzteFrage } =
    useFortschrittStore();

  const [phase, setPhase] = useState<'setup' | 'spiel'>('setup');
  const [poolArt, setPoolArt] = useState<WappenPool>('gemeinden');
  const [variante, setVariante] = useState<QuizVariante>('wappen-name');
  const [frage, setFrage] = useState<WappenFrage | null>(null);
  const [versuche, setVersuche] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [ergebnis, setErgebnis] = useState<'richtig' | 'falsch' | null>(null);
  const [fertig, setFertig] = useState(false);
  const [blinkId, setBlinkId] = useState<string | null>(null);
  const letzterSpruch = useRef<string | null>(null);

  const pool = useMemo(() => wappenPool(poolArt), [poolArt]);

  const neueFrage = useCallback(
    (ausgenommenId?: string | null) => {
      const n = neueWappenFrage(pool, fortschritt, ausgenommenId ?? letzteFrageId, variante);
      setFrage(n);
      setVersuche(0);
      setFeedback(null);
      setErgebnis(null);
      setFertig(false);
      setBlinkId(null);
    },
    [pool, fortschritt, letzteFrageId, variante],
  );

  useEffect(() => {
    if (phase === 'spiel' && !frage) neueFrage();
  }, [phase, frage, neueFrage]);

  useEffect(() => {
    if (versuche >= 2 && frage) {
      setBlinkId(frage.ziel.id);
      const t = setTimeout(() => setBlinkId(null), 2500);
      return () => clearTimeout(t);
    }
  }, [versuche, frage]);

  const schliesseRichtig = (ziel: LernElement) => {
    antwortRichtig(ziel.id, 'wappen');
    setFeedback(richtigText(ziel));
    setErgebnis('richtig');
    setFertig(true);
    window.setTimeout(() => neueFrage(ziel.id), 1800);
  };

  const schliesseFalsch = (ziel: LernElement, neuVersuche: number) => {
    antwortFalsch(ziel.id);
    setErgebnis('falsch');
    setVersuche(neuVersuche);
    if (neuVersuche >= MAX_VERSUCHE) {
      setFeedback(`Das war ${ziel.name}. Beim nächsten Mal klappt es!`);
      setLetzteFrage(ziel.id);
      setFertig(true);
      window.setTimeout(() => neueFrage(ziel.id), 2200);
      return;
    }
    setFeedback(ziel.wappenTipp ?? 'Versuch es noch einmal!');
  };

  const handleOption = (wahl: LernElement) => {
    if (!frage || fertig) return;
    if (wahl.id === frage.ziel.id) {
      schliesseRichtig(frage.ziel);
      return;
    }
    schliesseFalsch(frage.ziel, versuche + 1);
  };

  const handleKarte = (auswahl: KartenAuswahl | null) => {
    if (!frage || !auswahl || fertig) return;
    if (passtKartenAuswahl(auswahl, frage.ziel)) {
      schliesseRichtig(frage.ziel);
      return;
    }
    schliesseFalsch(frage.ziel, versuche + 1);
  };

  const rolle = findenBegleitung(ergebnis, versuche, fertig);
  const sprechtext = useMemo(() => {
    if (!frage) return 'Bereit für die Wappen?';
    if (!rolle.anlass) return frageSprech(frage);
    const spruch = waehleSpruch(SPRUECHE, rolle.anlass, letzterSpruch.current, rolle.sprecher);
    letzterSpruch.current = spruch.text;
    return spruch.text;
  }, [frage, rolle.anlass, rolle.sprecher]);

  if (laden) return <LadeBildschirm />;
  if (fehler || !daten) return <FehlerBildschirm meldung={`Fehler: ${fehler}`} onZurueck={onZurueck} />;

  if (phase === 'setup') {
    return (
      <Bildschirm>
        <Header titel="Wappen-Quiz" leitfarbe="stier-rot" onZurueck={onZurueck} />
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 p-4">
          <Begleitung name="lia" pose="zeigt" text="Welche Wappen möchtest du üben?" />

          <section className="space-y-2">
            <h2 className="font-display text-xl font-extrabold">Was?</h2>
            <div className="grid grid-cols-2 gap-3">
              <ComicButton
                variante={poolArt === 'gemeinden' ? 'primaer' : 'neutral'}
                fullWidth
                onClick={() => setPoolArt('gemeinden')}
              >
                Gemeinden
              </ComicButton>
              <ComicButton
                variante={poolArt === 'kantone' ? 'primaer' : 'neutral'}
                fullWidth
                onClick={() => setPoolArt('kantone')}
              >
                Kantone
              </ComicButton>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-xl font-extrabold">Wie?</h2>
            <div className="flex flex-col gap-3">
              {(
                [
                  ['wappen-name', 'Wappen → Name'],
                  ['name-wappen', 'Name → Wappen'],
                  ['wappen-karte', 'Wappen auf die Karte'],
                ] as const
              ).map(([id, label]) => (
                <ComicButton
                  key={id}
                  variante={variante === id ? 'primaer' : 'neutral'}
                  fullWidth
                  onClick={() => setVariante(id)}
                >
                  {label}
                </ComicButton>
              ))}
            </div>
          </section>

          <ComicButton
            fullWidth
            onClick={() => {
              setFrage(null);
              setPhase('spiel');
            }}
          >
            Los gehts
          </ComicButton>
        </div>
      </Bildschirm>
    );
  }

  if (!frage) return <LadeBildschirm text="Frage kommt …" />;

  const kartenModus = frage.variante === 'wappen-karte';

  return (
    <Bildschirm>
      <Header
        titel="Wappen-Quiz"
        leitfarbe="stier-rot"
        onZurueck={() => {
          setPhase('setup');
          setFrage(null);
        }}
      />

      <div className="mx-auto flex w-full max-w-[1400px] min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4 lg:flex-row lg:items-stretch">
        {kartenModus ? (
          <div className="min-h-0 flex-1 overflow-hidden rounded-comic-lg border-comic border-ink bg-sky shadow-comic lg:w-[65%]">
            <UriKarte
              daten={daten}
              ebenen={poolArt === 'kantone' ? ['kantone', 'seen'] : ['kantone', 'gemeinden', 'seen']}
              blick={poolArt === 'kantone' ? 'nachbarn' : 'uri'}
              onAuswahl={handleKarte}
              blinkId={blinkId}
            />
          </div>
        ) : null}

        <div className={cn('flex flex-col gap-4', kartenModus ? 'lg:w-[35%] lg:shrink-0' : 'mx-auto w-full max-w-xl')}>
          <Begleitung
            key={`${frage.ziel.id}-${rolle.anlass ?? 'frage'}-${versuche}`}
            name={rolle.name}
            pose={rolle.pose}
            text={sprechtext}
          />

          <div className="flex justify-center">
            {frage.variante !== 'name-wappen' ? (
              <Sticker src={frage.ziel.wappen} alt={frage.variante === 'wappen-name' || kartenModus ? 'Gesuchtes Wappen' : frage.ziel.name} groesse={128} />
            ) : (
              <p className="font-display text-3xl font-extrabold text-ink">{frage.ziel.name}</p>
            )}
          </div>

          {frage.variante === 'wappen-name' ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {frage.optionen.map((opt) => (
                <ComicButton
                  key={opt.id}
                  variante="neutral"
                  fullWidth
                  disabled={fertig}
                  onClick={() => handleOption(opt)}
                >
                  {opt.name}
                </ComicButton>
              ))}
            </div>
          ) : null}

          {frage.variante === 'name-wappen' ? (
            <div className="grid grid-cols-2 gap-3">
              {frage.optionen.map((opt, i) => (
                <button
                  key={opt.id}
                  type="button"
                  disabled={fertig}
                  onClick={() => handleOption(opt)}
                  className="flex min-h-12 min-w-12 flex-col items-center justify-center rounded-comic border-comic border-ink bg-weiss p-2 shadow-button enabled:cursor-pointer enabled:active:translate-y-[5px] enabled:active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Sticker src={opt.wappen} alt={`Wappen ${i + 1}`} groesse={96} className="shadow-none" />
                </button>
              ))}
            </div>
          ) : null}

          {kartenModus ? (
            <p className="font-display text-lg">
              Versuch {Math.min(versuche + 1, MAX_VERSUCHE)} von {MAX_VERSUCHE}
            </p>
          ) : null}

          {feedback ? (
            <div
              className={cn(
                'rounded-comic-lg border-comic border-ink bg-weiss p-4 shadow-comic',
                ergebnis === 'richtig' && 'animate-comic-richtig',
                ergebnis === 'falsch' && 'animate-comic-shake',
              )}
            >
              <div className="flex items-start gap-3">
                {ergebnis === 'richtig' ? (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-pill bg-alp-gruen text-weiss animate-check-pop">
                    <IconCheck className="h-7 w-7" />
                  </span>
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-pill bg-koralle text-ink">
                    <IconKreuz className="h-7 w-7" />
                  </span>
                )}
                <div>
                  <Badge variante={ergebnis === 'richtig' ? 'erfolg' : 'warnung'}>
                    {ergebnis === 'richtig' ? 'Richtig' : 'Noch nicht'}
                  </Badge>
                  <p className="mt-2 text-lg">{feedback}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Bildschirm>
  );
}
