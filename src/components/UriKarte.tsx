import { useCallback, useEffect, useId, useMemo, useRef, useState, type MutableRefObject, type PointerEvent } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { zoom, zoomIdentity, zoomTransform } from 'd3-zoom';
import { select } from 'd3-selection';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import {
  findeFeatureAnPunkt,
  findeKleineGemeindeAnPixel,
  mitD3Windung,
  reliefBildKasten,
} from '../logic/karte';
import { findePunktAnPunkt, punktAlsAuswahl } from '../logic/punkte';
import { findeTalAnPixel, findeTalAnPunkt, liniePfad, talPuffer, type TalGeo } from '../logic/taeler';
import { istNachbarKanton, KARTEN_NACHBARN_KUERZEL } from '../data/kantone';
import { stufeFarbe } from '../logic/leitner';
import { RELIEF } from '../data/relief';
import { cn } from './ui/cn';
import { ComicButton } from './ui/ComicButton';
import { IconBerge } from './ui/icons';
import type { GeoDaten, KartenAuswahl, KartenBlick, KartenEbenen, PunktArt } from '../types/karte';
import type { FortschrittEbene, LeitnerStufe } from '../types/fortschritt';

interface UriKarteProps {
  daten: GeoDaten;
  ebenen?: KartenEbenen[];
  auswahl?: KartenAuswahl | null;
  onAuswahl?: (auswahl: KartenAuswahl | null) => void;
  className?: string;
  fortschrittStufen?: Record<string, LeitnerStufe>;
  fortschrittEbene?: FortschrittEbene | null;
  highlightIds?: string[];
  blinkId?: string | null;
  blick?: KartenBlick;
  /** Täler als gelbes Band (Editor und Lernmodus). */
  taeler?: TalGeo[];
  talAktivId?: string | null;
  talPufferAnzeigen?: boolean;
  /** Punkte und Linie zum Zeichnen (Tal-Editor). */
  talEditor?: boolean;
  /** Namen an den Label-Punkten. In Finden aus, damit die Lösung nicht sichtbar ist. */
  talNamen?: boolean;
  /** Nach richtigem Beschriften: Namen auf der Karte. */
  etiketten?: { id: string; name: string }[];
  /** Liefert Treffer ohne Klick – für Drag & Drop. */
  trefferRef?: MutableRefObject<((clientX: number, clientY: number) => KartenAuswahl | null) | null>;
  /** Klick liefert WGS84 statt Feature-Auswahl (Tal-Editor). */
  onKlickKoordinate?: (lng: number, lat: number) => void;
  /** Welche Punktsymbole (Pässe, Berge, Sagenorte) aktiv sind. */
  punktArten?: PunktArt[];
  /** Zeigt den Schalter für die swisstopo-Reliefebene. */
  reliefSchalter?: boolean;
  /** Startzustand, wenn der Schalter da ist (sonst immer aus). */
  reliefStart?: boolean;
  /** Pan/Zoom per Finger – auf scrollenden Screens aus. */
  zoomAktiv?: boolean;
  /** Erlaubt vertikales Scrollen der Seite über der Karte (Startbildschirm). */
  scrollFreundlich?: boolean;
}

const PAD = 24;
const TAP_SCHWELLE = 12;

const FARBE = {
  himmel: 'var(--color-sky)',
  wiese: 'var(--color-wiese)',
  ink: 'var(--color-ink)',
  nachbar: 'var(--color-nachbar-grau)',
  schweiz: 'var(--color-schweiz-grau)',
  see: 'var(--color-see-blau)',
  seeDunkel: 'var(--color-see-blau-dunkel)',
  gelb: 'var(--color-uri-gelb)',
  weiss: 'var(--color-weiss)',
  gold: 'var(--color-gold)',
  lila: 'var(--color-sagen-lila)',
} as const;

/** Wie eng der Startblick auf Uri sitzt. Kleiner = stärkerer Zoom. */
const URI_ZOOM_PAD = 1.7;

export function UriKarte({
  daten,
  ebenen = ['kantone', 'gemeinden', 'seen'],
  auswahl,
  onAuswahl,
  className = '',
  fortschrittStufen,
  fortschrittEbene,
  highlightIds = [],
  blinkId,
  blick = 'uri',
  taeler = [],
  talAktivId = null,
  talPufferAnzeigen = true,
  talEditor = false,
  talNamen = true,
  etiketten = [],
  trefferRef,
  onKlickKoordinate,
  punktArten = [],
  reliefSchalter = false,
  reliefStart = true,
  zoomAktiv = true,
  scrollFreundlich = false,
}: UriKarteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const clipId = `relief-clip-${useId().replace(/:/g, '')}`;
  const [reliefAn, setReliefAn] = useState(reliefSchalter && reliefStart);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const [groesse, setGroesse] = useState({ w: 400, h: 500 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setGroesse({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const projection = useMemo(() => {
    const kuerzel =
      blick === 'nachbarn' ? new Set<string>(KARTEN_NACHBARN_KUERZEL) : null;
    const features = kuerzel
      ? daten.kantone.features.filter((f) => kuerzel.has(f.properties.kuerzel))
      : daten.kantone.features;
    const gebiet: FeatureCollection<Geometry> = {
      type: 'FeatureCollection',
      features: features.length > 0 ? features : daten.kantone.features,
    };
    return geoMercator().fitExtent(
      [
        [PAD, PAD],
        [groesse.w - PAD, groesse.h - PAD],
      ],
      gebiet,
    );
  }, [daten, groesse, blick]);

  const path = useMemo(() => geoPath(projection), [projection]);
  const zeichne = (f: Feature<Geometry>) => path(mitD3Windung(f)) ?? '';
  const reliefKasten = useMemo(() => reliefBildKasten(projection, RELIEF.bbox), [projection]);
  const uriKanton = useMemo(
    () => daten.kantone.features.find((f) => f.properties.kuerzel === 'UR'),
    [daten],
  );

  const uriBlick = useMemo(() => {
    if (!uriKanton) return zoomIdentity;
    const [[x0, y0], [x1, y1]] = path.bounds(mitD3Windung(uriKanton));
    const dx = Math.max(x1 - x0, 1);
    const dy = Math.max(y1 - y0, 1);
    const k = Math.min(groesse.w / (dx * URI_ZOOM_PAD), groesse.h / (dy * URI_ZOOM_PAD));
    return zoomIdentity
      .translate(groesse.w / 2 - k * ((x0 + x1) / 2), groesse.h / 2 - k * ((y0 + y1) / 2))
      .scale(k);
  }, [path, groesse, uriKanton]);

  const startBlick = useMemo(
    () => (blick === 'nachbarn' ? zoomIdentity : uriBlick),
    [blick, uriBlick],
  );

  useEffect(() => {
    const svg = svgRef.current;
    const g = gRef.current;
    if (!svg || !g) return;
    const sel = select(svg);
    if (!zoomAktiv) {
      select(g).attr('transform', startBlick.toString());
      sel.on('.zoom', null);
      return;
    }
    const z = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.85, 18])
      .on('zoom', (event) => {
        select(g).attr('transform', event.transform.toString());
      });
    sel.call(z);
    sel.call(z.transform, startBlick);
    return () => {
      sel.on('.zoom', null);
    };
  }, [startBlick, zoomAktiv]);

  const kartenTransform = useCallback(
    (svg: SVGSVGElement) => (zoomAktiv ? zoomTransform(svg) : startBlick),
    [zoomAktiv, startBlick],
  );

  const trefferBei = useCallback(
    (clientX: number, clientY: number): KartenAuswahl | null => {
      const svg = svgRef.current;
      if (!svg) return null;
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const ctm = svg.getScreenCTM()?.inverse();
      if (!ctm) return null;
      const svgP = pt.matrixTransform(ctm);
      const t = kartenTransform(svg);
      const mapX = (svgP.x - t.x) / t.k;
      const mapY = (svgP.y - t.y) / t.k;
      const coords = projection.invert?.([mapX, mapY]);
      if (!coords) return null;
      const [lng, lat] = coords;
      if (ebenen.includes('punkte') && daten.punkte) {
        const liste =
          punktArten.length > 0
            ? daten.punkte.features.filter((p) => punktArten.includes(p.properties.art))
            : daten.punkte.features;
        const punkt = findePunktAnPunkt(lng, lat, liste);
        if (punkt) return punktAlsAuswahl(punkt);
      }
      const gemFeatures = ebenen.includes('gemeinden') ? daten.gemeinden.features : [];
      const seeFeatures =
        ebenen.includes('seen') && ebenen.includes('gemeinden') ? daten.urnersee.features : [];
      let flaeche = findeFeatureAnPunkt(lng, lat, gemFeatures, daten.kantone.features, seeFeatures);
      if (!flaeche && gemFeatures.length > 0) {
        const klein = findeKleineGemeindeAnPixel(mapX, mapY, gemFeatures, (g) => {
          const c = path.centroid(mitD3Windung(g));
          return Number.isFinite(c[0]) && Number.isFinite(c[1]) ? [c[0], c[1]] : null;
        });
        if (klein) {
          flaeche = {
            id: `gem-${klein.properties.bfs}`,
            kategorie: 'gemeinde',
            name: klein.properties.name,
            bfs: klein.properties.bfs,
          };
        }
      }
      if (flaeche?.kategorie === 'gewaesser') return flaeche;
      if (taeler.length > 0) {
        const tal =
          findeTalAnPunkt(lng, lat, taeler) ??
          findeTalAnPixel(mapX, mapY, taeler, (c) => projection(c));
        if (tal) return { id: tal.id, kategorie: 'tal', name: tal.name };
      }
      return flaeche;
    },
    [daten, ebenen, kartenTransform, path, projection, taeler, punktArten],
  );

  useEffect(() => {
    if (!trefferRef) return;
    trefferRef.current = trefferBei;
    return () => {
      trefferRef.current = null;
    };
  }, [trefferBei, trefferRef]);

  const klick = useCallback(
    (clientX: number, clientY: number) => {
      if (onKlickKoordinate) {
        const svg = svgRef.current;
        if (!svg) return;
        const pt = svg.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        const ctm = svg.getScreenCTM()?.inverse();
        if (!ctm) return;
        const svgP = pt.matrixTransform(ctm);
        const t = kartenTransform(svg);
        const mapX = (svgP.x - t.x) / t.k;
        const mapY = (svgP.y - t.y) / t.k;
        const coords = projection.invert?.([mapX, mapY]);
        if (!coords) return;
        onKlickKoordinate(coords[0], coords[1]);
        return;
      }
      if (!onAuswahl) return;
      onAuswahl(trefferBei(clientX, clientY));
    },
    [kartenTransform, onAuswahl, onKlickKoordinate, projection, trefferBei],
  );

  const etikettePos = useCallback(
    (id: string): [number, number] | null => {
      if (id.startsWith('gem-')) {
        const bfs = Number(id.slice(4));
        const f = daten.gemeinden.features.find((g) => g.properties.bfs === bfs);
        if (!f) return null;
        const c = path.centroid(mitD3Windung(f));
        return Number.isFinite(c[0]) ? [c[0], c[1]] : null;
      }
      if (id.startsWith('kt-')) {
        const kuerzel = id.slice(3);
        const f = daten.kantone.features.find((k) => k.properties.kuerzel === kuerzel);
        if (!f) return null;
        const c = path.centroid(mitD3Windung(f));
        return Number.isFinite(c[0]) ? [c[0], c[1]] : null;
      }
      if (id.startsWith('tal-')) {
        const tal = taeler.find((t) => t.id === id);
        if (!tal?.label) return null;
        return projection(tal.label) ?? null;
      }
      if (id === 'see-urnersee') {
        const f = daten.urnersee.features[0];
        if (!f) return null;
        const c = path.centroid(mitD3Windung(f));
        return Number.isFinite(c[0]) ? [c[0], c[1]] : null;
      }
      const punkt = daten.punkte?.features.find((p) => p.properties.id === id);
      if (punkt && punkt.geometry.type === 'Point') {
        return projection(punkt.geometry.coordinates as [number, number]) ?? null;
      }
      return null;
    },
    [daten, path, projection, taeler],
  );

  const handlePointerDown = (e: PointerEvent<SVGSVGElement>) => {
    pointerStart.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: PointerEvent<SVGSVGElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.hypot(dx, dy) > TAP_SCHWELLE) return;
    klick(e.clientX, e.clientY);
  };

  const istHighlight = (id: string) => highlightIds.includes(id);
  const istBlink = (id: string) => blinkId === id;
  const istAktiv = (id: string) => auswahl?.id === id;
  const istGelb = (id: string) => istAktiv(id) || istBlink(id) || istHighlight(id);

  const flaechenKlasse = (id: string) =>
    cn(
      'karte-flaeche',
      istAktiv(id) && 'karte-aktiv',
      istBlink(id) && 'karte-gesucht',
    );

  const gemeindeFill = (id: string) => {
    if (fortschrittEbene === 'gemeinden' && fortschrittStufen) {
      return stufeFarbe(fortschrittStufen[id] ?? 0);
    }
    if (istGelb(id)) return FARBE.gelb;
    return FARBE.wiese;
  };

  const kantonFill = (id: string, kuerzel: string) => {
    if (fortschrittEbene === 'kantone' && fortschrittStufen && (kuerzel === 'UR' || istNachbarKanton(kuerzel))) {
      return stufeFarbe(fortschrittStufen[id] ?? 0);
    }
    if (istGelb(id)) return FARBE.gelb;
    if (kuerzel === 'UR') return FARBE.wiese;
    if (istNachbarKanton(kuerzel)) return FARBE.nachbar;
    return FARBE.schweiz;
  };

  const aktivOverlay = useMemo(() => {
    if (!reliefAn || !auswahl) return null;
    if (auswahl.kategorie === 'gemeinde') {
      if (fortschrittEbene === 'gemeinden') return null;
      return daten.gemeinden.features.find((g) => `gem-${g.properties.bfs}` === auswahl.id) ?? null;
    }
    if (auswahl.kategorie === 'kanton' && auswahl.kuerzel === 'UR') {
      if (fortschrittEbene === 'kantone') return null;
      return uriKanton ?? null;
    }
    return null;
  }, [reliefAn, auswahl, daten, uriKanton, fortschrittEbene]);

  const seeFill = (id: string) => {
    if (fortschrittEbene === 'gewaesser' && fortschrittStufen) {
      const stufe = fortschrittStufen[id] ?? 0;
      if (stufe > 0) return stufeFarbe(stufe);
    }
    if (istBlink(id) || istHighlight(id)) return FARBE.gelb;
    return FARBE.see;
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative h-full w-full',
        scrollFreundlich ? 'touch-pan-y' : 'touch-none',
        className,
      )}
    >
      <svg
        ref={svgRef}
        width={groesse.w}
        height={groesse.h}
        className={
          onKlickKoordinate
            ? 'cursor-crosshair'
            : zoomAktiv
              ? 'cursor-grab active:cursor-grabbing'
              : 'cursor-pointer'
        }
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        role="img"
        aria-label="Karte der Schweiz, Blick auf den Kanton Uri"
      >
        <defs>
          <pattern
            id="nachbar-schraffur"
            patternUnits="userSpaceOnUse"
            width="8"
            height="8"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="8"
              stroke={FARBE.ink}
              strokeWidth="0.7"
              strokeOpacity="0.12"
            />
          </pattern>
          <pattern id="see-wellen" patternUnits="userSpaceOnUse" width="22" height="12">
            <path
              d="M0 8 Q5.5 3 11 8 T22 8"
              fill="none"
              stroke={FARBE.weiss}
              strokeWidth="1.3"
              strokeOpacity="0.45"
            />
          </pattern>
          {reliefAn && uriKanton ? (
            <clipPath id={clipId}>
              <path d={zeichne(uriKanton)} />
            </clipPath>
          ) : null}
        </defs>

        <rect width={groesse.w} height={groesse.h} fill={FARBE.himmel} />
        <g opacity="0.55" fill={FARBE.weiss} pointerEvents="none">
          <ellipse cx={groesse.w * 0.12} cy={36} rx="42" ry="16" />
          <ellipse cx={groesse.w * 0.18} cy={32} rx="28" ry="14" />
          <ellipse cx={groesse.w * 0.86} cy={48} rx="38" ry="15" />
          <ellipse cx={groesse.w * 0.92} cy={44} rx="22" ry="12" />
        </g>

        <g ref={gRef} transform={startBlick.toString()} style={{ isolation: 'isolate' }}>
          {ebenen.includes('kantone') &&
            daten.kantone.features.map((f) => {
              const id = `kt-${f.properties.kuerzel}`;
              const istUri = f.properties.kuerzel === 'UR';
              return (
                <g key={id}>
                  <path
                    d={zeichne(f)}
                    fill={kantonFill(id, f.properties.kuerzel)}
                    stroke={FARBE.ink}
                    strokeOpacity={istUri ? 1 : 0.45}
                    strokeWidth={istUri ? 3 : 1.25}
                    vectorEffect="non-scaling-stroke"
                    pointerEvents="visibleFill"
                    className={flaechenKlasse(id)}
                  />
                  {istNachbarKanton(f.properties.kuerzel) && !istAktiv(id) ? (
                    <path
                      d={zeichne(f)}
                      fill="url(#nachbar-schraffur)"
                      pointerEvents="none"
                    />
                  ) : null}
                </g>
              );
            })}

          {ebenen.includes('seen') &&
            daten.vierwaldstaettersee.features.map((f) => (
              <path
                key="see-vierwaldstaettersee"
                d={zeichne(f)}
                fill={FARBE.see}
                fillOpacity={0.22}
                stroke={FARBE.seeDunkel}
                strokeOpacity={0.4}
                strokeWidth={0.8}
                vectorEffect="non-scaling-stroke"
                pointerEvents="none"
              />
            ))}

          {ebenen.includes('gemeinden') &&
            daten.gemeinden.features.map((f) => {
              const id = `gem-${f.properties.bfs}`;
              return (
                <path
                  key={id}
                  d={zeichne(f)}
                  fill={gemeindeFill(id)}
                  stroke={FARBE.ink}
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                  pointerEvents="visibleFill"
                  className={flaechenKlasse(id)}
                  aria-label={f.properties.name}
                />
              );
            })}

          {reliefAn && reliefKasten ? (
            <g
              clipPath={`url(#${clipId})`}
              pointerEvents="none"
              opacity={0.72}
              className="karte-relief"
            >
              <image
                href={RELIEF.src}
                x={reliefKasten.x}
                y={reliefKasten.y}
                width={reliefKasten.width}
                height={reliefKasten.height}
                preserveAspectRatio="none"
              />
            </g>
          ) : null}

          {aktivOverlay ? (
            <path
              d={zeichne(aktivOverlay)}
              fill={FARBE.gelb}
              stroke={FARBE.ink}
              strokeWidth={auswahl?.kategorie === 'kanton' ? 3 : 1.5}
              vectorEffect="non-scaling-stroke"
              pointerEvents="none"
              className="karte-aktiv"
            />
          ) : null}

          {uriKanton && ebenen.includes('kantone') ? (
            <path
              d={zeichne(uriKanton)}
              fill="none"
              stroke={FARBE.ink}
              strokeWidth={3}
              vectorEffect="non-scaling-stroke"
              pointerEvents="none"
            />
          ) : null}

          {ebenen.includes('gemeinden') &&
            fortschrittEbene === 'gemeinden' &&
            daten.gemeinden.features.map((f) => {
              const id = `gem-${f.properties.bfs}`;
              const stufe = fortschrittStufen?.[id] ?? 0;
              if (stufe < 5) return null;
              const [x, y] = path.centroid(f);
              return (
                <text
                  key={`stern-${id}`}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-display"
                  fontSize={14}
                  fontWeight={700}
                  fill={FARBE.gold}
                  stroke={FARBE.weiss}
                  strokeWidth={3}
                  paintOrder="stroke"
                  pointerEvents="none"
                >
                  ★
                </text>
              );
            })}

          {taeler.map((tal) => {
            const aktiv = tal.id === talAktivId || istAktiv(tal.id);
            const blink = istBlink(tal.id);
            const puffer = talPufferAnzeigen ? talPuffer(tal.linie) : null;
            const dLinie = liniePfad(tal.linie, (c) => {
              const p = projection(c);
              return p ? [p[0], p[1]] : null;
            });
            const labelPx = tal.label ? projection(tal.label) : null;
            const fuellFarbe =
              fortschrittEbene === 'gewaesser' && fortschrittStufen
                ? stufeFarbe(fortschrittStufen[tal.id] ?? 0)
                : FARBE.gelb;
            return (
              <g key={tal.id} pointerEvents="none">
                {puffer ? (
                  <path
                    d={zeichne(puffer)}
                    fill={fuellFarbe}
                    fillOpacity={aktiv || blink ? 0.55 : talEditor ? 0.22 : 0.45}
                    stroke={FARBE.ink}
                    strokeOpacity={aktiv || blink ? 0.9 : 0.45}
                    strokeWidth={aktiv || blink ? 2.5 : 1.5}
                    strokeDasharray={talEditor ? undefined : '8 6'}
                    vectorEffect="non-scaling-stroke"
                    className={flaechenKlasse(tal.id)}
                  />
                ) : null}
                {talEditor && dLinie ? (
                  <path
                    d={dLinie}
                    fill="none"
                    stroke={FARBE.ink}
                    strokeWidth={aktiv ? 2.5 : 1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                ) : null}
                {talEditor
                  ? tal.linie.map((c, i) => {
                      const p = projection(c);
                      if (!p) return null;
                      return (
                        <circle
                          key={`${tal.id}-${i}`}
                          cx={p[0]}
                          cy={p[1]}
                          r={aktiv ? 5 : 3.5}
                          fill={FARBE.weiss}
                          stroke={FARBE.ink}
                          strokeWidth={2}
                          vectorEffect="non-scaling-stroke"
                        />
                      );
                    })
                  : null}
                {talNamen && labelPx ? (
                  <>
                    {talEditor ? (
                      <circle
                        cx={labelPx[0]}
                        cy={labelPx[1]}
                        r={aktiv ? 7 : 5.5}
                        fill={FARBE.gold}
                        stroke={FARBE.ink}
                        strokeWidth={2}
                        vectorEffect="non-scaling-stroke"
                      />
                    ) : null}
                    <text
                      x={labelPx[0]}
                      y={labelPx[1] - (talEditor ? 12 : 6)}
                      textAnchor="middle"
                      className="font-display"
                      fontSize={talEditor ? 5 : aktiv || blink ? 4.5 : 3.4}
                      fontWeight={700}
                      fill={FARBE.ink}
                      stroke={FARBE.weiss}
                      strokeWidth={talEditor ? 2 : 1.1}
                      paintOrder="stroke"
                    >
                      {tal.name}
                    </text>
                  </>
                ) : null}
              </g>
            );
          })}

          {ebenen.includes('seen') && (
            <>
              {daten.urnersee.features.map((f) => {
                const id = 'see-urnersee';
                return (
                  <g key={id}>
                    <path
                      d={zeichne(f)}
                      fill={seeFill(id)}
                      stroke={FARBE.ink}
                      strokeWidth={2}
                      vectorEffect="non-scaling-stroke"
                      pointerEvents="visibleFill"
                      className={flaechenKlasse(id)}
                    />
                    <path d={zeichne(f)} fill="url(#see-wellen)" pointerEvents="none" />
                  </g>
                );
              })}
              {daten.goescheneralpsee.features.map((f, i) => (
                <g key={`goescheneralpsee-${i}`}>
                  <path
                    d={zeichne(f)}
                    fill={FARBE.see}
                    stroke={FARBE.ink}
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                    pointerEvents="none"
                  />
                  <path d={zeichne(f)} fill="url(#see-wellen)" pointerEvents="none" />
                </g>
              ))}
            </>
          )}

          {etiketten.map((et) => {
            const pos = etikettePos(et.id);
            if (!pos) return null;
            return (
              <text
                key={`etikett-${et.id}`}
                x={pos[0]}
                y={pos[1]}
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-display"
                fontSize={blick === 'nachbarn' ? 10 : 4}
                fontWeight={700}
                fill={FARBE.ink}
                stroke={FARBE.weiss}
                strokeWidth={blick === 'nachbarn' ? 3 : 1.2}
                paintOrder="stroke"
                pointerEvents="none"
              >
                {et.name}
              </text>
            );
          })}

          {ebenen.includes('punkte') && daten.punkte
            ? daten.punkte.features
                .filter((p) => punktArten.length === 0 || punktArten.includes(p.properties.art))
                .map((p) => {
                  if (p.geometry.type !== 'Point') return null;
                  const pos = projection(p.geometry.coordinates as [number, number]);
                  if (!pos) return null;
                  const id = p.properties.id;
                  const art = p.properties.art;
                  const fuell =
                    fortschrittStufen &&
                    (fortschrittEbene === 'passe-berge' || fortschrittEbene === 'sagen')
                      ? stufeFarbe(fortschrittStufen[id] ?? 0)
                      : art === 'pass'
                        ? FARBE.gelb
                        : art === 'berg'
                          ? FARBE.wiese
                          : FARBE.lila;
                  const aktiv = istAktiv(id) || istBlink(id) || istHighlight(id);
                  return (
                    <g key={id} className={flaechenKlasse(id)} pointerEvents="none">
                      {art === 'berg' ? (
                        <path
                          d={`M ${pos[0]} ${pos[1] - 9} L ${pos[0] + 8} ${pos[1] + 6} L ${pos[0] - 8} ${pos[1] + 6} Z`}
                          fill={fuell}
                          stroke={aktiv ? FARBE.gelb : FARBE.ink}
                          strokeWidth={aktiv ? 3 : 2}
                          vectorEffect="non-scaling-stroke"
                        />
                      ) : (
                        <circle
                          cx={pos[0]}
                          cy={pos[1]}
                          r={art === 'sagenort' ? 8 : 7}
                          fill={fuell}
                          stroke={aktiv ? FARBE.gelb : FARBE.ink}
                          strokeWidth={aktiv ? 3 : 2}
                          vectorEffect="non-scaling-stroke"
                        />
                      )}
                    </g>
                  );
                })
            : null}
        </g>
      </svg>
      {reliefSchalter ? (
        <div className="absolute top-3 right-3 z-10">
          <ComicButton
            variante={reliefAn ? 'primaer' : 'neutral'}
            icon={<IconBerge className="h-7 w-7" />}
            aria-pressed={reliefAn}
            onClick={() => setReliefAn((an) => !an)}
          >
            Berge
          </ComicButton>
        </div>
      ) : null}
      {reliefAn ? (
        <p className="pointer-events-none absolute right-3 bottom-3 rounded-pill border-comic-sm border-ink bg-weiss px-3 py-1 font-body text-base font-semibold text-ink shadow-comic">
          {RELIEF.quelle}
        </p>
      ) : null}
      {auswahl && (
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-pill border-comic-sm border-ink bg-weiss px-3 py-1 font-display text-lg font-extrabold text-ink shadow-comic">
          {auswahl.name}
        </div>
      )}
    </div>
  );
}
