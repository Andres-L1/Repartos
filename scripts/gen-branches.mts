/**
 * Genera con la tablebase las ramas (alternativas intermedias del alumno y su continuación) de una línea de finales.
 *   npx tsx scripts/gen-branches.mts "<fen>" "<uci uci ...>" [category|optimal]
 * Para cada jugada intermedia del alumno, toda jugada que cumple el criterio (scripts/lib/tablebase.ts) y no es la de la
 * línea da una rama: tras ella el rival juega la jugada de la línea si sigue conservando su mejor resultado y, si no,
 * la que más resiste; después el alumno juega la de la línea si es legal y cumple el criterio y, si no, la primera que
 * lo cumple; así hasta el final de la línea. Escribe la caché (solo FEN de ejercicios) y muestra el literal `branches`.
 */
import { Chess } from 'chessops/chess';
import { makeFen, parseFen } from 'chessops/fen';
import { parseUci } from 'chessops/util';
import { fetchEntry, loadCache, moverResult, saveCache, tbKey, type Mode, type TbEntry, type TbMove } from './lib/tablebase.ts';
import { checkLine, cacheProbe, lineFens } from './lib/tablebase.ts';
import type { Branch } from '../src/shared/moves.ts';

const cache = loadCache();
const get = async (fen: string): Promise<TbEntry> => {
  const k = tbKey(fen);
  if (!cache[k]) {
    cache[k] = await fetchEntry(fen);
    saveCache(cache);
  }
  return cache[k]!;
};
const dist = (moves: TbMove[]) => (moves.every((m) => m.dtm !== null) ? (m: TbMove) => Math.abs(m.dtm!) : (m: TbMove) => Math.abs(m.dtz ?? 0));
const fenOf = (pos: Chess) => makeFen(pos.toSetup());

/** Jugadas del alumno que cumplen el criterio en `fen`. */
async function studentKeep(fen: string, mode: Mode): Promise<string[]> {
  const e = await get(fen);
  let keep = e.moves.filter((m) => moverResult(m) === e.category);
  if (mode === 'optimal' && e.category === 'win') {
    const d = dist(keep);
    const best = Math.min(...keep.map(d));
    keep = keep.filter((m) => d(m) === best);
  }
  return keep.map((m) => m.uci);
}

/** Defensa del rival: la de la línea si conserva su resultado (y, si pierde, resiste lo máximo); si no, la que más resiste. */
async function rivalMove(fen: string, preferred: string | undefined): Promise<string> {
  const e = await get(fen);
  const keep = e.moves.filter((m) => moverResult(m) === e.category);
  const pool = e.category === 'loss' ? (() => { const d = dist(keep); const b = Math.max(...keep.map(d)); return keep.filter((m) => d(m) === b); })() : keep;
  return (pool.find((m) => m.uci === preferred) ?? pool[0]!).uci;
}

export async function branchesFor(fen: string, line: string[], mode: Mode): Promise<Branch[]> {
  const out: Branch[] = [];
  const pos = Chess.fromSetup(parseFen(fen).unwrap()).unwrap();
  for (let i = 0; i < line.length; i++) {
    if (i % 2 === 0 && i < line.length - 1) {
      for (const alt of (await studentKeep(fenOf(pos), mode)).filter((u) => u !== line[i])) {
        const p = pos.clone();
        p.play(parseUci(alt)!);
        const bl = [alt];
        for (let j = i + 1; j < line.length; j++) {
          const f = fenOf(p);
          const u = j % 2 === 1 ? await rivalMove(f, line[j]) : ((await studentKeep(f, mode)).find((k) => k === line[j]) ?? (await studentKeep(f, mode))[0]!);
          p.play(parseUci(u)!);
          bl.push(u);
        }
        out.push({ at: i, line: bl });
      }
    }
    pos.play(parseUci(line[i]!)!);
  }
  // alternativas de la última jugada de cada rama: las que cumplen el criterio y no son la de la rama
  for (const b of out) {
    const p = Chess.fromSetup(parseFen(fen).unwrap()).unwrap();
    for (const u of [...line.slice(0, b.at), ...b.line.slice(0, -1)]) p.play(parseUci(u)!);
    const alts = (await studentKeep(fenOf(p), mode)).filter((u) => u !== b.line.at(-1));
    if (alts.length) b.alt = alts;
  }
  return out;
}

if (process.argv[1]?.endsWith('gen-branches.mts')) {
  const [fen, lineArg, mode] = process.argv.slice(2);
  const line = lineArg!.split(' ').filter(Boolean);
  const bs = await branchesFor(fen!, line, (mode as Mode) ?? 'category');
  const p = Chess.fromSetup(parseFen(fen!).unwrap()).unwrap();
  for (const u of line.slice(0, -1)) p.play(parseUci(u)!);
  const alt = (await studentKeep(fenOf(p), (mode as Mode) ?? 'category')).filter((u) => u !== line.at(-1));
  console.log(JSON.stringify({ alt, branches: bs }));
  for (const full of [line, ...bs.map((b) => [...line.slice(0, b.at), ...b.line])]) for (const f of lineFens(fen!, full)) await get(f);
  const errors = checkLine(cacheProbe(cache), fen!, line, alt, (mode as Mode) ?? 'category', bs);
  console.log(errors.length ? errors.join('\n') : 'verificado');
  process.exit(0);
}
