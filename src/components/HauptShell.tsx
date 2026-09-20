import { Bildschirm } from './StatusSeite';
import { Header } from './ui/Header';
import { TabLeiste } from './ui/TabLeiste';
import { Fortschrittskarte } from './Fortschrittskarte';
import { SpieleScreen, type SpieleScreenProps } from './SpieleScreen';
import { StickerAlbum } from './StickerAlbum';
import { Profil } from './Profil';
import type { HauptTab } from '../types/navigation';
import type { MissionArt } from '../logic/mission';

export interface HauptShellProps extends SpieleScreenProps {
  tab: HauptTab;
  onTabWechsel: (tab: HauptTab) => void;
  onWeiterUeben: () => void;
  onMission: (art: MissionArt) => void;
  onJetztUeben: (elementId: string) => void;
  onUeben: (elementId: string) => void;
}

export function HauptShell({
  tab,
  onTabWechsel,
  onWeiterUeben,
  onMission,
  onJetztUeben,
  onUeben,
  ...spiele
}: HauptShellProps) {
  return (
    <Bildschirm className="pb-[calc(3.75rem+env(safe-area-inset-bottom))]">
      <Header titel="Uri-Entdecker" logoSrc="/logo/uri-entdecker-logo.svg" leitfarbe="uri-gelb" />

      <main className="flex-1">
        {tab === 'karte' ? (
          <Fortschrittskarte
            onWeiterUeben={onWeiterUeben}
            onMission={onMission}
            onJetztUeben={onJetztUeben}
          />
        ) : null}
        {tab === 'spiele' ? <SpieleScreen {...spiele} /> : null}
        {tab === 'album' ? <StickerAlbum eingebettet /> : null}
        {tab === 'profil' ? <Profil eingebettet onUeben={onUeben} /> : null}
      </main>

      <TabLeiste aktiv={tab} onWechsel={onTabWechsel} />
    </Bildschirm>
  );
}
