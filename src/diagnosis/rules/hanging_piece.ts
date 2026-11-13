import { VALUE, canCaptureOn, capitalize, describe, lossOver, replayAsThreat, sanEs, sq, withArticle } from '../chess-utils.js';
import type { Rule } from './types.js';

export const hangingPiece: Rule = (ctx) => {
  const { move, me, after, pos0, pos1, played } = ctx;
  const s0 = after[0];
  if (!s0 || !s0.captured || s0.color === me) return null;
  const cap = s0.captured;
  const value = VALUE[cap.role];
  if (cap.role === 'king' || value < 1) return null;
  const victim = pos1.board.get(cap.square);
  if (!victim || victim.color !== me || victim.role !== cap.role) return null;
  // Sin defensa: tras la captura no se puede recapturar en esa casilla.
  if (canCaptureOn(s0.pos, s0.to)) return null;
  const loss = lossOver(ctx, 4);
  if (loss < Math.max(1, value - (played.captured ? VALUE[played.captured.role] : 0))) return null;
  const isMoved = cap.square === played.to;
  // ¿La pieza ya estaba amenazada (y sin defensa) antes de la jugada, y la jugada no la atendió?
  let ignored = false;
  if (!isMoved && played.from !== cap.square) {
    const threat = replayAsThreat(pos0, [s0.uci]);
    const t = threat?.[0];
    ignored = !!t && !!t.captured && t.captured.role === cap.role && t.captured.square === cap.square && !canCaptureOn(t.pos, t.to);
  }
  const subject =
    describe(cap.role, cap.square) +
    (isMoved ? (played.captured ? `, que acaba de capturar ${withArticle(played.captured.role)},` : ', recién movido,') : '');
  const capture = `${withArticle(s0.role)} desde ${sq(s0.from)} (${s0.san})`;
  const fact = ignored
    ? capitalize(
        `no atendiste la amenaza sobre ${describe(cap.role, cap.square)}: ya estaba atacado por ${withArticle(s0.role)} en ${sq(s0.from)} y sin defensa antes de tu jugada (${sanEs(move.san)}), que no la resuelve; ${s0.san} lo captura.`,
      )
    : capitalize(`${subject} queda sin defensa y es capturado por ${capture}.`);
  return {
    type: 'hanging_piece',
    ply: move.ply,
    color: me,
    fact,
    evidence: {
      squares: [sq(cap.square), sq(s0.from)],
      pieces: [cap.role, s0.role],
      refutationUci: s0.uci,
      materialLostCp: loss * 100,
    },
    conceptIds: ['tactics.hanging_piece'],
  };
};
