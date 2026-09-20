import { useMemo, useState } from 'react';
import { UriKarte } from '../components/UriKarte';
import { InfoPanel } from '../components/InfoPanel';
import { KategorieWahl } from '../components/KategorieWahl';
import { Bildschirm, FehlerBildschirm, LadeBildschirm } from '../components/StatusSeite';
import { Header } from '../components/ui/Header';
import { useFortschrittStore } from '../store/fortschritt';
import { useGeoDaten } from '../hooks/useGeoDaten';
import { ELEMENT_MAP } from '../data/elemente';
import { GEMEINDEN_MAP } from '../data/gemeinden';
import { KANTONE_MAP } from '../data/kantone';
import { GEWAESSER_MAP } from '../data/gewaesser';
import { TAELER_MAP } from '../data/taeler';
import { TAELER_GEO } from '../logic/taeler';
import { kategorieInfo } from '../data/kategorien';
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

export function Entdecken({ onZurueck, kategorie: startKategorie = 'gemeinde' }: EntdeckenProps) {
  const { daten, fehler, laden } = useGeoDaten();
  const profiFreigeschaltet = useFortschrittStore((s) => s.profiFreigeschaltet);
  const [kategorie, setKategorie] = useState<Kategorie>(startKategorie);
  const [auswahl, setAuswahl] = useState<KartenAuswahl | null>(null);
  const karte = kartenModus(kategorie);
  const info = kategorieInfo(kategorie);

  const element = useMemo(() => (auswahl ? zuLernElement(auswahl) : null), [auswahl]);

  if (laden) return <LadeBildschirm />;
  if (fehler || !daten) {
    return <FehlerBildschirm meldung={`Fehler: ${fehler ?? 'Keine Daten'}`} onZurueck={onZurueck} />;
  }

  return (
    <Bildschirm>
      <Header titel="Karte anschauen" leitfarbe="alp-gruen" onZurueck={onZurueck} />

      <div className="mx-auto flex w-full max-w-[1400px] min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4 lg:flex-row lg:items-stretch">
        <div className="flex min-h-0 flex-1 flex-col gap-3 lg:w-[65%]">
          <KategorieWahl
            kompakt
            wert={kategorie}
            onChange={(k) => {
              setKategorie(k);
              setAuswahl(null);
            }}
            profi={profiFreigeschaltet}
            titel="Was anschauen?"
          />
          <div className="min-h-0 flex-1 overflow-hidden rounded-comic-lg border-comic border-ink bg-sky shadow-comic">
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
        </div>
        <div className="min-h-[200px] overflow-y-auto lg:w-[35%] lg:shrink-0 lg:self-stretch">
          <InfoPanel
            element={element}
            leerHinweis={`${info.erklaerung}. ${info.tippHinweis}`}
            onSchliessen={() => setAuswahl(null)}
          />
        </div>
      </div>
    </Bildschirm>
  );
}
