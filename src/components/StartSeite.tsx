import { useMemo } from 'react';
import { ProgressBar } from './ui/ProgressBar';
import { ComicButton } from './ui/ComicButton';
import { Begleitung } from './ui/Begleitung';
import { Badge } from './ui/Badge';
import { IconCheck, IconKarte, IconKarten, IconStern, IconSuche } from './ui/icons';
import { useFortschrittStore } from '../store/fortschritt';
import { SPRUECHE } from '../data/sprueche';
import { waehleSpruch } from '../logic/sprueche';
import { levelVonXp } from '../logic/level';
import { waehleWeiterUebenZiel } from '../logic/fragen';
import { gesamtStand, lernstand, standSatz } from '../logic/lernstand';
import { neuerModusVorschlag } from '../logic/vorschlag';
import {
  missionErledigt,
  missionFortschritt,
  missionStandFuerTag,
  tagesMissionen,
  type MissionArt,
} from '../logic/mission';
import type { ModusId } from '../data/modi';
import type { Kategorie } from '../types/karte';

export interface StartSeiteProps {
  onUeben: (kategorie: Kategorie) => void;
  onUebenElement: (elementId: string) => void;
  onKarte: () => void;
  onAlleSpiele: () => void;
  onModus: (id: ModusId) => void;
  onMission: (art: MissionArt) => void;
}

export function StartSeite({
  onUeben,
  onUebenElement,
  onKarte,
  onAlleSpiele,
  onModus,
  onMission,
}: StartSeiteProps) {
  const fortschritt = useFortschrittStore((s) => s.fortschritt);
  const name = useFortschrittStore((s) => s.name);
  const xp = useFortschrittStore((s) => s.xp);
  const serie = useFortschrittStore((s) => s.serie);
  const mission = useFortschrittStore((s) => s.mission);
  const gespielteModi = useFortschrittStore((s) => s.gespielteModi);
  const profiFrei = useFortschrittStore((s) => s.profiFreigeschaltet);

  const level = levelVonXp(xp);
  const staende = useMemo(() => lernstand(fortschritt, profiFrei), [fortschritt, profiFrei]);
  const gesamt = gesamtStand(staende);
  const weiterZiel = useMemo(() => waehleWeiterUebenZiel(fortschritt), [fortschritt]);
  const vorschlag = useMemo(
    () => neuerModusVorschlag(gespielteModi ?? [], profiFrei),
    [gespielteModi, profiFrei],
  );

  const missionStand = missionStandFuerTag(mission);
  const missionen = tagesMissionen();
  const alleMissionen = missionen.every((m) => missionErledigt(m, missionStand));

  const begruessung = useMemo(() => {
    if (name) return `Hallo ${name}! Du bist ${level.titel}.`;
    return waehleSpruch(SPRUECHE, 'begruessung', null, 'lia').text;
  }, [name, level.titel]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 pb-6">
      <Begleitung name="lia" pose="neutral" text={begruessung} />

      <ComicButton
        fullWidth
        icon={<IconSuche className="h-6 w-6" />}
        onClick={() => onUebenElement(weiterZiel.id)}
      >
        Weiter üben: {weiterZiel.name}
      </ComicButton>

      <section className="rounded-comic-lg border-comic border-ink bg-weiss p-4 shadow-comic">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-2xl font-extrabold text-ink">Mein Lernstand</h2>
          <div className="flex items-center gap-2">
            <Badge variante="standard">{level.titel}</Badge>
            {serie.tage > 0 ? (
              <Badge variante="gold">
                {serie.tage} {serie.tage === 1 ? 'Tag' : 'Tage'} Serie
              </Badge>
            ) : null}
          </div>
        </div>
        <ProgressBar wert={gesamt.gelernt} max={gesamt.gesamt} label="Alles zusammen" />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl font-extrabold text-ink">Was du lernst</h2>
        <ul className="space-y-3">
          {staende.map((stand) => (
            <li
              key={stand.info.id}
              className="rounded-comic-lg border-comic border-ink bg-weiss p-4 shadow-comic"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="flex items-center gap-2 font-display text-xl font-extrabold text-ink">
                    {stand.info.titel}
                    {stand.fertig ? (
                      <IconStern gefuellt className="h-5 w-5 text-gold" aria-label="geschafft" />
                    ) : null}
                  </h3>
                  <p className="font-body text-base text-ink/70">{stand.info.erklaerung}</p>
                </div>
                <ComicButton
                  icon={<IconSuche className="h-5 w-5" />}
                  onClick={() => onUeben(stand.info.id)}
                  aria-label={`${stand.info.titel} üben`}
                >
                  Üben
                </ComicButton>
              </div>

              <div className="mt-3">
                <ProgressBar wert={stand.gelernt} max={stand.gesamt} />
                <p className="mt-1 font-body text-base text-ink/80">
                  {stand.gelernt} von {stand.gesamt} sitzen · {standSatz(stand)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {vorschlag ? (
        <section className="rounded-comic-lg border-comic border-ink bg-uri-gelb p-4 shadow-comic">
          <Badge variante="standard">Neu für dich</Badge>
          <h2 className="mt-2 font-display text-2xl font-extrabold text-ink">{vorschlag.titel}</h2>
          <p className="mt-1 font-body text-lg text-ink">{vorschlag.einladung}</p>
          <div className="mt-3">
            <ComicButton fullWidth variante="sekundaer" onClick={() => onModus(vorschlag.id)}>
              Ausprobieren
            </ComicButton>
          </div>
        </section>
      ) : null}

      <section className="rounded-comic-lg border-comic border-ink bg-weiss p-4 shadow-comic">
        <h2 className="font-display text-2xl font-extrabold text-ink">Heute</h2>
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
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <ComicButton fullWidth icon={<IconKarten className="h-6 w-6" />} onClick={onAlleSpiele}>
          Alle Spiele ansehen
        </ComicButton>
        <ComicButton
          fullWidth
          variante="neutral"
          icon={<IconKarte className="h-6 w-6" />}
          onClick={onKarte}
        >
          Karte mit Fortschritt
        </ComicButton>
      </div>
    </div>
  );
}
