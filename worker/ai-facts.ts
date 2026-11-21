/**
 * Hechos de una posición calculados por código con chessops: es lo único que se le cuenta a la IA (nunca texto libre del cliente).
 * Cada hecho es una frase corta y verdadera; la IA solo los redacta como un porqué.
 */
import type { Chess } from 'chessops/chess';
import { normalizeMove } from 'chessops/chess';
import { parseUci, makeSquare } from 'chessops/util';
import type { Move, Role } from 'chessops/types';
import { makeSan } from 'chessops/san';
import { VALUE, canCaptureOn, describe, loadPosition, playLine, withArticle } from '../src/diagnosis/chess-utils.js';
import type { PracticeStep } from '../src/content/schema.js';

const UCI = /^[a-h][1-8][a-h][1-8][qrbn]?$/;
const side = (c: 'white' | 'black') => (c === 'white' ? 'blancas' : 'negras');

/** Posición y jugada UCI legal en ella (el enroque vale como e1g1 o e1h1); null si algo no es válido. */
export function legalMove(fen: string, uci: string): { pos: Chess; move: Move } | null {
  if (typeof fen !== 'string' || fen.length > 100 || typeof uci !== 'string' || !UCI.test(uci)) return null;
  const pos = loadPosition(fen);
  const parsed = parseUci(uci);
  if (!pos || !parsed) return null;
  const move = normalizeMove(pos, parsed);
  return pos.isLegal(move) ? { pos, move } : null;
}

/** Qué hace la jugada (pieza, captura, jaque, mate) y, si `exposure`, qué queda atacado tras ella. */
function moveFacts(pos: Chess, move: Move, label: string, exposure: boolean): string[] {
  if (!('from' in move)) return [];
  const san = makeSan(pos, move);
  const piece = pos.board.get(move.from)!;
  const target = pos.board.get(move.to);
  const enPassant = piece.role === 'pawn' && !target && makeSquare(move.from)[0] !== makeSquare(move.to)[0];
  const captured: Role | undefined = target?.role ?? (enPassant ? 'pawn' : undefined);
  const after = pos.clone();
  after.play(move);
  const parts = [`${withArticle(piece.role)} va de ${makeSquare(move.from)} a ${makeSquare(move.to)}`];
  if (san.startsWith('O-O')) parts.push('es un enroque');
  if (captured) parts.push(`captura ${withArticle(captured)}`);
  if (move.promotion) parts.push('corona el peón');
  if (after.isCheckmate()) parts.push('da jaque mate');
  else if (after.isCheck()) parts.push('da jaque');
  const facts = [`${label}: ${san} (${parts.join(', ')}).`];
  if (exposure && !after.isEnd()) facts.push(...exposureFacts(after, pos.turn));
  return facts;
}

/** Tras la jugada de `mover`: la mejor captura que gana material al rival (sin recaptura posible o por un valor mayor) y si tiene mate en una. */
function exposureFacts(after: Chess, mover: 'white' | 'black'): string[] {
  let best: { gain: number; text: string } | undefined;
  let mate = false;
  for (const [from, dests] of after.allDests()) {
    const attacker = after.board.get(from)!;
    for (const to of dests) {
      const victim = after.board.get(to);
      const next = after.clone();
      const promo = attacker.role === 'pawn' && (to < 8 || to > 55);
      next.play(normalizeMove(after, { from, to, ...(promo ? { promotion: 'queen' as const } : {}) }));
      if (next.isCheckmate()) mate = true;
      if (!victim || victim.color !== mover || victim.role === 'king') continue;
      const gain = VALUE[victim.role] - (canCaptureOn(next, to) ? VALUE[attacker.role] : 0);
      if (gain > 0 && (!best || gain > best.gain)) {
        const text = `Tras esa jugada, ${side(after.turn)} pueden capturar ${describe(victim.role, to)} con ${withArticle(attacker.role)}${canCaptureOn(next, to) ? ', aunque se podría recapturar' : ' y no se podría recapturar'}.`;
        best = { gain, text };
      }
    }
  }
  return [...(best ? [best.text] : []), ...(mate ? [`Tras esa jugada, ${side(after.turn)} tienen jaque mate en una jugada.`] : [])];
}

const fenKey = (fen: string) => fen.split(' ').slice(0, 4).join(' ');

/** Hechos de un error de partida: jugada del alumno, consecuencias, mejor jugada. */
export function errorFacts(fen: string, played: string, best: string): string[] | null {
  const a = legalMove(fen, played);
  const b = legalMove(fen, best);
  if (!a || !b) return null;
  return [
    `Posición (FEN): ${fenKey(fen)}`,
    `Mueven las ${side(a.pos.turn)}.`,
    ...moveFacts(a.pos, a.move, 'Jugada del alumno', true),
    ...moveFacts(b.pos, b.move, 'Mejor jugada', false),
  ];
}

/** Hechos de un paso de lección: la solución sale del contenido, nunca del cliente. */
export function lessonFacts(step: PracticeStep, objective: string): string[] | null {
  const first = legalMove(step.fen, step.solutionUci[0] ?? '');
  if (!first) return null;
  const line = playLine(first.pos, step.solutionUci, 4).map((s) => s.san);
  return [
    `Posición (FEN): ${fenKey(step.fen)}`,
    `Mueven las ${side(first.pos.turn)}.`,
    ...moveFacts(first.pos, first.move, 'Jugada correcta', false),
    ...(line.length > 1 ? [`Línea correcta: ${line.join(' ')}.`] : []),
    `Tema de la lección: ${objective}`,
    `Texto del método (no lo repitas): ${step.explanationCorrect}`,
  ];
}
