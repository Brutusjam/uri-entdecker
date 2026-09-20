# Figuren Lia und Stierli – Grundlage für Cursor

Diese Dateien sind die **verbindliche Vorlage** für alle Posen von Lia und Stierli. Neue Posen werden **aus diesen SVGs abgeleitet**, nicht neu gezeichnet: gleiche Formen, gleiche Farben, gleiche Strichstärke.

## Dateien

| Datei | Inhalt |
|---|---|
| `lia-neutral.svg` | Lia, Brustbild, ohne Kappe, neutral |
| `stierli-neutral.svg` | Stierli, ganze Figur, neutral |
| `teile.json` | Austauschteile (Augen, Münder, Augenbrauen, Arme, Beine) als SVG-Schnipsel |
| `posen/*.svg` | 9 Beispiel-Posen, bereits aus den Teilen zusammengesetzt |
| `posen-uebersicht.png` | Übersicht aller Posen (nur zur Kontrolle) |

## Stilregeln (gelten für jede neue Pose)

- viewBox immer `0 0 400 400`, Figur gleich gross und gleich platziert – so können Posen ohne Springen gewechselt werden.
- Outline `#1E2440`, Strichstärke 8 (Details 6–7), `stroke-linejoin="round"`, `stroke-linecap="round"`.
- Nur flache Farben aus der Palette unten, keine Verläufe, keine Schatten ausser Stierlis Bodenschatten.
- Auf Stierlis schwarzem Fell sind dunkle Linien unsichtbar: Augenbrauen `#6A74A0`, geschlossene Augen weiss.
- **Stierlis Nasenring geht durch die Nasenscheidewand** (zwischen den Nasenlöchern): Der obere Teil des Rings wird von der Scheidewand verdeckt, der Ring kommt an ihrer Unterkante heraus. Gruppe `stierli-nasenring` nie ändern, ausser beim Umpositionieren des ganzen Kopfes.
- Lia ist ein Brustbild und endet unten am Bildrand (y = 400). Stierli steht mit den Füssen auf y = 374.

**Farben Lia:** Haut `#F6C9A5`, Haare `#7A4A2C`, Haar-Glanz `#9A6240`, Haargummi `#FFC928`, Hoodie `#2EC4B6`, Kapuze `#1FA396`, Rucksackträger `#E63946`, Wangen `#FF9DB0`, Sommersprossen `#C97B55`.

**Farben Stierli:** Fell `#23283F`, Glanz `#3A4160`, Hufe `#4A4F66`, Hörner `#FFF1D0`, Schnauze `#F4B6A6`, Ohren innen/Wangen `#FF9DB0`, Nasenring `#E63946`, Augenbrauen `#6A74A0`.

## Aufbau (Ebenen mit ids)

Jede Figur ist in benannte Gruppen gegliedert. Für eine Pose wird eine Gruppe **durch den gleichnamigen Schnipsel aus `teile.json` ersetzt** (gleiche id), oder es wird eine Gruppe ergänzt (Arme).

**Lia:** `lia-zopf` · `lia-koerper` · `lia-hals` · `lia-kapuze` · `lia-baendel` · `lia-kopfgruppe` (darin: `lia-ohren`, `lia-gesicht`, `lia-haare`, `lia-haargummi`, `lia-augenbrauen`, `lia-augen`, `lia-wangen`, `lia-sommersprossen`, `lia-nase`, `lia-mund`). Arme (`lia-arm-rechts`, `lia-arm-links`) werden **vor** `lia-kopfgruppe` eingefügt.

**Stierli:** `stierli-schatten` · `stierli-schwanz` · `stierli-beine` · `stierli-koerper` · `stierli-kopfgruppe` (darin: `stierli-hoerner`, `stierli-ohren`, `stierli-kopf`, `stierli-haarbueschel`, `stierli-augen`, `stierli-pupillen`, `stierli-augenbrauen`, `stierli-wangen`, `stierli-schnauze`, `stierli-nasenring`).

Drehpunkte für Animationen: Lias Kopf `(200, 270)` (Halsansatz), Stierlis Kopf `(200, 190)`.

## Posen (Rezepte)

| Pose (Dateiname) | Lia | Stierli |
|---|---|---|
| `*-neutral` | Grundfigur | Grundfigur |
| `*-freut-sich` | augen-freude + mund-lachen | augen-freude, pupillen entfernen |
| `*-denkt` | augenbrauen-denken + augen-nach-oben + mund-denken | pupillen-oben |
| `lia-troestet` | augenbrauen-sanft + mund-sanft | – |
| `lia-zeigt` | + arm-rechts-zeigt | – |
| `lia-jubelt` | + arm-rechts-jubelt + arm-links-jubelt + augen-freude + mund-lachen | – |
| `stierli-erschrocken` | – | augen-gross + pupillen-klein + augenbrauen-hoch |
| `stierli-luftsprung` | – | ganze Figur 30 nach oben, beine-sprung, kleinerer Schatten, augen-freude |
| `lia-staunt` (noch zu bauen) | mund-staunen + augenbrauen-denken | – |

Alle ausser `lia-staunt` liegen fertig im Ordner `posen/`.

## Austauschteile

### Lia
**augen-freude**
```svg
<g id="lia-augen" fill="none" stroke-width="7"><path d="M146 208 Q160 190 174 208"/><path d="M226 208 Q240 190 254 208"/></g>
```
**augen-nach-oben**
```svg
<g id="lia-augen" stroke="none"><ellipse cx="164" cy="196" rx="14" ry="18" fill="#1E2440"/><ellipse cx="244" cy="196" rx="14" ry="18" fill="#1E2440"/><circle cx="169" cy="188" r="5" fill="#FFFFFF"/><circle cx="249" cy="188" r="5" fill="#FFFFFF"/></g>
```
**augenbrauen-denken**
```svg
<g id="lia-augenbrauen" fill="none" stroke-width="7"><path d="M140 170 Q158 164 178 172"/><path d="M222 156 Q244 138 264 152"/></g>
```
**augenbrauen-sanft**
```svg
<g id="lia-augenbrauen" fill="none" stroke-width="7"><path d="M140 178 Q158 168 176 164"/><path d="M224 164 Q242 168 260 178"/></g>
```
**mund-lachen**
```svg
<path id="lia-mund" d="M162 244 Q200 296 240 244 Z" fill="#FFFFFF" stroke-width="7"/>
```
**mund-denken**
```svg
<path id="lia-mund" d="M184 258 Q202 250 218 262" fill="none" stroke-width="7"/>
```
**mund-sanft**
```svg
<path id="lia-mund" d="M176 250 Q200 268 224 250" fill="none" stroke-width="7"/>
```
**mund-staunen**
```svg
<ellipse id="lia-mund" cx="200" cy="258" rx="14" ry="18" fill="#1E2440" stroke-width="6"/>
```
**arm-rechts-zeigt**
```svg
<g id="lia-arm-rechts"><path d="M306 350 C 330 300, 350 262, 366 232" fill="none" stroke-width="58"/><path d="M306 350 C 330 300, 350 262, 366 232" fill="none" stroke="#2EC4B6" stroke-width="42"/><rect x="364" y="168" width="16" height="44" rx="8" fill="#F6C9A5" stroke-width="6" transform="rotate(28 372 212)"/><circle cx="370" cy="222" r="22" fill="#F6C9A5" stroke-width="7"/></g>
```
**arm-rechts-jubelt**
```svg
<g id="lia-arm-rechts"><path d="M306 350 C 336 300, 352 250, 356 196" fill="none" stroke-width="58"/><path d="M306 350 C 336 300, 352 250, 356 196" fill="none" stroke="#2EC4B6" stroke-width="42"/><circle cx="358" cy="180" r="25" fill="#F6C9A5" stroke-width="7"/></g>
```
**arm-links-jubelt**
```svg
<g id="lia-arm-links"><path d="M94 350 C 64 300, 48 250, 44 196" fill="none" stroke-width="58"/><path d="M94 350 C 64 300, 48 250, 44 196" fill="none" stroke="#2EC4B6" stroke-width="42"/><circle cx="42" cy="180" r="25" fill="#F6C9A5" stroke-width="7"/></g>
```

### Stierli
**augen-freude**
```svg
<g id="stierli-augen" fill="none" stroke="#FFFFFF" stroke-width="10"><path d="M126 170 Q154 134 182 170"/><path d="M218 170 Q246 134 274 170"/></g>
```
**augen-gross**
```svg
<g id="stierli-augen"><ellipse cx="152" cy="156" rx="36" ry="42" fill="#FFFFFF"/><ellipse cx="248" cy="156" rx="36" ry="42" fill="#FFFFFF"/></g>
```
**pupillen-klein**
```svg
<g id="stierli-pupillen" stroke="none"><circle cx="152" cy="158" r="8" fill="#1E2440"/><circle cx="248" cy="158" r="8" fill="#1E2440"/></g>
```
**pupillen-oben**
```svg
<g id="stierli-pupillen" stroke="none"><circle cx="166" cy="148" r="15" fill="#1E2440"/><circle cx="250" cy="148" r="15" fill="#1E2440"/><circle cx="171" cy="142" r="5" fill="#FFFFFF"/><circle cx="255" cy="142" r="5" fill="#FFFFFF"/></g>
```
**augenbrauen-hoch**
```svg
<g id="stierli-augenbrauen" fill="none" stroke="#6A74A0" stroke-width="9"><path d="M118 100 Q146 82 178 98"/><path d="M222 98 Q254 82 282 100"/></g>
```
**beine-sprung**
```svg
<g id="stierli-beine"><rect x="120" y="316" width="38" height="52" rx="13" fill="#23283F" transform="rotate(25 139 330)"/><rect x="242" y="316" width="38" height="52" rx="13" fill="#23283F" transform="rotate(-25 261 330)"/></g>
```

## Prompt für Cursor

```
Lies @FIGUREN.md. Ersetze public/figuren/lia-neutral.svg und stierli-neutral.svg
durch die neuen Dateien und kopiere die Posen aus posen/ nach public/figuren/.
Baue die Figur-Komponente (DESIGN.md, Kapitel 7) so, dass sie eine Pose per
Name lädt: <Figur name="lia" pose="freut-sich" />. Fehlende Posen (z. B.
lia-staunt) nach den Rezepten in FIGUREN.md aus den Teilen zusammensetzen –
nichts neu zeichnen. Posenwechsel mit kurzem Überblenden (150 ms), im
Leerlauf leichtes «Atmen» (scale 1 → 1.02), prefers-reduced-motion beachten.
```
