import { useMemo, useRef, useState } from 'react';
import { UriKarte } from '../components/UriKarte';
import { KategorieWahl } from '../components/KategorieWahl';
import { Bildschirm, FehlerBildschirm, LadeBildschirm } from '../components/StatusSeite';
import { Header } from '../components/ui/Header';
import { Begleitung } from '../components/ui/Begleitung';
import { ComicButton } from '../components/ui/ComicButton';
import { useGeoDaten } from '../hooks/useGeoDaten';
import { SPRUECHE } from '../data/sprueche';
import { TAELER_GEO } from '../logic/taeler';
import { beschriftenPool, darfBlinken, type BeschriftenStufe } from '../logic/beschriften';
import { elementeFuer, kartenElementId, kartenModus } from '../logic/fragen';
import { passtKartenAuswahl } from '../logic/wappen';
import { waehleSpruch } from '../logic/sprueche';
import { useFortschrittStore } from '../store/fortschritt';
import { cn } from '../components/ui/cn';
import type { KartenAuswahl, Kategorie, LernElement } from '../types/karte';

interface BeschriftenProps {
  onZurueck: () => void;
}

const STUFEN: { id: BeschriftenStufe; text: string }[] = [
  { id: 'leicht', text: '8 Schilder, Tipp nach zwei Fehlern' },
  { id: 'mittel', text: 'Alle Schilder, Tipp nach zwei Fehlern' },
  { id: 'profi', text: 'Alle Schilder, ohne Tipp' },
];

export function Beschriften({ onZurueck }: BeschriftenProps) {
  const { daten, fehler, laden } = useGeoDaten();
  const { antwortRichtig, antwortFalsch, profiFreigeschaltet } = useFortschrittStore();
  const [phase, setPhase] = useState<'setup' | 'spiel' | 'fertig'>('setup');
  const [kategorie, setKategorie] = useState<Kategorie>('gemeinde');
  const [stufe, setStufe] = useState<BeschriftenStufe>('leicht');
  const [offen, setOffen] = useState<LernElement[]>([]);
  const [platziert, setPlatziert] = useState<LernElement[]>([]);
  const [aktivId, setAktivId] = useState<string | null>(null);
  const [fehle, setFehle] = useState<Record<string, number>>({});
  const [blinkId, setBlinkId] = useState<string | null>(null);
  const [hinweis, setHinweis] = useState('Nimm ein Schild und lege es auf die Karte.');
  const [schuettler, setSchuettler] = useState<string | null>(null);
  const [ziehe, setZiehe] = useState<{ id: string; x: number; y: number } | null>(null);
  const trefferRef = useRef<((x: number, y: number) => KartenAuswahl | null) | null>(null);
  const letzterSpruch = useRef<string | null>(null);
  const karteModus = kartenModus(kategorie);

  const starte = () => {
    setOffen(beschriftenPool(elementeFuer(kategorie), stufe));
    setPlatziert([]);
    setAktivId(null);
    setFehle({});
    setBlinkId(null);
    setHinweis('Nimm ein Schild und lege es auf die Karte.');
    setZiehe(null);
    setPhase('spiel');
  };

  const legeAb = (el: LernElement, auswahl: KartenAuswahl | null) => {
    if (!auswahl) {
      setAktivId(null);
      setZiehe(null);
      return;
    }
    if (passtKartenAuswahl(auswahl, el)) {
      antwortRichtig(el.id, 'beschriften');
      const rest = offen.filter((o) => o.id !== el.id);
      const neuPlatziert = [...platziert, el];
      setOffen(rest);
      setPlatziert(neuPlatziert);
      setAktivId(null);
      setZiehe(null);
      setBlinkId((b) => (b === kartenElementId(el) ? null : b));
      setHinweis(rest.length === 0 ? 'Alles beschriftet!' : `Super, ${el.name}! Noch ${rest.length}.`);
      if (rest.length === 0) setPhase('fertig');
      return;
    }
    antwortFalsch(el.id);
    const neu = (fehle[el.id] ?? 0) + 1;
    setFehle((alt) => ({ ...alt, [el.id]: neu }));
    setAktivId(null);
    setZiehe(null);
    setSchuettler(el.id);
    window.setTimeout(() => setSchuettler(null), 400);
    if (darfBlinken(stufe, neu)) {
      setBlinkId(kartenElementId(el));
      setHinweis('Schau, dort blinkt die richtige Stelle!');
      return;
    }
    const spruch = waehleSpruch(SPRUECHE, 'falsch', letzterSpruch.current, 'stierli');
    letzterSpruch.current = spruch.text;
    setHinweis(spruch.text);
  };

  const etiketten = useMemo(
    () => platziert.map((el) => ({ id: kartenElementId(el), name: el.name })),
    [platziert],
  );

  if (laden) return <LadeBildschirm />;
  if (fehler || !daten) return <FehlerBildschirm meldung={`Fehler: ${fehler}`} onZurueck={onZurueck} />;

  if (phase === 'setup') {
    return (
      <Bildschirm>
        <Header titel="Beschriften" leitfarbe="uri-gelb" onZurueck={onZurueck} />
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 p-4">
          <Begleitung name="lia" pose="zeigt" text="Wie in der Schule: Schilder auf die stumme Karte ziehen." />
          <KategorieWahl wert={kategorie} onChange={setKategorie} profi={profiFreigeschaltet} />
          <section className="space-y-2">
            <h2 className="font-display text-xl font-extrabold">Stufe</h2>
            <div className="flex flex-col gap-3">
              {STUFEN.map((s) => (
                <ComicButton
                  key={s.id}
                  variante={stufe === s.id ? 'primaer' : 'neutral'}
                  fullWidth
                  onClick={() => setStufe(s.id)}
                >
                  {s.id[0]!.toUpperCase() + s.id.slice(1)} · {s.text}
                </ComicButton>
              ))}
            </div>
          </section>
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
        <Header titel="Beschriften" leitfarbe="uri-gelb" onZurueck={onZurueck} />
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-5 p-4">
          <Begleitung name="lia" pose="jubelt" text="Die Karte ist voll – super gemacht!" />
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

  const aktiv = offen.find((o) => o.id === aktivId) ?? null;

  return (
    <Bildschirm>
      <Header titel="Beschriften" leitfarbe="uri-gelb" onZurueck={() => setPhase('setup')} />
      <div className="mx-auto flex w-full max-w-[1400px] min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4 lg:flex-row lg:items-stretch">
        <div className="min-h-0 flex-1 overflow-hidden rounded-comic-lg border-comic border-ink bg-sky shadow-comic lg:w-[65%]">
          <UriKarte
            daten={daten}
            ebenen={karteModus.ebenen}
            blick={karteModus.blick}
            taeler={karteModus.talOderSee ? TAELER_GEO : []}
            talNamen={false}
            blinkId={blinkId}
            etiketten={etiketten}
            trefferRef={trefferRef}
            punktArten={karteModus.punktArten}
            onAuswahl={(auswahl) => {
              if (!aktiv) {
                setHinweis('Zuerst ein Namensschild antippen.');
                return;
              }
              legeAb(aktiv, auswahl);
            }}
          />
        </div>
        <div className="flex min-h-0 flex-col gap-3 lg:w-[35%] lg:shrink-0">
          <p className="rounded-comic border-comic-sm border-ink bg-weiss px-3 py-2 font-body text-lg shadow-comic">
            {hinweis}
          </p>
          <p className="font-display text-lg font-extrabold">
            {platziert.length}/{platziert.length + offen.length} Schilder
          </p>
          <div className="grid min-h-0 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
            {offen.map((el) => (
              <button
                key={el.id}
                type="button"
                aria-pressed={aktivId === el.id}
                aria-label={el.name}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  setAktivId(el.id);
                  setZiehe({ id: el.id, x: e.clientX, y: e.clientY });
                }}
                onPointerMove={(e) => {
                  if (ziehe?.id !== el.id) return;
                  setZiehe({ id: el.id, x: e.clientX, y: e.clientY });
                }}
                onPointerUp={(e) => {
                  if (ziehe?.id !== el.id) return;
                  const treffer = trefferRef.current?.(e.clientX, e.clientY) ?? null;
                  if (treffer) {
                    legeAb(el, treffer);
                    return;
                  }
                  setZiehe(null);
                }}
                onPointerCancel={() => setZiehe(null)}
                onContextMenu={(e) => e.preventDefault()}
                className={cn(
                  'min-h-12 touch-none rounded-comic border-comic-sm border-ink bg-weiss px-2 py-2 font-display text-base font-extrabold shadow-comic',
                  'cursor-grab active:cursor-grabbing',
                  aktivId === el.id && 'bg-uri-gelb',
                  schuettler === el.id && 'animate-comic-shake',
                  ziehe?.id === el.id && 'opacity-40',
                )}
              >
                {el.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      {ziehe && aktiv ? (
        <div
          className="pointer-events-none fixed z-50 rounded-pill border-comic-sm border-ink bg-uri-gelb px-3 py-1 font-display text-lg font-extrabold shadow-comic"
          style={{ left: ziehe.x + 16, top: ziehe.y + 16 }}
        >
          {aktiv.name}
        </div>
      ) : null}
    </Bildschirm>
  );
}
