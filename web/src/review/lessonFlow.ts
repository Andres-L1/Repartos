import type { ErrorLesson } from '../../../src/pedagogy/error-lesson';
import { applyUci, canonicalUci, needsPromotion } from '../chess';
import { isExpectedMove } from '../../../src/shared/moves';

export type LessonStep = 'look' | 'pause' | 'happened' | 'why' | 'best' | 'done';
export type PauseResult = 'correct' | 'wrong' | 'skipped';

export interface LessonState {
  step: LessonStep;
  pauseResult: PauseResult | null;
  /** La lección tiene pausa comprobable; si no, el paso `pause` se salta. */
  hasPause: boolean;
  /** Hay un «por qué» que contar; si no (lección solo con análisis del motor), el momento se salta. */
  hasWhy: boolean;
  correctSquares: readonly string[];
  /** Casilla marcada en la pausa; elegirla no responde, solo `confirm` lo hace. */
  selected: string | null;
}

export type LessonAction = { type: 'next' } | { type: 'select'; square: string } | { type: 'confirm' } | { type: 'skip' };

export function initLessonState(lesson: Pick<ErrorLesson, 'pause'> & Partial<Pick<ErrorLesson, 'why'>>): LessonState {
  return { step: 'look', pauseResult: null, hasPause: !!lesson.pause, hasWhy: lesson.why !== '', correctSquares: lesson.pause?.correctSquares ?? [], selected: null };
}

const AFTER: Record<Exclude<LessonStep, 'done' | 'pause'>, LessonStep> = { look: 'pause', happened: 'why', why: 'best', best: 'done' };

/** Reductor puro. En `pause`, `select` solo marca (tocar la misma casilla la desmarca) y `confirm` responde (un solo intento); `skip` salta. Fuera de la pausa se ignoran. */
export function lessonReducer(state: LessonState, action: LessonAction): LessonState {
  if (action.type === 'next') {
    if (state.step === 'done' || state.step === 'pause') return state;
    const step = AFTER[state.step];
    if (step === 'pause' && !state.hasPause) return { ...state, step: 'happened' };
    if (step === 'why' && !state.hasWhy) return { ...state, step: 'best' };
    return { ...state, step };
  }
  if (state.step !== 'pause') return state;
  if (action.type === 'skip') return { ...state, step: 'happened', pauseResult: 'skipped' };
  if (action.type === 'select') return { ...state, selected: state.selected === action.square ? null : action.square };
  if (!state.selected) return state;
  return { ...state, step: 'happened', pauseResult: state.correctSquares.includes(state.selected) ? 'correct' : 'wrong' };
}

export type BestAttempt = { kind: 'correct' | 'wrong'; uci: string; fen: string } | { kind: 'illegal' };

/**
 * Juzga la jugada que hace el alumno en el último momento («Qué debías hacer»). Tolera el enroque como rey a torre
 * y, si coincide con la mejor salvo la pieza de coronación, toma la de la mejor; una coronación distinta se juega a dama.
 * Si la mejor da mate, vale cualquier mate (misma regla que la sesión diaria).
 */
export function judgeBestMove(fen: string, bestUci: string, from: string, to: string): BestAttempt {
  const best = canonicalUci(fen, bestUci);
  let uci = canonicalUci(fen, from + to);
  if (needsPromotion(fen, from, to)) uci = uci === best.slice(0, 4) ? best : uci + 'q';
  const res = applyUci(fen, uci);
  if (!res) return { kind: 'illegal' };
  return { kind: isExpectedMove(fen, [best], 0, uci) ? 'correct' : 'wrong', uci, fen: res.fen };
}
