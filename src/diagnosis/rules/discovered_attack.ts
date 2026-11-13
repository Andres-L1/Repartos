import { attacks, between } from 'chessops/attacks';
import type { Role, Square } from 'chessops/types';
import { VALUE, capitalize, describe, lossOver, sq, withArticle } from '../chess-utils.js';
import type { Rule } from './types.js';

/**
 * Jaque / ataque a la descubierta. Se reproduce pvAfter[0]: una pieza del rival se mueve y, al dejar su casilla,
 * abre la línea de otra pieza de largo alcance suya (alfil, torre o dama) contra el rey del alumno (jaque a la
 * descubierta) o contra una pieza valiosa / indefensa. Se exige, además, que la línea reproducida gane material.
 */
export const discoveredAttack: Rule = (ctx) => {
  const { move, me, opp, after, pos1 } = ctx;
  const s0 = after[0];
  if (!s0 || s0.color !== opp) return null;
  const from = s0.from;
  const moved = s0.pos.board.get(s0.to);
  if (!moved) return null;

  for (const [slider, piece] of pos1.board) {
    if (piece.color !== opp || slider === from) continue;
    if (piece.role !== 'bishop' && piece.role !== 'rook' && piece.role !== 'queen') continue;
    // La pieza de largo alcance no puede haber sido capturada por la jugada del rival.
    const nowThere = s0.pos.board.get(slider);
    if (!nowThere || nowThere.color !== opp || nowThere.role !== piece.role) continue;
    const reachBefore = attacks(piece, slider, pos1.board.occupied);
    const reachAfter = attacks(piece, slider, s0.pos.board.occupied);
    const targets: Array<{ square: Square; role: Role }> = [];
    for (const t of reachAfter.intersect(s0.pos.board[me])) {
      if (reachBefore.has(t)) continue; // ya estaba atacada
      if (!between(slider, t).has(from)) continue; // la apertura debe ser por la casilla que dejó la pieza
      const tp = s0.pos.board.get(t)!;
      const defended = s0.pos.kingAttackers(t, me, s0.pos.board.occupied).nonEmpty();
      const worthy = tp.role === 'king' || VALUE[tp.role] >= 5 || (VALUE[tp.role] >= 3 && (!defended || VALUE[tp.role] > VALUE[piece.role]));
      if (worthy) targets.push({ square: t, role: tp.role });
    }
    if (targets.length === 0) continue;
    const loss = lossOver(ctx, 4);
    if (loss < 2) continue;
    // Verificación: en la línea, el rival captura alguna de las piezas atacadas (o gana la pieza que se movió contra el rey).
    const check = targets.some((t) => t.role === 'king') && s0.pos.isCheck();
    const upto = after.slice(0, 5).findIndex((s) => s.color === opp && s.captured && VALUE[s.captured.role] >= 3);
    if (upto < 0) continue;
    const target = targets.find((t) => t.role === 'king') ?? targets.sort((a, b) => VALUE[b.role] - VALUE[a.role])[0]!;
    const seq = after.slice(0, upto + 1).map((s) => s.san).join(' ');
    return {
      type: 'discovered_attack',
      ply: move.ply,
      color: me,
      fact: capitalize(
        `${withArticle(moved.role)} se mueve de ${sq(from)} a ${sq(s0.to)} (${s0.san}) y descubre ${check ? 'jaque' : 'un ataque'} de ${describe(piece.role, slider)} sobre ${target.role === 'king' ? 'el rey' : describe(target.role, target.square)}; la línea ${seq} cuesta ${loss} ${loss === 1 ? 'peón' : 'peones'} de material.`,
      ),
      evidence: {
        squares: [sq(slider), sq(from), sq(s0.to), sq(target.square)],
        pieces: [piece.role, moved.role, target.role],
        refutationUci: s0.uci,
        materialLostCp: loss * 100,
      },
      conceptIds: ['tactics.discovered_attack'],
    };
  }
  return null;
};
