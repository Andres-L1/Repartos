import type { ErrorLesson } from '../../../src/pedagogy/error-lesson';

export type LessonStep = 'look' | 'pause' | 'happened' | 'why' | 'best' | 'done';
export type PauseResult = 'correct' | 'wrong' | 'skipped';

export interface LessonState {
  step: LessonStep;
  pauseResult: PauseResult | null;
  /** La lección tiene pausa comprobable; si no, el paso `pause` se salta. */
  hasPause: boolean;
  correctSquares: readonly string[];
}

export type LessonAction = { type: 'next' } | { type: 'tap'; square: string } | { type: 'skip' };

export function initLessonState(lesson: Pick<ErrorLesson, 'pause'>): LessonState {
  return { step: 'look', pauseResult: null, hasPause: !!lesson.pause, correctSquares: lesson.pause?.correctSquares ?? [] };
}

const AFTER: Record<Exclude<LessonStep, 'done' | 'pause'>, LessonStep> = { look: 'pause', happened: 'why', why: 'best', best: 'done' };

/** Reductor puro. En `pause` solo `tap` y `skip` avanzan (un solo intento); fuera de ella se ignoran. */
export function lessonReducer(state: LessonState, action: LessonAction): LessonState {
  if (action.type === 'next') {
    if (state.step === 'done' || state.step === 'pause') return state;
    const step = AFTER[state.step];
    return step === 'pause' && !state.hasPause ? { ...state, step: 'happened' } : { ...state, step };
  }
  if (state.step !== 'pause') return state;
  if (action.type === 'skip') return { ...state, step: 'happened', pauseResult: 'skipped' };
  return { ...state, step: 'happened', pauseResult: state.correctSquares.includes(action.square) ? 'correct' : 'wrong' };
}
