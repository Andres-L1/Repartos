/**
 * ¿Vale la jugada del alumno? Regla única para lecciones (web), mini lección del error y sesión diaria (worker).
 * Módulo puro compartido por worker y web.
 */
import { Chess } from 'chessops/chess';
import { parseFen } from 'chessops/fen';
import { makeSquare, parseUci } from 'chessops/util';

/** Enroque como rey sobre su torre (e1h1) pasa a rey a destino (e1g1); lo demás igual. */
function canonical(pos: Chess, uci: string): string {
  const m = parseUci(uci);
  if (!m || !('from' in m)) return uci;
  const king = pos.board.get(m.from);
  const target = pos.board.get(m.to);
  if (king?.role !== 'king' || target?.role !== 'rook' || target.color !== king.color) return uci;
  const from = makeSquare(m.from);
  return from + (m.to > m.from ? 'g' : 'c') + from[1];
}

function mates(pos: Chess, uci: string): boolean {
  const m = parseUci(uci);
  if (!m || !pos.isLegal(m)) return false;
  const after = pos.clone();
  after.play(m);
  return after.isCheckmate();
}

/**
 * ¿`uci` es la jugada esperada en el paso `step` de la línea? Compara el enroque en forma canónica; como Lichess
 * en los puzles de mate, si la esperada da jaque mate vale cualquier jugada legal que también lo dé; y en la última
 * jugada de la línea valen también las de `alt` (soluciones alternativas verificadas, en UCI).
 */
export function isExpectedMove(fen: string, line: readonly string[], step: number, uci: string, alt: readonly string[] = []): boolean {
  const want = line[step];
  if (want === undefined) return false;
  if (uci === want) return true;
  try {
    const pos = Chess.fromSetup(parseFen(fen).unwrap()).unwrap();
    for (const u of line.slice(0, step)) pos.play(parseUci(u)!);
    const got = canonical(pos, uci);
    if (got === canonical(pos, want)) return true;
    if (step === line.length - 1 && alt.some((a) => canonical(pos, a) === got) && pos.isLegal(parseUci(got)!)) return true;
    return mates(pos, want) && mates(pos, uci);
  } catch {
    return false;
  }
}

/**
 * Rama: jugada alternativa del alumno en una jugada intermedia (`at`, índice par de `solutionUci`) con su continuación
 * completa precalculada. `line` empieza por la alternativa y sigue (respuesta del rival, jugada del alumno, ...) hasta el
 * final del ejercicio; `alt` son las alternativas de su última jugada. El rival responde según la rama, no según la línea
 * principal. Sin ramas anidadas: dentro de una rama las jugadas intermedias del alumno son únicas.
 */
export interface Branch {
  at: number;
  line: string[];
  alt?: string[];
}

export interface Variants {
  fen: string;
  solutionUci: readonly string[];
  alt?: readonly string[];
  branches?: readonly Branch[];
}

const sameStart = (a: readonly string[], b: readonly string[], n: number) => a.slice(0, n).join() === b.slice(0, n).join();

/** `alt` vigente para la línea efectiva `line` (la principal o una rama ya tomada). */
export function altOf(v: Variants, line: readonly string[]): readonly string[] {
  if (line.join() === v.solutionUci.join()) return v.alt ?? [];
  const b = v.branches?.find((x) => sameStart(line, v.solutionUci, x.at) && x.line.join() === line.slice(x.at).join());
  return b?.alt ?? [];
}

/**
 * Juzga la jugada `uci` del alumno en el paso `step` de la línea efectiva `line` (empieza siendo `solutionUci`).
 * Devuelve la línea efectiva a seguir: la misma si acierta la principal, la de la rama si juega una alternativa
 * intermedia verificada, o null si falla. Regla única de lecciones (web) y sesión diaria (worker).
 */
export function followMove(v: Variants, line: readonly string[], step: number, uci: string): readonly string[] | null {
  if (isExpectedMove(v.fen, line, step, uci, altOf(v, line))) return line;
  if (line.join() !== v.solutionUci.join()) return null; // ya en una rama: sin más ramas
  for (const b of v.branches ?? []) {
    if (b.at !== step) continue;
    const next = [...line.slice(0, step), ...b.line];
    if (isExpectedMove(v.fen, next, step, uci)) return next;
  }
  return null;
}
