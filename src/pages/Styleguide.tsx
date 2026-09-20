import { useState, type ComponentProps, type ReactNode } from 'react';
import { assetUrl } from '../lib/assetUrl';
import { Badge } from '../components/ui/Badge';
import { ComicButton } from '../components/ui/ComicButton';
import { ComicCard } from '../components/ui/ComicCard';
import { Header } from '../components/ui/Header';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SpeechBubble, type ZipfelSeite } from '../components/ui/SpeechBubble';
import { Sticker } from '../components/ui/Sticker';
import {
  IconBlitz,
  IconCheck,
  IconFlamme,
  IconKarte,
  IconKreuz,
  IconProfi,
  IconPruefung,
  IconPuzzle,
  IconSchild,
  IconStern,
  IconStift,
  IconSuche,
} from '../components/ui/icons';
import { Begleitung } from '../components/ui/Begleitung';
import { Figur } from '../components/ui/Figur';
import { LEITFARBE_BG, LEITFARBE_LABEL, type Leitfarbe } from '../components/ui/leitfarbe';
import { LIA_POSEN, STIERLI_POSEN } from '../data/figuren';

const FARBEN: { token: string; hex: string; nutzung: string; klasse: string }[] = [
  { token: 'ink', hex: '#1E2440', nutzung: 'Outlines, Text, harte Schatten', klasse: 'bg-ink' },
  { token: 'paper', hex: '#FFF8E7', nutzung: 'Haupthintergrund', klasse: 'bg-paper' },
  { token: 'sky', hex: '#CFEFFF', nutzung: 'Himmel, Kopfbereich, Kartenhintergrund', klasse: 'bg-sky' },
  { token: 'weiss', hex: '#FFFFFF', nutzung: 'Karten, Sprechblasen, Sticker-Rand', klasse: 'bg-weiss' },
  { token: 'uri-gelb', hex: '#FFC928', nutzung: 'Primär-Buttons, Highlights, Lias Cap', klasse: 'bg-uri-gelb' },
  { token: 'uri-gelb-dunkel', hex: '#E0A800', nutzung: 'Hover / gedrückt', klasse: 'bg-uri-gelb-dunkel' },
  { token: 'alp-gruen', hex: '#3DBE6B', nutzung: 'Richtig, Fortschritt, Wiesen', klasse: 'bg-alp-gruen' },
  { token: 'alp-gruen-dunkel', hex: '#1F8A4C', nutzung: 'Fortschritt Stufe 3–4', klasse: 'bg-alp-gruen-dunkel' },
  { token: 'see-blau', hex: '#3AA7E8', nutzung: 'Seen, Info, Sekundär-Buttons', klasse: 'bg-see-blau' },
  { token: 'see-blau-dunkel', hex: '#1C6FB0', nutzung: 'Flüsse, Hover', klasse: 'bg-see-blau-dunkel' },
  { token: 'koralle', hex: '#FF7A59', nutzung: 'Falsch / Achtung', klasse: 'bg-koralle' },
  { token: 'stier-rot', hex: '#E63946', nutzung: 'Akzente (Flamme, Herzen)', klasse: 'bg-stier-rot' },
  { token: 'sagen-lila', hex: '#8B5CF6', nutzung: 'Profi, Sagen', klasse: 'bg-sagen-lila' },
  { token: 'gold', hex: '#F5B301', nutzung: 'Gemeistert, Glanz-Sticker', klasse: 'bg-gold' },
  { token: 'neu-grau', hex: '#C9CED8', nutzung: 'Noch nicht gelernt, deaktiviert', klasse: 'bg-neu-grau' },
  { token: 'nachbar-grau', hex: '#E4E1D6', nutzung: 'Nachbarkantone', klasse: 'bg-nachbar-grau' },
  { token: 'schweiz-grau', hex: '#EEF0F4', nutzung: 'Übrige Kantone der Schweiz', klasse: 'bg-schweiz-grau' },
  { token: 'wiese', hex: '#BFE8B0', nutzung: 'Kanton Uri, Fortschritt Stufe 1–2', klasse: 'bg-wiese' },
  { token: 'hoodie', hex: '#2EC4B6', nutzung: 'Lias Hoodie', klasse: 'bg-hoodie' },
];

const MODI: {
  titel: string;
  leitfarbe: Leitfarbe;
  icon: typeof IconSuche;
  sterne?: 0 | 1 | 2 | 3;
  bestwert?: string;
  kipp: -1 | 1;
}[] =
  [
    { titel: 'Finden', leitfarbe: 'see-blau', icon: IconSuche, sterne: 2, bestwert: 'Bestwert 14', kipp: -1 },
    { titel: 'Beschriften', leitfarbe: 'uri-gelb', icon: IconStift, sterne: 1, kipp: 1 },
    { titel: 'Wappen', leitfarbe: 'stier-rot', icon: IconSchild, sterne: 3, bestwert: 'Alle richtig!', kipp: -1 },
    { titel: 'Puzzle', leitfarbe: 'alp-gruen', icon: IconPuzzle, sterne: 0, kipp: 1 },
    { titel: 'Blitzrunde', leitfarbe: 'koralle', icon: IconBlitz, sterne: 2, bestwert: '12 in 60s', kipp: -1 },
    { titel: 'Prüfung', leitfarbe: 'ink', icon: IconPruefung, sterne: 1, kipp: 1 },
    { titel: 'Uri-Profi', leitfarbe: 'sagen-lila', icon: IconProfi, sterne: 0, kipp: -1 },
    { titel: 'Entdecken', leitfarbe: 'see-blau', icon: IconKarte, kipp: 1 },
  ];

const ZIPFEL: ZipfelSeite[] = ['unten-links', 'unten-rechts', 'links', 'rechts'];

const LIA_POSE_LABEL: Record<(typeof LIA_POSEN)[number], string> = {
  neutral: 'wartet',
  zeigt: 'zeigt',
  denkt: 'denkt',
  jubelt: 'jubelt',
  troestet: 'tröstet',
  'freut-sich': 'freut sich',
  staunt: 'staunt',
  wanderin: 'Wanderin',
};

const STIERLI_POSE_LABEL: Record<(typeof STIERLI_POSEN)[number], string> = {
  neutral: 'wartet',
  zeigt: 'zeigt',
  denkt: 'denkt',
  jubelt: 'jubelt',
  troestet: 'tröstet',
  'freut-sich': 'freut sich',
  erschrocken: 'erschrocken',
  luftsprung: 'Luftsprung',
  wanderin: 'Wanderin',
};

const NAV: { id: string; label: string }[] = [
  { id: 'farben', label: 'Farben' },
  { id: 'schrift', label: 'Schrift' },
  { id: 'form', label: 'Form' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'karten', label: 'Karten' },
  { id: 'blasen', label: 'Sprechblasen' },
  { id: 'balken', label: 'Balken' },
  { id: 'sticker', label: 'Sticker' },
  { id: 'badges', label: 'Badges' },
  { id: 'header', label: 'Kopfzeile' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'figuren', label: 'Figuren' },
];

export function Styleguide() {
  const [tonAn, setTonAn] = useState(true);
  const [xp] = useState(240);
  const [serie] = useState(4);
  const [ploppKey, setPloppKey] = useState(0);
  const [headerFarbe, setHeaderFarbe] = useState<Leitfarbe>('see-blau');
  const [richtigTick, setRichtigTick] = useState(0);
  const [falschTick, setFalschTick] = useState(0);
  const [klicks, setKlicks] = useState(0);

  return (
    <div className="min-h-screen bg-paper">
      <Header
        titel="Styleguide"
        leitfarbe="uri-gelb"
        xp={xp}
        serieTage={serie}
        tonAn={tonAn}
        onTonUmschalten={() => setTonAn((v) => !v)}
        onHome={() => {
          window.location.href = '/';
        }}
        klebend={false}
      />

      <main className="mx-auto flex max-w-[1400px] flex-col gap-12 px-4 py-8">
        <section className="rounded-comic-lg border-comic border-ink bg-sky p-6 shadow-comic">
          <p className="font-display text-4xl font-extrabold text-ink md:text-5xl">Uri-Entdecker</p>
          <p className="mt-2 max-w-prose text-xl">
            Hier siehst du alle Farben, Bausteine und Figuren. So prüfst du, ob Lia, Stierli und die
            Buttons zusammenpassen.
          </p>
          <p className="mt-2 text-base text-ink/70">Nur im Entwicklungsmodus unter /styleguide.</p>
        </section>

        <nav className="flex flex-wrap gap-2" aria-label="Abschnitte">
          {NAV.map((item) => (
            <a key={item.id} href={`#${item.id}`} className="inline-flex min-h-12 items-center">
              <Badge variante="standard" className="min-h-12 px-4 text-lg">
                {item.label}
              </Badge>
            </a>
          ))}
        </nav>

        <Abschnitt id="farben" titel="Farben">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {FARBEN.map((farbe) => (
              <div
                key={farbe.token}
                className="overflow-hidden rounded-comic border-comic border-ink bg-weiss shadow-comic"
              >
                <div className={`h-16 ${farbe.klasse}`} />
                <div className="p-3">
                  <p className="font-display text-xl font-extrabold">{farbe.token}</p>
                  <p className="font-display text-lg tabular-nums">{farbe.hex}</p>
                  <p className="mt-1 text-base leading-snug">{farbe.nutzung}</p>
                </div>
              </div>
            ))}
          </div>
        </Abschnitt>

        <Abschnitt id="schrift" titel="Schrift">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-comic border-comic border-ink bg-weiss p-5 shadow-comic">
              <p className="text-base text-ink/70">Baloo 2 · Titel, Buttons, Zahlen</p>
              <p className="mt-2 font-display text-5xl font-extrabold">Uri-Entdecker</p>
              <p className="font-display text-3xl font-bold">Finden · Wappen · Puzzle</p>
              <p className="mt-2 font-display text-4xl font-extrabold tabular-nums">240 XP</p>
            </div>
            <div className="rounded-comic border-comic border-ink bg-weiss p-5 shadow-comic">
              <p className="text-base text-ink/70">Nunito · Fliesstext, Sprechblasen</p>
              <p className="mt-2 text-xl">Tippe auf die Gemeinde, die du suchst!</p>
              <p className="mt-2 text-lg">
                Kurze Sätze, gut lesbar. Keine Schrift unter 16 Pixel, keine Blocksätze.
              </p>
            </div>
          </div>
        </Abschnitt>

        <Abschnitt id="form" titel="Form, Schatten, Abstände">
          <div className="flex flex-wrap items-end gap-6">
            <div className="h-24 w-24 rounded-comic border-comic border-ink bg-weiss shadow-comic" />
            <div className="h-24 w-32 rounded-comic-lg border-comic border-ink bg-weiss shadow-comic" />
            <div className="h-12 w-28 rounded-pill border-comic-sm border-ink bg-uri-gelb shadow-button" />
            <p className="max-w-xs text-base">
              Outline 3 px (klein 2 px), Radius 16 / 24 / Pille, harter Schatten. Abstand im 4er-Raster.
            </p>
          </div>
        </Abschnitt>

        <Abschnitt id="buttons" titel="ComicButton">
          <p className="mb-4">Drück die Knöpfe – sie rutschen nach unten, wie echte Knöpfe.</p>
          <div className="flex flex-wrap items-start gap-4">
            <ComicButton icon={<IconSuche />} onClick={() => setKlicks((n) => n + 1)}>
              Primär
            </ComicButton>
            <ComicButton variante="sekundaer" icon={<IconKarte />}>
              Sekundär
            </ComicButton>
            <ComicButton variante="neutral">Neutral</ComicButton>
            <ComicButton variante="profi" icon={<IconProfi />}>
              Profi
            </ComicButton>
            <ComicButton gedrueckt>Gedrückt</ComicButton>
            <ComicButton disabled>Deaktiviert</ComicButton>
          </div>
          <p className="mt-3 text-base text-ink/70">Klicks auf Primär: {klicks}</p>
        </Abschnitt>

        <Abschnitt id="karten" titel="ComicCard">
          <p className="mb-4">Tippe auf eine Karte: Sie richtet sich gerade aus und hebt sich leicht an.</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {MODI.map((modus) => {
              const Icon = modus.icon;
              return (
                <ComicCard
                  key={modus.titel}
                  titel={modus.titel}
                  leitfarbe={modus.leitfarbe}
                  icon={<Icon className="h-10 w-10" />}
                  sterne={modus.sterne}
                  bestwert={modus.bestwert}
                  kipp={modus.kipp}
                  onClick={() => setHeaderFarbe(modus.leitfarbe)}
                />
              );
            })}
          </div>
        </Abschnitt>

        <Abschnitt id="blasen" titel="SpeechBubble">
          <div className="mb-4">
            <ComicButton onClick={() => setPloppKey((n) => n + 1)}>Plopp nochmal</ComicButton>
          </div>
          <div className="flex flex-wrap items-center gap-10">
            {ZIPFEL.map((seite) => (
              <SpeechBubble key={`${seite}-${ploppKey}`} zipfel={seite}>
                {seite === 'unten-links'
                  ? 'Tippe auf Wassen – du schaffst das!'
                  : seite === 'unten-rechts'
                    ? 'Super, das ist Altdorf!'
                    : seite === 'links'
                      ? 'Schau nach Norden, zum See.'
                      : 'Keine Sorge, wir versuchen es nochmal.'}
              </SpeechBubble>
            ))}
          </div>
        </Abschnitt>

        <Abschnitt id="balken" titel="ProgressBar">
          <div className="flex flex-col gap-6">
            <ProgressBar wert={0} max={19} label="Gemeinden · noch neu" />
            <ProgressBar wert={12} max={19} label="Gemeinden" />
            <ProgressBar wert={19} max={19} label="Gemeinden · alle geschafft" />
            <ProgressBar wert={5} max={9} label="Kantone" />
          </div>
        </Abschnitt>

        <Abschnitt id="sticker" titel="Sticker">
          <div className="flex flex-wrap items-end gap-8">
            <FigurSticker drehung={-3} src={assetUrl('/wappen/gemeinden/1201.svg')} alt="Altdorf" beschriftung="Normal" />
            <FigurSticker
              drehung={2}
              src={assetUrl('/wappen/gemeinden/1202.svg')}
              alt="Andermatt"
              glanz
              beschriftung="Glanz"
            />
            <FigurSticker drehung={-4} leer beschriftung="Leerer Platz" />
            <FigurSticker drehung={4} src={assetUrl('/wappen/kantone/ur.svg')} alt="Uri" beschriftung="Kanton Uri" />
          </div>
        </Abschnitt>

        <Abschnitt id="badges" titel="Badge">
          <div className="flex flex-wrap gap-3">
            <Badge>Standard</Badge>
            <Badge variante="gold" icon={<IconStern gefuellt className="h-4 w-4" />}>
              Gemeistert
            </Badge>
            <Badge variante="erfolg" icon={<IconCheck className="h-4 w-4" />}>
              Richtig
            </Badge>
            <Badge variante="profi">Uri-Profi</Badge>
            <Badge variante="neu">Neu</Badge>
            <Badge variante="warnung" icon={<IconKreuz className="h-4 w-4" />}>
              Achtung
            </Badge>
            <Badge variante="serie" icon={<IconFlamme className="h-4 w-4" />}>
              4 Tage
            </Badge>
          </div>
        </Abschnitt>

        <Abschnitt id="header" titel="Kopfzeile">
          <p className="mb-4">Leitfarbe wechseln (oder oben eine Modus-Karte antippen):</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {(Object.keys(LEITFARBE_BG) as Leitfarbe[]).map((farbe) => (
              <ComicButton
                key={farbe}
                variante={headerFarbe === farbe ? 'primaer' : 'neutral'}
                onClick={() => setHeaderFarbe(farbe)}
              >
                {LEITFARBE_LABEL[farbe]}
              </ComicButton>
            ))}
          </div>
          <div className="overflow-hidden rounded-comic border-comic border-ink shadow-comic">
            <Header
              titel={LEITFARBE_LABEL[headerFarbe]}
              leitfarbe={headerFarbe}
              xp={xp}
              serieTage={serie}
              tonAn={tonAn}
              onTonUmschalten={() => setTonAn((v) => !v)}
              onZurueck={() => undefined}
              onHome={() => undefined}
              klebend={false}
            />
          </div>
        </Abschnitt>

        <Abschnitt id="feedback" titel="Feedback">
          <p className="mb-4">Richtig und falsch nie nur über Farbe: immer Symbol und Bewegung.</p>
          <div className="grid gap-6 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setRichtigTick((n) => n + 1)}
              className={`rounded-comic border-comic border-ink bg-weiss p-6 text-left shadow-comic ${
                richtigTick > 0 ? 'animate-comic-richtig' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  key={`ok-${richtigTick}`}
                  className={`flex h-12 w-12 items-center justify-center rounded-pill bg-alp-gruen text-weiss ${
                    richtigTick > 0 ? 'animate-check-pop' : ''
                  }`}
                >
                  <IconCheck className="h-7 w-7" />
                </span>
                <div>
                  <p className="font-display text-2xl font-extrabold">Richtig!</p>
                  <p>Element blinkt grün, Häkchen springt. Tippen zum Testen.</p>
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setFalschTick((n) => n + 1)}
              className={`rounded-comic border-comic border-ink bg-weiss p-6 text-left shadow-comic ${
                falschTick > 0 ? 'animate-comic-shake' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-pill bg-koralle text-ink">
                  <IconKreuz className="h-7 w-7" />
                </span>
                <div>
                  <p className="font-display text-2xl font-extrabold">Noch nicht</p>
                  <p>Kurzes Schütteln in Koralle, nie hämisch. Tippen zum Testen.</p>
                </div>
              </div>
            </button>
          </div>
        </Abschnitt>

        <Abschnitt id="figuren" titel="Lia und Stierli">
          <p className="mb-6">
            Gleiche Grösse, Füsse unten. Posen ohne Springen tauschen. Atmen im Leerlauf, ausser wenn
            Bewegung reduziert ist.
          </p>
          <Begleitung
            className="mb-8 w-fit"
            name="lia"
            pose="neutral"
            text="Bereit für ein Abenteuer in Uri?"
          />
          <h3 className="mb-3 font-display text-2xl font-extrabold">Lia</h3>
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {LIA_POSEN.map((pose) => (
              <figure key={`lia-${pose}`} className="flex flex-col items-center overflow-visible rounded-comic border-comic-sm border-ink bg-weiss p-2">
                <Figur name="lia" pose={pose} className="h-28 w-28 md:h-32 md:w-32" />
                <figcaption className="font-display text-lg">{LIA_POSE_LABEL[pose]}</figcaption>
              </figure>
            ))}
          </div>
          <h3 className="mb-3 font-display text-2xl font-extrabold">Stierli</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {STIERLI_POSEN.map((pose) => (
              <figure key={`stierli-${pose}`} className="flex flex-col items-center rounded-comic border-comic-sm border-ink bg-weiss p-2">
                <Figur name="stierli" pose={pose} className="h-28 w-28 md:h-32 md:w-32" />
                <figcaption className="font-display text-lg">{STIERLI_POSE_LABEL[pose]}</figcaption>
              </figure>
            ))}
          </div>
        </Abschnitt>

        <p className="pb-8 text-center text-base text-ink/70">
          Figuren sind austauschbar: gleiche Dateinamen in public/figuren, gleicher Ausschnitt.
        </p>
      </main>
    </div>
  );
}

function Abschnitt({ id, titel, children }: { id: string; titel: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="mb-4 font-display text-3xl font-extrabold text-ink">{titel}</h2>
      {children}
    </section>
  );
}

function FigurSticker({
  beschriftung,
  ...props
}: { beschriftung: string } & ComponentProps<typeof Sticker>) {
  return (
    <figure className="flex flex-col items-center gap-2">
      <Sticker {...props} />
      <figcaption className="font-display text-lg">{beschriftung}</figcaption>
    </figure>
  );
}
