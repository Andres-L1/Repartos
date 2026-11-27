/**
 * Verificación con Stockfish de la unidad u37 (Ideas de apertura por color).
 *   npx tsx scripts/verify-u37.mts
 * Por ejercicio (profundidad DEPTH, MultiPV 25): (1) la línea es prefijo de una línea de src/openings/openings.json y el nombre
 * indicado es el de la línea más corta que pasa por ella; (2) la solución es la mejor jugada de la posición; (3) las demás jugadas de su
 * clase (peón central d/e, caballo o alfil en casilla inicial, enroque) quedan al menos CLASS_GAP cp por debajo; (4) cada jugada de
 * `wrongByMove` queda al menos WRONG_GAP cp por debajo. Sale con código 1 si algo falla.
 */
import { readFileSync } from 'node:fs';
import { Chess } from 'chessops/chess';
import { parseFen } from 'chessops/fen';
import { parseUci, squareFile, makeSquare } from 'chessops/util';
import { SPECS, parseLine } from '../src/content/units/u37.ts';
import { Stockfish } from './verify-lib.mts';
import { leaksIn, targetsOf } from './lib/hint-leaks.ts';
import { unit } from '../src/content/units/u37.ts';

const DEPTH = Number(process.env.DEPTH ?? 18);
const CLASS_GAP = 16;
const WRONG_GAP = 30;
const book: [string, string, string][] = JSON.parse(readFileSync(new URL('../src/openings/openings.json', import.meta.url), 'utf8'));
const HOME = { white: ['b1', 'g1', 'c1', 'f1'], black: ['b8', 'g8', 'c8', 'f8'] };

const sf = new Stockfish();
await sf.init();
let fails = 0;
const fail = (k: string, m: string) => {
  fails++;
  console.log(`FALLA ${k}: ${m}`);
};

for (const [lesson, specs] of Object.entries(SPECS)) {
  for (const [i, s] of specs.entries()) {
    const key = `${lesson}#${i + 1} ${s.line.split(' ').slice(-1)[0]}`;
    const { fen, uci, color } = parseLine(s.line);
    // (1) libro
    const through = book.filter((b) => b[2] === s.line || b[2].startsWith(s.line + ' ')).sort((a, b) => a[2].length - b[2].length);
    if (!through.length) fail(key, 'la línea no está en openings.json');
    else if (through[0]![1] !== s.name) fail(key, `nombre del libro «${through[0]![1]}» != «${s.name}»`);
    // (2)-(4) motor
    const pos = Chess.fromSetup(parseFen(fen).unwrap()).unwrap();
    const lines = await sf.multipv(fen, DEPTH, 25);
    const best = lines[0]!;
    const sol = lines.find((l) => l.uci === uci);
    if (!sol) {
      fail(key, `la solución ${uci} no sale en el MultiPV`);
      continue;
    }
    const loss = (u: string) => best.score - (lines.find((l) => l.uci === u)?.score ?? -Infinity);
    if (best.uci !== uci && sol.score < best.score) fail(key, `la solución no es la mejor (${best.uci} ${best.score} vs ${sol.score})`);
    const cls = (u: string) => {
      const m = parseUci(u) as { from: number; to: number };
      const p = pos.board.get(m.from)!;
      if (p.role === 'king' && Math.abs(squareFile(m.to) - squareFile(m.from)) === 2) return 'castle';
      if ((p.role === 'knight' || p.role === 'bishop') && HOME[color].includes(makeSquare(m.from))) return 'develop';
      if (p.role === 'pawn' && 'de'.includes(makeSquare(m.from)[0]!)) return 'center';
      return 'other';
    };
    if (cls(uci) !== s.kind) fail(key, `la solución es de clase ${cls(uci)}, no ${s.kind}`);
    const peers = lines.filter((l) => l.uci !== uci && cls(l.uci) === s.kind);
    const gap = peers.length ? sol.score - Math.max(...peers.map((l) => l.score)) : Infinity;
    if (gap < CLASS_GAP) fail(key, `hueco con las de su clase ${gap} < ${CLASS_GAP}`);
    let minWrong = Infinity;
    for (const u of Object.keys(s.wrong ?? {})) {
      if (!lines.some((l) => l.uci === u)) {
        // fuera del MultiPV 25: queda por debajo de la 25.ª; vale si esa ya está a >= WRONG_GAP
        if (best.score - lines[lines.length - 1]!.score < WRONG_GAP) fail(key, `${u} fuera del MultiPV y sin cota`);
        continue;
      }
      minWrong = Math.min(minWrong, loss(u));
      if (loss(u) < WRONG_GAP) fail(key, `wrongByMove ${u} pierde solo ${loss(u)} < ${WRONG_GAP}`);
    }
    console.log(`ok ${key} | mejor=${best.uci === uci} hueco=${gap === Infinity ? '-' : gap} wrongMin=${minWrong === Infinity ? '-' : minWrong}`);
  }
}
// política de pistas (como test/content/hints.test.ts, que solo recorre las unidades registradas)
for (const l of unit.lessons)
  for (const st of [...l.practice, ...l.evaluation]) {
    const t = targetsOf(st.fen, st.solutionUci, st.alt);
    for (const x of [st.hint, st.explanationWrong, ...Object.values(st.wrongByMove ?? {})])
      if (x && leaksIn(x, t, st.prompt).length) fail(l.id, `pista que regala la solución: ${x}`);
  }
sf.quit();
console.log(fails ? `${fails} fallos` : 'u37 verificada');
process.exit(fails ? 1 : 0);
