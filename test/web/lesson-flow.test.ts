import { describe, it, expect } from 'vitest';
import { initLessonState, judgeBestMove, lessonReducer, type LessonState } from '../../web/src/review/lessonFlow.js';
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
  it('next no avanza desde la pausa (se resuelve con confirm o skip)', () => {
    const s = run(initLessonState(lesson(true)), { type: 'next' });
    expect(lessonReducer(s, { type: 'next' }).step).toBe('pause');
  });
  const inPause = () => run(initLessonState(lesson(true)), { type: 'next' });
  it('select solo marca: no responde ni avanza', () => {
    const s = run(inPause(), { type: 'select', square: 'a1' });
    expect(s).toMatchObject({ step: 'pause', selected: 'a1', pauseResult: null });
  });
  it('select cambia la selección y la misma casilla la quita', () => {
    const s = run(inPause(), { type: 'select', square: 'a1' }, { type: 'select', square: 'f7' });
    expect(s.selected).toBe('f7');
    expect(lessonReducer(s, { type: 'select', square: 'f7' }).selected).toBeNull();
  });
  it('selects repetidos (como arrastrar) nunca resuelven la pausa', () => {
    const s = run(inPause(), ...['e2', 'e4', 'e2', 'e4', 'e2'].map((square) => ({ type: 'select' as const, square })));
    expect(s.step).toBe('pause');
    expect(s.pauseResult).toBeNull();
  });
  it('confirm sin selección se ignora', () => {
    const s = inPause();
    expect(lessonReducer(s, { type: 'confirm' })).toBe(s);
  });
  it('confirm con casilla correcta marca correct y avanza', () => {
    const s = run(inPause(), { type: 'select', square: 'f7' }, { type: 'confirm' });
    expect(s).toMatchObject({ step: 'happened', pauseResult: 'correct' });
  });
  it('confirm equivocado es el único intento: wrong y revela', () => {
    const s = run(inPause(), { type: 'select', square: 'a1' }, { type: 'confirm' }, { type: 'select', square: 'f7' }, { type: 'confirm' });
    expect(s).toMatchObject({ step: 'happened', pauseResult: 'wrong' });
  });
  it('skip marca skipped', () => {
    const s = run(initLessonState(lesson(true)), { type: 'next' }, { type: 'skip' });
    expect(s).toMatchObject({ step: 'happened', pauseResult: 'skipped' });
  });
  it('select, confirm y skip fuera de la pausa se ignoran', () => {
    const s0 = initLessonState(lesson(true));
    expect(lessonReducer(s0, { type: 'select', square: 'f7' })).toBe(s0);
    expect(lessonReducer(s0, { type: 'confirm' })).toBe(s0);
    expect(lessonReducer(s0, { type: 'skip' })).toBe(s0);
  });
  it('next en done no cambia nada', () => {
    const done = run(initLessonState(lesson(false)), { type: 'next' }, { type: 'next' }, { type: 'next' }, { type: 'next' });
    expect(done.step).toBe('done');
    expect(lessonReducer(done, { type: 'next' })).toBe(done);
  });
});

describe('judgeBestMove', () => {
  const start = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  it('acierta con la mejor, falla con otra legal y rechaza una ilegal', () => {
    expect(judgeBestMove(start, 'e2e4', 'e2', 'e4')).toMatchObject({ kind: 'correct', uci: 'e2e4' });
    expect(judgeBestMove(start, 'e2e4', 'd2', 'd4')).toMatchObject({ kind: 'wrong', uci: 'd2d4' });
    expect(judgeBestMove(start, 'e2e4', 'e2', 'e5')).toEqual({ kind: 'illegal' });
  });
  it('acepta el enroque como rey a torre', () => {
    const castle = 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1';
    expect(judgeBestMove(castle, 'e1g1', 'e1', 'h1').kind).toBe('correct');
  });
  it('en una coronación toma la pieza de la mejor jugada', () => {
    const promo = '8/4P3/8/8/8/8/k7/4K3 w - - 0 1';
    expect(judgeBestMove(promo, 'e7e8n', 'e7', 'e8')).toMatchObject({ kind: 'correct', uci: 'e7e8n' });
  });
});
