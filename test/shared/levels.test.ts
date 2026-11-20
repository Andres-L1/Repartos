import { describe, it, expect } from 'vitest';
import { LEVELS, eloRange, levelForRating, suggestLevel } from '../../src/shared/levels.js';
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
  it('caso real: blitz fiable 1125 y rápida provisional 1749 con 43 partidas sugiere Competitivo, no Intermedio', () => {
    const r = suggestLevel(seen({
      rapid: { state: 'provisional', rating: 1749, games: 43 },
      classical: { state: 'few_games', rating: 1500, games: 6 },
      blitz: { state: 'reliable', rating: 1125, games: 1177 },
    }));
    expect(r).toEqual({ level: 'competitive', hint: null });
  });
  it('caso real: quien vuelve tras años (provisional con cientos de partidas) no queda sin sugerencia', () => {
    expect(suggestLevel(seen({ rapid: { state: 'provisional', rating: 1450, games: 600 } })).level).toBe('advanced');
  });
  it('Lichess no baja de 400: 400 es Iniciación y Principiante no se sugiere por Elo', () => {
    expect(suggestLevel(seen({ rapid: { state: 'reliable', rating: 400, games: 50 } })).level).toBe('initiation');
  });
  it('rango mostrado', () => {
    expect(LEVELS.map(eloRange)).toEqual(['sin Elo todavía', '400 a 800', '800 a 1100', '1100 a 1400', '1400 a 1700', '1700 o más']);
  });
  it('sin datos fiables: sin sugerencia', () => {
    expect(suggestLevel(null)).toEqual({ level: null, hint: null });
    expect(suggestLevel(seen({}))).toEqual({ level: null, hint: null });
    expect(suggestLevel(seen({ rapid: { state: 'invalid' }, classical: { state: 'provisional', rating: 1500, games: 29 } }))).toEqual({ level: null, hint: null });
  });
  it('provisional con 29 partidas solo da pista; con 30 cuenta para el nivel', () => {
    const base = { blitz: { state: 'reliable', rating: 1125, games: 100 } } as const;
    expect(suggestLevel(seen({ ...base, rapid: { state: 'provisional', rating: 1749, games: 9 } })).hint).toBeNull();
    expect(suggestLevel(seen({ ...base, rapid: { state: 'provisional', rating: 1749, games: 10 } })).hint).not.toBeNull();
    expect(suggestLevel(seen({ ...base, rapid: { state: 'provisional', rating: 1749, games: 29 } }))).toMatchObject({ level: 'intermediate' });
    expect(suggestLevel(seen({ ...base, rapid: { state: 'provisional', rating: 1749, games: 30 } }))).toEqual({ level: 'competitive', hint: null });
  });
  it('provisional menor que el sugerido: sin pista', () => {
    expect(suggestLevel(seen({ blitz: { state: 'reliable', rating: 1500, games: 100 }, rapid: { state: 'provisional', rating: 1300, games: 25 } })))
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
