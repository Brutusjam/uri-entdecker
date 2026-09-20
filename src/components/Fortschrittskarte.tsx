import { useEffect, useMemo, useState } from 'react';
import { UriKarte } from './UriKarte';
import { InfoPanel } from './InfoPanel';
import { FehlerBildschirm, LadeBildschirm } from './StatusSeite';
import { ProgressBar } from './ui/ProgressBar';
import { ComicButton } from './ui/ComicButton';
import { Begleitung } from './ui/Begleitung';
import { Badge } from './ui/Badge';
import { FortschrittLegende } from './ui/FortschrittLegende';
import { IconCheck, IconStern, IconSuche } from './ui/icons';
import { useGeoDaten } from '../hooks/useGeoDaten';
import { GEMEINDEN } from '../data/gemeinden';
import { KANTONE } from '../data/kantone';
import { GEWAESSER } from '../data/gewaesser';
import { TAELER } from '../data/taeler';
import { PAESSE } from '../data/paesse';
import { BERGE } from '../data/berge';
import { SAGENORTE } from '../data/sagenorte';
import { ELEMENT_MAP } from '../data/elemente';
import { SPRUECHE } from '../data/sprueche';
import { useFortschrittStore } from '../store/fortschritt';
import { istGemeistert, istGutGelernt, stufeLabel } from '../logic/leitner';
import { waehleSpruch } from '../logic/sprueche';
import { waehleWeiterUebenZiel } from '../logic/fragen';
import { TAELER_GEO } from '../logic/taeler';
import { levelVonXp } from '../logic/level';
import {
  missionErledigt,
  missionFortschritt,
  missionStandFuerTag,
  tagesMissionen,
  type MissionArt,
} from '../logic/mission';
import type { FortschrittEbene, LeitnerStufe } from '../types/fortschritt';
import type { KartenBlick, KartenEbenen, LernElement, PunktArt } from '../types/karte';

interface FortschrittskarteProps {
  onWeiterUeben: () => void;
  onMission: (art: MissionArt) => void;
  onJetztUeben: (elementId: string) => void;
}

const EBENEN: {
  id: FortschrittEbene;
  label: string;
  elemente: LernElement[];
  kartenEbenen: KartenEbenen[];
  blick: KartenBlick;
  punktArten: PunktArt[];
  profi?: boolean;
}[] = [
  { id: 'gemeinden', label: 'Gemeinden', elemente: GEMEINDEN, kartenEbenen: ['kantone', 'gemeinden', 'seen'], blick: 'uri', punktArten: [] },
  { id: 'kantone', label: 'Kantone', elemente: KANTONE, kartenEbenen: ['kantone', 'seen'], blick: 'nachbarn', punktArten: [] },
  { id: 'gewaesser', label: 'Täler & Seen', elemente: [...TAELER, ...GEWAESSER], kartenEbenen: ['kantone', 'gemeinden', 'seen'], blick: 'uri', punktArten: [] },
  {
    id: 'passe-berge',
    label: 'Pässe & Berge',
    elemente: [...PAESSE, ...BERGE],
    kartenEbenen: ['kantone', 'gemeinden', 'seen', 'punkte'],
    blick: 'nachbarn',
    punktArten: ['pass', 'berg'],
    profi: true,
  },
  {
    id: 'sagen',
    label: 'Sagen',
    elemente: SAGENORTE,
    kartenEbenen: ['kantone', 'gemeinden', 'seen', 'punkte'],
    blick: 'nachbarn',
    punktArten: ['sagenort'],
    profi: true,
  },
];

export function Fortschrittskarte({ onWeiterUeben, onMission, onJetztUeben }: FortschrittskarteProps) {
  const { daten, fehler, laden } = useGeoDaten();
  const fortschritt = useFortschrittStore((s) => s.fortschritt);
  const name = useFortschrittStore((s) => s.name);
  const xp = useFortschrittStore((s) => s.xp);
  const mission = useFortschrittStore((s) => s.mission);
  const profiFrei = useFortschrittStore((s) => s.profiFreigeschaltet);
  const level = levelVonXp(xp);
  const missionStand = missionStandFuerTag(mission);
  const missionen = tagesMissionen();
  const alleMissionen = missionen.every((m) => missionErledigt(m, missionStand));
  const [ebene, setEbene] = useState<FortschrittEbene>('gemeinden');
  const [auswahlId, setAuswahlId] = useState<string | null>(null);
  const begruessung = useMemo(() => {
    if (name) return { text: `Hallo ${name}! Du bist ${level.titel}.` };
    return waehleSpruch(SPRUECHE, 'begruessung', null, 'lia');
  }, [name, level.titel]);

  const weiterZiel = useMemo(
    () => waehleWeiterUebenZiel(fortschritt),
    [fortschritt],
  );

  const sichtbareEbenen = EBENEN.filter((e) => !e.profi || profiFrei);
  const aktiveEbene = sichtbareEbenen.find((e) => e.id === ebene) ?? sichtbareEbenen[0]!;

  useEffect(() => {
    if (!profiFrei && (ebene === 'passe-berge' || ebene === 'sagen')) {
      setEbene('gemeinden');
      setAuswahlId(null);
    }
  }, [profiFrei, ebene]);
  const aktiveElemente = aktiveEbene.elemente;

  const fortschrittStufen = useMemo(() => {
    const stufen: Record<string, LeitnerStufe> = {};
    for (const el of aktiveElemente) {
      stufen[el.id] = (fortschritt[el.id]?.stufe ?? 0) as LeitnerStufe;
    }
    return stufen;
  }, [aktiveElemente, fortschritt]);

  const gutGelernt = aktiveElemente.filter((e) => istGutGelernt(fortschritt[e.id]?.stufe ?? 0)).length;
  const element = auswahlId ? (ELEMENT_MAP.get(auswahlId) ?? null) : null;
  const stufe = auswahlId ? (fortschritt[auswahlId]?.stufe ?? 0) : 0;

  if (laden) return <LadeBildschirm />;
  if (fehler || !daten) return <FehlerBildschirm meldung={`Fehler: ${fehler}`} />;

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 p-4 lg:flex-row lg:items-start lg:min-h-0">
      <div className="flex flex-col gap-3 lg:w-[65%]">
        <ProgressBar wert={gutGelernt} max={aktiveElemente.length} label={aktiveEbene.label} />

        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Karten-Ebenen">
          {sichtbareEbenen.map((e) => (
            <ComicButton
              key={e.id}
              role="tab"
              aria-selected={ebene === e.id}
              variante={ebene === e.id ? 'primaer' : 'neutral'}
              onClick={() => {
                setEbene(e.id);
                setAuswahlId(null);
              }}
            >
              {e.label}
            </ComicButton>
          ))}
        </div>

        <div className="h-[clamp(220px,42dvh,480px)] overflow-hidden rounded-comic-lg border-comic border-ink bg-sky shadow-comic lg:h-[clamp(280px,50dvh,520px)]">
          <UriKarte
            daten={daten}
            ebenen={[...aktiveEbene.kartenEbenen]}
            blick={aktiveEbene.blick}
            fortschrittStufen={fortschrittStufen}
            fortschrittEbene={aktiveEbene.id}
            onAuswahl={(a) => setAuswahlId(a?.id ?? null)}
            taeler={aktiveEbene.id === 'gewaesser' ? TAELER_GEO : []}
            talAktivId={auswahlId?.startsWith('tal-') ? auswahlId : null}
            punktArten={aktiveEbene.punktArten}
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
          <div className="space-y-3">
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
          </div>
        ) : (
          <Begleitung name="lia" pose="neutral" text={begruessung.text} />
        )}

        <ComicButton fullWidth icon={<IconSuche />} onClick={onWeiterUeben}>
          Weiter üben: {weiterZiel.name}
        </ComicButton>

        <div className="rounded-comic-lg border-comic border-ink bg-weiss p-4 shadow-comic">
          <h2 className="font-display text-xl font-extrabold">Heute</h2>
          <ul className="mt-2 space-y-2">
            {missionen.map((m) => {
              const fertig = missionErledigt(m, missionStand);
              const stand = missionFortschritt(m, missionStand);
              return (
                <li key={m.art}>
                  <button
                    type="button"
                    onClick={() => onMission(m.art)}
                    className="flex min-h-12 w-full items-center justify-between gap-2 rounded-comic border-comic-sm border-ink bg-paper px-3 text-left font-display text-base font-bold hover:bg-uri-gelb focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-uri-gelb"
                  >
                    <span>
                      {m.text} ({stand}/{m.ziel})
                    </span>
                    {fertig ? <IconCheck className="h-6 w-6 text-alp-gruen" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
          {alleMissionen ? (
            <p className="mt-2 font-display text-lg">Alle drei geschafft – stark!</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
