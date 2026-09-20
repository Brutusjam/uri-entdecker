import { useEffect, useMemo, useRef, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { motion, useReducedMotion } from 'framer-motion';
import { UmrissBild } from '../components/UmrissBild';
import { Bildschirm, FehlerBildschirm, LadeBildschirm } from '../components/StatusSeite';
import { Header } from '../components/ui/Header';
import { Begleitung } from '../components/ui/Begleitung';
import { ComicButton } from '../components/ui/ComicButton';
import { IconPuzzle, IconStern } from '../components/ui/icons';
import { useGeoDaten } from '../hooks/useGeoDaten';
import { NACHBAR_KUERZEL } from '../data/kantone';
import { ELEMENT_MAP } from '../data/elemente';
import { SPRUECHE } from '../data/sprueche';
import { mitD3Windung } from '../logic/karte';
import {
  formatiereZeit,
  istKleinesPuzzleTeil,
  puzzleBestKey,
  puzzleSterne,
  teilSitzt,
  type PuzzleStufe,
  type PuzzleVariante,
} from '../logic/puzzle';
import { waehleSpruch } from '../logic/sprueche';
import { mische } from '../logic/zufall';
import { useFortschrittStore } from '../store/fortschritt';
import { cn } from '../components/ui/cn';
import type { Feature, Geometry } from 'geojson';
import type { GemeindeFeature, GeoDaten, KantonFeature, LernElement } from '../types/karte';

interface PuzzleProps {
  onZurueck: () => void;
}

const PAD = 20;
const STUFEN_TEXT: Record<PuzzleStufe, string> = {
  leicht: 'Grenzen sichtbar, mit Namen',
  mittel: 'Nur Umriss, mit Namen',
  profi: 'Nur Umriss, mit Wappen',
};

interface PuzzleTeil {
  id: string;
  name: string;
  wappen?: string;
  geo: string;
  feature: Feature<Geometry>;
  d: string;
  centroid: [number, number];
  klein: boolean;
}

function teileFeatures(daten: GeoDaten, variante: PuzzleVariante): Feature<Geometry>[] {
  if (variante === 'gemeinden') return daten.gemeinden.features;
  const erlaubt = new Set<string>(['UR', ...NACHBAR_KUERZEL]);
  return daten.kantone.features.filter((f) => erlaubt.has(f.properties.kuerzel));
}

function elementZuFeature(variante: PuzzleVariante, f: Feature<Geometry>): LernElement | undefined {
  if (variante === 'gemeinden') {
    return ELEMENT_MAP.get(`gem-${(f as GemeindeFeature).properties.bfs}`);
  }
  return ELEMENT_MAP.get(`kt-${(f as KantonFeature).properties.kuerzel}`);
}

function clientNachBrett(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  breite: number,
  hoehe: number,
): [number, number] {
  if (rect.width <= 0 || rect.height <= 0) return [0, 0];
  return [((clientX - rect.left) / rect.width) * breite, ((clientY - rect.top) / rect.height) * hoehe];
}

export function Puzzle({ onZurueck }: PuzzleProps) {
  const { daten, fehler, laden } = useGeoDaten();
  const { antwortRichtig, puzzleBest, merkePuzzleZeit } = useFortschrittStore();
  const reduziert = useReducedMotion() ?? false;

  const [phase, setPhase] = useState<'setup' | 'spiel' | 'fertig'>('setup');
  const [variante, setVariante] = useState<PuzzleVariante>('gemeinden');
  const [stufe, setStufe] = useState<PuzzleStufe>('leicht');
  const [teile, setTeile] = useState<PuzzleTeil[]>([]);
  const [offen, setOffen] = useState<string[]>([]);
  const [platziert, setPlatziert] = useState<Set<string>>(new Set());
  const [fehleProTeil, setFehleProTeil] = useState<Record<string, number>>({});
  const [fehlversuche, setFehlversuche] = useState(0);
  const [blinkId, setBlinkId] = useState<string | null>(null);
  const [hinweis, setHinweis] = useState('Zieh die Teile in den Umriss.');
  const [startMs, setStartMs] = useState<number | null>(null);
  const startRef = useRef<number | null>(null);
  const [dauerMs, setDauerMs] = useState(0);
  const [ziehe, setZiehe] = useState<{ id: string; x: number; y: number } | null>(null);
  const [schuettler, setSchuettler] = useState<string | null>(null);
  const [brett, setBrett] = useState({ w: 400, h: 420 });
  const brettRef = useRef<HTMLDivElement>(null);
  const letzterSpruch = useRef<string | null>(null);

  const schluessel = puzzleBestKey(variante, stufe);
  const bestzeit = puzzleBest?.[schluessel];
  const zeigeNamen = stufe !== 'profi';
  const zeigeWappen = stufe === 'profi';
  const zeigeInnengrenzen = stufe === 'leicht';

  useEffect(() => {
    if (phase !== 'spiel') return;
    const el = brettRef.current;
    if (!el) return;
    const messen = () => {
      const r = el.getBoundingClientRect();
      const w = Math.max(1, Math.floor(r.width));
      const h = Math.max(1, Math.floor(r.height));
      setBrett((alt) => (alt.w === w && alt.h === h ? alt : { w, h }));
    };
    messen();
    const ro = new ResizeObserver(messen);
    ro.observe(el);
    return () => ro.disconnect();
  }, [phase]);

  const geoTeile = useMemo(
    () => (daten ? teileFeatures(daten, variante) : []),
    [daten, variante],
  );

  const umrissFeature = useMemo(() => {
    if (!daten || variante !== 'gemeinden') return null;
    return daten.kantone.features.find((f) => f.properties.kuerzel === 'UR') ?? null;
  }, [daten, variante]);

  const path = useMemo(() => {
    const fit =
      umrissFeature ?? { type: 'FeatureCollection' as const, features: geoTeile };
    const projection = geoMercator().fitExtent(
      [
        [PAD, PAD],
        [brett.w - PAD, brett.h - PAD],
      ],
      fit,
    );
    return geoPath(projection);
  }, [umrissFeature, geoTeile, brett]);

  const baueTeile = useMemo((): PuzzleTeil[] => {
    return geoTeile.flatMap((f) => {
      const el = elementZuFeature(variante, f);
      if (!el) return [];
      const gezeichnet = mitD3Windung(f);
      const d = path(gezeichnet) ?? '';
      const c = path.centroid(gezeichnet);
      return [
        {
          id: el.id,
          name: el.name,
          wappen: el.wappen,
          geo: el.geo,
          feature: f,
          d,
          centroid: [c[0], c[1]],
          klein: istKleinesPuzzleTeil(variante, el.geo),
        },
      ];
    });
  }, [geoTeile, path, variante]);

  const teileMap = useMemo(() => new Map(teile.map((t) => [t.id, t])), [teile]);

  useEffect(() => {
    if (phase !== 'spiel' || startMs === null || platziert.size >= teile.length || teile.length === 0) return;
    const t = window.setInterval(() => setDauerMs(Date.now() - startMs), 250);
    return () => window.clearInterval(t);
  }, [phase, startMs, platziert.size, teile.length]);

  const starteUhr = () => {
    if (startRef.current !== null) return;
    const jetzt = Date.now();
    startRef.current = jetzt;
    setStartMs(jetzt);
  };

  const starte = () => {
    setTeile([]);
    setOffen([]);
    setPlatziert(new Set());
    setFehleProTeil({});
    setFehlversuche(0);
    setBlinkId(null);
    setHinweis('Zieh die Teile in den Umriss.');
    startRef.current = null;
    setStartMs(null);
    setDauerMs(0);
    setZiehe(null);
    setPhase('spiel');
  };

  useEffect(() => {
    if (phase !== 'spiel' || baueTeile.length === 0) return;
    setTeile((alt) => {
      if (alt.length === 0) return mische(baueTeile);
      const neu = new Map(baueTeile.map((t) => [t.id, t]));
      return alt.map((t) => neu.get(t.id) ?? t);
    });
  }, [phase, baueTeile]);

  useEffect(() => {
    if (phase !== 'spiel') return;
    if (teile.length > 0 && offen.length === 0 && platziert.size === 0) {
      setOffen(teile.map((t) => t.id));
    }
  }, [phase, teile, offen.length, platziert.size]);

  const beendeWennFertig = (neuPlatziert: Set<string>, dauer: number) => {
    if (neuPlatziert.size < teile.length || teile.length === 0) return;
    merkePuzzleZeit(schluessel, dauer);
    setDauerMs(dauer);
    window.setTimeout(() => setPhase('fertig'), 500);
  };

  const drop = (clientX: number, clientY: number, id: string) => {
    const teil = teileMap.get(id);
    const el = brettRef.current;
    if (!teil || !el) {
      setZiehe(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    const punkt = clientNachBrett(clientX, clientY, rect, brett.w, brett.h);
    const imBrett =
      clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;

    if (imBrett && teilSitzt(punkt, teil.centroid, brett.w, teil.klein)) {
      starteUhr();
      antwortRichtig(teil.id);
      const neu = new Set(platziert);
      neu.add(teil.id);
      setPlatziert(neu);
      setOffen((o) => o.filter((x) => x !== teil.id));
      setBlinkId((b) => (b === teil.id ? null : b));
      setHinweis(`${teil.name} sitzt! Noch ${teile.length - neu.size}.`);
      setZiehe(null);
      const dauer = (startRef.current ? Date.now() - startRef.current : 0);
      beendeWennFertig(neu, dauer);
      return;
    }

    const neuFehl = fehlversuche + 1;
    const proTeil = (fehleProTeil[id] ?? 0) + 1;
    setFehlversuche(neuFehl);
    setFehleProTeil((alt) => ({ ...alt, [id]: proTeil }));
    setZiehe(null);
    setSchuettler(id);
    window.setTimeout(() => setSchuettler(null), 400);
    const spruch = waehleSpruch(SPRUECHE, 'falsch', letzterSpruch.current, 'stierli');
    letzterSpruch.current = spruch.text;
    if (proTeil >= 2) {
      setBlinkId(id);
      setHinweis('Schau, dort blinkt die richtige Stelle!');
    } else {
      setHinweis(spruch.text);
    }
  };

  const sterne = puzzleSterne(fehlversuche, dauerMs, teile.length || 1);
  const umrissD = umrissFeature ? (path(mitD3Windung(umrissFeature)) ?? '') : '';

  if (laden) return <LadeBildschirm />;
  if (fehler || !daten) return <FehlerBildschirm meldung={`Fehler: ${fehler}`} onZurueck={onZurueck} />;

  if (phase === 'setup') {
    return (
      <Bildschirm>
        <Header titel="Puzzle" leitfarbe="alp-gruen" onZurueck={onZurueck} />
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 p-4">
          <Begleitung name="stierli" pose="zeigt" text="Leg die Teile in den Umriss – ohne Drehen!" />

          <section className="space-y-2">
            <h2 className="font-display text-xl font-extrabold">Was puzzeln?</h2>
            <div className="grid grid-cols-2 gap-3">
              <ComicButton
                variante={variante === 'gemeinden' ? 'primaer' : 'neutral'}
                fullWidth
                onClick={() => setVariante('gemeinden')}
              >
                Gemeinden
              </ComicButton>
              <ComicButton
                variante={variante === 'kantone' ? 'primaer' : 'neutral'}
                fullWidth
                onClick={() => setVariante('kantone')}
              >
                Kantone
              </ComicButton>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-xl font-extrabold">Stufe</h2>
            <div className="flex flex-col gap-3">
              {(['leicht', 'mittel', 'profi'] as const).map((s) => (
                <ComicButton
                  key={s}
                  variante={stufe === s ? 'primaer' : 'neutral'}
                  fullWidth
                  onClick={() => setStufe(s)}
                >
                  {s[0]!.toUpperCase() + s.slice(1)} · {STUFEN_TEXT[s]}
                </ComicButton>
              ))}
            </div>
          </section>

          {bestzeit !== undefined ? (
            <p className="font-display text-lg">Bestzeit: {formatiereZeit(bestzeit)}</p>
          ) : null}

          <ComicButton fullWidth icon={<IconPuzzle />} onClick={starte}>
            Los gehts
          </ComicButton>
        </div>
      </Bildschirm>
    );
  }

  if (phase === 'fertig') {
    return (
      <Bildschirm>
        <Header titel="Puzzle" leitfarbe="alp-gruen" onZurueck={onZurueck} />
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-5 p-4">
          <Begleitung
            name="lia"
            pose="jubelt"
            text={`Fertig in ${formatiereZeit(dauerMs)} – ${fehlversuche === 0 ? 'ohne Fehlversuch!' : `${fehlversuche} Fehlversuche.`}`}
          />
          <div className="flex gap-2" aria-label={`${sterne} von 3 Sternen`}>
            {[1, 2, 3].map((n) => (
              <IconStern
                key={n}
                gefuellt={n <= sterne}
                className={n <= sterne ? 'h-10 w-10 text-gold' : 'h-10 w-10 text-neu-grau'}
              />
            ))}
          </div>
          {bestzeit !== undefined ? (
            <p className="font-display text-lg">Bestzeit: {formatiereZeit(Math.min(bestzeit, dauerMs))}</p>
          ) : null}
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

  const aktiv = ziehe ? teileMap.get(ziehe.id) : null;
  const brettRect = brettRef.current?.getBoundingClientRect();

  return (
    <Bildschirm className="h-dvh min-h-0 overflow-hidden">
      <Header
        titel="Puzzle"
        leitfarbe="alp-gruen"
        klebend={false}
        onZurueck={() => {
          setPhase('setup');
          setTeile([]);
          setZiehe(null);
        }}
      />
      <div className="mx-auto flex min-h-0 w-full max-w-[1400px] flex-1 flex-col gap-2 overflow-hidden px-3 py-2">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 font-display text-base font-bold sm:text-lg">
          <p>
            Zeit {formatiereZeit(dauerMs)} · Fehler {fehlversuche}
          </p>
          <p>
            {platziert.size}/{teile.length} Teile
          </p>
        </div>
        <p className="line-clamp-2 min-h-8 shrink-0 rounded-comic border-comic-sm border-ink bg-weiss px-3 py-1.5 text-base shadow-comic">
          {hinweis}
        </p>

        <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row">
          <div
            ref={brettRef}
            className="relative min-h-[42vh] flex-1 overflow-hidden rounded-comic-lg border-comic border-ink bg-sky shadow-comic lg:min-h-0"
          >
            <svg
              width={brett.w}
              height={brett.h}
              className="h-full w-full touch-none"
              role="img"
              aria-label={variante === 'gemeinden' ? 'Umriss des Kantons Uri' : 'Umriss der Nachbarkantone'}
            >
              <rect width={brett.w} height={brett.h} fill="var(--color-sky)" />
              {umrissD ? (
                <path
                  d={umrissD}
                  fill="var(--color-wiese)"
                  fillOpacity={0.35}
                  stroke="var(--color-ink)"
                  strokeWidth={3}
                />
              ) : null}
              {variante === 'kantone' &&
                baueTeile.map((t) => (
                  <path
                    key={`hg-${t.id}`}
                    d={t.d}
                    fill="var(--color-wiese)"
                    fillOpacity={0.4}
                    stroke={zeigeInnengrenzen ? 'var(--color-ink)' : 'none'}
                    strokeOpacity={0.35}
                    strokeWidth={1.2}
                  />
                ))}
              {zeigeInnengrenzen &&
                teile.map((t) =>
                  platziert.has(t.id) ? null : (
                    <path
                      key={`slot-${t.id}`}
                      data-teil={t.id}
                      d={t.d}
                      fill="none"
                      stroke="var(--color-ink)"
                      strokeOpacity={0.35}
                      strokeWidth={1.2}
                    />
                  ),
                )}
              {teile
                .filter((t) => platziert.has(t.id))
                .map((t) => (
                  <path
                    key={`fest-${t.id}`}
                    d={t.d}
                    fill="var(--color-alp-gruen)"
                    stroke="var(--color-ink)"
                    strokeWidth={1.5}
                  />
                ))}
              {blinkId && teileMap.get(blinkId) && !platziert.has(blinkId) ? (
                <path
                  d={teileMap.get(blinkId)!.d}
                  fill="var(--color-uri-gelb)"
                  fillOpacity={0.7}
                  stroke="var(--color-ink)"
                  strokeWidth={2.5}
                  className="karte-gesucht"
                />
              ) : null}
              {variante === 'gemeinden' &&
                [...daten.urnersee.features, ...daten.goescheneralpsee.features].map((f, i) => (
                  <path
                    key={`see-${i}`}
                    d={path(mitD3Windung(f)) ?? ''}
                    fill="var(--color-see-blau)"
                    fillOpacity={0.7}
                    stroke="var(--color-ink)"
                    strokeWidth={1}
                    pointerEvents="none"
                  />
                ))}
            </svg>
          </div>

          <div className="flex min-h-0 max-h-[38vh] flex-col gap-2 overflow-y-auto lg:max-h-none lg:w-[34%] lg:shrink-0">
            <p className="font-display text-lg font-extrabold">Teile</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {offen.map((id) => {
                const t = teileMap.get(id);
                if (!t) return null;
                const kante = t.klein ? 64 : 48;
                return (
                  <motion.button
                    key={id}
                    type="button"
                    aria-label={t.name}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.currentTarget.setPointerCapture(e.pointerId);
                      starteUhr();
                      setZiehe({ id, x: e.clientX, y: e.clientY });
                    }}
                    onPointerMove={(e) => {
                      if (!ziehe || ziehe.id !== id) return;
                      setZiehe({ id, x: e.clientX, y: e.clientY });
                    }}
                    onPointerUp={(e) => {
                      if (ziehe?.id === id) drop(e.clientX, e.clientY, id);
                    }}
                    onPointerCancel={() => setZiehe(null)}
                    onContextMenu={(e) => e.preventDefault()}
                    className={cn(
                      'flex touch-none select-none flex-col items-center justify-center gap-1 rounded-comic border-comic border-ink bg-weiss p-1 shadow-comic',
                      'cursor-grab active:cursor-grabbing',
                      'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-uri-gelb',
                      ziehe?.id === id && 'opacity-40',
                      schuettler === id && 'animate-comic-shake',
                    )}
                    style={{ minHeight: kante, minWidth: kante }}
                    whileTap={reduziert ? undefined : { scale: 0.97 }}
                  >
                    <UmrissBild feature={t.feature} className="h-10 w-10" titel={t.name} />
                    {zeigeNamen ? (
                      <span className="w-full px-0.5 text-center font-display text-sm font-extrabold leading-tight [overflow-wrap:anywhere]">
                        {t.name}
                      </span>
                    ) : null}
                    {zeigeWappen && t.wappen ? (
                      <img src={t.wappen} alt="" className="h-8 w-8 object-contain" />
                    ) : null}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {aktiv && brettRect ? (
        <svg
          className="pointer-events-none fixed z-50"
          style={{
            left: brettRect.left,
            top: brettRect.top,
            width: brettRect.width,
            height: brettRect.height,
          }}
          viewBox={`0 0 ${brett.w} ${brett.h}`}
          aria-hidden
        >
          <g
            transform={`translate(${clientNachBrett(ziehe!.x, ziehe!.y, brettRect, brett.w, brett.h)[0] - aktiv.centroid[0]} ${clientNachBrett(ziehe!.x, ziehe!.y, brettRect, brett.w, brett.h)[1] - aktiv.centroid[1]})`}
          >
            <path
              d={aktiv.d}
              fill="var(--color-uri-gelb)"
              fillOpacity={0.9}
              stroke="var(--color-ink)"
              strokeWidth={2}
            />
          </g>
        </svg>
      ) : null}
      {aktiv && zeigeNamen ? (
        <div
          className="pointer-events-none fixed z-50 rounded-pill border-comic-sm border-ink bg-weiss px-3 py-1 font-display text-base font-extrabold shadow-comic"
          style={{ left: ziehe!.x + 18, top: ziehe!.y + 18 }}
        >
          {aktiv.name}
        </div>
      ) : null}
    </Bildschirm>
  );
}
