/**
 * Verificación EXACTA con la tablebase de Lichess (Syzygy) de las líneas de mate y la técnica de las unidades u25 a u29.
 *   npx tsx scripts/verify-metodo-ruso.mts              usa la caché y pide a la API solo las posiciones que falten
 *   npx tsx scripts/verify-metodo-ruso.mts --refresh    vuelve a pedir todas (comprueba que nada ha cambiado)
 * Criterio `optimal` de scripts/lib/tablebase.ts (`checkLine`): las jugadas aceptadas son exactamente las que ganan lo
 * antes posible (menor DTM). Caché propia: test/fixtures/tablebase/metodo-ruso-b.json. Código de salida 1 si algo falla.
 * Los tests (test/content/unitsRusoB.test.ts) repiten la comprobación solo con la caché.
 */
import { Chess } from 'chessops/chess';
import { makeFen, parseFen } from 'chessops/fen';
import { parseUci } from 'chessops/util';
import { CACHE_RUSO_B, TB_CLAIMS, tbSteps } from './lib/metodo-ruso-b.ts';
import { cacheProbe, checkLine, fetchEntry, lineFens, loadCache, saveCache, tbKey } from './lib/tablebase.ts';

const refresh = process.argv.includes('--refresh');
const cache = loadCache(CACHE_RUSO_B);
const steps = tbSteps();
const claimFen = (fen: string, moves: string[]) => {
  const pos = Chess.fromSetup(parseFen(fen).unwrap()).unwrap();
  for (const u of moves) pos.play(parseUci(u)!);
  return makeFen(pos.toSetup());
};

let fetched = 0;
for (const f of [...new Set([...steps.flatMap((s) => lineFens(s.fen, s.line)), ...TB_CLAIMS.map((c) => claimFen(c.fen, c.moves))].map(tbKey))]) {
  if (!refresh && cache[f]) continue;
  const e = await fetchEntry(f);
  if (cache[f] && JSON.stringify(cache[f]) !== JSON.stringify(e)) console.log(`CAMBIO en la tablebase: ${f}`);
  cache[f] = e;
  if (++fetched % 20 === 0) saveCache(cache, CACHE_RUSO_B);
}
saveCache(cache, CACHE_RUSO_B);

const probe = cacheProbe(cache);
let failed = 0;
for (const s of steps) {
  const errors = checkLine(probe, s.fen, s.line, s.alt, 'optimal');
  console.log(`${errors.length ? 'FALLA' : 'ok   '} ${s.key} (dtm ${probe(s.fen).dtm})${s.alt.length ? ` alt ${s.alt.join(',')}` : ''}`);
  for (const e of errors) console.log(`        ${e}`);
  if (errors.length) failed++;
}
for (const c of TB_CLAIMS) {
  const got = probe(claimFen(c.fen, c.moves)).category;
  if (got !== c.result) {
    console.log(`FALLA afirmación «${c.where}»: ${got}; el texto supone ${c.result}`);
    failed++;
  }
}
console.log(`\n${steps.length - failed}/${steps.length} ejercicios cumplen; ${TB_CLAIMS.length} afirmaciones comprobadas; ${fetched} posiciones pedidas a la API; caché con ${Object.keys(cache).length}.`);
process.exitCode = failed ? 1 : 0;
