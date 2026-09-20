// Lädt alle Wappen (19 Urner Gemeinden + Uri + 8 Nachbarkantone) als SVG von Wikimedia Commons.
// Quelle der Zuordnung: Wikidata (P771 = BFS-Gemeindenummer, P300 = ISO-Kantonscode, P94 = Wappenbild).
// Node >= 18. Ausführen: node scripts/fetch-wappen.mjs
import fs from 'node:fs';

const UA = 'UriLernApp/0.1 (privates Lernprojekt)';
const GEMEINDEN = ['1201','1202','1203','1205','1206','1207','1208','1209','1210','1211',
                   '1212','1213','1214','1215','1216','1217','1218','1219','1220'];
const KANTONE = ['CH-UR','CH-BE','CH-SZ','CH-OW','CH-NW','CH-GL','CH-GR','CH-TI','CH-VS'];

async function sparql(q, retries = 3) {
  const url = 'https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(q);
  for (let i = 0; i < retries; i++) {
    const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/sparql-results+json' } });
    if (r.ok) return (await r.json()).results.bindings;
    if (r.status === 429 && i < retries - 1) {
      const wait = (i + 1) * 5000;
      console.warn('SPARQL 429 – warte', wait / 1000, 's …');
      await new Promise((res) => setTimeout(res, wait));
      continue;
    }
    throw new Error('SPARQL ' + r.status);
  }
}

const FETCH_HEADERS = {
  'User-Agent': UA,
  Accept: 'image/svg+xml,image/*,*/*;q=0.8',
  Referer: 'https://commons.wikimedia.org/',
};

function commonsUrls(wikidataUrl) {
  const filename = decodeURIComponent(wikidataUrl.split('/').pop() ?? '');
  return [
    `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}`,
    `https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${encodeURIComponent(filename)}`,
  ];
}

async function download(fileUrl, target, retries = 6) {
  for (const url of commonsUrls(fileUrl)) {
    for (let i = 0; i < retries; i++) {
      const r = await fetch(url, { headers: FETCH_HEADERS, redirect: 'follow' });
      if (r.ok) {
        const buf = Buffer.from(await r.arrayBuffer());
        if (buf.length < 100) break;
        fs.writeFileSync(target, buf);
        return;
      }
      if ((r.status === 403 || r.status === 429 || r.status >= 500) && i < retries - 1) {
        const wait = Math.min((i + 1) * 6000, 60000);
        console.warn('Download', r.status, '– warte', wait / 1000, 's …');
        await new Promise((res) => setTimeout(res, wait));
        continue;
      }
    }
  }
  throw new Error(`Download fehlgeschlagen für ${fileUrl}`);
}

const gem = await sparql(`SELECT ?code ?label ?img WHERE {
  VALUES ?code { ${GEMEINDEN.map(c => `"${c}"`).join(' ')} }
  ?item wdt:P771 ?code; wdt:P94 ?img.
  FILTER NOT EXISTS { ?item wdt:P576 ?aufgeloest }
  ?item rdfs:label ?label FILTER(lang(?label)='de') }`);
const kt = await sparql(`SELECT ?code ?label ?img WHERE {
  VALUES ?code { ${KANTONE.map(c => `"${c}"`).join(' ')} }
  ?item wdt:P300 ?code; wdt:P94 ?img.
  ?item rdfs:label ?label FILTER(lang(?label)='de') }`);

const manifest = { quelle: 'Wikimedia Commons via Wikidata P94', gemeinden: {}, kantone: {} };
fs.mkdirSync('public/wappen/gemeinden', { recursive: true });
fs.mkdirSync('public/wappen/kantone', { recursive: true });

for (const [rows, dir, key] of [[gem, 'gemeinden', 'gemeinden'], [kt, 'kantone', 'kantone']]) {
  for (const row of rows) {
    const code = row.code.value;
    if (manifest[key][code]) { console.warn('Mehrere Wappen für', code, '→ erstes behalten'); continue; }
    const file = `${code.replace('CH-', '').toLowerCase()}.svg`;
    const target = `public/wappen/${dir}/${file}`;
    if (fs.existsSync(target)) {
      console.log('–', code, row.label.value, '(bereits vorhanden)');
    } else {
      await download(row.img.value, target);
      console.log('✓', code, row.label.value);
    }
    manifest[key][code] = { name: row.label.value, datei: `/wappen/${dir}/${file}`, commons: row.img.value };
    await new Promise((r) => setTimeout(r, 3000)); // Commons schonen
  }
}

const fehlt = [...GEMEINDEN.filter(c => !manifest.gemeinden[c]), ...KANTONE.filter(c => !manifest.kantone[c])];
fs.writeFileSync('public/wappen/manifest.json', JSON.stringify(manifest, null, 2));
if (fehlt.length) { console.error('FEHLEN:', fehlt.join(', '), '→ manuell auf Commons suchen'); process.exit(1); }
console.log('Alle 28 Wappen geladen.');
