/**
 * Verificación EXACTA de los finales (conceptos `endgame.*`) con la tablebase de Lichess (Syzygy, hasta 7 piezas).
 *   npm run verify:finales                 usa la caché y pide a la API solo las posiciones que falten
 *   npm run verify:finales -- --refresh    vuelve a pedir todas las posiciones (comprueba que nada ha cambiado)
 *   npx tsx scripts/verify-finales.mts probe "<fen>" ["<uci ...>"]   resultado y jugadas de una posición (tras las jugadas)
 * Criterio en scripts/lib/tablebase.ts (`checkLine`). Sale con código 1 si algún ejercicio deja de cumplirse.
 * Los tests (test/content/unitsE.test.ts) repiten la comprobación solo con la caché.
 */
import { Chess } from 'chessops/chess';
import { makeFen, parseFen } from 'chessops/fen';
import { parseUci } from 'chessops/util';
import { LESSONS } from '../src/content/index.ts';
import { EXERCISES } from '../src/pedagogy/exercises.ts';
import { mirrorExercise } from '../src/pedagogy/mirror.ts';
import { CLAIMS, EXPLAIN_RESULT } from './lib/finales-claims.ts';
import { cacheProbe, checkLine, describeEntry, fetchEntry, lineFens, loadCache, modeFor, saveCache, tbKey } from './lib/tablebase.ts';

const args = process.argv.slice(2);
const cache = loadCache();

async function ensure(fens: string[], refresh: boolean): Promise<number> {
  let fetched = 0;
  for (const f of [...new Set(fens.map(tbKey))]) {
    if (!refresh && cache[f]) continue;
    const e = await fetchEntry(f);
    const before = cache[f];
    if (before && JSON.stringify(before) !== JSON.stringify(e)) console.log(`CAMBIO en la tablebase: ${f}`);
    cache[f] = e;
    fetched++;
    if (fetched % 20 === 0) saveCache(cache);
  }
  saveCache(cache);
  return fetched;
}

if (args[0] === 'probe') {
  const pos = Chess.fromSetup(parseFen(args[1]!).unwrap()).unwrap();
  for (const u of args[2]?.split(' ').filter(Boolean) ?? []) pos.play(parseUci(u)!);
  const fen = makeFen(pos.toSetup());
  const e = await fetchEntry(fen);
  console.log(fen + '\n' + describeEntry(fen, e));
  process.exit(0);
}

const isEndgame = (c: string) => c.startsWith('endgame.');
const steps = [
  ...LESSONS.filter((l) => l.conceptIds?.some(isEndgame)).flatMap((l) =>
    [...l.practice.map((s, i) => ({ key: `${l.id}:practice:${i}`, s })), ...l.evaluation.map((s, i) => ({ key: `${l.id}:evaluation:${i}`, s }))].map(
      ({ key, s }) => ({ key, fen: s.fen, line: s.solutionUci, alt: s.alt ?? [], branches: s.branches ?? [] }),
    ),
  ),
  ...EXERCISES.filter((e) => isEndgame(e.conceptId))
    .flatMap((e) => [e, mirrorExercise(e)])
    .map((e) => ({ key: e.id, fen: e.fen, line: e.solutionUci, alt: e.alt ?? [], branches: e.branches ?? [] })),
];
const explains = LESSONS.filter((l) => l.conceptIds?.some(isEndgame)).flatMap((l) => l.explanation.map((e, i) => ({ key: `${l.id}:${i}`, fen: e.fen })));
const claimFen = (fen: string, moves: string[]) => {
  const pos = Chess.fromSetup(parseFen(fen).unwrap()).unwrap();
  for (const u of moves) pos.play(parseUci(u)!);
  return makeFen(pos.toSetup());
};

const fetched = await ensure(
  [...steps.flatMap((s) => [...lineFens(s.fen, s.line), ...s.branches.flatMap((b) => lineFens(s.fen, [...s.line.slice(0, b.at), ...b.line]))]), ...explains.map((e) => e.fen), ...CLAIMS.map((c) => claimFen(c.fen, c.moves))],
  args.includes('--refresh'),
);
const probe = cacheProbe(cache);
let failed = 0;
for (const s of steps) {
  const errors = checkLine(probe, s.fen, s.line, s.alt, modeFor(s.key), s.branches);
  console.log(`${errors.length ? 'FALLA' : 'ok   '} ${s.key} (${probe(s.fen).category})${s.alt.length ? ` alt ${s.alt.join(',')}` : ''}${s.branches.length ? ` ramas ${s.branches.length}` : ''}`);
  for (const e of errors) console.log(`        ${e}`);
  if (errors.length) failed++;
}
const okSteps = steps.length - failed;
for (const e of explains) {
  const got = probe(e.fen).category;
  if (got !== EXPLAIN_RESULT[e.key]) {
    console.log(`FALLA explicación ${e.key}: ${got}; el texto supone ${EXPLAIN_RESULT[e.key] ?? '(sin declarar en finales-claims.ts)'}`);
    failed++;
  }
}
for (const c of CLAIMS) {
  const got = probe(claimFen(c.fen, c.moves)).category;
  if (got !== c.result) {
    console.log(`FALLA afirmación «${c.where}»: ${got}; el texto supone ${c.result}`);
    failed++;
  }
}
console.log(
  `\n${okSteps}/${steps.length} ejercicios cumplen; ${explains.length} explicaciones y ${CLAIMS.length} afirmaciones de los textos comprobadas; ` +
    `${fetched} posiciones pedidas a la API; caché con ${Object.keys(cache).length}.`,
);
process.exit(failed ? 1 : 0);
