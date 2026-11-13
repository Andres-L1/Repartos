import { describe, expect, it, vi } from 'vitest';
import type { AnalyzedMove, Diagnosis } from '../../src/types.js';

// El concepto va en san como 'c:<concepto>' (varios separados por coma): así se controla sin posiciones reales.
vi.mock('../../src/diagnosis/index.js', () => ({
  diagnose: (m: AnalyzedMove): Diagnosis | null =>
    m.san.startsWith('c:')
      ? { type: 'fork', ply: m.ply, color: m.color, fact: 'f', evidence: { squares: [], pieces: [] }, conceptIds: m.san.slice(2).split(',') }
      : null,
}));

import { ReportError, buildReport } from '../../src/review/report.js';
import { game, mv, rg } from './helpers.js';

const err = (ply: number, concept: string, cp: number) => ({ ...mv(ply, 'white', 'blunder', cp), san: `c:${concept}` });
/** n jugadas buenas del alumno (ply impares) desde start. */
const filler = (n: number, start = 1) => Array.from({ length: n }, (_, i) => mv(start + i * 2, 'white', 'good'));
const games3 = [rg('1'), rg('2'), rg('3')];

describe('buildReport', () => {
  it('lanza ReportError con menos de 3 partidas', () => {
    const a = [game('1', []), game('2', [])];
    expect(() => buildReport(a, [rg('1'), rg('2')])).toThrow(ReportError);
    try {
      buildReport(a, []);
    } catch (e) {
      expect((e as ReportError).code).toBe('not-enough-games');
    }
  });

  it('cuenta resultados desde ReviewGame', () => {
    const r = buildReport([game('1', []), game('2', []), game('3', [])], [rg('1', 'win'), rg('2', 'draw'), rg('3', 'loss'), rg('4', 'loss')]);
    expect(r.counts).toEqual({ wins: 1, draws: 1, losses: 2 });
    expect(r.games).toHaveLength(4);
  });

  it('sin errores clave: weaknesses vacío y sin starError ni regla', () => {
    const r = buildReport([game('1', filler(3)), game('2', filler(3)), game('3', filler(3))], games3);
    expect(r.weaknesses).toEqual([]);
    expect(r.starError).toBeUndefined();
    expect(r.ruleConceptId).toBeUndefined();
  });

  it('cuenta cada concepto una vez por partida y ordena por games y luego occurrences', () => {
    const a = [
      game('1', [err(1, 'fork', 300), err(3, 'fork', 400), err(5, 'pin', 200)]),
      game('2', [err(1, 'pin', 300)]),
      game('3', [err(1, 'hanging', 300), err(3, 'hanging', 310)]),
    ];
    expect(buildReport(a, games3).weaknesses).toEqual([
      { conceptId: 'pin', games: 2, occurrences: 2 },
      { conceptId: 'fork', games: 1, occurrences: 2 },
      { conceptId: 'hanging', games: 1, occurrences: 2 },
    ]);
  });

  it('empates se resuelven por conceptId de forma determinista', () => {
    const a = [game('1', [err(1, 'zeta', 300)]), game('2', [err(1, 'alfa', 300)]), game('3', [])];
    expect(buildReport(a, games3).weaknesses.map((w) => w.conceptId)).toEqual(['alfa', 'zeta']);
  });

  it('starError es el mayor cpLoss del concepto más repetido y ruleConceptId ese concepto', () => {
    const a = [game('1', [err(1, 'pin', 300), err(3, 'fork', 900)]), game('2', [err(1, 'pin', 700)]), game('3', [])];
    const r = buildReport(a, games3);
    expect(r.ruleConceptId).toBe('pin');
    expect(r.starError?.gameId).toBe('2');
    expect(r.starError?.move.cpLoss).toBe(700);
  });

  describe('elogios solo con datos', () => {
    it('sin datos suficientes strengths es []', () => {
      expect(buildReport([game('1', [mv(1, 'white', 'inaccuracy')]), game('2', []), game('3', [])], games3).strengths).toEqual([]);
    });

    it('cero jugadas del alumno no divide por cero', () => {
      expect(buildReport([game('1', []), game('2', []), game('3', [])], games3).strengths).toEqual([]);
    });

    it('menos de 15 jugadas en la fase no es fortaleza aunque no tenga errores', () => {
      const opening = filler(10, 1); // ply 1..19
      const middle = Array.from({ length: 10 }, (_, i) => mv(31 + i * 2, 'white', i < 5 ? 'blunder' : 'good', 300));
      const r = buildReport([game('1', [...opening, ...middle]), game('2', []), game('3', [])], games3);
      expect(r.strengths.find((s) => s.kind === 'phase')).toBeUndefined();
    });

    it('fase fuerte con 15 jugadas y tasa <= mitad de la global', () => {
      // medio juego: 15 buenas; final: 10 jugadas con 5 errores. Global 5/25 = 0,2; medio 0 <= 0,1
      const end = Array.from({ length: 10 }, (_, i) => mv(61 + i * 2, 'white', i < 5 ? 'blunder' : 'good', 300));
      const r = buildReport([game('1', [...filler(15, 21), ...end]), game('2', []), game('3', [])], games3);
      expect(r.strengths).toContainEqual({ kind: 'phase', phase: 'middlegame', value: 0 });
      expect(r.strengths.find((s) => s.phase === 'endgame')).toBeUndefined();
    });

    it('fase con tasa mayor que la mitad de la global no cuenta', () => {
      // 15 jugadas de medio juego con 6 errores (0,4) y 10 de final sin errores: global 0,24; 0,4 > 0,12
      const middle = Array.from({ length: 15 }, (_, i) => mv(21 + i * 2, 'white', i < 6 ? 'blunder' : 'good', 300));
      const r = buildReport([game('1', [...middle, ...filler(10, 61)]), game('2', []), game('3', [])], games3);
      expect(r.strengths.find((s) => s.phase === 'middlegame')).toBeUndefined();
    });

    it('accuracy solo con proporción best/good >= 0,75', () => {
      const mk = (goods: number) => [
        ...Array.from({ length: goods }, (_, i) => mv(1 + i * 2, 'white', i % 2 ? 'best' : 'good')),
        ...Array.from({ length: 4 - goods }, (_, i) => mv(101 + i * 2, 'white', 'inaccuracy')),
      ];
      expect(buildReport([game('1', mk(3)), game('2', []), game('3', [])], games3).strengths).toContainEqual({ kind: 'accuracy', value: 0.75 });
      expect(buildReport([game('1', mk(2)), game('2', []), game('3', [])], games3).strengths.find((s) => s.kind === 'accuracy')).toBeUndefined();
    });

    describe('trend', () => {
      // Partida i tiene createdAt 1000+i y e errores de 10 jugadas; el array se invierte para verificar que manda createdAt.
      const build = (errsByTime: number[]) => {
        const analyses = errsByTime.map((e, i) =>
          game(String(i), Array.from({ length: 10 }, (_, j) => mv(1 + j * 2, 'white', j < e ? 'mistake' : 'inaccuracy', 150))),
        );
        const games = errsByTime.map((_, i) => rg(String(i), 'win', 1000 + i));
        return buildReport([...analyses].reverse(), [...games].reverse());
      };
      const trend = (r: ReturnType<typeof build>) => r.strengths.find((s) => s.kind === 'trend');

      it('mejora >= 20 % relativo entre las 5 primeras y las 5 últimas', () => {
        // primeras 5: 0,5; últimas 5 (por tiempo, solapan): (5+5+4+3+3)/50 = 0,4 -> baja justo 20 %
        const t = trend(build([5, 5, 5, 5, 5, 4, 3, 3]));
        expect(t?.value).toBeCloseTo((0.5 - 0.4) / 0.5, 5);
      });
      it('no hay trend si la bajada es menor al 20 %', () => {
        expect(trend(build([5, 5, 5, 5, 5, 5, 5, 4]))).toBeUndefined();
      });
      it('no hay trend con menos de 8 partidas', () => {
        expect(trend(build([5, 5, 5, 5, 0, 0, 0]))).toBeUndefined();
      });
      it('usa createdAt, no el orden del array', () => {
        // por tiempo empeora: no hay trend aunque en el array invertido parezca mejorar
        expect(trend(build([2, 2, 2, 2, 2, 8, 8, 8]))).toBeUndefined();
      });
    });
  });
});
