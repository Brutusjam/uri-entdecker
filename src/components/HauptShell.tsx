import { Bildschirm } from './StatusSeite';
import { Header } from './ui/Header';
import { TabLeiste } from './ui/TabLeiste';
import { StartSeite } from './StartSeite';
import { SpieleScreen } from './SpieleScreen';
import { StickerAlbum } from './StickerAlbum';
import { Profil } from './Profil';
import type { HauptTab } from '../types/navigation';
import type { ModusId } from '../data/modi';
import type { MissionArt } from '../logic/mission';
import type { Kategorie } from '../types/karte';
import { assetUrl } from '../lib/assetUrl';

export interface HauptShellProps {
  tab: HauptTab;
  onTabWechsel: (tab: HauptTab) => void;
  onModus: (id: ModusId) => void;
  onUebenKategorie: (kategorie: Kategorie) => void;
  onKarte: () => void;
  onMission: (art: MissionArt) => void;
  onUeben: (elementId: string) => void;
}

export function HauptShell({
  tab,
  onTabWechsel,
  onModus,
  onUebenKategorie,
  onKarte,
  onMission,
  onUeben,
}: HauptShellProps) {
  return (
    <Bildschirm className="pb-[calc(3.75rem+env(safe-area-inset-bottom))]">
      <Header
        titel="Uri entdecken"
        logoSrc={assetUrl('/logo/uri-entdecker-logo.svg')}
        leitfarbe="uri-gelb"
        onLogo={() => onTabWechsel('start')}
      />

      <main className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain">
        {tab === 'start' ? (
          <StartSeite
            onUeben={onUebenKategorie}
            onUebenElement={onUeben}
            onKarte={onKarte}
            onAlleSpiele={() => onTabWechsel('spiele')}
            onModus={onModus}
            onMission={onMission}
          />
        ) : null}
        {tab === 'spiele' ? <SpieleScreen onModus={onModus} /> : null}
        {tab === 'album' ? <StickerAlbum eingebettet /> : null}
        {tab === 'profil' ? <Profil eingebettet onUeben={onUeben} /> : null}
      </main>

      <TabLeiste aktiv={tab} onWechsel={onTabWechsel} />
    </Bildschirm>
  );
}
