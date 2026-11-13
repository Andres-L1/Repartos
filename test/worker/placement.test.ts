import { describe, it, expect } from 'vitest';
import { computePlacement, PLACEMENT_BANDS, PLACEMENT_MIN_GAMES, parsePerf } from '../../worker/placement.js';
import type { Unit } from '../../src/content/schema.js';

const u = (id: string, order: number, level: Unit['level']): Unit => ({
  id, order, title: id, description: 'd', level, requires: [], lessons: [],
});
const full: Unit[] = [u('u01', 1, 'beginner'), u('u02', 2, 'beginner'), u('u03', 3, 'beginner'), u('u04', 4, 'initiation'), u('u05', 5, 'initiation'), u('u06', 6, 'initiation')];
const p = (rating: number, games = 100, prov?: boolean) => ({ rating, games, ...(prov === undefined ? {} : { prov }) });
const content = { units: full };

describe('computePlacement', () => {
  it('constantes de diseño', () => {
    expect(PLACEMENT_MIN_GAMES).toBe(10);
    expect(PLACEMENT_BANDS.map((b) => b.minRating)).toEqual([0, 1000, 1400]);
  });

  it('sin perfs o sin datos fiables: none, sin efectos', () => {
    for (const perfs of [undefined, null, {}, { rapid: 'x' }]) {
      expect(computePlacement(perfs, content)).toEqual({ source: 'none', perf: null, rating: null, games: null, recommendedUnitId: null, openUnitIds: [] });
    }
  });

  it('provisional (prov true) no cuenta aunque tenga muchas partidas', () => {
    expect(computePlacement({ rapid: p(1800, 500, true) }, content).source).toBe('none');
  });

  it('pocas partidas no cuenta; el umbral (10) sí', () => {
    expect(computePlacement({ classical: p(1800, 9) }, content).source).toBe('none');
    expect(computePlacement({ classical: p(1800, 10) }, content)).toMatchObject({ source: 'lichess', perf: 'classical', rating: 1800 });
  });

  it('toma el mayor entre rapid y classical fiables; ignora el no fiable aunque sea mayor', () => {
    expect(computePlacement({ rapid: p(1100), classical: p(1500) }, content)).toMatchObject({ perf: 'classical', rating: 1500 });
    expect(computePlacement({ rapid: p(1600), classical: p(1500) }, content)).toMatchObject({ perf: 'rapid', rating: 1600 });
    expect(computePlacement({ rapid: p(900), classical: p(2000, 3) }, content)).toMatchObject({ perf: 'rapid', rating: 900 });
    expect(computePlacement({ rapid: p(1500), classical: p(1500) }, content).perf).toBe('rapid'); // empate
  });

  it('bandas: <1000, 1000-1399 y >=1400 (límites inclusivos)', () => {
    const at = (r: number) => computePlacement({ rapid: p(r) }, content);
    for (const r of [0, 500, 999]) expect(at(r)).toMatchObject({ recommendedUnitId: 'u01', openUnitIds: [] });
    for (const r of [1000, 1200, 1399]) expect(at(r)).toMatchObject({ recommendedUnitId: 'u04', openUnitIds: ['u01', 'u02', 'u03'] });
    for (const r of [1400, 2500, 4000]) expect(at(r)).toMatchObject({ recommendedUnitId: 'u05', openUnitIds: ['u01', 'u02', 'u03', 'u04', 'u05', 'u06'] });
  });

  it('es genérico por nivel y orden, no por ids (independiente del orden del array)', () => {
    const shuffled = { units: [full[4]!, full[0]!, full[5]!, full[2]!, full[1]!, full[3]!] };
    expect(computePlacement({ rapid: p(1200) }, shuffled).recommendedUnitId).toBe('u04');
    const renamed = { units: [u('x', 10, 'beginner'), u('y', 20, 'initiation'), u('z', 30, 'initiation')] };
    expect(computePlacement({ rapid: p(1500) }, renamed)).toMatchObject({ recommendedUnitId: 'z', openUnitIds: ['x', 'y', 'z'] });
  });

  it('contenido con pocas unidades: recomendada con respaldo y sin romper', () => {
    const two = { units: [u('a', 1, 'beginner'), u('b', 2, 'beginner')] };
    expect(computePlacement({ rapid: p(500) }, two).recommendedUnitId).toBe('a');
    expect(computePlacement({ rapid: p(1200) }, two)).toMatchObject({ recommendedUnitId: 'b', openUnitIds: ['a', 'b'] });
    expect(computePlacement({ rapid: p(1800) }, two)).toMatchObject({ recommendedUnitId: 'b', openUnitIds: ['a', 'b'] });
    const oneInit = { units: [u('a', 1, 'beginner'), u('b', 2, 'initiation')] };
    expect(computePlacement({ rapid: p(1800) }, oneInit).recommendedUnitId).toBe('b'); // índice 1 no existe: última del nivel
    expect(computePlacement({ rapid: p(1800) }, { units: [] })).toMatchObject({ source: 'lichess', recommendedUnitId: null, openUnitIds: [] });
  });
});

describe('parsePerf', () => {
  it('acepta perfs de Lichess reales y rechaza tipos y rangos inválidos', () => {
    expect(parsePerf({ games: 12, rating: 1500, rd: 90, prog: 4, prov: true })).toEqual({ rating: 1500, games: 12, prov: true });
    expect(parsePerf({ games: 12, rating: 1500 })).toEqual({ rating: 1500, games: 12, prov: false });
    for (const bad of [null, 5, 'x', [], {}, { rating: 4001, games: 1 }, { rating: -1, games: 1 }, { rating: 1.5, games: 1 }, { rating: '1500', games: 1 },
      { rating: 1500, games: 1.5 }, { rating: 1500, games: NaN }, { rating: 1500, games: 1, prov: 1 }, { rating: 1500, games: 1, rd: 5000 }, { rating: 1500, games: 1, rd: 'a' }])
      expect(parsePerf(bad)).toBeNull();
  });
});
