import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { UriKarte } from '../components/UriKarte';
import { Bildschirm, FehlerBildschirm, LadeBildschirm } from '../components/StatusSeite';
import { SpielLayout } from '../components/SpielLayout';
import { KategorieWahl } from '../components/KategorieWahl';
import { Header } from '../components/ui/Header';
import { Begleitung } from '../components/ui/Begleitung';
import { Badge } from '../components/ui/Badge';
import { ComicButton } from '../components/ui/ComicButton';
import { IconCheck, IconKreuz } from '../components/ui/icons';
import { Sticker } from '../components/ui/Sticker';
import { kategorieInfo } from '../data/kategorien';
import { useGeoDaten } from '../hooks/useGeoDaten';
import { ELEMENT_MAP } from '../data/elemente';
import { istFangfrage } from '../data/fangfragen';
import { istFangfrageKuerzel } from '../data/kantone';
import { SPRUECHE } from '../data/sprueche';
import { elementeFuer, findenFrageText, kartenElementId, kartenModus, waehleFindenFrage } from '../logic/fragen';
import { findenBegleitung } from '../logic/finden-begleitung';
import { nachbarIds, berechneNachbarn } from '../logic/nachbarn';
import { waehleSpruch } from '../logic/sprueche';
import { passtKartenAuswahl } from '../logic/wappen';
import { TAELER_GEO } from '../logic/taeler';
import { useFortschrittStore } from '../store/fortschritt';
import { cn } from '../components/ui/cn';
import type { KartenAuswahl, LernElement, Kategorie } from '../types/karte';

interface FindenProps {
  onZurueck: () => void;
  startElementId?: string | null;
  startKategorie?: Kategorie;
}

const MAX_VERSUCHE = 3;

function poolFuer(kategorie: Kategorie): LernElement[] {
  return elementeFuer(kategorie);
}

function sprechtextFuer(
  frage: LernElement,
  anlass: ReturnType<typeof findenBegleitung>['anlass'],
  sprecher: ReturnType<typeof findenBegleitung>['sprecher'],
  letzterSpruch: { current: string | null },
): string {
  if (!anlass) return findenFrageText(frage);
  const spruch = waehleSpruch(SPRUECHE, anlass, letzterSpruch.current, sprecher);
  letzterSpruch.current = spruch.text;
  return spruch.text;
}

export function Finden({ onZurueck, startElementId, startKategorie = 'gemeinde' }: FindenProps) {
  const { daten, fehler, laden } = useGeoDaten();
  const { fortschritt, letzteFrageId, antwortRichtig, antwortFalsch, setLetzteFrage } =
    useFortschrittStore();
  const profiFreigeschaltet = useFortschrittStore((s) => s.profiFreigeschaltet);

  const [kategorie, setKategorie] = useState<Kategorie>(() => {
    if (startElementId) return ELEMENT_MAP.get(startElementId)?.kategorie ?? startKategorie;
    return startKategorie;
  });
  // Direkt geübte Elemente überspringen die Auswahl.
  const [phase, setPhase] = useState<'setup' | 'spiel'>(startElementId ? 'spiel' : 'setup');

  const [frage, setFrage] = useState<LernElement | null>(null);
  const [versuche, setVersuche] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [ergebnis, setErgebnis] = useState<'richtig' | 'falsch' | null>(null);
  const [blinkId, setBlinkId] = useState<string | null>(null);
  const [fertig, setFertig] = useState(false);
  const letzterSpruch = useRef<string | null>(null);
  const pool = useMemo(() => poolFuer(kategorie), [kategorie]);

  const nachbarn = useMemo(
    () => (daten ? berechneNachbarn(daten.gemeinden.features) : new Map()),
    [daten],
  );

  const neueFrage = useCallback(
    (zielId?: string | null, ausgenommenId?: string | null) => {
      const meiden = ausgenommenId ?? letzteFrageId;
      const direkt = zielId ? ELEMENT_MAP.get(zielId) : undefined;
      const el = direkt ?? waehleFindenFrage(pool, fortschritt, meiden);
      setFrage(el);
      setVersuche(0);
      setFeedback(null);
      setErgebnis(null);
      setBlinkId(null);
      setFertig(false);
    },
    [fortschritt, letzteFrageId, pool],
  );

  useEffect(() => {
    if (daten && phase === 'spiel' && !frage) neueFrage(startElementId);
  }, [daten, phase, frage, startElementId, neueFrage]);

  const highlightIds = useMemo(() => {
    if (!frage || frage.kategorie !== 'gemeinde' || versuche < 1) return [];
    return nachbarIds(Number(frage.geo), nachbarn);
  }, [frage, versuche, nachbarn]);

  useEffect(() => {
    if (versuche >= 2 && frage) {
      setBlinkId(kartenElementId(frage));
      const t = setTimeout(() => setBlinkId(null), 2500);
      return () => clearTimeout(t);
    }
  }, [versuche, frage]);

  const handleAuswahl = (auswahl: KartenAuswahl | null) => {
    if (!frage || !auswahl || fertig) return;
    const fangfrage = istFangfrage(frage);

    if (passtKartenAuswahl(auswahl, frage)) {
      if (!fangfrage) antwortRichtig(frage.id, 'finden');
      else setLetzteFrage(frage.id);
      setFeedback(fangfrage && frage.funFact ? frage.funFact : `Super! Das ist ${frage.name}!`);
      setErgebnis('richtig');
      setFertig(true);
      const erledigtId = frage.id;
      setTimeout(() => neueFrage(null, erledigtId), 1800);
      return;
    }

    const neu = versuche + 1;
    setVersuche(neu);
    if (!fangfrage) antwortFalsch(frage.id);
    setErgebnis('falsch');

    const danebenIstFangfrage =
      frage.kategorie === 'kanton' && !fangfrage && istFangfrageKuerzel(auswahl.kuerzel);

    if (neu >= MAX_VERSUCHE) {
      setFeedback(
        fangfrage && frage.funFact
          ? frage.funFact
          : `Das war ${frage.name}. Beim nächsten Mal klappt es!`,
      );
      setLetzteFrage(frage.id);
      setFertig(true);
      const erledigtId = frage.id;
      setTimeout(() => neueFrage(null, erledigtId), 2200);
      return;
    }

    if (danebenIstFangfrage) {
      setFeedback(`${auswahl.name} grenzt nicht an Uri! Schau die Kantone, die Uri wirklich berühren.`);
      return;
    }

    setFeedback(frage.tipps[neu - 1] ?? 'Versuch es noch einmal!');
  };

  const rolle = findenBegleitung(ergebnis, versuche, fertig);
  const sprechtext = useMemo(() => {
    if (!frage) return '';
    return sprechtextFuer(frage, rolle.anlass, rolle.sprecher, letzterSpruch);
  }, [frage, rolle.anlass, rolle.sprecher]);

  if (laden) return <LadeBildschirm />;
  if (fehler || !daten) {
    return <FehlerBildschirm meldung={`Fehler: ${fehler ?? 'Keine Daten'}`} onZurueck={onZurueck} />;
  }

  if (phase === 'setup') {
    const info = kategorieInfo(kategorie);
    return (
      <Bildschirm>
        <Header titel="Wo liegt das?" leitfarbe="see-blau" onZurueck={onZurueck} />
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 p-4">
          <Begleitung
            name="lia"
            pose="zeigt"
            text="Ich frage nach einem Ort, du tippst ihn auf der Karte an. Drei Versuche, mit Tipps."
          />
          <KategorieWahl
            wert={kategorie}
            onChange={setKategorie}
            profi={profiFreigeschaltet}
            titel="Was möchtest du üben?"
          />
          <ComicButton
            fullWidth
            onClick={() => {
              setFrage(null);
              setPhase('spiel');
            }}
          >
            Los mit {info.titel}
          </ComicButton>
        </div>
      </Bildschirm>
    );
  }

  if (!frage) {
    return <FehlerBildschirm meldung="Keine Frage gefunden." onZurueck={onZurueck} />;
  }

  const karte = kartenModus(frage.kategorie);

  return (
    <Bildschirm>
      <Header titel="Wo liegt das?" leitfarbe="see-blau" onZurueck={onZurueck} />

      <SpielLayout
        karte={
          <UriKarte
            daten={daten}
            ebenen={karte.ebenen}
            blick={karte.blick}
            onAuswahl={handleAuswahl}
            highlightIds={highlightIds}
            blinkId={blinkId}
            taeler={karte.talOderSee ? TAELER_GEO : []}
            talNamen={false}
            punktArten={karte.punktArten}
          />
        }
        panel={
          <>
            <div className="flex flex-col items-center gap-3">
              <Begleitung
                key={`${frage.id}-${rolle.anlass ?? 'frage'}-${versuche}`}
                name={rolle.name}
                pose={rolle.pose}
                text={sprechtext}
                className="w-full"
              />

              {frage.wappen ? (
                <Sticker src={frage.wappen} alt={`Wappen ${frage.name}`} groesse={112} drehung={-2} />
              ) : frage.bild ? (
                <Sticker src={frage.bild} alt={frage.name} groesse={112} drehung={-2} />
              ) : null}
            </div>

            <p className="font-display text-lg">
              Versuch {Math.min(versuche + 1, MAX_VERSUCHE)} von {MAX_VERSUCHE}
            </p>

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
            ) : (
              <p className="text-lg text-ink/70">Tippe auf die richtige Stelle auf der Karte.</p>
            )}

            {startElementId ? null : (
              <ComicButton variante="neutral" fullWidth onClick={() => setPhase('setup')}>
                Andere Gruppe üben
              </ComicButton>
            )}
          </>
        }
      />
    </Bildschirm>
  );
}
