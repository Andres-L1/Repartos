import { VALUE, balance, canCaptureOn, describe, playLine, sq, type Step } from '../chess-utils.js';
import type { Rule } from './types.js';

/** Medias jugadas de la línea del motor en las que se mide el material (cambios completos de capturas). */
const WINDOW = 6;
/** Ganancia neta mínima (en piezas: peón 1, pieza menor 3, torre 5, dama 9): descarta ganar un peón. */
const MIN_GAIN = 2;

/**
 * Táctica perdida: la mejor jugada del motor era una captura que gana material neto o un jaque que lleva a mate o a ganar
 * material, y el alumno jugó otra. Se comprueba reproduciendo la línea del motor en chessops (no se confía en la puntuación).
 * No es una causa de la jugada hecha sino de la que se dejó de hacer, por eso no está en RULES de diagnose().
 */
export const missedTactic: Rule = (ctx) => {
  const { move, me, pos0 } = ctx;
  if (move.pv[0] === undefined || move.pv[0] !== move.bestUci || move.uci === move.bestUci) return null;
  const line = playLine(pos0, move.pv, 14);
  const first = line[0];
  if (!first) return null;
  const san = (steps: Step[]) => steps.map((s) => s.san).join(' ');

  // Material neto ganado al cierre del último cambio de capturas dentro de la ventana.
  const win = line.slice(0, WINDOW);
  let last = -1;
  win.forEach((s, i) => {
    if (s.captured || s.promotion) last = i;
  });
  let gain = 0;
  if (last >= 0) {
    const settle = win[last]!;
    // Si la ventana corta una captura mía con recaptura posible, el resultado no está comprobado.
    const open = last === win.length - 1 && settle.color === me && canCaptureOn(settle.pos, settle.to);
    if (!open) gain = balance(settle.pos.board, me) - balance(pos0.board, me);
  }

  const base = { type: 'missed_tactic' as const, ply: move.ply, color: me, conceptIds: [] as string[] };
  const squares = [sq(first.from), sq(first.to)];

  if (first.captured && gain >= MIN_GAIN) {
    const free = !canCaptureOn(first.pos, first.to) && VALUE[first.captured.role] >= MIN_GAIN;
    const fact = free
      ? `Con ${first.san} se capturaba ${describe(first.captured.role, first.captured.square)} y no se podía recapturar en ${sq(first.to)}.`
      : `Con ${first.san} empezaba una serie de capturas (${san(win.slice(0, last + 1))}) que ganaba ${gain} de valor neto.`;
    return {
      ...base,
      fact,
      evidence: {
        squares,
        pieces: [first.role, first.captured.role],
        refutationUci: first.uci,
        tactic: free ? 'free_capture' : 'winning_exchange',
        gainCp: gain * 100,
      },
    };
  }

  if (first.pos.isCheck()) {
    const mateAt = line.findIndex((s) => s.pos.isCheckmate());
    if (mateAt >= 0 && mateAt % 2 === 0) {
      return {
        ...base,
        fact: `Con ${first.san} se daba jaque y la línea del motor llegaba a mate: ${san(line.slice(0, mateAt + 1))}.`,
        evidence: { squares, pieces: [first.role, 'king'], refutationUci: first.uci, tactic: 'check_mate' },
      };
    }
    if (gain >= MIN_GAIN) {
      return {
        ...base,
        fact: `Con ${first.san} se daba jaque y la línea del motor (${san(win.slice(0, last + 1))}) ganaba ${gain} de valor neto.`,
        evidence: { squares, pieces: [first.role, 'king'], refutationUci: first.uci, tactic: 'check_wins', gainCp: gain * 100 },
      };
    }
  }
  return null;
};
