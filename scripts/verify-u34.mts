/**
 * Verificación EXACTA de u34 (Estructuras de peones) con la tablebase Syzygy de Lichess (finales de peones, <= 7 piezas).
 *   npx tsx scripts/verify-u34.mts            usa la caché test/fixtures/tablebase/u34.json y pide solo lo que falte
 *   npx tsx scripts/verify-u34.mts --refresh  vuelve a pedirlo todo (avisa si algo cambió)
 *   npx tsx scripts/verify-u34.mts probe "<fen>"   resultado y jugadas de una posición
 * Criterio (checkLine, modo `category`): en cada ejercicio la jugada del alumno es EXACTAMENTE la única que conserva el
 * resultado de la posición (ganada o tablas); toda otra jugada lo empeora. En las explicaciones, la jugada que ilustra el
 * texto es la única que conserva el resultado. Los tests (test/content/unitsU34.test.ts) repiten esto solo con la caché.
 */
import { Chess } from 'chessops/chess';
import { makeFen, parseFen } from 'chessops/fen';
import { unit as u34, EXPLAIN_MOVES } from '../src/content/units/u34.ts';
import { checkLine, describeEntry, fetchEntry, lineFens, loadCache, onlyResultErrors, cacheProbe, saveCache, tbKey } from './lib/tablebase.ts';

export const CACHE = 'test/fixtures/tablebase/u34.json';
const args = process.argv.slice(2);
const cache = loadCache(CACHE);

if (args[0] === 'probe') {
  const fen = makeFen(Chess.fromSetup(parseFen(args[1]!).unwrap()).unwrap().toSetup());
  console.log(fen + '\n' + describeEntry(fen, await fetchEntry(fen)));
  process.exit(0);
}

const steps = u34.lessons.flatMap((l) => [
  ...l.practice.map((s, i) => ({ key: `${l.id}:practice:${i}`, fen: s.fen, line: s.solutionUci, alt: s.alt ?? [] })),
  ...l.evaluation.map((s, i) => ({ key: `${l.id}:evaluation:${i}`, fen: s.fen, line: s.solutionUci, alt: s.alt ?? [] })),
]);
const explains = u34.lessons.flatMap((l) => l.explanation.map((e, i) => ({ key: `${l.id}:${i}`, fen: e.fen, move: EXPLAIN_MOVES[`${l.id}:${i}`] })));

const refresh = args.includes('--refresh');
const needed = new Set<string>();
for (const s of steps) for (const f of lineFens(s.fen, s.line)) needed.add(tbKey(f));
for (const e of explains) needed.add(tbKey(e.fen));
let fetched = 0;
for (const k of needed) {
  if (!refresh && cache[k]) continue;
  const e = await fetchEntry(k + ' 0 1');
  if (cache[k] && JSON.stringify(cache[k]) !== JSON.stringify(e)) console.log(`CAMBIO en la tablebase: ${k}`);
  cache[k] = e;
  if (++fetched % 20 === 0) saveCache(cache, CACHE);
}
saveCache(cache, CACHE);

const probe = cacheProbe(cache);
let failed = 0;
const report = (key: string, errs: string[]) => {
  if (errs.length) failed++;
  console.log(`${errs.length ? 'FALLA' : 'ok   '} ${key}${errs.length ? '\n   ' + errs.join('\n   ') : ''}`);
};
for (const s of steps) report(s.key, [...checkLine(probe, s.fen, s.line, s.alt, 'category'), ...(s.line.length === 1 ? onlyResultErrors(probe, s.fen, s.line, s.alt) : [])]);
for (const e of explains) report(`explicación ${e.key}`, e.move ? onlyResultErrors(probe, e.fen, [e.move]) : ['falta la jugada en EXPLAIN_MOVES']);
console.log(`\n${steps.length + explains.length - failed}/${steps.length + explains.length} correctos (tablebase Syzygy, ${fetched} posiciones pedidas)`);
process.exit(failed ? 1 : 0);
