/**
 * Verificación exacta de u36 con la tablebase Syzygy de Lichess. Caché propia: test/fixtures/tablebase/u36.json.
 *   npx tsx scripts/verify-u36.mts               pide a la API las posiciones que falten y comprueba los 18 ejercicios
 *   npx tsx scripts/verify-u36.mts --refresh     vuelve a pedirlas todas
 *   npx tsx scripts/verify-u36.mts probe "<fen>" ["<uci ...>"]   resultado y jugadas de una posición
 * Criterio (checkLine, modo `category`): en cada jugada del alumno la de la línea es EXACTAMENTE la única que conserva el
 * resultado (ganar o tablas); el rival juega siempre la defensa que más resiste. Además `onlyResultErrors` en la 1.ª jugada.
 */
import { Chess } from 'chessops/chess';
import { makeFen, parseFen } from 'chessops/fen';
import { parseUci } from 'chessops/util';
import { unit as u36 } from '../src/content/units/u36.ts';
import { cacheProbe, checkLine, describeEntry, fetchEntry, lineFens, loadCache, onlyResultErrors, saveCache, tbKey } from './lib/tablebase.ts';

export const U36_CACHE = 'test/fixtures/tablebase/u36.json';
const args = process.argv.slice(2);
const cache = loadCache(U36_CACHE);

async function ensure(fens: string[], refresh: boolean): Promise<number> {
  let n = 0;
  for (const f of [...new Set(fens.map(tbKey))]) {
    if (!refresh && cache[f]) continue;
    cache[f] = await fetchEntry(f);
    if (++n % 20 === 0) saveCache(cache, U36_CACHE);
  }
  saveCache(cache, U36_CACHE);
  return n;
}

if (args[0] === 'probe') {
  const pos = Chess.fromSetup(parseFen(args[1]!).unwrap()).unwrap();
  for (const u of args[2]?.split(' ').filter(Boolean) ?? []) pos.play(parseUci(u)!);
  const fen = makeFen(pos.toSetup());
  console.log(fen + '\n' + describeEntry(fen, await fetchEntry(fen)));
  process.exit(0);
}

const steps = u36.lessons.flatMap((l) => [...l.practice.map((s, i) => ({ key: `${l.id}:practice:${i}`, s })), ...l.evaluation.map((s, i) => ({ key: `${l.id}:evaluation:${i}`, s }))]);
const explains = u36.lessons.flatMap((l) => l.explanation.map((e, i) => ({ key: `${l.id}:${i}`, fen: e.fen })));
/** Posición final de la línea (turno del rival) y la misma con el turno cambiado: en l02 y l03 es el zugzwang (pierde el que mueve; con el turno cambiado, tablas). */
export const flipTurn = (fen: string): string => fen.replace(/ [wb] /, (m) => (m === ' w ' ? ' b ' : ' w '));
const endFen = (fen: string, line: readonly string[]): string => {
  const pos = Chess.fromSetup(parseFen(fen).unwrap()).unwrap();
  for (const u of line) pos.play(parseUci(u)!);
  return makeFen(pos.toSetup());
};
const zug = steps.filter(({ key }) => !key.startsWith('u36.l01'));
const needed = [
  ...steps.flatMap(({ s }) => lineFens(s.fen, s.solutionUci)),
  ...explains.flatMap((e) => [e.fen, flipTurn(e.fen)]),
  ...zug.flatMap(({ s }) => [endFen(s.fen, s.solutionUci), flipTurn(endFen(s.fen, s.solutionUci))]),
];
const fetched = await ensure(needed, args.includes('--refresh'));
for (const k of Object.keys(cache)) if (!needed.some((f) => tbKey(f) === k)) delete cache[k]; // la caché solo guarda lo que usa la unidad
saveCache(cache, U36_CACHE);
const probe = cacheProbe(cache);
let failed = 0;
for (const { key, s } of steps) {
  const errors = [...checkLine(probe, s.fen, s.solutionUci, s.alt ?? [], 'category'), ...onlyResultErrors(probe, s.fen, s.solutionUci, s.alt ?? [])];
  console.log(`${errors.length ? 'FALLA' : 'ok   '} ${key} (${probe(s.fen).category})`);
  for (const e of errors) console.log('        ' + e);
  if (errors.length) failed++;
}
console.log(`\n${steps.length - failed}/${steps.length} ejercicios cumplen; ${fetched} posiciones pedidas; caché con ${Object.keys(cache).length}.`);
process.exit(failed ? 1 : 0);
