import { useEffect, useMemo, useState } from 'react';
import { UriKarte } from './UriKarte';
import { InfoPanel } from './InfoPanel';
import { Bildschirm, FehlerBildschirm, LadeBildschirm } from './StatusSeite';
import { ProgressBar } from './ui/ProgressBar';
import { ComicButton } from './ui/ComicButton';
import { Badge } from './ui/Badge';
import { Header } from './ui/Header';
import { FortschrittLegende } from './ui/FortschrittLegende';
import { IconStern, IconSuche } from './ui/icons';
import { useGeoDaten } from '../hooks/useGeoDaten';
import { ELEMENT_MAP } from '../data/elemente';
import { sichtbareKategorien } from '../data/kategorien';
import { useFortschrittStore } from '../store/fortschritt';
import { istGemeistert, istGutGelernt, stufeLabel } from '../logic/leitner';
import { TAELER_GEO } from '../logic/taeler';
import type { LeitnerStufe } from '../types/fortschritt';
import type { Kategorie } from '../types/karte';

interface FortschrittskarteProps {
  onZurueck: () => void;
  onJetztUeben: (elementId: string) => void;
}

export function Fortschrittskarte({ onZurueck, onJetztUeben }: FortschrittskarteProps) {
  const { daten, fehler, laden } = useGeoDaten();
  const fortschritt = useFortschrittStore((s) => s.fortschritt);
  const profiFrei = useFortschrittStore((s) => s.profiFreigeschaltet);
  const [gruppe, setGruppe] = useState<Kategorie>('gemeinde');
  const [auswahlId, setAuswahlId] = useState<string | null>(null);

  const sichtbar = sichtbareKategorien(profiFrei);
  const aktiv = sichtbar.find((k) => k.id === gruppe) ?? sichtbar[0]!;

  useEffect(() => {
    if (!profiFrei && (gruppe === 'pass' || gruppe === 'berg' || gruppe === 'sagenort')) {
      setGruppe('gemeinde');
      setAuswahlId(null);
    }
  }, [profiFrei, gruppe]);

  const aktiveElemente = aktiv.elemente;

  const fortschrittStufen = useMemo(() => {
    const stufen: Record<string, LeitnerStufe> = {};
    for (const el of aktiveElemente) {
      stufen[el.id] = (fortschritt[el.id]?.stufe ?? 0) as LeitnerStufe;
    }
    return stufen;
  }, [aktiveElemente, fortschritt]);

  const gutGelernt = aktiveElemente.filter((e) =>
    istGutGelernt((fortschritt[e.id]?.stufe ?? 0) as LeitnerStufe),
  ).length;
  const element = auswahlId ? (ELEMENT_MAP.get(auswahlId) ?? null) : null;
  const stufe = auswahlId ? ((fortschritt[auswahlId]?.stufe ?? 0) as LeitnerStufe) : 0;

  if (laden) return <LadeBildschirm />;
  if (fehler || !daten) return <FehlerBildschirm meldung={`Fehler: ${fehler}`} onZurueck={onZurueck} />;

  return (
    <Bildschirm>
      <Header titel="Karte mit Fortschritt" leitfarbe="uri-gelb" onZurueck={onZurueck} />

      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 p-4 lg:flex-row lg:items-start">
        <div className="flex flex-col gap-3 lg:w-[65%]">
          <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Lerngruppen">
            {sichtbar.map((k) => (
              <ComicButton
                key={k.id}
                aria-pressed={gruppe === k.id}
                className="shrink-0 text-lg"
                variante={gruppe === k.id ? 'primaer' : k.profi ? 'profi' : 'neutral'}
                onClick={() => {
                  setGruppe(k.id);
                  setAuswahlId(null);
                }}
              >
                {k.titel}
              </ComicButton>
            ))}
          </div>

          <div>
            <ProgressBar wert={gutGelernt} max={aktiveElemente.length} label={aktiv.titel} />
            <p className="mt-1 font-body text-base text-ink/70">{aktiv.erklaerung}</p>
          </div>

          <div className="h-[clamp(220px,42dvh,480px)] overflow-hidden rounded-comic-lg border-comic border-ink bg-sky shadow-comic lg:h-[clamp(280px,50dvh,520px)]">
            <UriKarte
              daten={daten}
              ebenen={[...aktiv.kartenEbenen]}
              blick={aktiv.blick}
              fortschrittStufen={fortschrittStufen}
              fortschrittEbene={aktiv.fortschrittEbene}
              onAuswahl={(a) => setAuswahlId(a?.id ?? null)}
              taeler={aktiv.id === 'gewaesser' ? TAELER_GEO : []}
              talAktivId={auswahlId?.startsWith('tal-') ? auswahlId : null}
              punktArten={aktiv.punktArten}
              reliefSchalter
              zoomAktiv={false}
              scrollFreundlich
              auswahl={
                auswahlId
                  ? {
                      id: auswahlId,
                      kategorie: element?.kategorie ?? 'gemeinde',
                      name: element?.name ?? '',
                    }
                  : null
              }
            />
          </div>

          <FortschrittLegende />
        </div>

        <div className="flex flex-col gap-4 lg:w-[35%] lg:shrink-0">
          {element ? (
            <>
              <InfoPanel element={element} onSchliessen={() => setAuswahlId(null)} />
              <div className="rounded-comic-lg border-comic border-ink bg-weiss p-4 shadow-comic">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variante={istGemeistert(stufe) ? 'gold' : stufe === 0 ? 'neu' : 'erfolg'}>
                    Stufe {stufe}: {stufeLabel(stufe)}
                  </Badge>
                  {istGemeistert(stufe) ? <IconStern gefuellt className="h-6 w-6 text-gold" /> : null}
                </div>
                <p className="mt-2 font-display text-lg">
                  Richtig: {fortschritt[element.id]?.richtig ?? 0} · Falsch:{' '}
                  {fortschritt[element.id]?.falsch ?? 0}
                </p>
                <div className="mt-3">
                  <ComicButton fullWidth onClick={() => onJetztUeben(element.id)} icon={<IconSuche />}>
                    Jetzt üben
                  </ComicButton>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-comic-lg border-comic border-ink bg-weiss p-5 text-center shadow-comic">
              <p className="font-display text-2xl font-extrabold text-ink">Tippe auf die Karte!</p>
              <p className="mt-2 text-lg text-ink/80">
                Die Farbe zeigt, wie gut du einen Ort schon kennst.
              </p>
            </div>
          )}
        </div>
      </div>
    </Bildschirm>
  );
}
