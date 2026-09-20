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
import { MODUS_GRUPPEN, modiDerGruppe, type ModusId } from '../data/modi';
import { bestePuzzleZeit, formatiereZeit } from '../logic/puzzle';

export interface SpieleScreenProps {
  onModus: (id: ModusId) => void;
}

const ICONS: Record<ModusId, typeof IconSuche> = {
  finden: IconSuche,
  entdecken: IconKarte,
  wappen: IconSchild,
  memory: IconKarten,
  puzzle: IconPuzzle,
  beschriften: IconStift,
  pruefung: IconPruefung,
  blitz: IconBlitz,
  duell: IconDuell,
  'pass-reise': IconPass,
  gipfel: IconBerge,
  sagen: IconSage,
  'tell-pfad': IconProfi,
};

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

export function SpieleScreen({ onModus }: SpieleScreenProps) {
  const puzzleBest = useFortschrittStore((s) => s.puzzleBest);
  const gespielteModi = useFortschrittStore((s) => s.gespielteModi);
  const profiFrei = useFortschrittStore((s) => s.profiFreigeschaltet);
  const puzzleZeit = bestePuzzleZeit(puzzleBest ?? {});
  const gespielt = new Set(gespielteModi ?? []);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 p-4 pb-6">
      <Begleitung
        name="stierli"
        pose="zeigt"
        text="Such dir ein Spiel aus. Was du noch nie probiert hast, ist mit «Neu» markiert."
      />

      {MODUS_GRUPPEN.map((gruppe) => {
        const modi = modiDerGruppe(gruppe.id, profiFrei);

        if (gruppe.id === 'profi' && !profiFrei) {
          return (
            <ModusGruppe key={gruppe.id} titel={gruppe.titel} hinweis={gruppe.hinweis}>
              <ComicCard
                titel="Uri-Profi"
                leitfarbe="sagen-lila"
                icon={<IconProfi className="h-10 w-10" />}
                kipp={0}
              >
                <p className="text-base text-ink/70">
                  Ab 70 % gut gelernt oder über Eltern im Profil. Dann kommen Pässe, Berge und Sagen.
                </p>
              </ComicCard>
            </ModusGruppe>
          );
        }

        return (
          <ModusGruppe key={gruppe.id} titel={gruppe.titel} hinweis={gruppe.hinweis}>
            {modi.map((modus, i) => {
              const Icon = ICONS[modus.id];
              const bestwert =
                modus.id === 'puzzle' && puzzleZeit !== null
                  ? `Bestzeit ${formatiereZeit(puzzleZeit)}`
                  : gespielt.has(modus.id)
                    ? undefined
                    : 'Neu';
              return (
                <ComicCard
                  key={modus.id}
                  titel={modus.titel}
                  leitfarbe={modus.leitfarbe}
                  icon={<Icon className="h-10 w-10" />}
                  kipp={i % 2 === 0 ? -1 : 1}
                  bestwert={bestwert}
                  onClick={() => onModus(modus.id)}
                >
                  <p className="text-base text-ink/70">{modus.kurz}</p>
                </ComicCard>
              );
            })}
          </ModusGruppe>
        );
      })}
    </div>
  );
}
