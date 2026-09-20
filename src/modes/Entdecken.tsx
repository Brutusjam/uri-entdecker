import { useMemo, useState } from 'react';
import { UriKarte } from '../components/UriKarte';
import { InfoPanel } from '../components/InfoPanel';
import { Bildschirm, FehlerBildschirm, LadeBildschirm } from '../components/StatusSeite';
import { Header } from '../components/ui/Header';
import { useGeoDaten } from '../hooks/useGeoDaten';
import { ELEMENT_MAP } from '../data/elemente';
import { GEMEINDEN_MAP } from '../data/gemeinden';
import { KANTONE_MAP } from '../data/kantone';
import { GEWAESSER_MAP } from '../data/gewaesser';
import { TAELER_MAP } from '../data/taeler';
import { TAELER_GEO } from '../logic/taeler';
import { kartenModus } from '../logic/fragen';
import type { Kategorie, KartenAuswahl, LernElement } from '../types/karte';

interface EntdeckenProps {
  onZurueck: () => void;
  kategorie?: Kategorie;
}

function zuLernElement(auswahl: KartenAuswahl): LernElement | null {
  if (auswahl.kategorie === 'gemeinde' && auswahl.bfs) {
    return GEMEINDEN_MAP.get(String(auswahl.bfs)) ?? null;
  }
  if (auswahl.kategorie === 'kanton' && auswahl.kuerzel) {
    return KANTONE_MAP.get(auswahl.kuerzel) ?? null;
  }
  if (auswahl.kategorie === 'gewaesser') {
    const seeId = auswahl.id.replace('see-', '');
    return GEWAESSER_MAP.get(seeId) ?? null;
  }
  if (auswahl.kategorie === 'tal') {
    return TAELER_MAP.get(auswahl.id) ?? null;
  }
  return ELEMENT_MAP.get(auswahl.id) ?? null;
}

function einladungFuer(kategorie: Kategorie): string {
  if (kategorie === 'kanton') return 'Entdecke die Nachbarkantone von Uri.';
  if (kategorie === 'gewaesser' || kategorie === 'tal') return 'Entdecke Täler und Seen.';
  if (kategorie === 'pass') return 'Entdecke die Pässe von Uri.';
  if (kategorie === 'berg') return 'Entdecke wichtige Berge.';
  if (kategorie === 'sagenort') return 'Entdecke Orte aus den Sagen. Man erzählt sich …';
  return 'Entdecke Gemeinden und Seen.';
}

export function Entdecken({ onZurueck, kategorie = 'gemeinde' }: EntdeckenProps) {
  const { daten, fehler, laden } = useGeoDaten();
  const [auswahl, setAuswahl] = useState<KartenAuswahl | null>(null);
  const karte = kartenModus(kategorie);

  const element = useMemo(() => (auswahl ? zuLernElement(auswahl) : null), [auswahl]);

  if (laden) return <LadeBildschirm />;
  if (fehler || !daten) {
    return <FehlerBildschirm meldung={`Fehler: ${fehler ?? 'Keine Daten'}`} onZurueck={onZurueck} />;
  }

  return (
    <Bildschirm>
      <Header titel="Entdecken" leitfarbe="alp-gruen" onZurueck={onZurueck} />

      <div className="mx-auto flex w-full max-w-[1400px] min-h-0 flex-1 flex-col gap-4 p-4 lg:flex-row">
        <div className="h-[55vh] min-h-[320px] flex-1 overflow-hidden rounded-comic-lg border-comic border-ink bg-sky shadow-comic lg:h-auto lg:w-[65%]">
          <UriKarte
            daten={daten}
            auswahl={auswahl}
            onAuswahl={setAuswahl}
            ebenen={karte.ebenen}
            blick={karte.blick}
            taeler={karte.talOderSee ? TAELER_GEO : []}
            talAktivId={auswahl?.kategorie === 'tal' ? auswahl.id : null}
            punktArten={karte.punktArten}
            reliefSchalter
          />
        </div>
        <div className="min-h-[200px] overflow-y-auto lg:w-[35%] lg:shrink-0 lg:self-stretch">
          <InfoPanel
            element={element}
            leerHinweis={einladungFuer(kategorie)}
            onSchliessen={() => setAuswahl(null)}
          />
        </div>
      </div>
    </Bildschirm>
  );
}
