import { describe, it, expect } from 'vitest';
import { initLessonState, lessonReducer, type LessonState } from '../../web/src/review/lessonFlow.js';
import type { ErrorLesson } from '../../src/pedagogy/error-lesson.js';

const lesson = (withPause: boolean): ErrorLesson => ({
  gameId: 'g', ply: 10, conceptId: 'c', fenBefore: 'x', yourMoveSan: 'Qd5',
  ...(withPause ? { pause: { question: '¿Qué pieza está en peligro?', correctSquares: ['e5', 'f7'] } } : {}),
  happened: { text: 'h', arrows: [], circles: [] }, why: 'w', best: { uci: 'e2e4', san: 'e4', text: 'b' }, rule: 'r',
});
const run = (s: LessonState, ...a: Parameters<typeof lessonReducer>[1][]) => a.reduce(lessonReducer, s);

describe('lessonReducer', () => {
  it('sigue el orden look, pause, happened, why, best, done', () => {
    let s = initLessonState(lesson(true));
    const seen = [s.step];
    for (let i = 0; i < 5; i++) {
      s = lessonReducer(s, s.step === 'pause' ? { type: 'skip' } : { type: 'next' });
      seen.push(s.step);
    }
    expect(seen).toEqual(['look', 'pause', 'happened', 'why', 'best', 'done']);
  });
  it('sin pause se salta ese paso', () => {
    const s = run(initLessonState(lesson(false)), { type: 'next' });
    expect(s.step).toBe('happened');
    expect(s.pauseResult).toBeNull();
  });
  it('next no avanza desde la pausa (se resuelve tocando o con skip)', () => {
    const s = run(initLessonState(lesson(true)), { type: 'next' });
    expect(lessonReducer(s, { type: 'next' }).step).toBe('pause');
  });
  it('un toque correcto marca correct y avanza', () => {
    const s = run(initLessonState(lesson(true)), { type: 'next' }, { type: 'tap', square: 'f7' });
    expect(s).toMatchObject({ step: 'happened', pauseResult: 'correct' });
  });
  it('un toque equivocado es el único intento: wrong y revela', () => {
    const s = run(initLessonState(lesson(true)), { type: 'next' }, { type: 'tap', square: 'a1' }, { type: 'tap', square: 'f7' });
    expect(s).toMatchObject({ step: 'happened', pauseResult: 'wrong' });
  });
  it('skip marca skipped', () => {
    const s = run(initLessonState(lesson(true)), { type: 'next' }, { type: 'skip' });
    expect(s).toMatchObject({ step: 'happened', pauseResult: 'skipped' });
  });
  it('tap y skip fuera de la pausa se ignoran', () => {
    const s0 = initLessonState(lesson(true));
    expect(lessonReducer(s0, { type: 'tap', square: 'f7' })).toBe(s0);
    expect(lessonReducer(s0, { type: 'skip' })).toBe(s0);
  });
  it('next en done no cambia nada', () => {
    const done = run(initLessonState(lesson(false)), { type: 'next' }, { type: 'next' }, { type: 'next' }, { type: 'next' });
    expect(done.step).toBe('done');
    expect(lessonReducer(done, { type: 'next' })).toBe(done);
  });
});
