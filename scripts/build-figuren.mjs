import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const quelle = join(root, 'figuren');
const ziel = join(root, 'public', 'figuren');
mkdirSync(ziel, { recursive: true });

function kopiere(von, nachName) {
  copyFileSync(von, join(ziel, nachName));
}

kopiere(join(quelle, 'lia-neutral.svg'), 'lia-neutral.svg');
kopiere(join(quelle, 'stierli-neutral.svg'), 'stierli-neutral.svg');

for (const datei of [
  'lia-denkt.svg',
  'lia-freut-sich.svg',
  'lia-jubelt.svg',
  'lia-troestet.svg',
  'lia-zeigt.svg',
  'stierli-denkt.svg',
  'stierli-erschrocken.svg',
  'stierli-freut-sich.svg',
  'stierli-luftsprung.svg',
]) {
  kopiere(join(quelle, 'posen', datei), datei);
}

const teile = JSON.parse(readFileSync(join(quelle, 'teile.json'), 'utf8'));
let staunt = readFileSync(join(quelle, 'lia-neutral.svg'), 'utf8');
staunt = staunt.replace(
  /<g id="lia-augenbrauen"[\s\S]*?<\/g>/,
  teile.lia['augenbrauen-denken'],
);
staunt = staunt.replace(/<path id="lia-mund"[^/]*\/>/, teile.lia['mund-staunen']);
staunt = staunt.replace(
  'aria-label="Lia, die Uri-Entdeckerin"',
  'aria-label="Lia staunt"',
);
writeFileSync(join(ziel, 'lia-staunt.svg'), staunt);

console.log('OK: Figuren aus figuren/ nach public/figuren kopiert, lia-staunt zusammengesetzt');
