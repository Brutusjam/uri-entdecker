import type { ReactNode } from 'react';
import { ComicCard } from './ui/ComicCard';
import { Begleitung } from './ui/Begleitung';
import {
  IconBerge,
  IconBlitz,
  IconDuell,
  IconKarte,
  IconKarten,
  IconPass,
  IconProfi,
  IconPruefung,
  IconPuzzle,
  IconSage,
  IconSchild,
  IconStift,
  IconSuche,
} from './ui/icons';
import { useFortschrittStore } from '../store/fortschritt';
import { bestePuzzleZeit, formatiereZeit } from '../logic/puzzle';
import type { Kategorie } from '../types/karte';

export interface SpieleScreenProps {
  onEntdecken: (kategorie?: Kategorie) => void;
  onFinden: (kategorie?: Kategorie) => void;
  onWappen: () => void;
  onMemory: () => void;
  onPuzzle: () => void;
  onBeschriften: () => void;
  onBlitz: () => void;
  onPruefung: () => void;
  onDuell: () => void;
  onPassReise: () => void;
  onGipfel: () => void;
  onSagen: () => void;
  onTellPfad: () => void;
}

function ModusGruppe({
  titel,
  hinweis,
  children,
}: {
  titel: string;
  hinweis?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-ink">{titel}</h2>
        {hinweis ? <p className="mt-1 font-body text-base text-ink/70">{hinweis}</p> : null}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">{children}</div>
    </section>
  );
}

export function SpieleScreen({
  onEntdecken,
  onFinden,
  onWappen,
  onMemory,
  onPuzzle,
  onBeschriften,
  onBlitz,
  onPruefung,
  onDuell,
  onPassReise,
  onGipfel,
  onSagen,
  onTellPfad,
}: SpieleScreenProps) {
  const puzzleBest = useFortschrittStore((s) => s.puzzleBest);
  const profiFrei = useFortschrittStore((s) => s.profiFreigeschaltet);
  const puzzleZeit = bestePuzzleZeit(puzzleBest ?? {});

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 p-4 pb-6">
      <Begleitung
        name="stierli"
        pose="zeigt"
        text="Such dir einen Modus aus – oder übe auf der Karte mit «Weiter üben»."
      />

      <ModusGruppe titel="Üben" hinweis="Ohne Druck lernen und schauen.">
        <ComicCard
          titel="Finden"
          leitfarbe="see-blau"
          icon={<IconSuche className="h-10 w-10" />}
          kipp={-1}
          onClick={() => onFinden('gemeinde')}
        >
          <p className="text-base text-ink/70">Wo liegt …?</p>
        </ComicCard>
        <ComicCard
          titel="Entdecken"
          leitfarbe="alp-gruen"
          icon={<IconKarte className="h-10 w-10" />}
          kipp={1}
          onClick={() => onEntdecken('gemeinde')}
        >
          <p className="text-base text-ink/70">Frei auf der Karte schauen</p>
        </ComicCard>
      </ModusGruppe>

      <ModusGruppe titel="Spielen" hinweis="Quiz, Tempo und zu zweit.">
        <ComicCard
          titel="Wappen"
          leitfarbe="stier-rot"
          icon={<IconSchild className="h-10 w-10" />}
          kipp={1}
          onClick={onWappen}
        >
          <p className="text-base text-ink/70">28 Wappen zuordnen</p>
        </ComicCard>
        <ComicCard
          titel="Memory"
          leitfarbe="koralle"
          icon={<IconKarten className="h-10 w-10" />}
          kipp={-1}
          onClick={onMemory}
        >
          <p className="text-base text-ink/70">Paare finden</p>
        </ComicCard>
        <ComicCard
          titel="Puzzle"
          leitfarbe="alp-gruen"
          icon={<IconPuzzle className="h-10 w-10" />}
          kipp={1}
          bestwert={puzzleZeit !== null ? `Bestzeit ${formatiereZeit(puzzleZeit)}` : undefined}
          onClick={onPuzzle}
        >
          <p className="text-base text-ink/70">Teile in den Umriss</p>
        </ComicCard>
        <ComicCard
          titel="Blitzrunde"
          leitfarbe="koralle"
          icon={<IconBlitz className="h-10 w-10" />}
          kipp={-1}
          onClick={onBlitz}
        >
          <p className="text-base text-ink/70">60 Sekunden Tempo</p>
        </ComicCard>
        <ComicCard
          titel="Duell"
          leitfarbe="sagen-lila"
          icon={<IconDuell className="h-10 w-10" />}
          kipp={1}
          onClick={onDuell}
        >
          <p className="text-base text-ink/70">Zu zweit am Tablet</p>
        </ComicCard>
      </ModusGruppe>

      <ModusGruppe
        titel="Für die Prüfung"
        hinweis="Wie im Schultest: Namen auf die stumme Karte legen."
      >
        <ComicCard
          titel="Beschriften"
          leitfarbe="uri-gelb"
          icon={<IconStift className="h-10 w-10" />}
          kipp={-1}
          onClick={onBeschriften}
        >
          <p className="text-base text-ink/70">Schilder auf die Karte</p>
        </ComicCard>
        <ComicCard
          titel="Prüfung"
          leitfarbe="ink"
          icon={<IconPruefung className="h-10 w-10" />}
          kipp={1}
          onClick={onPruefung}
        >
          <p className="text-base text-ink/70">Note von 1 bis 6</p>
        </ComicCard>
      </ModusGruppe>

      <ModusGruppe titel="Uri-Profi" hinweis="Pässe, Berge und Sagen – wenn freigeschaltet.">
        {profiFrei ? (
          <>
            <ComicCard
              titel="Pass-Reise"
              leitfarbe="sagen-lila"
              icon={<IconPass className="h-10 w-10" />}
              kipp={-1}
              onClick={onPassReise}
            >
              <p className="text-base text-ink/70">Tal, Pass, Nachbarkanton</p>
            </ComicCard>
            <ComicCard
              titel="Gipfel-Quiz"
              leitfarbe="sagen-lila"
              icon={<IconBerge className="h-10 w-10" />}
              kipp={1}
              onClick={onGipfel}
            >
              <p className="text-base text-ink/70">Welcher Berg ist höher?</p>
            </ComicCard>
            <ComicCard
              titel="Sagen"
              leitfarbe="sagen-lila"
              icon={<IconSage className="h-10 w-10" />}
              kipp={-1}
              onClick={onSagen}
            >
              <p className="text-base text-ink/70">Comics und Quiz</p>
            </ComicCard>
            <ComicCard
              titel="Tell-Pfad"
              leitfarbe="sagen-lila"
              icon={<IconProfi className="h-10 w-10" />}
              kipp={1}
              onClick={onTellPfad}
            >
              <p className="text-base text-ink/70">Stationen in der Sage-Reihenfolge</p>
            </ComicCard>
          </>
        ) : (
          <ComicCard titel="Uri-Profi" leitfarbe="sagen-lila" icon={<IconProfi className="h-10 w-10" />} kipp={0}>
            <p className="text-base text-ink/70">
              Ab 70 % gut gelernt oder über Eltern im Profil. Dann kommen Pässe, Berge und Sagen.
            </p>
          </ComicCard>
        )}
      </ModusGruppe>
    </div>
  );
}
