import { mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';
const target = 'pulse/public';
await mkdir(`${target}/vendor`, { recursive: true });
await mkdir(`${target}/fonts`, { recursive: true });
await mkdir(`${target}/geo`, { recursive: true });
for (const name of ['maplibre-gl.mjs', 'maplibre-gl-shared.mjs', 'maplibre-gl-worker.mjs', 'maplibre-gl.css']) await copyFile(`node_modules/maplibre-gl/dist/${name}`, `${target}/vendor/${name}`);
await copyFile('node_modules/maplibre-gl/LICENSE.txt', `${target}/vendor/maplibre-LICENSE.txt`).catch(async () => {
  const pkg = JSON.parse(await readFile('node_modules/maplibre-gl/package.json', 'utf8'));
  const response = await fetch(`https://raw.githubusercontent.com/maplibre/maplibre-gl-js/v${pkg.version}/LICENSE.txt`);
  if (!response.ok) throw new Error('No se ha podido descargar la licencia de MapLibre.');
  await writeFile(`${target}/vendor/maplibre-LICENSE.txt`, await response.text());
});
async function download(url, filename) {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`Asset ${filename}: ${response.status}`);
  await writeFile(`${target}/${filename}`, new Uint8Array(await response.arrayBuffer()));
}
for (const font of ['dm-sans-latin.woff2', 'dm-sans-latin-ext.woff2']) await download(`https://chedex.app/fonts/${font}`, `fonts/${font}`);
await download('https://chedex.app/chedex-icon.svg', 'chedex-icon.svg');
await download('https://raw.githubusercontent.com/google/fonts/main/ofl/dmsans/OFL.txt', 'fonts/OFL.txt');
const response = await fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson');
if (!response.ok) throw new Error('Natural Earth unavailable');
const raw = await response.json();
const aliases = { DEU: 'GER', ZAF: 'RSA', MYS: 'MAS' };
const features = raw.features.map(feature => {
  const p = feature.properties, iso = p.ISO_A3_EH === '-99' ? p.ADM0_A3 : p.ISO_A3_EH;
  const code = aliases[iso] || iso;
  return { type: 'Feature', id: code, properties: { code, name: p.NAME_ES || p.NAME, english: p.NAME_EN || p.NAME, lng: p.LABEL_X, lat: p.LABEL_Y }, geometry: feature.geometry };
});
await writeFile(`${target}/geo/countries.geojson`, JSON.stringify({ type: 'FeatureCollection', features }));
console.log(`Assets preparados: MapLibre, DM Sans, identidad Chedex y ${features.length} geometrías Natural Earth.`);
