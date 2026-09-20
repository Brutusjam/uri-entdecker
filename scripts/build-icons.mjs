import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const icons = join(root, 'public', 'icons');
mkdirSync(icons, { recursive: true });

function svgNachPng(svgPfad, pngPfad, kantenlaenge) {
  const svg = readFileSync(svgPfad);
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: kantenlaenge },
    background: 'rgba(0,0,0,0)',
  });
  writeFileSync(pngPfad, resvg.render().asPng());
}

svgNachPng(join(icons, 'icon.svg'), join(icons, 'icon-192.png'), 192);
svgNachPng(join(icons, 'icon.svg'), join(icons, 'icon-512.png'), 512);
svgNachPng(join(icons, 'icon.svg'), join(icons, 'apple-touch-icon.png'), 180);
svgNachPng(join(icons, 'icon-maskable.svg'), join(icons, 'icon-maskable-512.png'), 512);
svgNachPng(join(root, 'public', 'favicon.svg'), join(icons, 'favicon-32.png'), 32);
svgNachPng(join(root, 'public', 'favicon.svg'), join(icons, 'favicon-48.png'), 48);

console.log('Icons geschrieben nach public/icons/');
