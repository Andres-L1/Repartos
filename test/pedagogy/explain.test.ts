import { describe, expect, it } from 'vitest';
import type { AnalyzedMove, Diagnosis, Level } from '../../src/types.js';
import { explain } from '../../src/pedagogy/explain.js';

const LEVELS: Level[] = ['beginner', 'initiation', 'basic', 'intermediate', 'advanced', 'competitive'];

// Blancas: torre d1 y dama negra en d5 (que ataca d1). En lugar de Rxd5+ se juega Rc1??
const FEN_BEFORE = '4k3/8/8/3q4/8/8/8/3RK3 w - - 0 1';
const FEN_AFTER = '4k3/8/8/3q4/8/8/8/2R1K3 b - - 1 1';

const move: AnalyzedMove = {
  ply: 1,
  color: 'white',
  fenBefore: FEN_BEFORE,
  fenAfter: FEN_AFTER,
  san: 'Rc1',
  uci: 'd1c1',
  scoreBefore: { cp: 900 },
  scoreAfter: { cp: -100 },
  bestUci: 'd1d5',
  bestSan: 'Rxd5+',
  pv: ['d1d5'],
  pvAfter: ['d5d1'],
  cpLoss: 350,
  classification: 'blunder',
};

const diagnosis: Diagnosis = {
  type: 'hanging_piece',
  ply: 1,
  color: 'white',
  fact: 'La torre en c1 queda sin defensa y es capturada por la dama.',
  evidence: { squares: ['c1'], pieces: ['rook'], refutationUci: 'd5c5', materialLostCp: 500 },
  conceptIds: ['tactics.hanging_piece'],
};

describe('explain con diagnóstico', () => {
  for (const level of LEVELS) {
    it(`nivel ${level}: verificado, con hecho, alternativa y sin placeholders`, () => {
      const e = explain(diagnosis, move, level);
      expect(e.verified).toBe(true);
      expect(e.conceptId).toBe('tactics.hanging_piece');
      expect(e.level).toBe(level);
      expect(e.title).toBe('Pieza colgada');
      expect(e.text).toContain(diagnosis.fact);
      expect(e.text).toContain('Rxd5+');
      expect(e.text).not.toMatch(/\{\w+\}/);
    });
  }

  it('los textos cambian con el nivel', () => {
    const texts = new Set(LEVELS.map((l) => explain(diagnosis, move, l).text));
    expect(texts.size).toBe(LEVELS.length);
  });

  it('rellena datos de la evidencia y convierte la refutación a SAN', () => {
    const e = explain(diagnosis, move, 'intermediate');
    expect(e.text).toContain('c1');
    expect(e.text).toContain('Qc5');
    expect(e.text).toContain('5 peones');
  });

  it('nombra la pieza en español con su artículo', () => {
    expect(explain(diagnosis, move, 'beginner').text).toContain('La torre en c1');
  });

  it('omite lo que la evidencia no aporta (no inventa refutación ni pérdida)', () => {
    const d: Diagnosis = { ...diagnosis, evidence: { squares: ['c1'], pieces: ['rook'] } };
    const e = explain(d, move, 'competitive');
    expect(e.text).toContain(d.fact);
    expect(e.text).not.toMatch(/Qc5|Material perdido|Secuencia:/);
    expect(e.text).not.toMatch(/\{\w+\}/);
  });

  it('usa un concepto distinto según conceptIds', () => {
    const d: Diagnosis = {
      ...diagnosis,
      type: 'fork',
      conceptIds: ['tactics.fork'],
      fact: 'El caballo en e6 ataca a la vez la torre y la dama.',
      evidence: { squares: ['e6'], pieces: ['knight'] },
    };
    const e = explain(d, move, 'initiation');
    expect(e.conceptId).toBe('tactics.fork');
    expect(e.title).toContain('Horquilla');
    expect(e.text).toContain(d.fact);
  });

  it('menciona mate solo si el motor lo ve contra quien jugó', () => {
    const mated: AnalyzedMove = { ...move, scoreAfter: { mate: -2 }, cpLoss: 1000 };
    expect(explain(null, mated, 'basic').text).toContain('mate en 2');
    expect(explain(null, move, 'basic').text).not.toMatch(/mate/i);
  });
});

describe('explain sin diagnóstico (null)', () => {
  for (const level of LEVELS) {
    it(`nivel ${level}: no verificado, muestra solo el análisis del motor`, () => {
      const e = explain(null, move, level);
      expect(e.verified).toBe(false);
      expect(e.level).toBe(level);
      expect(e.conceptId).toBe('engine.analysis');
      expect(e.text).toContain('Rxd5+');
      expect(e.text).not.toMatch(/\{\w+\}/);
    });
  }

  it('no afirma ninguna causa táctica ni usa vocabulario de conceptos', () => {
    for (const level of LEVELS) {
      const t = explain(null, move, level).text.toLowerCase();
      for (const word of [
        'colgada',
        'horquilla',
        'clavada',
        'amenaza',
        'sin defensa',
        'sin protección',
        'porque',
        'debido',
      ]) {
        expect(t, `${level}: ${word}`).not.toContain(word);
      }
    }
  });

  it('reconoce la limitación', () => {
    expect(explain(null, move, 'basic').text.toLowerCase()).toMatch(/no he podido determinar/);
  });

  it('muestra la pérdida del motor en niveles que usan cifras', () => {
    expect(explain(null, move, 'basic').text).toContain('3,5 peones');
  });
});
