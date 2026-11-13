import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { analyzeGame } from '../../src/analysis/index.js';
import { diagnose } from '../../src/diagnosis/index.js';
import type { AnalyzedMove } from '../../src/types.js';

/**
 * Golden tests de la Fase 1: tipo de diagnóstico por jugada de cada samples/v*.pgn, con la profundidad fijada.
 * Stockfish va con Threads=1, Hash fijo, tablas limpias por posición y `go depth` (sin tiempo), así que el
 * resultado es reproducible. Para regenerar tras un cambio intencionado: UPDATE_GOLDEN=1 npx vitest run test/validation/golden.test.ts
 */
const DEPTH = 10;
const DIR = join(import.meta.dirname, '..', '..', 'samples');
const GOLDEN = join(import.meta.dirname, 'golden.json');
const files = readdirSync(DIR)
  .filter((f) => /^v\d+_.*\.pgn$/.test(f))
  .sort();

const analyzed = new Map<string, AnalyzedMove[]>();

/** "ply SAN clasificación -> tipo|null" solo para jugadas peores que 'good'. */
function snapshot(moves: AnalyzedMove[]): string[] {
  return moves
    .filter((m) => m.classification !== 'best' && m.classification !== 'good')
    .map((m) => `${m.ply} ${m.san} ${m.classification} -> ${diagnose(m)?.type ?? 'null'}`);
}

beforeAll(async () => {
  for (const f of files) analyzed.set(f, await analyzeGame(readFileSync(join(DIR, f), 'utf8'), { depth: DEPTH }));
  if (process.env.UPDATE_GOLDEN) {
    const out = Object.fromEntries([...analyzed].map(([f, ms]) => [f, snapshot(ms)]));
    writeFileSync(GOLDEN, JSON.stringify({ depth: DEPTH, games: out }, null, 1) + '\n');
  }
}, 600_000);

describe('golden: tipo de diagnóstico por jugada (samples/v*.pgn, profundidad fija)', () => {
  it('existe el fichero golden', () => {
    expect(existsSync(GOLDEN)).toBe(true);
  });

  for (const f of files) {
    it(`${f}: coincide con el golden`, () => {
      const golden = JSON.parse(readFileSync(GOLDEN, 'utf8')) as { depth: number; games: Record<string, string[]> };
      expect(golden.depth).toBe(DEPTH);
      expect(snapshot(analyzed.get(f)!)).toEqual(golden.games[f]);
    });
  }

  it('errores deliberados concretos (bugs de la validación Fase 1)', () => {
    const type = (f: string, ply: number) => {
      const m = analyzed.get(f)!.find((x) => x.ply === ply)!;
      return diagnose(m);
    };
    expect(type('v11_clavada.pgn', 17)?.type).toBe('pin');
    expect(type('v07_trampa_petroff.pgn', 8)?.type).toBe('discovered_attack');
    const v06 = type('v06_cambio_malo.pgn', 17);
    expect(v06?.type).toBe('bad_exchange');
    expect(v06?.fact).toContain('peón');
  });

  it('partidas limpias sin diagnósticos', () => {
    for (const f of ['v01_limpia.pgn', 'v10_limpia_qgd.pgn']) {
      expect(snapshot(analyzed.get(f)!).filter((l) => !l.endsWith('null')), f).toEqual([]);
    }
  });
});

describe('determinismo del motor', () => {
  it('dos ejecuciones sobre samples/v11 dan exactamente el mismo análisis', async () => {
    const pgn = readFileSync(join(DIR, 'v11_clavada.pgn'), 'utf8');
    const a = await analyzeGame(pgn, { depth: DEPTH });
    const b = await analyzeGame(pgn, { depth: DEPTH });
    expect(b).toEqual(a);
    expect(a).toEqual(analyzed.get('v11_clavada.pgn'));
  }, 120_000);
});
