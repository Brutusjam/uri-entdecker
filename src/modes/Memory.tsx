import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Bildschirm, FehlerBildschirm, LadeBildschirm } from '../components/StatusSeite';
import { Header } from '../components/ui/Header';
import { Begleitung } from '../components/ui/Begleitung';
import { ComicButton } from '../components/ui/ComicButton';
import { IconKarten, IconSchild, IconStern } from '../components/ui/icons';
import { UmrissBild } from '../components/UmrissBild';
import { useGeoDaten } from '../hooks/useGeoDaten';
import { GEMEINDEN } from '../data/gemeinden';
import { KANTONE } from '../data/kantone';
import { PAESSE } from '../data/paesse';
import { BERGE } from '../data/berge';
import { SAGENORTE } from '../data/sagenorte';
import { ELEMENT_MAP } from '../data/elemente';
import { SPRUECHE } from '../data/sprueche';
import {
  MEMORY_GROESSEN,
  baueMemoryKarten,
  formatiereZeit,
  istMemoryPaar,
  memoryRaster,
  memorySterne,
  memoryZellenGroesse,
  waehleMemoryElemente,
  type MemoryGroesse,
  type MemoryKarte,
  type MemoryPaarTyp,
} from '../logic/memory';
import { waehleSpruch } from '../logic/sprueche';
import { useFortschrittStore } from '../store/fortschritt';
import { cn } from '../components/ui/cn';
import type { GemeindeFeature, LernElement } from '../types/karte';

interface MemoryProps {
  onZurueck: () => void;
}

type SpielModus = 'solo' | 'duell';

const GROESSEN_LABEL: Record<MemoryGroesse, string> = {
  '4x4': '4×4 leicht',
  '5x4': '5×4',
  '6x5': '6×5 profi',
};

function poolFuer(paarTyp: MemoryPaarTyp): LernElement[] {
  if (paarTyp === 'kanton-name') return [...KANTONE];
  if (paarTyp === 'bild-name') return [...PAESSE, ...BERGE, ...SAGENORTE];
  return [...GEMEINDEN];
}

function kartenVorderseite(
  karte: MemoryKarte,
  featureFuer: (id: string) => GemeindeFeature | undefined,
  zelle: number,
) {
  const el = ELEMENT_MAP.get(karte.elementId);
  if (!el) return null;
  const schrift = Math.max(10, Math.min(18, Math.round(zelle * 0.2)));
  const bildSrc = karte.seite === 'bild' ? el.bild : karte.seite === 'wappen' ? el.wappen : undefined;
  if (bildSrc) {
    return <img src={bildSrc} alt={el.name} className="h-[82%] w-[82%] object-contain" />;
  }
  if (karte.seite === 'umriss') {
    const f = featureFuer(el.id);
    if (!f) {
      return (
        <span className="px-1 text-center font-display font-extrabold leading-tight" style={{ fontSize: schrift }}>
          {el.name}
        </span>
      );
    }
    return <UmrissBild feature={f} titel={`Umriss von ${el.name}`} className="h-[82%] w-[82%]" />;
  }
  return (
    <span className="px-1 text-center font-display font-extrabold leading-tight" style={{ fontSize: schrift }}>
      {el.name}
      {el.kategorie === 'kanton' && zelle >= 64 ? (
        <span className="mt-0.5 block font-bold text-ink/60" style={{ fontSize: Math.max(9, schrift - 4) }}>
          {el.geo}
        </span>
      ) : null}
    </span>
  );
}

function gemeindeFeature(id: string, daten: NonNullable<ReturnType<typeof useGeoDaten>['daten']>) {
  const el = ELEMENT_MAP.get(id);
  if (!el || el.kategorie !== 'gemeinde') return undefined;
  return daten.gemeinden.features.find((f) => f.properties.bfs === Number(el.geo));
}

export function Memory({ onZurueck }: MemoryProps) {
  const { daten, fehler, laden } = useGeoDaten();
  const { fortschritt, antwortRichtig, merkeMemoryZuege, profiFreigeschaltet } = useFortschrittStore();
  const reduziert = useReducedMotion();

  const [phase, setPhase] = useState<'setup' | 'spiel' | 'fertig'>('setup');
  const [paarTyp, setPaarTyp] = useState<MemoryPaarTyp>('wappen-name');
  const [groesse, setGroesse] = useState<MemoryGroesse>('4x4');
  const [spielModus, setSpielModus] = useState<SpielModus>('solo');
  const [karten, setKarten] = useState<MemoryKarte[]>([]);
  const [offen, setOffen] = useState<string[]>([]);
  const [gefunden, setGefunden] = useState<Set<string>>(new Set());
  const [zuege, setZuege] = useState(0);
  const [sperre, setSperre] = useState(false);
  const [hinweis, setHinweis] = useState<string | null>(null);
  const [spieler, setSpieler] = useState<0 | 1>(0);
  const [punkte, setPunkte] = useState<[number, number]>([0, 0]);
  const [startMs, setStartMs] = useState<number | null>(null);
  const [dauerMs, setDauerMs] = useState(0);
  const letzterSpruch = useRef<string | null>(null);
  const feldRef = useRef<HTMLDivElement>(null);
  const [feld, setFeld] = useState({ w: 0, h: 0 });

  const pool = useMemo(() => poolFuer(paarTyp), [paarTyp]);
  const maxPaare = Math.min(MEMORY_GROESSEN[groesse].paare, pool.length);
  const raster = memoryRaster(karten.length, groesse);
  const paareGefunden = gefunden.size / 2;
  const allePaare = karten.length / 2;
  const abstand = feld.w < 480 ? 4 : feld.w < 900 ? 6 : 8;
  const zelle = memoryZellenGroesse(feld.w, feld.h, raster.spalten, raster.zeilen, abstand);
  const schild = Math.max(16, Math.round(zelle * 0.34));

  useEffect(() => {
    if (phase !== 'spiel') return;
    const el = feldRef.current;
    if (!el) return;
    const messen = (breite: number, hoehe: number) => {
      const w = Math.floor(breite);
      const h = Math.floor(hoehe);
      setFeld((alt) => (alt.w === w && alt.h === h ? alt : { w, h }));
    };
    messen(el.clientWidth, el.clientHeight);
    const ro = new ResizeObserver((eintraege) => {
      const r = eintraege[0]?.contentRect;
      if (r) messen(r.width, r.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [phase]);

  useEffect(() => {
    if (phase !== 'spiel' || startMs === null || paareGefunden >= allePaare) return;
    const t = window.setInterval(() => setDauerMs(Date.now() - startMs), 250);
    return () => window.clearInterval(t);
  }, [phase, startMs, paareGefunden, allePaare]);

  const starte = () => {
    const elemente = waehleMemoryElemente(pool, fortschritt, maxPaare);
    setKarten(baueMemoryKarten(elemente, paarTyp));
    setOffen([]);
    setGefunden(new Set());
    setZuege(0);
    setSperre(false);
    setHinweis(null);
    setSpieler(0);
    setPunkte([0, 0]);
    setStartMs(null);
    setDauerMs(0);
    setPhase('spiel');
  };

  const featureFuer = (id: string) => (daten ? gemeindeFeature(id, daten) : undefined);

  const deckeAuf = (karte: MemoryKarte) => {
    if (sperre || gefunden.has(karte.id) || offen.includes(karte.id)) return;
    if (offen.length >= 2) return;
    if (startMs === null) setStartMs(Date.now());

    const naechste = [...offen, karte.id];
    setOffen(naechste);
    if (naechste.length < 2) return;

    const a = karten.find((k) => k.id === naechste[0]);
    const b = karten.find((k) => k.id === naechste[1]);
    if (!a || !b) return;

    setZuege((z) => z + 1);
    if (!istMemoryPaar(a, b)) {
      setSperre(true);
      window.setTimeout(() => {
        setOffen([]);
        setSperre(false);
        if (spielModus === 'duell') setSpieler((p) => (p === 0 ? 1 : 0));
      }, 800);
      return;
    }

    const el = ELEMENT_MAP.get(a.elementId);
    antwortRichtig(a.elementId);
    const neuGefunden = new Set([...gefunden, a.id, b.id]);
    setGefunden(neuGefunden);
    setOffen([]);
    if (spielModus === 'duell') {
      setPunkte((p) => {
        const kopie: [number, number] = [p[0], p[1]];
        kopie[spieler] += 1;
        return kopie;
      });
    }
    const spruch = el?.wappenTipp
      ? el.wappenTipp
      : waehleSpruch(SPRUECHE, 'richtig', letzterSpruch.current, 'lia').text;
    if (!el?.wappenTipp) letzterSpruch.current = spruch;
    setHinweis(el ? `${el.name}: ${spruch}` : spruch);

    if (neuGefunden.size >= karten.length) {
      merkeMemoryZuege(zuege + 1);
      setDauerMs(startMs ? Date.now() - startMs : dauerMs);
      window.setTimeout(() => setPhase('fertig'), 700);
    }
  };

  const sterne = memorySterne(zuege, allePaare || 1);
  const duellGewinner = punkte[0] === punkte[1] ? null : punkte[0] > punkte[1] ? 0 : 1;

  if (laden) return <LadeBildschirm />;
  if (fehler || !daten) return <FehlerBildschirm meldung={`Fehler: ${fehler}`} onZurueck={onZurueck} />;

  if (phase === 'setup') {
    return (
      <Bildschirm>
        <Header titel="Memory" leitfarbe="koralle" onZurueck={onZurueck} />
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 p-4">
          <Begleitung name="lia" pose="zeigt" text="Drehe zwei Karten um – findest du das Paar?" />

          <section className="space-y-2">
            <h2 className="font-display text-xl font-extrabold">Paare</h2>
            <div className="flex flex-col gap-3">
              {(
                [
                  { id: 'wappen-name' as const, label: 'Wappen ↔ Name' },
                  { id: 'wappen-umriss' as const, label: 'Wappen ↔ Umriss' },
                  { id: 'kanton-name' as const, label: 'Kantonswappen ↔ Name' },
                  ...(profiFreigeschaltet
                    ? [{ id: 'bild-name' as const, label: 'Bild ↔ Name' }]
                    : []),
                ]
              ).map((option) => (
                <ComicButton
                  key={option.id}
                  variante={paarTyp === option.id ? 'primaer' : option.id === 'bild-name' ? 'profi' : 'neutral'}
                  fullWidth
                  onClick={() => setPaarTyp(option.id)}
                >
                  {option.label}
                </ComicButton>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-xl font-extrabold">Grösse</h2>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(MEMORY_GROESSEN) as MemoryGroesse[]).map((g) => {
                const zuGross = MEMORY_GROESSEN[g].paare > pool.length;
                return (
                  <ComicButton
                    key={g}
                    variante={groesse === g ? 'primaer' : 'neutral'}
                    disabled={zuGross}
                    onClick={() => setGroesse(g)}
                    className="px-2 text-lg"
                  >
                    {GROESSEN_LABEL[g]}
                  </ComicButton>
                );
              })}
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-xl font-extrabold">Wer spielt?</h2>
            <div className="grid grid-cols-2 gap-3">
              <ComicButton
                variante={spielModus === 'solo' ? 'primaer' : 'neutral'}
                fullWidth
                onClick={() => setSpielModus('solo')}
              >
                Solo
              </ComicButton>
              <ComicButton
                variante={spielModus === 'duell' ? 'primaer' : 'neutral'}
                fullWidth
                onClick={() => setSpielModus('duell')}
              >
                Duell
              </ComicButton>
            </div>
          </section>

          <ComicButton fullWidth icon={<IconKarten />} onClick={starte}>
            Los gehts
          </ComicButton>
        </div>
      </Bildschirm>
    );
  }

  if (phase === 'fertig') {
    const endeText =
      spielModus === 'duell'
        ? duellGewinner === null
          ? 'Unentschieden! Beide sind stark.'
          : `Spieler ${duellGewinner + 1} gewinnt mit ${punkte[duellGewinner]} Paaren!`
        : `Fertig in ${zuege} Zügen und ${formatiereZeit(dauerMs)}.`;

    return (
      <Bildschirm>
        <Header titel="Memory" leitfarbe="koralle" onZurueck={onZurueck} />
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-5 p-4">
          <Begleitung name="lia" pose="jubelt" text={endeText} />
          {spielModus === 'solo' ? (
            <div className="flex gap-2" aria-label={`${sterne} von 3 Sternen`}>
              {[1, 2, 3].map((n) => (
                <IconStern key={n} gefuellt={n <= sterne} className={n <= sterne ? 'h-10 w-10 text-gold' : 'h-10 w-10 text-neu-grau'} />
              ))}
            </div>
          ) : (
            <p className="font-display text-2xl font-extrabold">
              {punkte[0]} : {punkte[1]}
            </p>
          )}
          <div className="flex w-full flex-col gap-3">
            <ComicButton fullWidth onClick={starte}>
              Noch einmal
            </ComicButton>
            <ComicButton fullWidth variante="neutral" onClick={() => setPhase('setup')}>
              Andere Runde
            </ComicButton>
          </div>
        </div>
      </Bildschirm>
    );
  }

  return (
    <Bildschirm className="h-dvh min-h-0 overflow-hidden">
      <Header
        titel="Memory"
        leitfarbe="koralle"
        klebend={false}
        onZurueck={() => {
          setPhase('setup');
          setKarten([]);
        }}
      />
      <div className="mx-auto flex min-h-0 w-full max-w-[1400px] flex-1 flex-col gap-2 overflow-hidden px-3 py-2">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 font-display text-base font-bold sm:text-lg">
          {spielModus === 'solo' ? (
            <p>
              Züge {zuege} · Zeit {formatiereZeit(dauerMs)}
            </p>
          ) : (
            <p>
              Spieler {spieler + 1} ist dran · {punkte[0]} : {punkte[1]}
            </p>
          )}
          <p>
            {paareGefunden}/{allePaare} Paare
          </p>
        </div>

        <p className="line-clamp-2 min-h-8 shrink-0 rounded-comic border-comic-sm border-ink bg-weiss px-3 py-1.5 text-base shadow-comic">
          {hinweis ?? 'Zwei gleiche gehören zusammen.'}
        </p>

        <div ref={feldRef} className="flex min-h-0 min-w-0 flex-1 items-center justify-center">
          {zelle > 0 ? (
            <div
              className="grid"
              style={{
                width: zelle * raster.spalten + abstand * (raster.spalten - 1),
                height: zelle * raster.zeilen + abstand * (raster.zeilen - 1),
                gridTemplateColumns: `repeat(${raster.spalten}, ${zelle}px)`,
                gridTemplateRows: `repeat(${raster.zeilen}, ${zelle}px)`,
                gap: abstand,
              }}
            >
              {karten.map((karte) => {
                const istOffen = offen.includes(karte.id) || gefunden.has(karte.id);
                return (
                  <motion.button
                    key={karte.id}
                    type="button"
                    disabled={sperre && !istOffen}
                    onClick={() => deckeAuf(karte)}
                    className={cn(
                      'flex h-full w-full min-h-0 min-w-0 items-center justify-center overflow-hidden rounded-comic border-comic border-ink',
                      'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-uri-gelb',
                      gefunden.has(karte.id) ? 'bg-alp-gruen/20' : istOffen ? 'bg-weiss' : 'bg-uri-gelb',
                    )}
                    whileTap={reduziert ? undefined : { scale: 0.96 }}
                    aria-label={istOffen ? ELEMENT_MAP.get(karte.elementId)?.name : 'Verdeckte Karte'}
                  >
                    {istOffen ? (
                      kartenVorderseite(karte, featureFuer, zelle)
                    ) : (
                      <span className="inline-flex text-ink" style={{ width: schild, height: schild }}>
                        <IconSchild className="!h-full !w-full" />
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </Bildschirm>
  );
}
