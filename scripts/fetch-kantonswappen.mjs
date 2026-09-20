// Lädt nur Kantonswappen (Uri + 8 Nachbarn) von Wikimedia Commons via Wikidata.
// Ausführen: node scripts/fetch-kantonswappen.mjs
import fs from 'node:fs';

const UA = 'UriLernApp/0.1 (privates Lernprojekt)';
const KANTONE = ['CH-UR', 'CH-BE', 'CH-SZ', 'CH-OW', 'CH-NW', 'CH-GL', 'CH-GR', 'CH-TI', 'CH-VS'];
const PAUSE_MS = 5000;

const HEADERS = {
  'User-Agent': UA,
  Accept: 'image/svg+xml,image/*,*/*;q=0.8',
  Referer: 'https://commons.wikimedia.org/',
};

async function sparql(q, retries = 4) {
  const url = 'https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(q);
  for (let i = 0; i < retries; i++) {
    const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/sparql-results+json' } });
    if (r.ok) return (await r.json()).results.bindings;
    if (r.status === 429 && i < retries - 1) {
      await new Promise((res) => setTimeout(res, (i + 1) * 8000));
      continue;
    }
    throw new Error('SPARQL ' + r.status);
  }
}

function commonsUrls(wikidataUrl) {
  const filename = decodeURIComponent(wikidataUrl.split('/').pop() ?? '');
  return [
    `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}`,
    `https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${encodeURIComponent(filename)}`,
  ];
}

async function download(wikidataUrl, target) {
  for (const url of commonsUrls(wikidataUrl)) {
    for (let i = 0; i < 4; i++) {
      const r = await fetch(url, { headers: HEADERS, redirect: 'follow' });
      if (r.ok) {
        const buf = Buffer.from(await r.arrayBuffer());
        if (buf.length < 100) continue;
        fs.writeFileSync(target, buf);
        return;
      }
      if ((r.status === 403 || r.status === 429 || r.status >= 500) && i < 3) {
        await new Promise((res) => setTimeout(res, (i + 1) * 6000));
        continue;
      }
    }
  }
  throw new Error('Download fehlgeschlagen');
}

const rows = await sparql(`SELECT ?code ?label ?img WHERE {
  VALUES ?code { ${KANTONE.map((c) => `"${c}"`).join(' ')} }
  ?item wdt:P300 ?code; wdt:P94 ?img.
  ?item rdfs:label ?label FILTER(lang(?label)='de') }`);

fs.mkdirSync('public/wappen/kantone', { recursive: true });

let ok = 0;
const fehlt = [];

for (const row of rows) {
  const code = row.code.value;
  const file = `${code.replace('CH-', '').toLowerCase()}.svg`;
  const target = `public/wappen/kantone/${file}`;

  if (fs.existsSync(target)) {
    console.log('–', code, row.label.value, '(bereits vorhanden)');
    ok++;
    continue;
  }

  try {
    await download(row.img.value, target);
    console.log('✓', code, row.label.value);
    ok++;
  } catch {
    console.error('✗', code, row.label.value);
    fehlt.push(code);
  }
  await new Promise((r) => setTimeout(r, PAUSE_MS));
}

console.log(`\n${ok} / ${KANTONE.length} Kantonswappen vorhanden.`);
if (fehlt.length) {
  console.error('Fehlgeschlagen:', fehlt.join(', '));
  process.exit(1);
}
