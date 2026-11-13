import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { nextBox, dueAfter, themeForConcept, conceptForThemes, difficultyForLevel, puzzleStart } from '../../src/review/srs.js';

const DAY = 86_400_000;
const { puzzles } = JSON.parse(readFileSync(new URL('../fixtures/lichess-puzzles.json', import.meta.url), 'utf8')) as {
  puzzles: { game: { pgn: string }; puzzle: { solution: string[] } }[];
};

describe('cajas', () => {
  it('nextBox: acierto sube hasta 5, fallo vuelve a 1', () => {
    expect([1, 2, 3, 4, 5].map((b) => nextBox(b, true))).toEqual([2, 3, 4, 5, 5]);
    expect([1, 2, 3, 4, 5].map((b) => nextBox(b, false))).toEqual([1, 1, 1, 1, 1]);
  });
  it('dueAfter', () => {
    expect(dueAfter(1, 1000)).toBe(1000 + DAY);
    expect(dueAfter(5, 1000)).toBe(1000 + 16 * DAY);
  });
});

describe('temas y dificultad', () => {
  it('themeForConcept / conceptForThemes', () => {
    expect(themeForConcept('tactics.bad_exchange')).toBeNull();
    expect(['hanging_piece', 'fork', 'pin', 'discovered_attack', 'mate_threat'].map((c) => themeForConcept(`tactics.${c}`))).toEqual([
      'hangingPiece', 'fork', 'pin', 'discoveredAttack', 'mate',
    ]);
    expect(conceptForThemes(['middlegame', 'fork'])).toBe('tactics.fork');
    expect(conceptForThemes(['middlegame'])).toBeNull();
  });
  it('difficultyForLevel', () => {
    expect((['beginner', 'initiation', 'basic', 'intermediate', 'advanced', 'competitive'] as const).map(difficultyForLevel)).toEqual([
      'easiest', 'easier', 'normal', 'normal', 'harder', 'hardest',
    ]);
  });
});

describe('puzzleStart', () => {
  it('los 3 puzles reales dan fen y línea completa', () => {
    expect(puzzles).toHaveLength(3);
    for (const p of puzzles) {
      const r = puzzleStart(p.game.pgn, p.puzzle.solution);
      expect(r?.fen).toBeTruthy();
      expect(r?.line).toEqual(p.puzzle.solution);
      expect(r?.line[0]).toBe(p.puzzle.solution[0]);
    }
  });
  it('null con PGN ilegal, primer movimiento ilegal o línea rota', () => {
    const p = puzzles[0]!;
    expect(puzzleStart('1. e4 e4', p.puzzle.solution)).toBeNull();
    expect(puzzleStart(p.game.pgn, ['a1a1', ...p.puzzle.solution.slice(1)])).toBeNull();
    expect(puzzleStart(p.game.pgn, [...p.puzzle.solution.slice(0, 1), 'a1a1'])).toBeNull();
    expect(puzzleStart(p.game.pgn, [])).toBeNull();
  });
});
