export interface SageSeite {
  bild: 'bruecke' | 'geiss' | 'stein' | 'kreuz' | 'hut' | 'apfel' | 'sturm' | 'sprung';
  lia: string;
  stierli?: string;
}

export interface Sage {
  id: string;
  titel: string;
  kennzeichnung: string;
  seiten: SageSeite[];
}

export const TEUFELSBRUECKE_SAGE: Sage = {
  id: 'teufelsbruecke',
  titel: 'Die Teufelsbrücke',
  kennzeichnung: 'Man erzählt sich …',
  seiten: [
    {
      bild: 'bruecke',
      lia: 'Die Urner wollen eine Brücke über die wilde Reuss bauen. In der Schöllenen zwischen Göschenen und Andermatt klappt es nicht.',
    },
    {
      bild: 'geiss',
      lia: 'Der Teufel bietet Hilfe an. Als Lohn will er die erste Seele, die über die Brücke geht.',
      stierli: 'Zum Glück haben sie keinen Stier geschickt. Puh.',
    },
    {
      bild: 'geiss',
      lia: 'Die schlauen Urner schicken zuerst einen Geissbock hinüber.',
    },
    {
      bild: 'stein',
      lia: 'Der Teufel ist wütend und will die Brücke mit einem riesigen Stein zerschmettern.',
    },
    {
      bild: 'kreuz',
      lia: 'Eine fromme Frau ritzt ein Kreuz in den Stein. Der Teufel erschrickt – der Stein landet daneben, bei Göschenen. Man nennt ihn Teufelsstein.',
      stierli: 'Beim Teufel werde ich ganz klein. Nur so als Hinweis.',
    },
  ],
};

export const TELL_SAGE: Sage = {
  id: 'tell',
  titel: 'Wilhelm Tell',
  kennzeichnung: 'Man erzählt sich …',
  seiten: [
    {
      bild: 'hut',
      lia: 'Landvogt Gessler stellt einen Hut auf eine Stange. Alle sollen davor grüssen. Tell tut es nicht.',
    },
    {
      bild: 'apfel',
      lia: 'Zur Strafe soll Tell in Altdorf einem Apfel auf dem Kopf seines Sohnes treffen. Der Schuss sitzt.',
    },
    {
      bild: 'sturm',
      lia: 'Auf dem See kommt ein Sturm. Tell darf die Arme frei, um das Boot zu steuern.',
    },
    {
      bild: 'sprung',
      lia: 'Er springt bei der Tellsplatte aus dem Boot – dort steht heute die Tellskapelle bei Sisikon.',
    },
  ],
};

export const SAGEN = [TEUFELSBRUECKE_SAGE, TELL_SAGE] as const;

export interface SagenFrage {
  id: string;
  text: string;
  optionen: string[];
  richtig: string;
  hinweis: string;
}

export const SAGEN_FRAGEN: SagenFrage[] = [
  {
    id: 'fluss',
    text: 'Welcher Fluss fliesst unter der Teufelsbrücke?',
    optionen: ['Reuss', 'Schächen', 'Rhone'],
    richtig: 'Reuss',
    hinweis: 'Die Brücke steht in der Schöllenen über der Reuss.',
  },
  {
    id: 'geiss',
    text: 'Wen schicken die Urner zuerst über die Brücke?',
    optionen: ['Einen Geissbock', 'Einen Stier', 'Den Landvogt'],
    richtig: 'Einen Geissbock',
    hinweis: 'So tricksen sie den Teufel aus.',
  },
  {
    id: 'denkmal',
    text: 'Wo steht das Telldenkmal?',
    optionen: ['Altdorf', 'Andermatt', 'Flüelen'],
    richtig: 'Altdorf',
    hinweis: 'Laut Sage geschah dort der Apfelschuss.',
  },
  {
    id: 'heimat',
    text: 'Wo ist Tells Heimat – laut Sage?',
    optionen: ['Bürglen', 'Seedorf', 'Wassen'],
    richtig: 'Bürglen',
    hinweis: 'In Bürglen steht das Tell-Museum.',
  },
  {
    id: 'kapelle',
    text: 'Wo steht die Tellskapelle?',
    optionen: ['Bei Sisikon', 'In Göschenen', 'Auf dem Rütli'],
    richtig: 'Bei Sisikon',
    hinweis: 'An der Tellsplatte. Die Kapelle ist auch im Wappen von Sisikon.',
  },
  {
    id: 'hohle',
    text: 'Liegt die Hohle Gasse in Uri?',
    optionen: ['Nein, in Küssnacht (Schwyz)', 'Ja, in Altdorf', 'Ja, in Sisikon'],
    richtig: 'Nein, in Küssnacht (Schwyz)',
    hinweis: 'Das ist eine Fangfrage – wie Luzern und Zug bei den Kantonen.',
  },
];

export function istSagenAntwort(wahl: string, frage: SagenFrage): boolean {
  return wahl === frage.richtig;
}
