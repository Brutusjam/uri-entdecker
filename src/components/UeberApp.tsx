import { useState, type ReactNode } from 'react';
import { Bildschirm } from './StatusSeite';
import { Header } from './ui/Header';
import { ComicButton } from './ui/ComicButton';
import { SpeechBubble } from './ui/SpeechBubble';
import { assetUrl } from '../lib/assetUrl';
import { useFortschrittStore } from '../store/fortschritt';
import { HERAUSGEBER, LIZENZ, RECHTLICHES_STAND, SPEICHER_NAME } from '../content/rechtliches';

interface UeberAppProps {
  eingebettet?: boolean;
  onZurueck: () => void;
}

function Abschnitt({ titel, children }: { titel: string; children: ReactNode }) {
  return (
    <section className="rounded-comic-lg border-comic border-ink bg-weiss p-4 shadow-comic">
      <h2 className="font-display text-2xl font-extrabold text-ink">{titel}</h2>
      <div className="mt-2 space-y-3 font-body text-lg font-semibold leading-snug text-ink">{children}</div>
    </section>
  );
}

function AussenLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-bold text-see-blau-dunkel underline underline-offset-2"
    >
      {children}
    </a>
  );
}

export function UeberApp({ eingebettet = false, onZurueck }: UeberAppProps) {
  const loescheAlles = useFortschrittStore((s) => s.loescheAlles);
  const [geloescht, setGeloescht] = useState(false);
  const mailto = `mailto:${HERAUSGEBER.email}`;

  const inhalt = (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5 p-4 pb-8">
      {eingebettet ? (
        <>
          <ComicButton variante="neutral" onClick={onZurueck}>
            Zurück zum Profil
          </ComicButton>
          <h1 className="font-display text-3xl font-extrabold text-ink">Über die App</h1>
        </>
      ) : null}

      <div className="flex items-start justify-end gap-2">
        <SpeechBubble zipfel="rechts" className="mt-3">
          Hier steht, wer die App gemacht hat und was mit deinen Angaben passiert.
        </SpeechBubble>
        <img
          src={assetUrl('/figuren/beat-neutral.svg')}
          alt="Beat"
          width={400}
          height={400}
          className="h-36 w-36 shrink-0 object-contain object-bottom md:h-44 md:w-44"
        />
      </div>

      <Abschnitt titel="Impressum">
        <p>Uri entdecken</p>
        <p>Idee und Entwicklung: {HERAUSGEBER.name}</p>
        <p>
          {HERAUSGEBER.strasse}
          <br />
          {HERAUSGEBER.ort}
          <br />
          {HERAUSGEBER.land}
        </p>
        <p>
          Kontakt:{' '}
          <AussenLink href={mailto}>{HERAUSGEBER.email}</AussenLink>
        </p>
        <p>
          Die App ist ein privates Lernangebot. Sie ist kein Angebot des Kantons Uri und keiner
          Gemeinde.
        </p>
      </Abschnitt>

      <Abschnitt titel="Nutzung">
        <p>
          Die App darf für Lern- und Ausbildungszwecke kostenlos genutzt werden. Dazu gehören
          Schule, Unterricht, Aufgaben und Üben zu Hause.
        </p>
      </Abschnitt>

      <Abschnitt titel="Urheberrecht">
        <p>
          Idee, Texte, Spielablauf und die eigenen Bilder stammen von {HERAUSGEBER.name}, soweit
          unten nichts anderes steht.
        </p>
        <p>
          Diese eigenen Inhalte stehen unter der Lizenz{' '}
          <AussenLink href={LIZENZ.url}>{LIZENZ.name}</AussenLink> ({LIZENZ.kuerzel}).
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Du darfst die App für Lernen und Ausbildung nutzen, auch im Unterricht.</li>
          <li>Du nennst {HERAUSGEBER.name} als Urheber.</li>
          <li>
            Eine kommerzielle Nutzung ist nicht erlaubt. Wer die App verkaufen, in ein
            kostenpflichtiges Angebot einbauen oder damit Geld verdienen will, fragt vorher unter{' '}
            <AussenLink href={mailto}>{HERAUSGEBER.email}</AussenLink> nach.
          </li>
          <li>
            Änderungen sind erlaubt, solange dieselbe Lizenz gilt und kenntlich ist, was geändert
            wurde.
          </li>
        </ul>
        <p>Karten, Wappen und andere fremde Daten behalten ihre eigene Lizenz.</p>
      </Abschnitt>

      <Abschnitt titel="Haftung">
        <p>
          Für die Richtigkeit der Inhalte wird keine Haftung übernommen. Namen, Höhen,
          Einwohnerzahlen, Grenzen und Geschichten können Fehler enthalten. Die App ersetzt keine
          amtliche Auskunft.
        </p>
        <p>
          Fehler und Anregungen gerne an{' '}
          <AussenLink href={mailto}>{HERAUSGEBER.email}</AussenLink>.
        </p>
      </Abschnitt>

      <Abschnitt titel="Datenschutz">
        <p>
          Verantwortlich: {HERAUSGEBER.name}, {HERAUSGEBER.strasse}, {HERAUSGEBER.ort},{' '}
          <AussenLink href={mailto}>{HERAUSGEBER.email}</AussenLink>
        </p>
        <p>
          Die App schickt deinen Namen, deine Gemeinde und deinen Lernstand nicht an uns. Es gibt
          kein Konto, keine Werbung und kein Tracking.
        </p>
        <p>Auf diesem Gerät speichert der Browser unter «{SPEICHER_NAME}»:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>den Namen, den du einträgst (freiwillig, höchstens 20 Zeichen)</li>
          <li>die Heimatgemeinde, die du wählst (freiwillig)</li>
          <li>die Farbe der Cap</li>
          <li>Lernstand, Punkte, Abzeichen, Serie, Missionen und Übungszeit</li>
          <li>ob der Ton an ist und welche Spiele du schon geöffnet hast</li>
        </ul>
        <p>
          Diese Angaben bleiben in diesem Browser. Ein Vorname genügt. Das Namensfeld darf auch
          leer bleiben.
        </p>
        <p>
          Beim Laden der Seite kann der Server, der die App ausliefert, technische
          Verbindungsdaten sehen, zum Beispiel die IP-Adresse und den Zeitpunkt. Das braucht es,
          damit die Seite ankommt. Wir werten diese Daten nicht aus.
        </p>
        <p>
          Du kannst die Angaben im Profil ansehen und unten auf diesem Gerät löschen. Fragen zum
          Datenschutz gehen an{' '}
          <AussenLink href={mailto}>{HERAUSGEBER.email}</AussenLink>. Du kannst dich auch an den{' '}
          <AussenLink href="https://www.edoeb.admin.ch">
            Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten
          </AussenLink>{' '}
          wenden.
        </p>
      </Abschnitt>

      <Abschnitt titel="Quellen">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Gemeinde- und Kantonsgrenzen, Vierwaldstättersee: Geodaten des Bundesamts für
            Landestopografie swisstopo und des Bundesamts für Statistik, aufbereitet mit
            swiss-maps. Quelle: Bundesamt für Landestopografie swisstopo.
          </li>
          <li>
            Relief: swissALTI3D-Reliefschattierung, Bundesamt für Landestopografie swisstopo.
          </li>
          <li>
            Einwohner und Fläche der Gemeinden: Bundesamt für Statistik, ständige Wohnbevölkerung
            Ende 2025, Fläche Gemeindestand 2025.
          </li>
          <li>
            Berge, Pässe und weitere Kartenpunkte: © OpenStreetMap-Mitwirkende, Lizenz{' '}
            <AussenLink href="https://www.openstreetmap.org/copyright">ODbL</AussenLink>.
          </li>
          <li>
            Gemeinde- und Kantonswappen: Wikimedia Commons. Sie bleiben unter der Lizenz der
            jeweiligen Datei. Hoheitszeichen dürfen nicht so verwendet werden, als käme die App
            von einer Behörde.
          </li>
        </ul>
      </Abschnitt>

      <section className="rounded-comic-lg border-comic border-ink bg-weiss p-4 shadow-comic">
        <h2 className="font-display text-2xl font-extrabold text-ink">Angaben auf diesem Gerät löschen</h2>
        <p className="mt-2 font-body text-lg font-semibold leading-snug text-ink">
          Name, Lernstand, Punkte und Abzeichen verschwinden aus diesem Browser. Das lässt sich
          nicht rückgängig machen.
        </p>
        <div className="mt-3">
          <ComicButton
            fullWidth
            variante="neutral"
            onClick={() => {
              if (!window.confirm('Alle Angaben auf diesem Gerät löschen? Das lässt sich nicht rückgängig machen.')) {
                return;
              }
              loescheAlles();
              setGeloescht(true);
            }}
          >
            Alles löschen
          </ComicButton>
        </div>
        {geloescht ? (
          <p className="mt-3 font-body text-lg font-semibold text-ink" role="status">
            Gelöscht. Dein Lernstand auf diesem Gerät ist leer.
          </p>
        ) : null}
      </section>

      <p className="text-center font-body text-base font-semibold text-ink/70">
        Stand: {RECHTLICHES_STAND}
      </p>
    </div>
  );

  if (eingebettet) return inhalt;

  return (
    <Bildschirm>
      <Header titel="Über die App" leitfarbe="ink" onZurueck={onZurueck} />
      {inhalt}
    </Bildschirm>
  );
}
