import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Entdecken } from './modes/Entdecken';
import { Finden } from './modes/Finden';
import { Memory } from './modes/Memory';
import { Puzzle } from './modes/Puzzle';
import { WappenQuiz } from './modes/WappenQuiz';
import { Beschriften } from './modes/Beschriften';
import { Blitz } from './modes/Blitz';
import { Pruefung } from './modes/Pruefung';
import { Duell } from './modes/Duell';
import { HauptShell } from './components/HauptShell';
import { Fortschrittskarte } from './components/Fortschrittskarte';
import { FeierOverlay } from './components/FeierOverlay';
import SplashScreen from './components/SplashScreen';
import { PassReise } from './profi/PassReise';
import { GipfelQuiz } from './profi/GipfelQuiz';
import { SagenComic } from './profi/SagenComic';
import { SagenQuiz } from './profi/SagenQuiz';
import { TellPfad } from './profi/TellPfad';
import { Styleguide } from './pages/Styleguide';
import { TalEditor } from './pages/TalEditor';
import { useAssetVorladen } from './hooks/useAssetVorladen';
import { useUebungTicker } from './hooks/useUebungTicker';
import { merkeSplashGesehen, splashSchonGesehen } from './logic/vorladen';
import { ELEMENT_MAP } from './data/elemente';
import { useFortschrittStore } from './store/fortschritt';
import type { ModusId } from './data/modi';
import type { MissionArt } from './logic/mission';
import type { HauptTab } from './types/navigation';
import type { Kategorie } from './types/karte';

type Ansicht =
  | 'haupt'
  | 'karte'
  | 'entdecken'
  | 'finden'
  | 'wappen'
  | 'memory'
  | 'puzzle'
  | 'beschriften'
  | 'blitz'
  | 'pruefung'
  | 'duell'
  | 'pass-reise'
  | 'gipfel'
  | 'sagen'
  | 'sagen-quiz'
  | 'tell-pfad';

function aktuellerPfad(): string {
  return window.location.pathname.replace(/\/+$/, '') || '/';
}

const MISSION_MODUS: Record<MissionArt, ModusId> = {
  finden: 'finden',
  wappen: 'wappen',
  beschriften: 'beschriften',
  memory: 'memory',
  puzzle: 'puzzle',
  blitz: 'blitz',
};

function App() {
  const [ansicht, setAnsicht] = useState<Ansicht>('haupt');
  const [hauptTab, setHauptTab] = useState<HauptTab>('start');
  const [zurueckTab, setZurueckTab] = useState<HauptTab>('start');
  const [findenZiel, setFindenZiel] = useState<string | null>(null);
  const [findenKategorie, setFindenKategorie] = useState<Kategorie>('gemeinde');
  const [entdeckenKategorie, setEntdeckenKategorie] = useState<Kategorie>('gemeinde');
  const [splashSichtbar, setSplashSichtbar] = useState(() => !splashSchonGesehen());
  const { fortschritt } = useAssetVorladen(splashSichtbar);
  const merkeModusGespielt = useFortschrittStore((s) => s.merkeModusGespielt);
  const ruhig = useReducedMotion() ?? false;
  const uebergang = { duration: ruhig ? 0.15 : 0.35 };
  useUebungTicker();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [ansicht, hauptTab]);

  const zurueckHaupt = () => {
    setFindenZiel(null);
    setAnsicht('haupt');
    setHauptTab(zurueckTab);
  };

  const oeffne = (ziel: Ansicht) => {
    setZurueckTab(hauptTab);
    setAnsicht(ziel);
  };

  /** Modus aus Spiele-Liste, Startseite oder Mission starten. */
  const starteModus = (id: ModusId, kategorie?: Kategorie) => {
    merkeModusGespielt(id);
    if (id === 'finden') {
      setFindenZiel(null);
      setFindenKategorie(kategorie ?? 'gemeinde');
    }
    if (id === 'entdecken') setEntdeckenKategorie(kategorie ?? 'gemeinde');
    oeffne(id);
  };

  /** Einzelnes Element gezielt üben (Karte, Profil, Übungstest). */
  const uebeElement = (elementId: string) => {
    merkeModusGespielt('finden');
    setFindenZiel(elementId);
    setFindenKategorie(ELEMENT_MAP.get(elementId)?.kategorie ?? 'gemeinde');
    oeffne('finden');
  };

  if (import.meta.env.DEV) {
    const pfad = aktuellerPfad();
    if (pfad === '/styleguide') return <Styleguide />;
    if (pfad === '/editor') return <TalEditor />;
  }

  return (
    <AnimatePresence mode="wait">
      {splashSichtbar ? (
        <motion.div key="splash" className="fixed inset-0 z-50" exit={{ opacity: 0 }} transition={uebergang}>
          <SplashScreen
            fortschritt={fortschritt}
            onStart={() => {
              merkeSplashGesehen();
              setSplashSichtbar(false);
            }}
          />
        </motion.div>
      ) : (
        <motion.div key="app" className="h-dvh overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={uebergang}>
          <FeierOverlay />
          {ansicht === 'karte' ? (
            <Fortschrittskarte onZurueck={zurueckHaupt} onJetztUeben={uebeElement} />
          ) : ansicht === 'entdecken' ? (
            <Entdecken kategorie={entdeckenKategorie} onZurueck={zurueckHaupt} />
          ) : ansicht === 'finden' ? (
            <Finden
              startElementId={findenZiel}
              startKategorie={findenKategorie}
              onZurueck={zurueckHaupt}
            />
          ) : ansicht === 'wappen' ? (
            <WappenQuiz onZurueck={zurueckHaupt} />
          ) : ansicht === 'memory' ? (
            <Memory onZurueck={zurueckHaupt} />
          ) : ansicht === 'puzzle' ? (
            <Puzzle onZurueck={zurueckHaupt} />
          ) : ansicht === 'beschriften' ? (
            <Beschriften onZurueck={zurueckHaupt} />
          ) : ansicht === 'blitz' ? (
            <Blitz onZurueck={zurueckHaupt} />
          ) : ansicht === 'pruefung' ? (
            <Pruefung onZurueck={zurueckHaupt} onUeben={uebeElement} />
          ) : ansicht === 'duell' ? (
            <Duell onZurueck={zurueckHaupt} />
          ) : ansicht === 'pass-reise' ? (
            <PassReise onZurueck={zurueckHaupt} />
          ) : ansicht === 'gipfel' ? (
            <GipfelQuiz onZurueck={zurueckHaupt} />
          ) : ansicht === 'sagen' ? (
            <SagenComic onZurueck={zurueckHaupt} onQuiz={() => setAnsicht('sagen-quiz')} />
          ) : ansicht === 'sagen-quiz' ? (
            <SagenQuiz onZurueck={zurueckHaupt} />
          ) : ansicht === 'tell-pfad' ? (
            <TellPfad onZurueck={zurueckHaupt} />
          ) : (
            <HauptShell
              tab={hauptTab}
              onTabWechsel={setHauptTab}
              onModus={(id) => starteModus(id)}
              onUebenKategorie={(kategorie) => starteModus('finden', kategorie)}
              onKarte={() => oeffne('karte')}
              onMission={(art) => starteModus(MISSION_MODUS[art])}
              onUeben={uebeElement}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
