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
