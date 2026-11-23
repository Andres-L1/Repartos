/**
 * Repertorio de aperturas: puro (sin red ni DOM). Una jugada = (color, posición sin contadores, UCI).
 * Guarda las jugadas de los dos bandos, así se puede repasar entera la línea.
 */
import { Chess } from 'chessops/chess';
import { makeFen, parseFen } from 'chessops/fen';
import { makeUci } from 'chessops';
import { parseSan } from 'chessops/san';
import { parseUci } from 'chessops/util';
import type { LichessGame } from '../review/types.js';
import { scoreToCp } from '../analysis/core.js';
import type { EngineLike } from '../analysis/engine-like.js';
import { toReviewGame } from '../lichess/games.js';
import { positionKey, START_KEY } from './index.js';

export type RepColor = 'white' | 'black';
export interface RepMove {
  color: RepColor;
  key: string;
  uci: string;
}
export const isRepColor = (v: unknown): v is RepColor => v === 'white' || v === 'black';
export const MAX_REP_MOVES = 3000;

/** Jugadas por bando que se miran de cada partida al crear el repertorio (8 propias + 8 del rival). */
const MAX_PLIES = 16;
/** Una jugada entra solo si se repite en al menos tantas partidas. */
const MIN_GAMES = 2;
/** Respuestas del rival que se guardan por posición. */
const MAX_REPLIES = 3;

function posOfKey(key: string): Chess | null {
  const s = parseFen(`${key} 0 1`);
  if (s.isErr) return null;
  const p = Chess.fromSetup(s.value);
  return p.isErr ? null : p.value;
}

/** Clave canónica de `key` y UCI legal en esa posición; null si algo no vale (validación de la API). */
export function checkRepMove(key: unknown, uci: unknown): { key: string; uci: string } | null {
  if (typeof key !== 'string' || typeof uci !== 'string' || key.length > 100 || uci.length > 5) return null;
  const pos = posOfKey(key);
  const move = pos && parseUci(uci);
  if (!pos || !move || !pos.isLegal(move)) return null;
  return { key: positionKey(makeFen(pos.toSetup())), uci: makeUci(move) };
}

/** Posición (clave) tras una jugada legal, o null. */
export function nextKey(key: string, uci: string): string | null {
  const pos = posOfKey(key);
  const move = pos && parseUci(uci);
  if (!pos || !move || !pos.isLegal(move)) return null;
  pos.play(move);
  return positionKey(makeFen(pos.toSetup()));
}

/** Índice (color|clave) -> UCIs guardados. */
export function repIndex(moves: readonly RepMove[]): Map<string, string[]> {
  const idx = new Map<string, string[]>();
  for (const m of moves) {
    const k = `${m.color}|${m.key}`;
    const l = idx.get(k);
    if (l) l.push(m.uci);
    else idx.set(k, [m.uci]);
  }
  return idx;
}
export const repAt = (idx: Map<string, string[]>, color: RepColor, fen: string): string[] => idx.get(`${color}|${positionKey(fen)}`) ?? [];

/** Jugadas del repertorio de una línea ya jugada (para «añadir esta línea»). */
export function lineToMoves(color: RepColor, fens: readonly string[], ucis: readonly string[]): RepMove[] {
  return ucis.map((uci, i) => ({ color, key: positionKey(fens[i]!), uci }));
}

interface Seen {
  to: string;
  n: number;
}
/**
 * Repertorio a partir de tus partidas: recorre el árbol de jugadas que de verdad has jugado.
 * En tus turnos se queda con tu jugada más repetida; en los del rival, con sus respuestas más repetidas.
 */
export function repertoireFromGames(games: readonly LichessGame[], username: string): RepMove[] {
  const out: RepMove[] = [];
  for (const color of ['white', 'black'] as const) {
    const tree = new Map<string, Map<string, Seen>>();
    for (const g of games) {
      if (toReviewGame(g, username)?.color !== color) continue;
      let pos = Chess.default();
      for (const san of g.moves.trim().split(/\s+/).slice(0, MAX_PLIES)) {
        const move = parseSan(pos, san);
        if (!move) break;
        const key = positionKey(makeFen(pos.toSetup()));
        const uci = makeUci(move);
        pos.play(move);
        const at = tree.get(key) ?? new Map<string, Seen>();
        tree.set(key, at);
        const seen = at.get(uci);
        if (seen) seen.n++;
        else at.set(uci, { to: positionKey(makeFen(pos.toSetup())), n: 1 });
      }
    }
    const visited = new Set<string>();
    const walk = (key: string): void => {
      if (visited.has(key) || out.length >= MAX_REP_MOVES) return;
      visited.add(key);
      const mine = (key.split(' ')[1] === 'w') === (color === 'white');
      const cands = [...(tree.get(key) ?? [])].filter(([, s]) => s.n >= MIN_GAMES).sort((a, b) => b[1].n - a[1].n);
      for (const [uci, s] of cands.slice(0, mine ? 1 : MAX_REPLIES)) {
        out.push({ color, key, uci });
        walk(s.to);
      }
    };
    walk(START_KEY);
  }
  return out;
}

/** Misma posición, mismo bando: ¿es esta jugada nueva respecto al repertorio actual? */
export function onlyNew(moves: readonly RepMove[], have: readonly RepMove[]): RepMove[] {
  const seen = new Set(have.map((m) => `${m.color}|${m.key}|${m.uci}`));
  return moves.filter((m) => !seen.has(`${m.color}|${m.key}|${m.uci}`));
}

/** Solo las jugadas a las que se llega desde la posición inicial pasando por jugadas guardadas (una jugada quitada corta su rama). */
export function reachable(moves: readonly RepMove[]): RepMove[] {
  const out: RepMove[] = [];
  for (const color of ['white', 'black'] as const) {
    const idx = repIndex(moves.filter((m) => m.color === color));
    const seen = new Set<string>();
    const walk = (key: string): void => {
      if (seen.has(key)) return;
      seen.add(key);
      for (const uci of idx.get(`${color}|${key}`) ?? []) {
        out.push({ color, key, uci });
        const to = nextKey(key, uci);
        if (to) walk(to);
      }
    };
    walk(START_KEY);
  }
  return out;
}

/** Pérdida en centipeones de una jugada (>0 = empeora la posición de quien juega). */
const cpLoss = (color: RepColor, before: number, after: number): number => (color === 'white' ? before - after : after - before);

/**
 * Comprueba con un motor cada jugada PROPIA y descarta las dudosas (pierden más de `maxLoss` cp frente a la mejor);
 * sus ramas desaparecen. Las del rival no se comprueban: son lo que él juega, no lo que tú eliges.
 */
export async function verifyOwn(
  moves: readonly RepMove[],
  engine: Pick<EngineLike, 'analyze'>,
  o: { depth?: number; maxLoss?: number; onProgress?: (done: number, total: number) => void; signal?: AbortSignal } = {},
): Promise<RepMove[]> {
  const mine = moves.filter((m) => (m.key.split(' ')[1] === 'w') === (m.color === 'white'));
  const bad = new Set<RepMove>();
  let done = 0;
  for (const m of mine) {
    if (o.signal?.aborted) throw new DOMException('Cancelado', 'AbortError');
    o.onProgress?.(done++, mine.length);
    const to = nextKey(m.key, m.uci);
    if (!to) {
      bad.add(m);
      continue;
    }
    const before = await engine.analyze(`${m.key} 0 1`, { depth: o.depth });
    const after = await engine.analyze(`${to} 0 1`, { depth: o.depth });
    if (cpLoss(m.color, scoreToCp(before.score), scoreToCp(after.score)) > (o.maxLoss ?? 50)) bad.add(m);
  }
  o.onProgress?.(mine.length, mine.length);
  return reachable(moves.filter((m) => !bad.has(m)));
}
