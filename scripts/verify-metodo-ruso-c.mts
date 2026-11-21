/**
 * Verificación con la tablebase de Lichess (Syzygy) de lo que afirma u33: regla del cuadrado y coronación sin ahogado.
 *   npx tsx scripts/verify-metodo-ruso-c.mts             usa la caché y pide a la API solo lo que falte
 *   npx tsx scripts/verify-metodo-ruso-c.mts --refresh   vuelve a pedirlo todo
 * Criterio `category` de scripts/lib/tablebase.ts (`checkLine`): las jugadas aceptadas (`solutionUci[0]` + `alt`) son
 * EXACTAMENTE las que conservan el resultado. Sale con código 1 si algo deja de cumplirse.
 * Solo se envía a la API el FEN de las posiciones de los ejercicios. Caché: test/fixtures/tablebase/metodo-ruso-c.json.
 */
import { cacheProbe, checkLine, fetchEntry, lineFens, loadCache, saveCache, tbKey } from './lib/tablebase.ts';
import { promotionFens, squareExplainExpect, squareExplains, tbSteps, TB_CACHE_PATH } from './lib/ruso-c-tb.ts';

const refresh = process.argv.includes('--refresh');
const cache = loadCache(TB_CACHE_PATH);
const steps = tbSteps();
const explains = squareExplains();
const promos = promotionFens();

const fens = [...new Set([...steps.flatMap((s) => lineFens(s.fen, s.line)), ...explains.map((e) => e.fen), ...promos.map((p) => p.fen)].map(tbKey))];
let fetched = 0;
for (const f of fens) {
  if (!refresh && cache[f]) continue;
  cache[f] = await fetchEntry(f);
  fetched++;
}
saveCache(cache, TB_CACHE_PATH);

const probe = cacheProbe(cache);
let failed = 0;
for (const s of steps) {
  const errors = checkLine(probe, s.fen, s.line, s.alt, 'category');
  console.log(`${errors.length ? 'FALLA' : 'ok   '} ${s.key} (${probe(s.fen).category}) alt ${s.alt.join(',') || '-'}`);
  for (const e of errors) console.log(`        ${e}`);
  if (errors.length) failed++;
}
for (const e of explains) {
  const got = probe(e.fen).category;
  const want = squareExplainExpect(e.fen);
  if (got !== want) {
    console.log(`FALLA ${e.key}: la tablebase dice ${got} y la regla del cuadrado ${want}`);
    failed++;
  } else console.log(`ok    ${e.key} (${got})`);
}
for (const p of promos) console.log(`      coronar ${p.promotion}: ${probe(p.fen).category} para quien mueve (negras)`);
console.log(`\n${steps.length - failed} de ${steps.length} ejercicios cumplen; ${fetched} posiciones pedidas; caché con ${Object.keys(cache).length}.`);
process.exit(failed ? 1 : 0);
