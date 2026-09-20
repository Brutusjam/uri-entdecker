# Uri-Entdecker – Designsystem

> Ergänzung zu PLAN.md. Gilt für alle Screens, Komponenten, die Karte und die Figuren. Bei Widersprüchen gilt dieses Dokument für alles Visuelle.

---

## 1. Stilrichtung: «Comic-Abenteuerkarte»

Die App sieht aus wie eine bunte, gezeichnete Abenteuerkarte mit Stickern – verspielt, aber **nicht kindergartenhaft**. Zielgruppe sind 10- bis 12-Jährige: Sie wollen «cool», nicht «herzig».

**Merkmale:**
- Dicke, dunkle Outlines (wie Comiczeichnungen) um Buttons, Karten, Figuren und Kartenflächen.
- Flache, kräftige Farben ohne Verläufe – Ausnahme: Himmel und Glanz-Effekte.
- «Harte» versetzte Schatten (Comic-Look) statt weicher, verschwommener Schatten.
- Runde Ecken, leicht schräg gestellte Sticker und Karten (−2° bis +2°).
- Viel Bewegung bei Erfolgen, aber ruhige Oberfläche beim Nachdenken.

**Vorbilder in der Anmutung** (nur Stimmung, nichts kopieren): Duolingo (Klarheit, Belohnungen), Comic-Sammelalben, illustrierte Wanderkarten.

**Nicht:** Pastell-Babyfarben, Glitzer überall, verschnörkelte Schriften, zu viele Farben auf einem Screen, Stockfotos.

---

## 2. Farben

Abgeleitet aus Uri: Urner Gelb und Schwarz (Wappen), Alpengrün, Seeblau.

| Token | Hex | Verwendung |
|---|---|---|
| `ink` | `#1E2440` | Outlines, Text, harte Schatten |
| `paper` | `#FFF8E7` | Haupthintergrund (warmes Papier) |
| `sky` | `#CFEFFF` | Himmel-/Kopfbereich, Hintergrund der Karte |
| `uri-gelb` | `#FFC928` | Primärfarbe: Haupt-Buttons, Highlights, Lias Cap |
| `uri-gelb-dunkel` | `#E0A800` | Hover/gedrückt |
| `alp-gruen` | `#3DBE6B` | Richtig, Fortschritt, Wiesen auf der Karte |
| `alp-gruen-dunkel` | `#1F8A4C` | Fortschritt Stufe 3–4 |
| `see-blau` | `#3AA7E8` | Seen, Info, Sekundär-Buttons |
| `see-blau-dunkel` | `#1C6FB0` | Flüsse, Hover |
| `koralle` | `#FF7A59` | Falsch/Achtung (freundlich, nicht aggressives Rot) |
| `stier-rot` | `#E63946` | nur Akzente (Stierlis Nasenring, Herzen, Serie-Flamme) |
| `sagen-lila` | `#8B5CF6` | Fortgeschrittenenmodus, Sagen, Profi-Elemente |
| `gold` | `#F5B301` | Gemeistert (Stufe 5), Glanz-Sticker, Pokale |
| `neu-grau` | `#C9CED8` | Noch nicht gelernt (Stufe 0), deaktiviert |
| `nachbar-grau` | `#E4E1D6` | Nachbarkantone auf der Karte |

**Regeln:**
- Pro Screen max. **3 Akzentfarben** plus `ink`/`paper`.
- Jeder Modus hat eine Leitfarbe (Kopfzeile, Icon): Finden = `see-blau`, Beschriften = `uri-gelb`, Wappen = `stier-rot`, Puzzle = `alp-gruen`, Blitzrunde = `koralle`, Prüfung = `ink`, Profi/Sagen = `sagen-lila`.
- Text immer `ink` auf hellem Grund oder weiss auf dunklem Grund; Kontrast mind. WCAG AA.
- Richtig/falsch nie nur über Farbe: immer zusätzlich Symbol (✓/✗) und Bewegung.

---

## 3. Typografie

| Rolle | Schrift | Gewicht | Grösse (Tablet) |
|---|---|---|---|
| Titel, Buttons, Zahlen | **Baloo 2** | 700–800 | 28–48 px |
| Fliesstext, Sprechblasen | **Nunito** | 600–700 | min. 18 px |
| Kartenbeschriftungen | Baloo 2 | 700 | 14–18 px, mit weissem Rand (Halo) |

- Schriften **lokal einbinden** über `@fontsource/baloo-2` und `@fontsource/nunito` (offline-fähig, keine Google-Server).
- Keine Schrift unter 16 px. Keine Blocksätze, kurze Zeilen.
- Zahlen (Punkte, Timer) gross und fett in Baloo 2.

---

## 4. Form, Schatten, Abstände

| Token | Wert |
|---|---|
| Outline | 3 px `ink` (Buttons, Karten), 2 px (kleine Elemente) |
| Radius | 16 px Standard, 24 px grosse Karten, 999 px Pillen/Badges |
| Harter Schatten | `4px 4px 0 #1E2440` (Karten), `0 5px 0 #1E2440` (Buttons) |
| Abstände | 4er-Raster: 8, 12, 16, 24, 32, 48 px |
| Touch-Ziel | mind. 48 × 48 px |

---

## 5. Komponenten

**Button («Chunky Button»)**
- Farbfläche + 3 px Outline + Schatten nach unten (`0 5px 0 ink`).
- Gedrückt: rutscht 5 px nach unten, Schatten verschwindet → fühlt sich an wie ein echter Knopf.
- Varianten: Primär (`uri-gelb`), Sekundär (`see-blau`, weisse Schrift), Neutral (weiss), Profi (`sagen-lila`).
- Icon links, Text in Baloo 2, gross.

**Karte / Kachel (Modusauswahl)**
- Weisse Fläche, Outline, harter Schatten, leicht schräg (−1° / +1° abwechselnd).
- Oben ein farbiger Streifen in der Modus-Leitfarbe, grosses Icon oder Figur, Titel, Sterne/Bestwert.
- Hover/Tippen: richtet sich gerade aus und hebt sich leicht an.

**Sprechblase**
- Weiss, 3 px Outline, Radius 20 px, Zipfel zur Figur hin.
- Text Nunito 18–20 px, max. 2 Sätze.
- Erscheint mit kleinem «Plopp» (Skalierung 0.8 → 1, federnd), Text tippt sich nicht Buchstabe für Buchstabe (zu langsam).

**Fortschrittsbalken**
- Dicke Pille mit Outline, Füllung `alp-gruen` mit diagonalen Streifen, Zahl daneben («12/19»).

**Sticker**
- Weisser Rand (6 px) um das Motiv, leichter Schatten, zufällige Schräglage (−4° bis +4°).
- Glanz-Sticker: goldener Rand + gelegentlich wandernder Lichtstreifen.
- Leerer Platz: gestrichelte Outline, graue Silhouette, «?».

**Kopfzeile (immer sichtbar)**
- Links: Zurück/Home. Mitte: Modusname in Leitfarbe. Rechts: XP-Stern mit Zahl, Serie-Flamme mit Tagen, Ton an/aus.

**Feedback**
- Richtig: Element blinkt grün auf, ✓ springt heraus, kurzer Sound, +XP fliegt zur Kopfzeile.
- Falsch: Element schüttelt sich kurz (koralle), ✗, Figur gibt Tipp. Nie laute oder hämische Effekte.

---

## 6. Kartengestaltung

Die Karte ist das Herz der App und soll wie eine gezeichnete Abenteuerkarte wirken.

| Ebene | Stil |
|---|---|
| Hintergrund | `sky`, dezente Wolken-Illustrationen am Rand |
| Nachbarkantone | `nachbar-grau`, feine diagonale Schraffur |
| Übrige Schweiz | `schweiz-grau`, Kantonsgrenzen in `ink`, ohne Schraffur |
| Kanton Uri | helles Wiesengrün (`#BFE8B0`), 3 px `ink`-Aussengrenze |
| Gemeinden | Füllung je nach Modus/Lernstand, 1.5 px `ink`-Grenzen |
| Seen | `see-blau`, kleine weisse Wellenlinien als Muster |
| Flüsse (optional) | `see-blau-dunkel`, 2 px, runde Enden |
| Täler | halbtransparentes Band (`uri-gelb` 50 %) mit gestrichelter Outline |
| Pässe | kleines Pass-Symbol (Serpentine) in `ink` auf weissem Kreis |
| Berge | Dreieck-Symbol mit weisser Schneespitze |
| Sagenorte | Symbol auf lila Kreis (Brücke, Apfel, Kapelle …) |

**Zustände:** Hover/Antippen → Fläche leuchtet etwas heller und hebt sich (Schatten). Ausgewählt → dicke gelbe Outline + sanftes Pulsieren. Gesucht (Tipp) → pulsierender Ring.

**Fortschrittskarte:** Stufe 0 `neu-grau` → 1–2 hellgrün → 3–4 `alp-gruen-dunkel` → 5 `gold` mit kleinem ★ auf der Fläche.

Optionale Deko (später): kleine Illustrationen auf der Karte (Tell bei Altdorf, Zug am Gotthard, Kühe auf dem Urnerboden) – nur im Entdecken-Modus, nicht bei Prüfungsaufgaben.

---

## 7. Figuren – Stilvorgaben

**Allgemein:** Comicstil mit 3 px `ink`-Outline, flache Farben, grosser Kopf (ca. 1/3 der Körperhöhe), grosse ausdrucksstarke Augen, klare Silhouette (auch klein erkennbar). Beide Figuren im selben Stil.

**Lia (ca. 12)**
- Cap verkehrt in `uri-gelb`, Hoodie in Türkis (`#2EC4B6`), Rucksack in `stier-rot`, Jeans-Shorts oder Wanderhose, Wanderschuhe.
- Pferdeschwanz, Sommersprossen, selbstbewusstes Grinsen.
- Wirkt sportlich und schlau – keine Prinzessin, kein Kleinkind.

**Stierli**
- Kleiner, rundlicher Stier in Schwarz (wie im Urner Wappen), Hörner in Creme, roter Nasenring als Anspielung aufs Wappen, grosse Augen, kurze Beine.
- Übertriebene Mimik (Staunen, Schreck, Stolz); darf etwas tollpatschig wirken.

**Posen:** siehe PLAN.md Kapitel 7. Jede Pose als eigene SVG-Datei, gleiche Grösse (z. B. 400 × 400 viewBox), Figur unten ausgerichtet, damit Posen ohne Springen gewechselt werden können.

**Platzierung:** Figur unten links (Tablet quer) bzw. unten rechts neben der Sprechblase; nie über wichtigen Kartenteilen. Figuren «atmen» im Leerlauf ganz leicht (Skalierung 1 → 1.02).

**Später durch gezeichnete Figuren ersetzen:** Falls die Figuren mit einem Bildgenerator erstellt werden, zuerst ein **Character Sheet** (alle Posen einer Figur auf einem Bild, weisser Hintergrund, gleicher Stil) erzeugen, dann vektorisieren. Beispiel-Beschreibung für Lia:
«Cartoon character sheet, 12-year-old adventurous Swiss girl, backwards yellow cap, turquoise hoodie, red backpack, hiking boots, ponytail, freckles, confident grin, bold dark outlines, flat colors, comic style, multiple poses: pointing, thinking, cheering, comforting, white background.»

---

## 8. Animation und Sound

- Bibliothek: framer-motion. Federnde Bewegungen (`type: "spring"`), kurz: 150–350 ms.
- **Kleine Erfolge** (eine richtige Antwort): kurze Animation + Sound, kein Konfetti.
- **Grosse Erfolge** (Level-up, Sticker-Seite voll, Prüfung ≥ 5): Konfetti, Figur jubelt, Fanfare.
- Sticker einkleben: Sticker fliegt ein, dreht sich, «klatscht» auf die Seite (kleine Stauchung).
- Übergänge zwischen Screens: seitliches Gleiten wie beim Blättern.
- `prefers-reduced-motion` respektieren: dann nur Einblenden, kein Wackeln, kein Konfetti.
- Sounds kurz (< 1 s), freundlich, eher «Holz/Xylofon» als Arcade; global stummschaltbar.

---

## 9. Layout

- **Tablet quer (Hauptziel):** Karte links ca. 65 %, rechts Aufgaben-Panel (Frage, Antworten, Figur mit Sprechblase).
- **Tablet hoch / Handy:** Karte oben, Panel unten, Figur klein im Panel.
- **Laptop:** wie Tablet quer, max. Breite 1400 px, zentriert.
- Startbildschirm: grosse Fortschrittskarte oben, darunter Kachelreihe der Modi, Lia begrüsst mit Tagesmission.

---

## 10. Umsetzung

1. Design-Tokens zentral definieren (Tailwind 4: `@theme` in `src/index.css`; bei Tailwind 3 in `tailwind.config`):

```css
@theme {
  --color-ink: #1E2440;
  --color-paper: #FFF8E7;
  --color-sky: #CFEFFF;
  --color-uri-gelb: #FFC928;
  --color-uri-gelb-dunkel: #E0A800;
  --color-alp-gruen: #3DBE6B;
  --color-alp-gruen-dunkel: #1F8A4C;
  --color-see-blau: #3AA7E8;
  --color-see-blau-dunkel: #1C6FB0;
  --color-koralle: #FF7A59;
  --color-stier-rot: #E63946;
  --color-sagen-lila: #8B5CF6;
  --color-gold: #F5B301;
  --color-neu-grau: #C9CED8;
  --color-nachbar-grau: #E4E1D6;
  --font-display: "Baloo 2", system-ui, sans-serif;
  --font-body: "Nunito", system-ui, sans-serif;
  --radius-comic: 16px;
  --shadow-comic: 4px 4px 0 #1E2440;
  --shadow-button: 0 5px 0 #1E2440;
}
```

2. Basis-Komponenten in `src/components/ui/`: `ComicButton`, `ComicCard`, `SpeechBubble`, `ProgressBar`, `Sticker`, `Badge`, `Header`.
3. Eine Seite `/styleguide` (nur Dev), die alle Komponenten, Farben und Figuren-Posen zeigt – zum Abnehmen durch den Vater.
4. Bereits gebaute Screens auf die neuen Komponenten umstellen; keine Farbwerte direkt in Komponenten, nur Tokens.

**Abnahme:** Styleguide-Seite zeigt alle Elemente; Vater und Tochter finden es «cool»; alle Texte lesbar auf dem Tablet; Buttons fühlen sich beim Drücken «echt» an.
