/**
 * Índice del libro de aperturas (lichess-org/chess-openings, CC0). Puro: sin red ni DOM.
 * La clave de una posición es su FEN sin contadores de jugadas, así las transposiciones coinciden.
 */
import { Chess } from 'chessops/chess';
import { makeFen, parseFen } from 'chessops/fen';
import { makeSan, parseSan } from 'chessops/san';
import { makeUci } from 'chessops';

/** [eco, nombre, jugadas SAN separadas por espacios] */
export type OpeningLine = readonly [eco: string, name: string, moves: string];
export interface Opening {
  eco: string;
  name: string;
}
export interface BookMove {
  uci: string;
  san: string;
  /** Clave de la posición a la que lleva. */
  to: string;
  /** Apertura con nombre más corta que pasa por esta jugada (puede ser más específica que la posición destino). */
  opening: Opening;
  /** El destino tiene nombre propio. */
  named: boolean;
  /** Líneas del libro que pasan por esta jugada: sirve de orden aproximado por popularidad. */
  lines: number;
}
interface Node {
  opening?: Opening;
  moves: Map<string, BookMove>;
}
export type OpeningIndex = Map<string, Node>;

/** FEN sin contadores (piezas, turno, enroque y al paso). */
export const positionKey = (fen: string): string => fen.split(' ').slice(0, 4).join(' ');

/** Clave canónica de un FEN cualquiera; null si no es una posición legal. */
export function keyOfFen(fen: string): string | null {
  const s = parseFen(fen);
  if (s.isErr) return null;
  const p = Chess.fromSetup(s.value);
  return p.isErr ? null : positionKey(makeFen(p.value.toSetup()));
}

const keyOfPos = (p: Chess) => positionKey(makeFen(p.toSetup()));
export const START_KEY = keyOfPos(Chess.default());

export function buildIndex(lines: readonly OpeningLine[]): OpeningIndex {
  const index: OpeningIndex = new Map();
  const node = (k: string): Node => {
    let n = index.get(k);
    if (!n) index.set(k, (n = { moves: new Map() }));
    return n;
  };
  // Las líneas cortas primero: el nombre de una jugada es el de la línea más corta que pasa por ella.
  const sorted = [...lines].sort((a, b) => a[2].split(' ').length - b[2].split(' ').length);
  const prefixes = new Map<string, Chess>(); // prefijo de jugadas -> posición (evita repetir el cálculo)
  for (const [eco, name, pgn] of sorted) {
    const opening = { eco, name };
    let pos = Chess.default();
    let key = START_KEY;
    const sans = pgn.split(' ');
    for (let i = 0; i < sans.length; i++) {
      const from = node(key);
      const prefix = sans.slice(0, i + 1).join(' ');
      const move = parseSan(pos, sans[i]!);
      if (!move) throw new Error(`${eco} ${name}: jugada ilegal ${sans[i]}`);
      let next = prefixes.get(prefix);
      if (!next) {
        next = pos.clone();
        next.play(move);
        prefixes.set(prefix, next);
      }
      const uci = makeUci(move);
      const seen = from.moves.get(uci);
      if (seen) seen.lines++;
      else from.moves.set(uci, { uci, san: makeSan(pos, move), to: keyOfPos(next), opening, named: false, lines: 1 });
      pos = next;
      key = keyOfPos(pos);
    }
    // La posición final tiene nombre; si ya tenía uno (transposición), gana la primera línea más corta.
    const end = node(key);
    end.opening ??= opening;
  }
  for (const n of index.values()) for (const m of n.moves.values()) m.named = !!index.get(m.to)?.opening;
  return index;
}

/** Apertura exacta de una posición (por clave), si el libro la nombra. */
export const openingAt = (index: OpeningIndex, key: string): Opening | undefined => index.get(key)?.opening;

/**
 * Nombre de la posición actual dentro de una partida: el de la última posición con nombre
 * (la más larga entre los prefijos). `keys` = claves de la posición inicial y de cada jugada hecha.
 */
export function openingOfGame(index: OpeningIndex, keys: readonly string[]): Opening | undefined {
  for (let i = keys.length - 1; i >= 0; i--) {
    const o = openingAt(index, keys[i]!);
    if (o) return o;
  }
  return undefined;
}

/** Jugadas del libro desde una posición: primero las que más líneas tienen, luego por SAN. */
export function bookMoves(index: OpeningIndex, key: string): BookMove[] {
  return [...(index.get(key)?.moves.values() ?? [])].sort((a, b) => b.lines - a.lines || a.san.localeCompare(b.san));
}
