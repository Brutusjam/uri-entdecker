# Uri-Entdecker – Lern-WebApp (Entwicklungsplan für Cursor)

> Dieses Dokument ist die Arbeitsgrundlage für Cursor. Bitte phasenweise umsetzen (Kapitel 9), nach jeder Phase die Abnahmekriterien prüfen und erst dann weitermachen. Bei offenen Punkten (Kapitel 11) nicht raten, sondern nachfragen.

---

## 1. Ziel und Zielgruppe

Eine spielerische Lern-WebApp, mit der ein 11-jähriges Mädchen (5./6. Klasse, Kanton Uri) Geografie des Kantons Uri lernt. Die App soll sich wie ein Spiel anfühlen, nicht wie ein Arbeitsblatt – aber am Ende muss sie eine «stumme Karte» sicher beschriften können.

**Lernziele (Pflicht)**

| # | Lernziel | Anzahl Elemente |
|---|---|---|
| L1 | Urner Gemeinden auf der Karte finden und bezeichnen | 19 |
| L2 | Wappen aller Urner Gemeinden benennen | 19 |
| L3 | Nachbarkantone auf der Karte bezeichnen | 8 |
| L4 | Wappen der Nachbarkantone (plus Uri) benennen | 9 |
| L5 | Täler kennen und auf der Karte eintragen | 10 |
| L6 | Gewässer kennen (Urnersee, Göscheneralpsee) | 2 (+ Bonus) |

**Lernziele Fortgeschrittenenmodus «Uri-Profi»** (siehe Kapitel 8)

| # | Lernziel | Anzahl Elemente |
|---|---|---|
| L7 | Pässe kennen, auf der Karte finden und dem Nachbarkanton zuordnen | 5 |
| L8 | Wichtige Berge kennen und auf der Karte finden | ca. 8 |
| L9 | Sagen und Geschichte: Teufelsbrücke und Wilhelm Tell mit ihren Orten | 2 Geschichten, ca. 7 Orte |

**Täler (L5):** Riemenstaldnertal, Grosstal (Isenthal), Schächental, Erstfeldertal, Maderanertal, Fellital, Meiental, Göschenertal, Unteralptal, Urserntal.

**Nachbarkantone (L3):** Schwyz, Glarus, Graubünden, Tessin, Wallis, Bern, Obwalden, Nidwalden. (Luzern und Zug grenzen **nicht** an Uri – gute Fangfrage!)

**Gemeinden (L1), Stand 2026, 19 Gemeinden (Bauen seit 2021 in Seedorf):**
Altdorf, Andermatt, Attinghausen, Bürglen, Erstfeld, Flüelen, Göschenen, Gurtnellen, Hospental, Isenthal, Realp, Schattdorf, Seedorf, Seelisberg, Silenen, Sisikon, Spiringen, Unterschächen, Wassen.

---

## 2. Tech-Stack

| Bereich | Wahl | Begründung |
|---|---|---|
| Build | **Vite + React + TypeScript** | Rein statische App, kein Server nötig. (Next.js ginge auch, bringt hier aber keinen Vorteil.) |
| Styling | Tailwind CSS | schnell, konsistent |
| Karte | **d3-geo + SVG** (eigene Komponente), d3-zoom für Pan/Zoom | Volle Kontrolle über Klickflächen, Farben, Animationen; keine Kacheln/Tileserver nötig, offline-fähig |
| Geo-Hilfen | @turf/turf | Hit-Tests für Täler (Puffer um Linien), Zuschneiden des Urnersees |
| State | zustand (+ persist-Middleware → localStorage) | einfach, Fortschritt bleibt erhalten |
| Animation | framer-motion, canvas-confetti | Belohnungseffekte |
| Sound | howler.js | Soundeffekte, optional Sprachausgabe |
| PWA | vite-plugin-pwa | auf Tablet «installierbar», läuft offline |
| Tests | Vitest (Logik), Playwright (1–2 Smoke-Tests) | |
| Hosting | statischer Build, nginx-Container im Homelab (Proxmox) oder lokal | |

**Wichtig:** Tablet-first (Touch) entwickeln, aber auch mit Maus bedienbar. Mindestgrösse Touch-Ziele 44 px; kleine Gemeinden (Flüelen, Sisikon, Altdorf, Schattdorf) brauchen Zoom oder vergrösserte Trefferzonen.

---

## 3. Datenquellen (recherchiert und teilweise getestet)

### 3.1 Gemeinde- und Kantonsgrenzen ✅ getestet

- npm-Paket **`swiss-maps`** (Interactive Things), basiert auf swisstopo/BFS-Geodaten, enthält Jahrgänge bis **2026**.
- Datei: `node_modules/swiss-maps/2026/ch-combined.json` (TopoJSON, WGS84), Objekte: `country`, `cantons`, `districts`, `municipalities`, `lakes`.
- **Achtung:** Die Features haben **keine Namen**, nur die `id` (= BFS-Nummer). Namen werden über eine eigene Tabelle zugeordnet.
- BFS-Nummern Uri: 1201–1220 ohne 1204 (Bauen). Kantonsnummern: UR 4, BE 2, SZ 5, OW 6, NW 7, GL 8, GR 18, TI 21, VS 23.
- Seen: `lakes` enthält nur grosse Seen; der **Vierwaldstättersee hat id 9179** (Urnersee ist ein Teil davon). Der **Göscheneralpsee fehlt**.
- Das Skript `scripts/extract-uri.mjs` (liegt bei) erzeugt daraus `public/geo/uri-gemeinden.geojson`, `public/geo/kantone.geojson`, `public/geo/vierwaldstaettersee.geojson`. Die Zuordnung BFS-Nummer → Name wurde über die Flächenschwerpunkte plausibilisiert.

Aufruf:
```bash
npm i -D swiss-maps topojson-client
node scripts/extract-uri.mjs
```

### 3.2 Urnersee

Den Vierwaldstättersee mit turf auf den Urner Teil zuschneiden (`turf.intersect` mit dem Kantonspolygon Uri **oder** einem Rechteck südlich von Brunnen). Resultat visuell prüfen: Urnersee = See-Arm von Brunnen/Seelisberg bis Flüelen. Übriger Vierwaldstättersee blass darstellen.

### 3.3 Göscheneralpsee und Bonus-Gewässer

Aus OpenStreetMap via Overpass-API einmalig holen und als GeoJSON speichern:
```
[out:json];
(
  way["natural"="water"]["name"="Göscheneralpsee"];
  relation["natural"="water"]["name"="Göscheneralpsee"];
);
out geom;
```
Konvertierung mit `osmtogeojson`. Lizenzhinweis im «Über»-Screen: «© OpenStreetMap-Mitwirkende (ODbL)». Gleiches Vorgehen für Bonus-Gewässer (Reuss, Schächen, Oberalpsee, Seelisbergsee, Golzernsee, Arnisee) – nur wenn gewünscht.

Alternative: swissTLM3D (swisstopo, Open Data) – genauer, aber aufwendiger in der Aufbereitung.

### 3.4 Wappen ⚠️ Skript geschrieben, noch nicht ausgeführt

- Alle Gemeinde- und Kantonswappen gibt es als SVG auf **Wikimedia Commons** (Kategorie «SVG coats of arms of municipalities of the canton of Uri»), Dateinamen nach Muster `Andermatt-coat of arms.svg`, `Sisikon-coat of arms.svg`. Als Wappen öffentlich-rechtlicher Körperschaften sind sie auf Commons als gemeinfrei (Public Domain) markiert.
- Das Skript `scripts/fetch-wappen.mjs` (liegt bei) holt die Zuordnung sauber über **Wikidata** (P771 BFS-Nummer → P94 Wappenbild; P300 ISO-Code für Kantone) und lädt die SVGs nach `public/wappen/…` inkl. `manifest.json`.
- **Cursor:** Skript ausführen, prüfen dass 19 + 9 = 28 Wappen vorhanden sind und jedes Wappen visuell zum Namen passt (Stichprobe mit den Wappenbeschreibungen unten). Falls Wikidata ein veraltetes Wappen liefert (z. B. Seedorf nach der Fusion), manuell auf Commons nachsehen und melden.
- Hinweis: Die Nutzung ist privat bzw. schulisch und nicht kommerziell. Falls die App später öffentlich oder kommerziell genutzt würde, die Wappennutzung vorher klären.

### 3.5 Täler – keine fertigen Geodaten verfügbar

Täler haben keine amtlichen Grenzen. Lösung:
1. **Tal-Editor (nur im Dev-Modus, Route `/editor`)**: Auf der Karte Punkte entlang des Talbodens klicken → Polylinie; zusätzlich ein Label-Punkt. Speichern als `src/data/taeler.json` (Download-Button).
2. **Trefferprüfung**: Talpolylinie mit `turf.buffer` (ca. 1–1.5 km) zu einer Fläche machen → Klick innerhalb = richtig.
3. Anzeige: Tal als halbtransparentes «Band» mit abgerundeten Enden, im Lernmodus mit Namen.
4. Orientierung zum Einzeichnen (Talbach bzw. Talausgang):
   - Riemenstaldnertal – Riemenstaldner Bach, Ausgang bei Sisikon (grösster Teil des Tals liegt im Kanton Schwyz!)
   - Grosstal – Isenthal
   - Schächental – Schächen, Bürglen → Klausenpass
   - Erstfeldertal – Alpbach, Erstfeld → Richtung Schlossberg
   - Maderanertal – Chärstelenbach, Amsteg → Bristen
   - Fellital – Fellibach, Ausgang bei Gurtnellen
   - Meiental – Meienreuss, Wassen → Sustenpass
   - Göschenertal – Göschenerreuss, Göschenen → Göscheneralpsee
   - Unteralptal – Unteralpreuss, Andermatt → Süden
   - Urserntal – Reuss, Andermatt – Hospental – Realp → Furkapass

Diese Polylinien zeichnet der Vater einmalig im Editor ein (15 Minuten Aufwand) – das ist genauer als jede automatische Lösung.

### 3.6 Pässe, Berge und Sagenorte (Fortgeschrittenenmodus)

Alles Punktdaten. Skript `scripts/fetch-punkte.mjs` holt sie einmalig via Overpass (OpenStreetMap) anhand einer Namensliste:
- Pässe: `mountain_pass=yes` bzw. `natural=saddle` – Gotthardpass, Furkapass, Oberalppass, Sustenpass, Klausenpass
- Berge: `natural=peak` – Namen aus Tabelle 8.3
- Sagenorte: Teufelsbrücke, Teufelsstein, Telldenkmal Altdorf, Tell-Museum Bürglen, Tellskapelle, Rütli

Höhen (`ele`) werden mit übernommen und stichprobenweise mit map.geo.admin.ch verglichen; Alternative ist swissNAMES3D (swisstopo, Open Data). Ergebnis: `public/geo/punkte.geojson`. Fehlt ein Punkt oder ist er doppelt, meldet das Skript dies – dann Koordinate manuell auf map.geo.admin.ch ablesen und nachfragen.

### 3.7 Hintergrundkarte

Kein Luftbild nötig. Empfohlen: stilisierte Comic-Karte (Kanton in warmem Grün, Seen blau, Nachbarkantone hellgrau, weiche Schatten). Optional als Bonus-Ebene ein Relief (swisstopo-Relief als Bild) – nicht in Phase 1.

---

## 4. Datenmodell

```ts
type Kategorie = 'gemeinde' | 'kanton' | 'tal' | 'gewaesser'
  | 'pass' | 'berg' | 'sagenort';          // Fortgeschrittenenmodus

interface LernElement {
  id: string;               // z.B. "gem-1201", "kt-SZ", "tal-schaechental", "see-urnersee"
  kategorie: Kategorie;
  name: string;             // "Göschenen"
  aliase?: string[];        // Schreibvarianten für Tipp-Modus, z.B. ["Goeschenen"]
  geo: string;              // Verweis auf Feature-ID in der GeoJSON-Datei
  wappen?: string;          // "/wappen/gemeinden/1208.svg"
  tipps: string[];          // gestufte Hinweise, vom allgemeinen zum konkreten
  wappenTipp?: string;      // kindgerechte Wappenbeschreibung
  funFact?: string;         // 1 Satz, z.B. "Hier beginnt die Teufelsbrücke-Sage"
}

interface Fortschritt {
  [elementId: string]: {
    stufe: 0 | 1 | 2 | 3 | 4 | 5;   // Leitner-Box: 0 = neu, 5 = gemeistert
    richtig: number;
    falsch: number;
    zuletzt: string;                  // ISO-Datum
    naechsteWiederholung: string;
  };
}

interface SpielerProfil {
  name: string;
  xp: number;
  abzeichen: string[];
  sticker: Record<string, 'normal' | 'glanz'>;   // elementId → Stickerart
  bestzeiten: Record<string, number>;            // z.B. "puzzle-gemeinden-leicht"
  profiFreigeschaltet: boolean;
  avatar: { heimatgemeinde?: string; capFarbe?: string; frisur?: string };
  serie: { tage: number; letzterTag: string };
}
```

Gemeinden, Kantone, Täler, Gewässer liegen als je eine Datei in `src/data/`. Texte (Tipps, Fun Facts) werden gemeinsam mit dem Vater geprüft – **keine erfundenen Fakten**: im Zweifel Feld leer lassen und in einer Liste `TODO-FAKTEN.md` sammeln.

**Wappenbeschreibungen als Tipps (Beispiele, verifiziert):**
- Altdorf: links halber schwarzer Adler auf Gold, rechts rot mit zwei weissen Schrägbalken
- Andermatt: schwarzer Bär auf Gelb, mit schwarzem Kreuz oben
- Seedorf: zwei gekreuzte weisse Hechte auf Blau
- Sisikon: die Tellskapelle am See auf Grün

Weitere aus den Commons-Dateibeschreibungen (Feld «Blazon») ableiten und kindgerecht umformulieren.

---

## 5. Spielmodi (Grundmodus)

| Modus | Beschreibung | Lernziele |
|---|---|---|
| **Entdecken** | Freies Tippen auf die Karte: Name, Wappen, Fun Fact, Lia oder Stierli erzählen etwas. Kein Druck, keine Punkte. | alle |
| **Finden** | «Wo liegt Wassen?» → auf Karte tippen. 3 Versuche mit gestuften Tipps (Region → Nachbarn aufleuchten → Blinken). | L1, L3, L5, L6 |
| **Beschriften** | Stumme Karte, Namensschilder per Drag & Drop an den richtigen Ort ziehen – wie der Schultest. | L1, L3, L5, L6 |
| **Wie heisst das?** | Element leuchtet auf → Namen wählen (4 Antworten) oder eintippen (Profi-Stufe, tolerante Schreibweise). | L1, L3, L5, L6 |
| **Wappen-Quiz** | Wappen → Name, Name → Wappen, Wappen auf die richtige Gemeinde ziehen. | L2, L4 |
| **Wappen-Memory** | siehe 5.2 | L2, L4 |
| **Puzzle** | siehe 5.1 | L1, L3 |
| **Blitzrunde** | 60 Sekunden, so viele richtige wie möglich, Highscore. | alle |
| **Prüfungsmodus** | Ohne Tipps, alles einmal, Resultat als Schweizer Note (1–6) mit Fehlerliste. | alle |
| **Duell** | 2 Spieler abwechselnd am gleichen Gerät (z. B. Tochter gegen Papa). | alle |

Schwierigkeitsstufen pro Modus: **Leicht** (Namen der Nachbarn sichtbar, 4 Auswahlmöglichkeiten), **Mittel**, **Profi** (freies Tippen, keine Tipps).

Fragenauswahl: Elemente mit tiefer Leitner-Stufe und fälliger Wiederholung werden bevorzugt (Spaced Repetition). Nie dieselbe Frage zweimal hintereinander.

### 5.1 Puzzle

Die Gemeinden (bzw. Kantone) liegen als Puzzleteile ungeordnet neben der Karte und müssen in den Umriss gezogen werden.

- **Varianten:** Gemeinde-Puzzle (19 Teile im Kantonsumriss Uri), Kantons-Puzzle (Uri + 8 Nachbarn im Umriss der Zentralschweiz).
- **Stufen:**
  - Leicht: Gemeindegrenzen als feine Linien im Umriss sichtbar, Teile mit Namen beschriftet.
  - Mittel: nur Kantonsumriss sichtbar, Teile mit Namen.
  - Profi: nur Kantonsumriss, Teile **ohne** Namen – oder mit Wappen statt Namen.
- **Technik:** Jedes Teil ist das SVG-Polygon der Gemeinde (aus derselben Projektion wie die Karte, damit Grösse und Form stimmen). Keine Rotation. Einrasten, wenn der Schwerpunkt des Teils näher als eine Toleranz (z. B. 4 % der Kartenbreite) am Zielschwerpunkt liegt.
- **Kleine Gemeinden** (Flüelen, Sisikon, Altdorf, Schattdorf) bekommen einen unsichtbaren, grösseren Greifbereich, damit sie mit dem Finger gut zu fassen sind.
- Falsch abgelegt → Teil federt zurück, Stierli kommentiert freundlich; nach 2 Fehlversuchen leuchtet der Zielbereich kurz auf.
- **Wertung:** Zeit und Anzahl Fehlversuche → 1–3 Sterne; Bestzeit wird gespeichert.
- Jedes richtig eingesetzte Teil zählt als «richtig» für das Element im Fortschritt (L1).

### 5.2 Wappen-Memory

Klassisches Memory mit Karten, die umgedreht werden.

- **Paar-Typen** (wählbar):
  - Wappen ↔ Gemeindename (Standard)
  - Wappen ↔ Umriss der Gemeinde (Profi)
  - Kantonswappen ↔ Kantonsname oder Kürzel (SZ, GL …)
- **Grösse:** 4×4 (8 Paare, Leicht), 5×4 (10 Paare), 6×5 (15 Paare, Profi). Paare zufällig, bevorzugt aus schwachen Elementen.
- Beim Aufdecken eines Paars kurz den Wappen-Tipp zeigen («Zwei gekreuzte Hechte – das ist Seedorf!»).
- **Solo:** Anzahl Züge und Zeit → Sterne. **Duell:** 2 Spieler abwechselnd, wer mehr Paare hat, gewinnt.
- Gefundene Paare zählen für das Wappen-Lernziel (L2/L4) und damit fürs Sticker-Album.

---

## 6. Fortschritt und Belohnung

Fehler werden nie bestraft (keine Minuspunkte), sondern führen zu Tipp und Wiederholung.

### 6.1 Fortschrittskarte (Herzstück, Startbildschirm)

- Die Uri-Karte auf dem Startbildschirm zeigt den Lernstand jedes Elements als Farbe:
  - Stufe 0: grau (noch nicht gesehen)
  - Stufe 1–2: hellgrün
  - Stufe 3–4: sattgrün
  - Stufe 5 (gemeistert): gold mit kleinem Glanz-Effekt
- **Ebenen-Umschalter** (Reiter): Gemeinden · Kantone · Täler & Seen · (freigeschaltet) Pässe & Berge · Sagen.
- Antippen eines Elements zeigt: Name, Wappen, Stufe, richtig/falsch, «Jetzt üben»-Knopf (startet direkt eine kurze Runde zu diesem Element).
- Steigt ein Element eine Stufe auf, wird beim nächsten Besuch des Startbildschirms die Farbänderung animiert – Lia kommentiert («Andermatt ist jetzt gold!»).
- Fortschrittsbalken pro Lernziel oben (z. B. «Gemeinden 12/19»).
- Farbe nie als einziges Signal: gemeisterte Elemente bekommen zusätzlich ein kleines Sternsymbol.

### 6.2 Sticker-Album

- Eigener Menüpunkt, gestaltet wie ein echtes Stickeralbum (Seiten zum Blättern).
- **Seiten:** Urner Gemeinden (19) · Uri & Nachbarkantone (9) · im Fortgeschrittenenmodus zusätzlich Pässe · Berge · Sagen.
- Leere Plätze zeigen die Silhouette mit «?» und den Namen erst, wenn das Element einmal gesehen wurde.
- **Sticker verdienen:** Element erreicht Stufe 3 → normaler Sticker wird mit «Einklebe»-Animation ins Album geklebt. Stufe 5 → Sticker wird zum **Glanz-Sticker** (Gold-Rand).
- Volle Seite → Seiten-Abzeichen und Konfetti. Volles Album → besondere Urkunde (druckbar, mit Name und Datum).
- Wappen-Sticker zeigen das Wappen; Pass-/Berg-/Sagen-Sticker zeigen eine kleine Comic-Illustration (Lia auf dem Pass, Stierli auf der Teufelsbrücke …).

### 6.3 Punkte, Level, Abzeichen, Tagesmission

- **Punkte (XP)** und **Level mit Titeln**: Wanderin → Alphirtin → Bergführerin → Gipfelstürmerin → Urner Landammann.
- **Abzeichen**, z. B. «Alle Nachbarn gefunden», «10er-Serie», «Ohne Tipp durch alle Täler», «Puzzle unter 2 Minuten», «Memory in unter 20 Zügen».
- **Tagesmission** (3 kurze Aufgaben, ca. 5 Minuten) und **Serie** (Tage in Folge) mit Frostschutz (1 Tag Pause verzeiht).
- **Eltern-Ansicht** (hinter einfacher Rechenaufgabe): welche Elemente sitzen, welche nicht, Übungszeit pro Tag; Freischaltung des Fortgeschrittenenmodus manuell möglich.

---

## 7. Figuren: Lia und Stierli (bestätigt)

**Lia** – ca. 12 Jahre, cooles Mädchen aus Uri. Cap verkehrt, Rucksack, Wanderschuhe, Karte in der Hand, manchmal auf dem Mountainbike. Neugierig, mutig, lustig. Sie erklärt, gibt Tipps, feiert Erfolge und tröstet bei Fehlern.

**Stierli** – kleiner, frecher Uristier als eigene Cartoonfigur (angelehnt an das Urner Wappentier, aber nicht das Wappen selbst). Etwas tollpatschig, macht Witze, «schnaubt» bei falschen Antworten freundlich, verrät in Notfällen den letzten Tipp. Hat Angst vor dem Teufel (Running Gag für die Teufelsbrücke).

**Posen (je als SVG):**

| Pose | Lia | Stierli |
|---|---|---|
| neutral / wartet | ✓ | ✓ |
| zeigt auf etwas (Tipp) | ✓ | ✓ |
| denkt nach | ✓ | ✓ |
| freut sich / jubelt | ✓ | ✓ (Luftsprung) |
| tröstet / «macht nichts» | ✓ | ✓ |
| erschrocken (Sagen) | – | ✓ |
| Wanderin auf dem Pass (Sticker) | ✓ | ✓ |

**Stil:** dicke Outlines, flache Farben, grosse Augen, einheitliche Farbpalette. Erst einfache SVG-Version durch Cursor (austauschbar), später evtl. durch gezeichnete/generierte Figuren ersetzen – Dateinamen und Posen bleiben gleich, damit der Tausch nur Dateien betrifft.

**Sprechblasen-System:**
- Texte in `src/data/sprueche.ts`, gruppiert nach Anlass: `begruessung`, `tipp`, `richtig`, `falsch`, `serie`, `levelUp`, `sticker`, `sage`.
- Pro Anlass mehrere Varianten, zufällig gewählt; nie zweimal hintereinander derselbe Spruch.
- Max. 1–2 kurze Sätze, Hochdeutsch, gelegentlich ein Urner Mundart-Spruch.
- Lia spricht bei Erklärungen und Tipps, Stierli bei Witzen, Fehlern und Notfall-Tipps.
- Tochter darf Lias Heimatgemeinde, Cap-Farbe und Frisur im Profil wählen (einfacher Avatar-Baukasten).

**Gestaltung allgemein:** warme, freundliche Farben, hoher Kontrast, gut lesbare Schrift (z. B. «Nunito» oder «Baloo 2»). Keine bekannten Comic- oder Filmfiguren verwenden. Kurze Soundeffekte (richtig, falsch, Level-up, Sticker einkleben), global stummschaltbar.

---

## 8. Fortgeschrittenenmodus «Uri-Profi»

### 8.1 Freischaltung

- Wird freigeschaltet, sobald im Grundmodus mindestens 70 % der Elemente Stufe 3 erreicht haben (Lia und Stierli überreichen einen «Profi-Pass»).
- Eltern können ihn in der Eltern-Ansicht jederzeit manuell freischalten.
- Eigene Fortschrittskarten-Ebene und eigene Album-Seiten; alle Grundmodi (Finden, Wie heisst das?, Blitzrunde, Memory, Prüfung) funktionieren auch mit den neuen Elementen.

### 8.2 Pässe (L7)

| Pass | verbindet Uri mit | Ausgangspunkt in Uri |
|---|---|---|
| Gotthardpass | Tessin | Hospental / Urserntal |
| Furkapass | Wallis | Realp / Urserntal |
| Oberalppass | Graubünden | Andermatt |
| Sustenpass | Bern | Wassen / Meiental |
| Klausenpass | Glarus | Unterschächen / Schächental (über Urnerboden) |

Spielideen: Pass auf der Karte finden; «Welcher Pass führt ins Tessin?»; Zuordnen Pass ↔ Tal ↔ Nachbarkanton (verbindet L3, L5 und L7 – sehr lernwirksam). Passhöhen nur aus swisstopo-Daten übernehmen (siehe 3.7).

### 8.3 Berge (L8)

Vorschlag (Auswahl, mit Vater abstimmen):

| Berg | Hinweis |
|---|---|
| Dammastock | höchster Berg von Uri (ca. 3630 m), Gemeinde Göschenen, Grenze zum Wallis |
| Galenstock | Realp, beim Rhonegletscher |
| Oberalpstock | Silenen, Grenze zu Graubünden |
| Schärhorn | Unterschächen |
| Clariden | Spiringen, Grenze zu Glarus |
| Gross Spannort | Grenze Attinghausen/Erstfeld |
| Bristen | markanter Berg über dem Maderanertal |
| Uri Rotstock | Isenthal |

Höhen werden aus den Geodaten übernommen, nicht abgetippt. Darstellung als Bergsymbol (Dreieck) mit Trefferradius.

### 8.4 Sagen und Geschichte (L9)

Kurze Comic-Geschichten (4–6 Bilder mit Sprechblasen), erzählt von Lia, kommentiert von Stierli. Danach Quiz und Kartenaufgaben. Die Geschichten werden als **Sage** gekennzeichnet («Man erzählt sich …»), nicht als Tatsachenbericht.

**Die Teufelsbrücke (Schöllenenschlucht, zwischen Göschenen und Andermatt)**
- Die Urner schaffen es nicht, eine Brücke über die wilde Reuss zu bauen. Der Teufel bietet Hilfe an – als Lohn will er die erste Seele, die über die Brücke geht.
- Die schlauen Urner schicken einen Geissbock zuerst hinüber. Der Teufel ist wütend und will die Brücke mit einem riesigen Stein zerschmettern.
- Eine fromme Frau ritzt ein Kreuz in den Stein, der Teufel erschrickt und der Stein landet daneben – der «Teufelsstein» bei Göschenen.
- Kartenaufgaben: Schöllenenschlucht finden, Teufelsstein finden, «Welcher Fluss fliesst unter der Brücke?» (Reuss).
- Stierli-Gag: Er ist froh, dass sie keinen Stier geschickt haben.

**Wilhelm Tell**
- Orte: **Bürglen** (Tells Heimat laut Sage, Tell-Museum), **Altdorf** (Apfelschuss, Telldenkmal), **Tellsplatte / Tellskapelle** bei Sisikon (Tellsprung aus dem Boot), **Rütli** bei Seelisberg (Rütlischwur).
- Geschichte: Landvogt Gessler, der Hut auf der Stange, der Apfelschuss, der Sturm auf dem See, der Sprung auf die Felsplatte.
- Kartenaufgaben: Stationen der Tell-Geschichte auf der Karte in die richtige Reihenfolge bringen (Tell-Pfad); «Wo steht das Telldenkmal?»; Verknüpfung mit dem Wappen-Tipp von Sisikon (Tellskapelle im Wappen!).
- Die Hohle Gasse liegt in Küssnacht (Kanton Schwyz) – als Bonus-Fangfrage «Liegt das in Uri?».

Alle Sagen-Texte vor Freigabe durch den Vater prüfen lassen (`TODO-FAKTEN.md`).

### 8.5 Spielformen im Fortgeschrittenenmodus

- **Pass-Reise:** Stierli will ins Tessin/Wallis/… → auf der Karte den richtigen Weg wählen: Tal → Pass → Nachbarkanton.
- **Gipfel-Quiz:** Welcher Berg ist höher? (Vergleichskarten mit Höhe aus den Daten.)
- **Sagen-Quiz:** Fragen zur Geschichte + Orte auf der Karte.
- **Tell-Pfad:** Stationen in richtiger Reihenfolge antippen.
- Alle neuen Elemente zusätzlich in Memory (Bild ↔ Name), Blitzrunde und Prüfungsmodus.

---

## 9. Umsetzungsphasen (mit Abnahmekriterien)

**Phase 0 – Setup & Daten**
- Vite/React/TS/Tailwind-Projekt, ESLint/Prettier, Ordnerstruktur.
- `extract-uri.mjs` und `fetch-wappen.mjs` ausführen, Urnersee zuschneiden, Göscheneralpsee holen.
- ✅ 19 Gemeinden, 9 Kantone, 28 Wappen, 2 Seen vorhanden; Vitest-Test prüft die Anzahlen.

**Phase 1 – Karte & Entdecken-Modus**
- `<UriKarte>`-Komponente (d3-geo, Projektion `geoMercator().fitSize`), Ebenen: Nachbarkantone, Gemeinden, Seen, Täler, Punkte; Zoom/Pan; Hover/Tap-Zustände.
- ✅ Auf dem Tablet lässt sich jede Gemeinde (auch Flüelen/Sisikon) zuverlässig antippen.

**Phase 2 – Finden-Modus, Fortschritt, Fortschrittskarte**
- Fragenlogik, gestufte Tipps, Leitner-System, Persistenz.
- Fortschrittskarte auf dem Startbildschirm (Farbstufen, Ebenen-Reiter, «Jetzt üben»).
- ✅ Fortschritt bleibt nach Neuladen erhalten; Unit-Tests für Leitner-Logik; Farben ändern sich nach richtigen Antworten.

**Phase 3 – Figuren-Grundlage**
- Lia und Stierli als SVG mit allen Posen, Sprechblasen-Komponente, Spruch-Katalog.
- ✅ Figuren erscheinen in Finden-Modus und Startbildschirm, Sprüche wechseln.

**Phase 4 – Wappen: Quiz, Memory, Sticker-Album**
- Wappen-Quiz (3 Varianten), Wappen-Memory (alle Paar-Typen, Solo + Duell), Sticker-Album mit Einklebe-Animation.
- ✅ Alle 28 Wappen spielbar; Sticker erscheinen bei Stufe 3, Glanz bei Stufe 5.

**Phase 5 – Nachbarkantone & Puzzle**
- Kantonsebene in allen Kartenmodi; Fangfragen Luzern/Zug.
- Puzzle (Gemeinden und Kantone, 3 Stufen, Sterne, Bestzeit).
- ✅ Puzzle auf Tablet mit Finger vollständig lösbar, auch kleine Gemeinden.

**Phase 6 – Täler & Gewässer**
- Tal-Editor (`/editor`, nur Dev), Buffer-Trefferprüfung, Täler und Seen in allen Kartenmodi.
- ✅ Vater hat alle 10 Täler eingezeichnet; Treffer funktionieren.

**Phase 7 – Beschriften, Blitzrunde, Prüfungsmodus, Duell**
- Drag & Drop (dnd-kit oder Pointer-Events), Timer, Notenberechnung, Fehlerliste.

**Phase 8 – Belohnungen & Polish**
- Level, Abzeichen, Tagesmission, Serie, Eltern-Ansicht, Sound, Konfetti, Avatar-Baukasten für Lia.

**Phase 9 – Fortgeschrittenenmodus «Uri-Profi»**
- Punktdaten für Pässe, Berge, Sagenorte (Skript `fetch-punkte.mjs`), Freischaltlogik.
- Pässe und Berge in allen Modi, Pass-Reise, Gipfel-Quiz.
- Comic-Geschichten Teufelsbrücke und Tell, Sagen-Quiz, Tell-Pfad, neue Album-Seiten.
- ✅ Freischaltung bei 70 % bzw. per Eltern-Ansicht; alle Sagen-Texte vom Vater freigegeben.

**Phase 10 – PWA & Deployment**
- Offline-Fähigkeit, App-Icon (Stierli!), Build als nginx-Container, Export/Import des Fortschritts als JSON (Backup).

---

## 10. Weitere Ideen (optional, später)

- **Weitere Sagen:** z. B. rund um den Urnerboden oder die Schöllenen – nur mit geprüften Quellen.
- **Zugreise-Modus:** Mit dem Zug von Flüelen nach Andermatt – unterwegs Orte erkennen.
- **Foto-Rätsel:** Eigene Familienfotos aus Uri → «Wo war das?».
- **Stumme Karte ausdrucken:** PDF-Arbeitsblatt zum Üben auf Papier.
- **Bonus-Gewässer:** Reuss, Schächen, Oberalpsee, Seelisbergsee, Golzernsee, Arnisee.
- **Mehrere Profile** (Geschwister, Klassenkameradinnen).
- **Ganze Schweiz** als späteres Level (alle Kantone + Hauptorte), gleiche Engine.
- **Einsatz in der Schule:** ohne Tracking, ohne Login.

---

## 11. Offene Fragen (Standardannahme in Klammern – bis zur Klärung so umsetzen)

1. Auf welchem Gerät wird gespielt? (Annahme: Tablet, zusätzlich Laptop)
2. Lokal im Heimnetz oder öffentlich erreichbar? (Annahme: Homelab, nur Heimnetz)
3. Gibt es einen konkreten Schultest und in welcher Form? (Annahme: stumme Karte beschriften → Beschriften- und Prüfungsmodus priorisieren)
4. Riemenstaldnertal liegt grösstenteils im Kanton Schwyz – ganzes Tal zeigen oder nur Urner Teil? (Annahme: ganzes Tal, mit Hinweis)
5. Figuren: bleibt es bei der SVG-Version von Cursor oder werden sie später gezeichnet/generiert? (Annahme: SVG zuerst, austauschbar)
6. Mehrere Profile nötig? (Annahme: ja, einfaches Profil-Auswahlmenü ohne Passwort)
7. Berg-Auswahl in 8.3 so übernehmen? (Annahme: ja)
8. Freischaltschwelle für den Fortgeschrittenenmodus 70 %? (Annahme: ja)

---

## 12. Regeln für Cursor

- Schweizer Rechtschreibung: **«ss» statt «ß»** in allen Texten.
- Alle Ortsnamen exakt wie in Kapitel 1 (Göscheneralpsee, Göschenertal, Urserntal, Unterschächen …).
- Keine erfundenen Fakten. Unsichere Inhalte in `TODO-FAKTEN.md` sammeln.
- Kleine, überprüfbare Schritte; nach jeder Phase kurze Zusammenfassung + was zu testen ist.
- Geo- und Wappendaten nie von Hand abtippen, immer aus den Skripten erzeugen.
- Keine externen Tracker, keine Werbung, keine Anmeldung.
- Komponenten klein halten; Spiel-Logik (Fragenauswahl, Leitner, Punkte) als reine, getestete Funktionen in `src/logic/`.

Vorschlag für `.cursor/rules/uri-app.mdc`:
```
---
description: Regeln für die Uri-Lern-App
alwaysApply: true
---
- Stack: Vite, React, TypeScript (strict), Tailwind, zustand, d3-geo, turf.
- Texte für Kinder (11 J.): kurz, freundlich, ermutigend; Schweizer Rechtschreibung (ss statt ß).
- Geodaten nur aus public/geo, Wappen nur aus public/wappen/manifest.json.
- Spiel-Logik in src/logic/ als reine Funktionen mit Vitest-Tests.
- Touch-Ziele min. 44 px; jede Interaktion mit Maus und Finger testen.
- Bei Unklarheiten nachfragen statt raten; keine Fakten erfinden.
```

---

## 13. Projektstruktur (Vorschlag)

```
uri-entdecker/
├─ public/
│  ├─ geo/            uri-gemeinden.geojson, kantone.geojson, urnersee.geojson, goescheneralpsee.geojson, punkte.geojson
│  ├─ wappen/         gemeinden/*.svg, kantone/*.svg, manifest.json
│  ├─ figuren/        lia-*.svg, stierli-*.svg
│  └─ sagen/          teufelsbruecke/*.svg, tell/*.svg (Comic-Bilder)
├─ scripts/           extract-uri.mjs, fetch-wappen.mjs, clip-urnersee.mjs, fetch-osm.mjs, fetch-punkte.mjs
├─ src/
│  ├─ components/     UriKarte, Fortschrittskarte, StickerAlbum, Sprechblase, Figur, WappenKarte, Timer …
│  ├─ modes/          Entdecken, Finden, Beschriften, WappenQuiz, Memory, Puzzle, Blitz, Pruefung, Duell
│  ├─ profi/          PassReise, GipfelQuiz, SagenComic, SagenQuiz, TellPfad
│  ├─ logic/          fragen.ts, leitner.ts, punkte.ts, namensvergleich.ts (+ Tests)
│  ├─ data/           gemeinden.ts, kantone.ts, taeler.json, gewaesser.ts, paesse.ts, berge.ts, sagen.ts, tipps.ts, sprueche.ts
│  ├─ store/          fortschritt.ts (zustand + persist)
│  └─ editor/         TalEditor (nur Dev)
└─ .cursor/rules/uri-app.mdc
```

---

## Quellen

- Geodaten: swisstopo / BFS über npm-Paket `swiss-maps` (Interactive Things)
- Wappen: Wikimedia Commons (Zuordnung via Wikidata)
- Göscheneralpsee: © OpenStreetMap-Mitwirkende (ODbL)
- Gemeindeliste: 19 Einwohnergemeinden seit 1.1.2021 (Fusion Seedorf/Bauen)
