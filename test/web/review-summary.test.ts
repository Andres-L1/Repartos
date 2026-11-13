import { describe, expect, it } from 'vitest';
import type { Report } from '../../src/review/types';
import { headline, inGames, strengthSentence } from '../../web/src/review/summary';

const report = (over: Partial<Report> = {}): Report => ({
  games: Array.from({ length: 10 }, (_, i) => ({ id: `g${i}`, result: 'win' as const })),
  counts: { wins: 6, draws: 1, losses: 3 },
  strengths: [],
  weaknesses: [{ conceptId: 'tactics.hanging_piece', games: 4, occurrences: 5 }],
  ...over,
});

describe('summary', () => {
  it('cuenta partidas con concordancia', () => {
    expect(inGames(4, 10)).toBe('en 4 de 10 partidas');
    expect(inGames(1, 1)).toBe('en 1 de 1 partida');
  });
  it('titular con resultados y causa principal', () => {
    const h = headline(report());
    expect(h).toContain('6 ganadas, 1 empatada y 3 perdidas');
    expect(h).toContain('piezas sin defensa');
  });
  it('sin debilidades no inventa causa', () => {
    expect(headline(report({ weaknesses: [] }))).toContain('No encontré errores graves');
  });
  it('frase de punto fuerte por fase', () => {
    expect(strengthSentence({ kind: 'phase', phase: 'endgame', value: 0.02 })).toContain('el final');
  });
});
