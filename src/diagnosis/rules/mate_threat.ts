import { colorName, playLine, sanEs, sq, type Step } from '../chess-utils.js';
import type { Rule } from './types.js';

const MAX_PERMITTED = 3;
const MAX_MISSED = 5;

const firstMateIndex = (steps: Step[]): number => steps.findIndex((s) => s.pos.isCheckmate());
const favors = (mate: number, color: 'white' | 'black'): boolean => (color === 'white' ? mate > 0 : mate < 0);
const plural = (n: number): string => (n === 1 ? 'jugada' : 'jugadas');

export const mateThreat: Rule = (ctx) => {
  const { move, me, opp } = ctx;
  const beforeMate = move.scoreBefore.mate;
  const afterMate = move.scoreAfter.mate;

  // (a) Permite un mate del rival en <= 3, verificado reproduciendo pvAfter.
  const alreadyLost = beforeMate !== undefined && favors(beforeMate, opp);
  const contradicts = afterMate !== undefined && favors(afterMate, me);
  if (!alreadyLost && !contradicts) {
    const idx = firstMateIndex(ctx.after);
    if (idx >= 0 && idx % 2 === 0 && idx / 2 + 1 <= MAX_PERMITTED) {
      const n = idx / 2 + 1;
      const line = ctx.after.slice(0, idx + 1);
      const last = line[idx]!;
      const king = last.pos.board.kingOf(me);
      return {
        type: 'mate_threat',
        ply: move.ply,
        color: me,
        fact: `Tras ${sanEs(move.san)}, ${colorName(opp)} dan mate en ${n} ${plural(n)}: ${line.map((s) => s.san).join(' ')}.`,
        evidence: {
          squares: [sq(last.from), sq(last.to), ...(king !== undefined ? [sq(king)] : [])],
          pieces: [last.role, 'king'],
          refutationUci: ctx.after[0]!.uci,
        },
        conceptIds: ['tactics.mate_threat'],
      };
    }
  }

  // (b) Tenía un mate a su favor y no lo jugó.
  if (beforeMate !== undefined && favors(beforeMate, me) && move.pv.length > 0 && move.uci !== move.pv[0]) {
    if (ctx.pos1.isCheckmate()) return null;
    if (afterMate !== undefined && favors(afterMate, me)) return null;
    const steps = playLine(ctx.pos0, move.pv);
    const idx = firstMateIndex(steps);
    if (idx >= 0 && idx % 2 === 0 && idx / 2 + 1 <= MAX_MISSED) {
      const n = idx / 2 + 1;
      const line = steps.slice(0, idx + 1);
      const first = line[0]!;
      const matedKing = line[idx]!.pos.board.kingOf(opp);
      return {
        type: 'mate_threat',
        ply: move.ply,
        color: me,
        fact: `Había mate en ${n} ${plural(n)} con ${first.san} (${line.map((s) => s.san).join(' ')}) y se jugó ${sanEs(move.san)}.`,
        evidence: {
          squares: [sq(first.from), sq(first.to), ...(matedKing !== undefined ? [sq(matedKing)] : [])],
          pieces: [first.role, 'king'],
          refutationUci: first.uci,
        },
        conceptIds: ['tactics.mate_threat'],
      };
    }
  }
  return null;
};
