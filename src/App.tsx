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
import { waehleWeiterUebenZiel } from './logic/fragen';
import { ELEMENT_MAP } from './data/elemente';
import { useFortschrittStore } from './store/fortschritt';
import type { MissionArt } from './logic/mission';
import type { HauptTab } from './types/navigation';
import type { Kategorie } from './types/karte';

type Ansicht =
  | 'start'
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

function ansichtFuerMission(art: MissionArt): Ansicht {
  if (art === 'finden') return 'finden';
  if (art === 'wappen') return 'wappen';
  if (art === 'beschriften') return 'beschriften';
  if (art === 'memory') return 'memory';
  if (art === 'puzzle') return 'puzzle';
  return 'blitz';
}

function App() {
  const [ansicht, setAnsicht] = useState<Ansicht>('start');
  const [hauptTab, setHauptTab] = useState<HauptTab>('karte');
  const [zurueckTab, setZurueckTab] = useState<HauptTab>('karte');
  const [findenZiel, setFindenZiel] = useState<string | null>(null);
  const [findenKategorie, setFindenKategorie] = useState<Kategorie>('gemeinde');
  const [entdeckenKategorie, setEntdeckenKategorie] = useState<Kategorie>('gemeinde');
  const [splashSichtbar, setSplashSichtbar] = useState(() => !splashSchonGesehen());
  const { fortschritt } = useAssetVorladen(splashSichtbar);
  const ruhig = useReducedMotion() ?? false;
  const uebergang = { duration: ruhig ? 0.15 : 0.35 };
  useUebungTicker();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [ansicht, hauptTab]);

  const zurueckStart = () => {
    setFindenZiel(null);
    setAnsicht('start');
    setHauptTab(zurueckTab);
  };

  const starteModus = (ziel: Ansicht, tab: HauptTab = hauptTab) => {
    setZurueckTab(tab);
    setAnsicht(ziel);
  };

  const starteFinden = (elementId: string, tab: HauptTab) => {
    setFindenZiel(elementId);
    setFindenKategorie(ELEMENT_MAP.get(elementId)?.kategorie ?? 'gemeinde');
    starteModus('finden', tab);
  };

  const handleWeiterUeben = () => {
    const storeFortschritt = useFortschrittStore.getState().fortschritt;
    const ziel = waehleWeiterUebenZiel(storeFortschritt);
    starteFinden(ziel.id, 'karte');
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
        <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={uebergang}>
          <FeierOverlay />
          {ansicht === 'entdecken' ? (
            <Entdecken kategorie={entdeckenKategorie} onZurueck={zurueckStart} />
          ) : ansicht === 'finden' ? (
            <Finden
              startElementId={findenZiel}
              startKategorie={findenKategorie}
              onZurueck={zurueckStart}
            />
          ) : ansicht === 'wappen' ? (
            <WappenQuiz onZurueck={zurueckStart} />
          ) : ansicht === 'memory' ? (
            <Memory onZurueck={zurueckStart} />
          ) : ansicht === 'puzzle' ? (
            <Puzzle onZurueck={zurueckStart} />
          ) : ansicht === 'beschriften' ? (
            <Beschriften onZurueck={zurueckStart} />
          ) : ansicht === 'blitz' ? (
            <Blitz onZurueck={zurueckStart} />
          ) : ansicht === 'pruefung' ? (
            <Pruefung
              onZurueck={zurueckStart}
              onUeben={(id) => starteFinden(id, zurueckTab)}
            />
          ) : ansicht === 'duell' ? (
            <Duell onZurueck={zurueckStart} />
          ) : ansicht === 'pass-reise' ? (
            <PassReise onZurueck={zurueckStart} />
          ) : ansicht === 'gipfel' ? (
            <GipfelQuiz onZurueck={zurueckStart} />
          ) : ansicht === 'sagen' ? (
            <SagenComic
              onZurueck={zurueckStart}
              onQuiz={() => starteModus('sagen-quiz', zurueckTab)}
            />
          ) : ansicht === 'sagen-quiz' ? (
            <SagenQuiz onZurueck={zurueckStart} />
          ) : ansicht === 'tell-pfad' ? (
            <TellPfad onZurueck={zurueckStart} />
          ) : (
            <HauptShell
              tab={hauptTab}
              onTabWechsel={setHauptTab}
              onWeiterUeben={handleWeiterUeben}
              onMission={(art) => {
                setFindenZiel(null);
                starteModus(ansichtFuerMission(art), 'karte');
              }}
              onJetztUeben={(id) => starteFinden(id, 'karte')}
              onUeben={(id) => starteFinden(id, 'profil')}
              onEntdecken={(kategorie) => {
                setEntdeckenKategorie(kategorie ?? 'gemeinde');
                starteModus('entdecken', 'spiele');
              }}
              onFinden={(kategorie) => {
                setFindenZiel(null);
                setFindenKategorie(kategorie ?? 'gemeinde');
                starteModus('finden', 'spiele');
              }}
              onWappen={() => starteModus('wappen', 'spiele')}
              onMemory={() => starteModus('memory', 'spiele')}
              onPuzzle={() => starteModus('puzzle', 'spiele')}
              onBeschriften={() => starteModus('beschriften', 'spiele')}
              onBlitz={() => starteModus('blitz', 'spiele')}
              onPruefung={() => starteModus('pruefung', 'spiele')}
              onDuell={() => starteModus('duell', 'spiele')}
              onPassReise={() => starteModus('pass-reise', 'spiele')}
              onGipfel={() => starteModus('gipfel', 'spiele')}
              onSagen={() => starteModus('sagen', 'spiele')}
              onTellPfad={() => starteModus('tell-pfad', 'spiele')}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
