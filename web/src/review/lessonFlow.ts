import type { ErrorLesson } from '../../../src/pedagogy/error-lesson';

export type LessonStep = 'look' | 'pause' | 'happened' | 'why' | 'best' | 'done';
export type PauseResult = 'correct' | 'wrong' | 'skipped';

export interface LessonState {
  step: LessonStep;
  pauseResult: PauseResult | null;
  /** La lección tiene pausa comprobable; si no, el paso `pause` se salta. */
  hasPause: boolean;
  correctSquares: readonly string[];
  /** Casilla marcada en la pausa; elegirla no responde, solo `confirm` lo hace. */
  selected: string | null;
}

export type LessonAction = { type: 'next' } | { type: 'select'; square: string } | { type: 'confirm' } | { type: 'skip' };

export function initLessonState(lesson: Pick<ErrorLesson, 'pause'>): LessonState {
  return { step: 'look', pauseResult: null, hasPause: !!lesson.pause, correctSquares: lesson.pause?.correctSquares ?? [], selected: null };
}

const AFTER: Record<Exclude<LessonStep, 'done' | 'pause'>, LessonStep> = { look: 'pause', happened: 'why', why: 'best', best: 'done' };

/** Reductor puro. En `pause`, `select` solo marca (tocar la misma casilla la desmarca) y `confirm` responde (un solo intento); `skip` salta. Fuera de la pausa se ignoran. */
export function lessonReducer(state: LessonState, action: LessonAction): LessonState {
  if (action.type === 'next') {
    if (state.step === 'done' || state.step === 'pause') return state;
    const step = AFTER[state.step];
    return step === 'pause' && !state.hasPause ? { ...state, step: 'happened' } : { ...state, step };
  }
  if (state.step !== 'pause') return state;
  if (action.type === 'skip') return { ...state, step: 'happened', pauseResult: 'skipped' };
  if (action.type === 'select') return { ...state, selected: state.selected === action.square ? null : action.square };
  if (!state.selected) return state;
  return { ...state, step: 'happened', pauseResult: state.correctSquares.includes(state.selected) ? 'correct' : 'wrong' };
}
