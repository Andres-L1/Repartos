import { attacks } from 'chessops/attacks';
import type { Role, Square } from 'chessops/types';
import { VALUE, capitalize, describe, lossOver, sq, withArticle } from '../chess-utils.js';
import type { Rule } from './types.js';

export const fork: Rule = (ctx) => {
  const { move, me, opp, after } = ctx;
  const [s0, s1, s2] = after;
  if (!s0 || !s1 || !s2) return null;
  if (s0.captured || s0.color !== opp || s1.color !== me || s2.color !== opp) return null;
  const pos2 = s0.pos;
  const forker = pos2.board.get(s0.to);
  if (!forker) return null;

  const hit = attacks(forker, s0.to, pos2.board.occupied).intersect(pos2.board[me]);
  const targets: Array<{ square: Square; role: Role }> = [];
  for (const t of hit) {
    const p = pos2.board.get(t)!;
    const undefended = pos2.kingAttackers(t, me, pos2.board.occupied).isEmpty();
    if (p.role === 'king' || VALUE[p.role] > VALUE[forker.role] || (undefended && VALUE[p.role] >= 1)) {
      targets.push({ square: t, role: p.role });
    }
  }
  if (targets.length < 2) return null;

  // Verificación: tras la respuesta, la misma pieza captura uno de los objetivos y se gana material.
  if (!s2.captured || s2.from !== s0.to) return null;
  const cap = s2.captured;
  if (!targets.some((t) => t.square === cap.square && t.role === cap.role)) return null;
  const loss = lossOver(ctx, 4);
  if (loss < 2) return null;

  const list = targets.map((t) => describe(t.role, t.square)).join(' y ');
  return {
    type: 'fork',
    ply: move.ply,
    color: me,
    fact: capitalize(
      `${withArticle(forker.role)} salta a ${sq(s0.to)} (${s0.san}) y ataca a la vez ${list}; después captura ${describe(cap.role, cap.square)} (${s2.san}).`,
    ),
    evidence: {
      squares: [sq(s0.to), ...targets.map((t) => sq(t.square))],
      pieces: [forker.role, ...targets.map((t) => t.role)],
      refutationUci: s0.uci,
      materialLostCp: loss * 100,
    },
    conceptIds: ['tactics.fork'],
  };
};
