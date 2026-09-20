import type { LernElement } from '../types/karte';
import { assetUrl } from '../lib/assetUrl';

const STANDARD_TIPPS = [
  'Überlege, in welcher Gegend von Uri die Gemeinde liegt.',
  'Die Nachbargemeinden leuchten dir als Hinweis auf.',
  'Dort blinkt die gesuchte Gemeinde kurz auf!',
];

/** BFS: ständige Wohnbevölkerung 31.12.2025, Fläche Gemeindestand 2025. */
const EINWOHNER_STAND = 'Ende 2025';

interface GemeindeInfo {
  wappenTipp: string;
  wappenHintergrund: string;
  funFact: string;
  einwohner: number;
  flaecheKm2: number;
  regionTipp?: string;
  istHauptort?: boolean;
}

const gem = (bfs: number, name: string, info: GemeindeInfo): LernElement => ({
  id: `gem-${bfs}`,
  kategorie: 'gemeinde',
  name,
  geo: String(bfs),
  wappen: assetUrl(`/wappen/gemeinden/${bfs}.svg`),
  tipps: [info.regionTipp ?? STANDARD_TIPPS[0], STANDARD_TIPPS[1], STANDARD_TIPPS[2]],
  wappenTipp: info.wappenTipp,
  wappenHintergrund: info.wappenHintergrund,
  funFact: info.funFact,
  einwohner: info.einwohner,
  flaecheKm2: info.flaecheKm2,
  einwohnerStand: EINWOHNER_STAND,
  istHauptort: info.istHauptort,
});

/** 19 Urner Gemeinden (Stand 2021 ff.) */
export const GEMEINDEN: LernElement[] = [
  gem(1201, 'Altdorf', {
    istHauptort: true,
    einwohner: 10618,
    flaecheKm2: 10.21,
    wappenTipp: 'Links ein halber schwarzer Adler auf Gelb, rechts rot mit zwei weissen Schrägbalken.',
    wappenHintergrund:
      'Der Adler erinnert daran, dass Altdorf zum Reich gehörte. Die drei roten Flächen sollen an drei grosse Dorfbrände erinnern.',
    funFact:
      'Man erzählt sich: Hier hat Tell den Apfel vom Kopf seines Sohnes geschossen. Auf dem Marktplatz steht das Telldenkmal.',
  }),
  gem(1202, 'Andermatt', {
    einwohner: 1603,
    flaecheKm2: 62.26,
    wappenTipp: 'Ein schwarzer Bär auf Gelb, oben ein schwarzes Kreuz.',
    wappenHintergrund:
      'Der Bär steht für das Urserntal – der Name bedeutet Bärental. Das Kreuz erinnert an das Kloster Disentis.',
    funFact:
      'Von Andermatt aus geht es über den Oberalppass nach Graubünden. Ganz nah sind auch Gotthard- und Furkapass.',
  }),
  gem(1203, 'Attinghausen', {
    einwohner: 1781,
    flaecheKm2: 46.89,
    wappenTipp: 'Oben ein schwarzer Adler auf Gelb, unten schwarz-gelbe Streifen.',
    wappenHintergrund:
      'Das ist das Wappen der Freiherren von Attinghausen. Sie wohnten im Mittelalter auf der Burg hier.',
    funFact: 'Oben auf dem Hügel steht die Burgruine. Der Turm hatte Mauern von drei Metern Dicke!',
  }),
  gem(1205, 'Bürglen', {
    einwohner: 3923,
    flaecheKm2: 53.06,
    wappenTipp: 'Auf Blau eine weisse Mauer mit vier Türmen und einem roten Tor.',
    wappenHintergrund: 'Die vier Türme standen wirklich in Bürglen. Einer ist heute das Tell-Museum.',
    funFact: 'Man erzählt sich: Wilhelm Tell hat hier gelebt. Darum gibt es in Bürglen ein Tell-Museum.',
  }),
  gem(1206, 'Erstfeld', {
    einwohner: 3985,
    flaecheKm2: 59.08,
    wappenTipp: 'Auf Blau ein gelber Hirsch. Im Geweih hängt ein Tuch.',
    wappenHintergrund:
      'Man erzählt sich: Ein Jäger sah in der Jagdmatt einen Hirsch mit dem Schweisstuch Christi – und wurde gläubig.',
    funFact:
      'Hier beginnt der Gotthard-Basistunnel – mit 57 Kilometern der längste Eisenbahntunnel der Welt.',
  }),
  gem(1207, 'Flüelen', {
    einwohner: 2048,
    flaecheKm2: 12.38,
    wappenTipp: 'Eine weisse Rose auf Grün.',
    wappenHintergrund:
      'Die Rose kommt wohl vom alten Namen Fiora. Auch die Grafen von Rapperswil führten eine Rose – sie hatten hier den Zoll.',
    funFact:
      'Hier endet der Urnersee. Von Flüelen fahren die Schiffe, und hier beginnt die Axenstrasse am Fels entlang.',
  }),
  gem(1208, 'Göschenen', {
    einwohner: 482,
    flaecheKm2: 104.15,
    wappenTipp: 'Eine weisse Burg mit rotem Tor auf Blau, darüber ein gelbes Posthorn.',
    wappenHintergrund:
      'Das Tor erinnert an den alten Zoll an der Reussbrücke. Das Posthorn steht für den Gotthardverkehr.',
    funFact:
      'Hier steckt das Nordportal des alten Gotthard-Eisenbahntunnels. Gleich daneben führt die wilde Schöllenen zur Teufelsbrücke.',
  }),
  gem(1209, 'Gurtnellen', {
    einwohner: 501,
    flaecheKm2: 83.31,
    wappenTipp: 'Oben ein weisser Stern auf Schwarz, unten ein halbes schwarzes Mühlrad auf Gelb.',
    wappenHintergrund:
      'Der fünfzackige Stern steht für fünf Gemeindeteile. Das Mühlrad erinnert an die alte Wassermühle am Gornerbach.',
    funFact: 'Hoch über dem Dorf liegt der Arnisee. Man fährt mit der Seilbahn hinauf.',
  }),
  gem(1210, 'Hospental', {
    einwohner: 176,
    flaecheKm2: 35.17,
    wappenTipp: 'Ein schwarzer Bär auf Gelb, der ein weisses Kreuz hält.',
    wappenHintergrund:
      'Das war das Wappen der Familie von Hospental. Sie wohnten im Turm mitten im Dorf.',
    funFact:
      'Hier teilen sich die Wege: zum Gotthardpass ins Tessin und zum Furkapass ins Wallis. Der alte Turm steht noch.',
  }),
  gem(1211, 'Isenthal', {
    einwohner: 461,
    flaecheKm2: 60.97,
    wappenTipp: 'Eine weisse Leiter auf Rot.',
    wappenHintergrund:
      'Früher kam man nur über steile Felsen ins Tal. Die ersten Bewohner sollen eine Leiter benutzt haben.',
    funFact:
      'Lange gab es keine Autostrasse. Erst 1901 konnte man von Isleten her mit Wagen nach Isenthal fahren.',
  }),
  gem(1212, 'Realp', {
    einwohner: 157,
    flaecheKm2: 77.84,
    wappenTipp: 'Ein weisses Kreuz auf Grün, unten drei Hügel.',
    wappenHintergrund:
      'Das Kreuz steht für die Kirche Heilig Kreuz. Die drei Hügel sind Geländeeinschnitte in Realp.',
    funFact:
      'Realp hat die wenigsten Einwohner von Uri. Im Sommer fährt von hier eine echte Dampfbahn über die Furka ins Wallis.',
  }),
  gem(1213, 'Schattdorf', {
    einwohner: 5555,
    flaecheKm2: 16.33,
    wappenTipp: 'Drei gelbe Äpfel an einem weissen Zweig, auf Blau.',
    wappenHintergrund:
      'Die Äpfel gehören zum heiligen Nikolaus. In der Legende schenkt er drei goldene Äpfel.',
    funFact:
      'Schattdorf ist die zweitgrösste Urner Gemeinde. Oben am Hang liegt Haldi, rund 1000 Meter über Meer.',
  }),
  gem(1214, 'Seedorf', {
    einwohner: 2054,
    flaecheKm2: 19.29,
    wappenTipp: 'Zwei gekreuzte weisse Hechte auf Blau.',
    wappenHintergrund:
      'Seedorf liegt am See, früher wurde hier gefischt. Der Fisch ist auch das Zeichen des Kirchenpatrons Sankt Ulrich.',
    funFact:
      'Hier steht Schloss A Pro – ein altes Wasserschloss mit Graben. Seit 2021 gehört auch das Dorf Bauen dazu.',
  }),
  gem(1215, 'Seelisberg', {
    einwohner: 724,
    flaecheKm2: 13.29,
    wappenTipp: 'Der Erzengel Michael mit Waage und Schwert auf Rot, unten drei weisse Berge.',
    wappenHintergrund: 'Michael ist der Kirchenpatron. Das Wappen kommt vom alten Kirchensiegel.',
    funFact:
      'Auf dem Gemeindegebiet liegt das Rütli. Dort sollen die Urkantone 1291 den Bund geschworen haben.',
  }),
  gem(1216, 'Silenen', {
    einwohner: 2080,
    flaecheKm2: 144.78,
    wappenTipp: 'Ein roter Löwe auf Gelb.',
    wappenHintergrund: 'Das ist das Wappen der Ritterfamilie von Silenen aus dem Mittelalter.',
    funFact:
      'Drei Dörfer gehören dazu: Silenen, Amsteg und Bristen. Dahinter liegt das wilde Maderanertal – und die Gemeinde ist flächenmässig die grösste in Uri.',
  }),
  gem(1217, 'Sisikon', {
    einwohner: 399,
    flaecheKm2: 16.46,
    wappenTipp: 'Die Tellskapelle am See, auf Grün.',
    wappenHintergrund:
      'Die Tellskapelle steht wirklich am See bei Sisikon. Darum hat die Gemeinde sie ins Wappen genommen.',
    funFact: 'Man erzählt sich: Hier sprang Tell aus dem Boot auf die Felsplatte – die Tellsplatte.',
  }),
  gem(1218, 'Spiringen', {
    einwohner: 872,
    flaecheKm2: 64.68,
    wappenTipp: 'Ein Krieger mit Helm und Hellebarde auf Gelb.',
    wappenHintergrund: 'Das ist das Bild der Familie Arnold, dem wichtigsten Geschlecht in Spiringen.',
    funFact:
      'Zum Gemeindegebiet gehört der Urnerboden – die grösste Alp der Schweiz, jenseits des Klausenpasses.',
  }),
  gem(1219, 'Unterschächen', {
    einwohner: 737,
    flaecheKm2: 80.28,
    wappenTipp: 'Der heilige Theodul mit einer Glocke. Zu seinen Füssen ein Teufelchen mit Glocke. Oben weisse Wellen.',
    wappenHintergrund:
      'Theodul ist der Kirchenpatron. Man erzählt sich: Der Teufel musste für ihn eine Glocke tragen.',
    funFact: 'Unterschächen liegt am Fuss des Klausenpasses. Von hier geht es hoch nach Glarus.',
  }),
  gem(1220, 'Wassen', {
    einwohner: 425,
    flaecheKm2: 96.88,
    wappenTipp: 'Ein schwarzer Bär mit einem gelben Holz auf der Schulter, auf Weiss.',
    wappenHintergrund:
      'Die Kirche gehört dem heiligen Gallus. Man erzählt sich: Ein Bär half ihm beim Bauen – darum trägt der Bär ein Holz.',
    funFact:
      'Im Zug über die alte Gotthardbahn siehst du die Kirche von Wassen dreimal – weil die Bahn in Kehrtunneln den Berg hochschraubt.',
  }),
];

export const GEMEINDEN_MAP = new Map(GEMEINDEN.map((g) => [g.geo, g]));
