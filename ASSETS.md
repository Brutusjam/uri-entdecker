# Uri-Entdecker – Logo, App-Icon und Splash-Screen

Gewählt: **Logo D (Comic-Schriftzug)**, **App-Icon A (Stierli-Sticker)**, **Splash «Aufbruch»**.

## Inhalt

| Datei | Zweck |
|---|---|
| `public/logo/uri-entdecker-logo.svg` | Hauptlogo mit Stierli (Startbildschirm, «Über»-Seite) |
| `public/logo/uri-entdecker-schriftzug.svg` | Schriftzug ohne Figur (Splash, Kopfzeile) |
| `public/icons/icon.svg`, `icon-192.png`, `icon-512.png` | App-Icon (PWA, «any») |
| `public/icons/icon-maskable-512.png` | App-Icon für Android (randlos, Inhalt in der Sicherheitszone) |
| `public/icons/apple-touch-icon.png` | Icon für iPad/iPhone (180 × 180) |
| `public/favicon.svg`, `icons/favicon-32.png`, `favicon-48.png` | Browser-Tab (Stierli-Kopf) |
| `public/splash/hintergrund.svg` | Landschaft für den Splash, skaliert auf jedes Format (unten verankert) |
| `public/figuren/lia-neutral.svg`, `stierli-neutral.svg` | Figuren-Skizzen (später durch ausgearbeitete Versionen ersetzen, gleiche Dateinamen) |
| `src/components/SplashScreen.tsx` | Fertige Splash-Komponente (React, framer-motion, Tailwind-Tokens aus DESIGN.md), TypeScript-geprüft |
| `vorschau/*.png` | Referenzbilder, nicht ins Projekt kopieren |

Alle Schriften in den Logo-SVGs sind in Pfade umgewandelt – die Logos sehen überall gleich aus, auch ohne geladene Schrift.

## Einbau

**1. Dateien kopieren:** Den Ordner `public/` und `src/components/SplashScreen.tsx` ins Projekt übernehmen (bestehende Dateien nicht überschreiben, ausser gleichnamige Figuren-Platzhalter).

**2. `index.html` (im `<head>`):**
```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/icons/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<meta name="theme-color" content="#FFC928">
<title>Uri-Entdecker</title>
```

**3. PWA-Manifest (vite-plugin-pwa, `manifest`):**
```ts
{
  name: 'Uri-Entdecker',
  short_name: 'Uri-Entdecker',
  description: 'Kanton Uri spielend entdecken',
  lang: 'de-CH',
  display: 'standalone',
  orientation: 'any',
  background_color: '#CFEFFF',
  theme_color: '#FFC928',
  icons: [
    { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}
```

**4. Splash verwenden:** `SplashScreen` beim App-Start zeigen, während Geodaten, Wappen und Figuren vorgeladen werden. `fortschritt` = geladene Dateien / alle Dateien (0–1). Bei `onStart` zum Startbildschirm wechseln (sanfter Übergang). Den Splash nur beim ersten Öffnen pro Sitzung zeigen, nicht bei jedem Seitenwechsel.

## Prompt für Cursor

```
Lies @ASSETS.md und @DESIGN.md. Baue Logo, Icons und Splash-Screen ein:
1. Dateien aus public/ übernehmen, index.html und das PWA-Manifest gemäss ASSETS.md ergänzen.
2. src/components/SplashScreen.tsx übernehmen. Prüfe, dass die verwendeten
   Tailwind-Klassen (bg-sky, text-ink, bg-uri-gelb, font-display, font-body,
   shadow-button, shadow-comic, --color-alp-gruen) zu unseren Design-Tokens passen.
3. Einen kleinen Vorlade-Hook schreiben (fetch aller Dateien aus public/geo,
   public/wappen/manifest.json inkl. Wappen, public/figuren) und den Fortschritt an
   SplashScreen übergeben. Splash nur einmal pro Sitzung zeigen.
4. Das Logo mit Stierli auf dem Startbildschirm oben einsetzen.
5. Testen: Tablet quer und hoch, Handy hoch, prefers-reduced-motion.
Danach stoppen und mir sagen, was ich prüfen soll.
```
