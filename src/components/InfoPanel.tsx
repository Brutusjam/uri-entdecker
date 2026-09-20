import type { LernElement } from '../types/karte';
import { GEMEINDEN } from '../data/gemeinden';
import { formatiereEinwohner, gemeindeMerkmale } from '../logic/gemeinde-infos';
import { Badge } from './ui/Badge';
import { ComicButton } from './ui/ComicButton';
import { Sticker } from './ui/Sticker';
import { IconKreuz } from './ui/icons';

interface InfoPanelProps {
  element: LernElement | null;
  onSchliessen?: () => void;
  leerHinweis?: string;
}

export function InfoPanel({
  element,
  onSchliessen,
  leerHinweis = 'Entdecke Gemeinden, Täler, Seen und Nachbarkantone.',
}: InfoPanelProps) {
  if (!element) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-comic-lg border-comic border-ink bg-weiss p-6 text-center shadow-comic">
        <p className="font-display text-2xl font-extrabold text-ink">Tippe auf die Karte!</p>
        <p className="mt-2 text-lg text-ink/80">{leerHinweis}</p>
      </div>
    );
  }

  const kategorieLabel =
    element.kategorie === 'gemeinde'
      ? 'Gemeinde'
      : element.kategorie === 'kanton'
        ? 'Kanton'
        : element.kategorie === 'tal'
          ? 'Tal'
          : element.kategorie === 'pass'
            ? 'Pass'
            : element.kategorie === 'berg'
              ? 'Berg'
              : element.kategorie === 'sagenort'
                ? 'Sagenort'
                : 'Gewässer';

  const merkmale = element.kategorie === 'gemeinde' ? gemeindeMerkmale(element, GEMEINDEN) : [];
  const hatZahlen = element.einwohner != null && element.flaecheKm2 != null;
  const hatTexte = Boolean(element.wappenTipp || element.wappenHintergrund || element.funFact);

  return (
    <div className="flex h-full flex-col overflow-y-auto rounded-comic-lg border-comic border-ink bg-weiss p-5 shadow-comic">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <Badge variante="standard">{kategorieLabel}</Badge>
          <h2 className="mt-2 font-display text-3xl font-extrabold leading-tight text-ink">{element.name}</h2>
        </div>
        {onSchliessen ? (
          <ComicButton onClick={onSchliessen} aria-label="Schliessen" variante="neutral">
            <IconKreuz className="h-6 w-6" />
          </ComicButton>
        ) : null}
      </div>

      {element.wappen ? (
        <div className="mx-auto mb-4">
          <Sticker src={element.wappen} alt={`Wappen ${element.name}`} groesse={112} drehung={-2} />
        </div>
      ) : element.bild ? (
        <div className="mx-auto mb-4">
          <Sticker src={element.bild} alt={element.name} groesse={112} drehung={-2} />
        </div>
      ) : null}

      {merkmale.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {merkmale.map((merkmal) => (
            <Badge key={merkmal.id} variante={merkmal.id === 'hauptort' ? 'gold' : 'erfolg'}>
              {merkmal.label}
            </Badge>
          ))}
        </div>
      ) : null}

      {hatZahlen ? (
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-comic border-comic-sm border-ink bg-sky p-3 text-center">
              <p className="font-display text-2xl font-extrabold leading-none text-ink">
                {formatiereEinwohner(element.einwohner!)}
              </p>
              <p className="mt-1 text-base text-ink/80">Einwohner</p>
            </div>
            <div className="rounded-comic border-comic-sm border-ink bg-wiese p-3 text-center">
              <p className="font-display text-2xl font-extrabold leading-none text-ink">
                {element.flaecheKm2!.toFixed(2).replace('.', ',')}
              </p>
              <p className="mt-1 text-base text-ink/80">km² Fläche</p>
            </div>
          </div>
          {element.einwohnerStand ? (
            <p className="mt-2 text-center text-base text-ink/60">Stand {element.einwohnerStand}</p>
          ) : null}
        </div>
      ) : null}

      {element.wappenTipp ? (
        <p className="mb-3 text-lg text-ink">
          <span className="font-display font-extrabold">Wappen: </span>
          {element.wappenTipp}
        </p>
      ) : null}

      {element.wappenHintergrund ? (
        <p className="mb-3 text-lg text-ink">
          <span className="font-display font-extrabold">Warum so? </span>
          {element.wappenHintergrund}
        </p>
      ) : null}

      {element.funFact ? (
        <p className="mt-auto rounded-comic border-comic-sm border-ink bg-sky p-4 text-lg text-ink">
          <span className="font-display font-extrabold">Spannend! </span>
          {element.funFact}
        </p>
      ) : null}

      {!hatTexte && !hatZahlen ? (
        <p className="mt-auto text-lg text-ink/70">Mehr Infos kommen bald!</p>
      ) : null}
    </div>
  );
}
