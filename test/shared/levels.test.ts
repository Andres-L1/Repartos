import { describe, it, expect } from 'vitest';
import { LEVELS, levelForRating, suggestLevel } from '../../src/shared/levels.js';
import type { PlacementSeen } from '../../src/shared/api.js';

const none = { state: 'absent' } as const;
const seen = (o: Partial<PlacementSeen>): PlacementSeen => ({ perfsPresent: true, rapid: none, classical: none, blitz: none, ...o });

describe('LEVELS', () => {
  it('seis niveles en orden con etiquetas y subtítulos', () => {
    expect(LEVELS.map((l) => [l.id, l.label, l.blurb])).toEqual([
      ['beginner', 'Principiante', 'Reglas y fundamentos'],
      ['initiation', 'Iniciación', 'Tácticas y principios básicos'],
      ['basic', 'Básico', 'Cálculo y comprensión'],
      ['intermediate', 'Intermedio', 'Estrategia y planificación'],
      ['advanced', 'Avanzado', 'Profundización técnica'],
      ['competitive', 'Competitivo', 'Rendimiento y preparación'],
    ]);
  });
});

describe('levelForRating', () => {
  it('fronteras con límite inferior incluido', () => {
    const cases: [number, string][] = [
      [0, 'beginner'], [399, 'beginner'], [400, 'initiation'], [799, 'initiation'], [800, 'basic'], [1099, 'basic'],
      [1100, 'intermediate'], [1399, 'intermediate'], [1400, 'advanced'], [1699, 'advanced'], [1700, 'competitive'],
      [1999, 'competitive'], [2000, 'competitive'], [2400, 'competitive'],
    ];
    for (const [r, l] of cases) expect(levelForRating(r), String(r)).toBe(l);
  });
});

describe('suggestLevel', () => {
  it('caso real: blitz fiable manda, rápida provisional alta da pista', () => {
    expect(
      suggestLevel(seen({
        rapid: { state: 'provisional', rating: 1749, games: 43 },
        classical: { state: 'few_games', rating: 1500, games: 6 },
        blitz: { state: 'reliable', rating: 1125, games: 1177 },
      })),
    ).toEqual({ level: 'intermediate', hint: { perf: 'rapid', rating: 1749, games: 43, level: 'competitive' } });
  });
  it('sin datos fiables: sin sugerencia', () => {
    expect(suggestLevel(null)).toEqual({ level: null, hint: null });
    expect(suggestLevel(seen({}))).toEqual({ level: null, hint: null });
    expect(suggestLevel(seen({ rapid: { state: 'invalid' }, classical: { state: 'provisional', rating: 1500, games: 99 } }))).toEqual({ level: null, hint: null });
  });
  it('provisional con 29 partidas no da pista; con 30 sí', () => {
    const base = { blitz: { state: 'reliable', rating: 1125, games: 100 } } as const;
    expect(suggestLevel(seen({ ...base, rapid: { state: 'provisional', rating: 1749, games: 29 } })).hint).toBeNull();
    expect(suggestLevel(seen({ ...base, rapid: { state: 'provisional', rating: 1749, games: 30 } })).hint).not.toBeNull();
  });
  it('provisional menor que el sugerido: sin pista', () => {
    expect(suggestLevel(seen({ blitz: { state: 'reliable', rating: 1500, games: 100 }, rapid: { state: 'provisional', rating: 1300, games: 80 } })))
      .toEqual({ level: 'advanced', hint: null });
  });
  it('varios fiables: gana el mayor', () => {
    expect(suggestLevel(seen({
      rapid: { state: 'reliable', rating: 900, games: 50 },
      classical: { state: 'reliable', rating: 1450, games: 50 },
      blitz: { state: 'reliable', rating: 1200, games: 50 },
    })).level).toBe('advanced');
  });
});
