import fs from 'node:fs';

const ink = '#1E2440';
const ids = [
  ['pass-gotthard', 'pass', 'G'],
  ['pass-furka', 'pass', 'F'],
  ['pass-oberalp', 'pass', 'O'],
  ['pass-susten', 'pass', 'S'],
  ['pass-klausen', 'pass', 'K'],
  ['berg-dammastock', 'berg', 'D'],
  ['berg-galenstock', 'berg', 'G'],
  ['berg-oberalpstock', 'berg', 'O'],
  ['berg-schaerhorn', 'berg', 'S'],
  ['berg-clariden', 'berg', 'C'],
  ['berg-spannort', 'berg', 'P'],
  ['berg-bristen', 'berg', 'B'],
  ['berg-urirotstock', 'berg', 'U'],
  ['sage-teufelsbruecke', 'sage', 'B'],
  ['sage-teufelsstein', 'sage', 'T'],
  ['sage-telldenkmal', 'sage', 'A'],
  ['sage-tellmuseum', 'sage', 'M'],
  ['sage-tellskapelle', 'sage', 'K'],
  ['sage-ruetli', 'sage', 'R'],
  ['sage-hohle-gasse', 'sage', 'H'],
];

function svg(art, buchstabe) {
  const fill = art === 'pass' ? '#FFC928' : art === 'berg' ? '#3DBE6B' : '#8B5CF6';
  const motiv =
    art === 'pass'
      ? `<path d="M18 52 C28 40 36 44 42 38 C48 32 54 36 62 28" fill="none" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>`
      : art === 'berg'
        ? `<path d="M16 58 L40 22 L64 58 Z" fill="#BFE8B0" stroke="${ink}" stroke-width="4"/><path d="M34 32 L40 22 L48 34 L42 36 Z" fill="#FFF8E7" stroke="${ink}" stroke-width="3"/>`
        : `<circle cx="40" cy="36" r="12" fill="#FFF8E7" stroke="${ink}" stroke-width="4"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" role="img"><circle cx="40" cy="40" r="36" fill="${fill}" stroke="${ink}" stroke-width="4"/>${motiv}<text x="40" y="70" text-anchor="middle" font-size="12" font-weight="700" fill="${ink}">${buchstabe}</text></svg>\n`;
}

fs.mkdirSync('public/profi', { recursive: true });
for (const [id, art, b] of ids) {
  fs.writeFileSync(`public/profi/${id}.svg`, svg(art, b));
}
console.log('profi-icons', ids.length);
