import { useCallback, useEffect, useRef, useState } from 'react';
import taelerRoh from '../data/taeler.json' with { type: 'json' };
import { UriKarte } from '../components/UriKarte';
import { Bildschirm, FehlerBildschirm, LadeBildschirm } from '../components/StatusSeite';
import { Header } from '../components/ui/Header';
import { ComicButton } from '../components/ui/ComicButton';
import { Badge } from '../components/ui/Badge';
import { cn } from '../components/ui/cn';
import { useGeoDaten } from '../hooks/useGeoDaten';
import {
  findeTalAnPunkt,
  istTalFertig,
  leereTaeler,
  parseTaelerDatei,
  TAL_PUFFER_KM,
  TAELER_SPEICHER_KEY,
  talKatalogHinweis,
  taelerJson,
  type Koordinate,
  type TalGeo,
} from '../logic/taeler';

type EditorModus = 'linie' | 'label' | 'pruefen';

function startTaeler(): TalGeo[] {
  const ausApp = parseTaelerDatei(taelerRoh).taeler;
  try {
    const roh = localStorage.getItem(TAELER_SPEICHER_KEY);
    if (roh) {
      const lokal = parseTaelerDatei(JSON.parse(roh)).taeler;
      if (lokal.filter(istTalFertig).length >= ausApp.filter(istTalFertig).length) return lokal;
    }
  } catch {
    /* Entwurf ungültig – Datei aus dem Repo */
  }
  return ausApp;
}

function talStand(tal: TalGeo): 'leer' | 'begonnen' | 'fertig' {
  if (istTalFertig(tal)) return 'fertig';
  if (tal.linie.length > 0 || tal.label) return 'begonnen';
  return 'leer';
}

function modusText(modus: EditorModus, name: string): string {
  if (modus === 'label') return `Tippe hin, wo «${name}» stehen soll.`;
  if (modus === 'pruefen') {
    return `Tippe auf die Karte: liegt der Punkt im gelben Band (${TAL_PUFFER_KM} km)?`;
  }
  return 'Tippe entlang des Talbodens. Ziehen verschiebt die Karte.';
}

export function TalEditor() {
  const { daten, fehler, laden } = useGeoDaten();
  const dateiRef = useRef<HTMLInputElement>(null);
  const [taeler, setTaeler] = useState<TalGeo[]>(startTaeler);
  const [aktivId, setAktivId] = useState(taeler[0]?.id ?? 'tal-riemenstaldnertal');
  const [modus, setModus] = useState<EditorModus>('linie');
  const [pufferAn, setPufferAn] = useState(true);
  const [pruefText, setPruefText] = useState<string | null>(null);
  const [meldung, setMeldung] = useState<string | null>(null);

  const aktiv = taeler.find((t) => t.id === aktivId) ?? taeler[0];
  const fertigZahl = taeler.filter(istTalFertig).length;

  useEffect(() => {
    localStorage.setItem(TAELER_SPEICHER_KEY, taelerJson(taeler));
  }, [taeler]);

  const setzeTal = useCallback((id: string, patch: Partial<TalGeo>) => {
    setTaeler((alt) => alt.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const onKlick = useCallback(
    (lng: number, lat: number) => {
      const punkt: Koordinate = [lng, lat];
      if (modus === 'pruefen') {
        const treffer = findeTalAnPunkt(lng, lat, taeler);
        setPruefText(treffer ? `Treffer: ${treffer.name}` : 'Kein Tal an diesem Punkt.');
        return;
      }
      if (!aktiv) return;
      setPruefText(null);
      if (modus === 'label') {
        setzeTal(aktiv.id, { label: punkt });
        return;
      }
      setzeTal(aktiv.id, { linie: [...aktiv.linie, punkt] });
    },
    [aktiv, modus, setzeTal, taeler],
  );

  const herunterladen = () => {
    const blob = new Blob([taelerJson(taeler)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'taeler.json';
    a.click();
    URL.revokeObjectURL(url);
    setMeldung('Datei gespeichert. Lege sie als src/data/taeler.json ins Projekt.');
  };

  const dateiLaden = async (datei: File) => {
    try {
      const text = await datei.text();
      setTaeler(parseTaelerDatei(JSON.parse(text)).taeler);
      setMeldung(`«${datei.name}» geladen.`);
      setPruefText(null);
    } catch {
      setMeldung('Diese Datei ist kein gültiges taeler.json.');
    }
  };

  if (laden) return <LadeBildschirm />;
  if (fehler || !daten) {
    return <FehlerBildschirm meldung={`Fehler: ${fehler ?? 'Keine Daten'}`} />;
  }
  if (!aktiv) return <FehlerBildschirm meldung="Kein Tal im Katalog." />;

  return (
    <Bildschirm>
      <Header
        titel="Tal-Editor"
        leitfarbe="uri-gelb"
        onZurueck={() => {
          window.location.assign('/');
        }}
      />

      <div className="mx-auto flex w-full max-w-[1400px] min-h-0 flex-1 flex-col gap-4 p-4 lg:flex-row">
        <div className="flex min-h-0 flex-1 flex-col gap-3 lg:w-[65%]">
          <p className="text-lg font-semibold text-ink">{modusText(modus, aktiv.name)}</p>
          <div className="relative h-[50vh] min-h-[280px] flex-1 overflow-hidden rounded-comic-lg border-comic border-ink bg-sky shadow-comic">
            <UriKarte
              daten={daten}
              ebenen={['kantone', 'gemeinden', 'seen']}
              taeler={taeler}
              talAktivId={aktiv.id}
              talPufferAnzeigen={pufferAn}
              talEditor
              talNamen
              reliefSchalter
              onKlickKoordinate={onKlick}
            />
            {pruefText ? (
              <div className="pointer-events-none absolute bottom-3 left-3 rounded-pill border-comic-sm border-ink bg-weiss px-3 py-1 font-display text-lg font-extrabold text-ink shadow-comic">
                {pruefText}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto lg:w-[35%] lg:shrink-0">
          <div className="rounded-comic-lg border-comic border-ink bg-weiss p-4 shadow-comic">
            <p className="font-display text-xl font-extrabold text-ink">
              {fertigZahl} von {taeler.length} Tälern fertig
            </p>
            <p className="mt-1 text-base text-ink/70">
              Linie plus Name. Der Entwurf bleibt auf diesem Gerät.
            </p>
            <ul className="mt-3 space-y-2">
              {taeler.map((tal) => {
                const stand = talStand(tal);
                return (
                  <li key={tal.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setAktivId(tal.id);
                        setPruefText(null);
                        if (tal.linie.length < 2) setModus('linie');
                        else if (!tal.label) setModus('label');
                      }}
                      className={cn(
                        'flex min-h-12 w-full items-center justify-between gap-2 rounded-comic border-comic-sm border-ink px-3 py-2 text-left',
                        'font-display text-lg font-extrabold',
                        tal.id === aktiv.id ? 'bg-uri-gelb text-ink' : 'bg-paper text-ink hover:bg-weiss',
                      )}
                    >
                      <span className="truncate">{tal.name}</span>
                      <Badge
                        variante={stand === 'fertig' ? 'erfolg' : stand === 'begonnen' ? 'warnung' : 'neu'}
                      >
                        {stand === 'fertig' ? 'fertig' : stand === 'begonnen' ? 'offen' : 'leer'}
                      </Badge>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-comic-lg border-comic border-ink bg-weiss p-4 shadow-comic">
            <p className="font-display text-xl font-extrabold text-ink">{aktiv.name}</p>
            <p className="mt-1 text-base font-semibold text-ink/80">{talKatalogHinweis(aktiv.id)}</p>
            <p className="mt-1 text-base text-ink/60">
              {aktiv.linie.length === 1 ? '1 Punkt' : `${aktiv.linie.length} Punkte`}
              {aktiv.label ? ' · Name gesetzt' : ' · noch kein Name'}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <ComicButton variante={modus === 'linie' ? 'primaer' : 'neutral'} onClick={() => setModus('linie')}>
                Linie
              </ComicButton>
              <ComicButton variante={modus === 'label' ? 'primaer' : 'neutral'} onClick={() => setModus('label')}>
                Name
              </ComicButton>
              <ComicButton
                variante={modus === 'pruefen' ? 'sekundaer' : 'neutral'}
                onClick={() => {
                  setModus('pruefen');
                  setPruefText(null);
                }}
              >
                Treffer prüfen
              </ComicButton>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <ComicButton
                variante="neutral"
                disabled={aktiv.linie.length === 0}
                onClick={() => setzeTal(aktiv.id, { linie: aktiv.linie.slice(0, -1) })}
              >
                Letzter Punkt weg
              </ComicButton>
              <ComicButton variante="neutral" disabled={aktiv.linie.length === 0} onClick={() => setzeTal(aktiv.id, { linie: [] })}>
                Linie löschen
              </ComicButton>
              <ComicButton variante="neutral" disabled={!aktiv.label} onClick={() => setzeTal(aktiv.id, { label: null })}>
                Name löschen
              </ComicButton>
            </div>

            <label className="mt-3 flex min-h-12 cursor-pointer items-center gap-3 text-lg font-semibold text-ink">
              <input
                type="checkbox"
                checked={pufferAn}
                onChange={(e) => setPufferAn(e.target.checked)}
                className="h-6 w-6 accent-uri-gelb"
              />
              Gelbes Band zeigen
            </label>
          </div>

          <div className="rounded-comic-lg border-comic border-ink bg-weiss p-4 shadow-comic">
            <div className="flex flex-wrap gap-2">
              <ComicButton onClick={herunterladen}>Herunterladen</ComicButton>
              <ComicButton variante="sekundaer" onClick={() => dateiRef.current?.click()}>
                Datei öffnen
              </ComicButton>
              <ComicButton variante="neutral" onClick={() => setTaeler(parseTaelerDatei(taelerRoh).taeler)}>
                Aus App laden
              </ComicButton>
              <ComicButton
                variante="neutral"
                onClick={() => {
                  if (!window.confirm('Alle Täler auf diesem Gerät löschen?')) return;
                  setTaeler(leereTaeler());
                  setPruefText(null);
                }}
              >
                Alles leeren
              </ComicButton>
            </div>
            <input
              ref={dateiRef}
              type="file"
              accept="application/json"
              className="sr-only"
              onChange={(e) => {
                const datei = e.target.files?.[0];
                e.target.value = '';
                if (datei) void dateiLaden(datei);
              }}
            />
            {meldung ? <p className="mt-3 text-base font-semibold text-ink/80">{meldung}</p> : null}
          </div>
        </div>
      </div>
    </Bildschirm>
  );
}
