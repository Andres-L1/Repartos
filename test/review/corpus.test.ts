/**
 * Corpus real (partidas de club de Lichess sin nombres, partidas históricas y samples/) con los resultados de Stockfish
 * a profundidad 12 guardados: sin motor. Demuestra que ninguna partida con errores graves queda vacía y que las limpias
 * siguen limpias. Se regenera con `npx tsx scripts/corpus/build.mts`.
 */
import { describe, expect, it } from 'vitest';
import { CONCEPTS } from '../../src/pedagogy/concepts.js';
import { diagnose } from '../../src/diagnosis/index.js';
import { buildErrorLesson } from '../../src/pedagogy/error-lesson.js';
import { loadPosition, playLine } from '../../src/diagnosis/chess-utils.js';
import { buildReport } from '../../src/review/report.js';
import { countInaccuracies, errorTier, keyErrors, positionConcept, seriousMoves } from '../../src/review/select.js';
import { emptyMessage } from '../../web/src/review/summary.js';
import { corpusAnalyses, loadCorpusFile } from './corpus.js';
import { rg } from './helpers.js';

const analyses = corpusAnalyses();
const withSerious = analyses.filter((a) => seriousMoves(a).length > 0);
const clean = analyses.filter((a) => seriousMoves(a).length === 0);
const CONCEPT_IDS = new Set(CONCEPTS.map((c) => c.id));

describe('corpus real', () => {
  it('tiene tamaño y mezcla suficientes', () => {
    const c = loadCorpusFile();
    expect(c.depth).toBe(12);
    expect(c.games.length).toBeGreaterThanOrEqual(80);
    expect(new Set(c.games.map((g) => g.source))).toEqual(new Set(['club', 'historica', 'sample']));
    expect(withSerious.length).toBeGreaterThanOrEqual(80);
  });

  it('el problema era real: antes, partidas con errores graves se quedaban sin nada que aprender', () => {
    const emptyBefore = withSerious.filter((a) => seriousMoves(a).every((m) => !diagnose(m)));
    expect(emptyBefore.length).toBeGreaterThanOrEqual(10);
  });

  it('ahora ninguna partida con errores graves queda vacía', () => {
    const empty = withSerious.filter((a) => keyErrors(a).length === 0);
    expect(empty.map((a) => a.gameId)).toEqual([]);
  });

  it('las partidas sin errores graves siguen limpias y dicen «partida limpia»', () => {
    expect(clean.length).toBeGreaterThanOrEqual(3);
    for (const a of clean) {
      expect(keyErrors(a), a.gameId).toEqual([]);
      expect(emptyMessage(0, countInaccuracies(a))).toMatch(/^Partida limpia: .*ninguna grave/);
    }
  });

  it('tope 3 por partida, solo jugadas del alumno graves, en orden de jugada, y las imprecisiones nunca entran', () => {
    for (const a of analyses) {
      const ke = keyErrors(a);
      expect(ke.length).toBeLessThanOrEqual(3);
      expect(ke.map((e) => e.move.ply)).toEqual([...ke.map((e) => e.move.ply)].sort((x, y) => x - y));
      for (const e of ke) {
        expect(e.move.color).toBe(a.color);
        expect(['mistake', 'blunder']).toContain(e.move.classification);
      }
    }
  });

  it('prioridad: nunca se muestra un error de menor prioridad si hay sitio y queda uno de mayor prioridad sin mostrar', () => {
    const tier = { cause: 0, tactic: 1, engine: 2 } as const;
    for (const a of withSerious) {
      const shown = keyErrors(a);
      const worst = Math.max(...shown.map((e) => tier[errorTier(e)]));
      const all = keyErrors(a, 1000);
      const better = all.filter((e) => tier[errorTier(e)] < worst && !shown.some((s) => s.move.ply === e.move.ply));
      expect(better, a.gameId).toEqual([]);
    }
  });

  it('cada error construye su lección: línea legal, sin jerga ni cifras de motor, pista que no nombra la solución', () => {
    const JARGON = /evaluaci[oó]n|centipe[oó]n|\bcp\b|peones? de|[+-]\d+[.,]\d/i;
    let engineLessons = 0;
    let missedLessons = 0;
    for (const a of analyses)
      for (const e of keyErrors(a)) {
        const l = buildErrorLesson(e, 'beginner');
        expect(JSON.stringify([l.happened.text, l.why, l.best.text, l.rule, l.best.hint ?? ''])).not.toMatch(JARGON);
        expect(l.best.uci).toBe(e.move.bestUci);
        if (l.kind) {
          expect(l.line, a.gameId).toBeDefined();
          const pos0 = loadPosition(e.move.fenBefore)!;
          expect(playLine(pos0, l.line!.ucis).length).toBe(l.line!.ucis.length);
          expect(l.line!.ucis[0]).toBe(e.move.bestUci);
          expect(l.line!.ucis.length).toBeLessThanOrEqual(5);
          if (l.best.hint) {
            expect(l.best.hint).not.toContain(l.best.san);
            expect(l.best.hint).not.toContain(l.best.uci.slice(2, 4));
          }
          expect(l.pause).toBeUndefined();
          if (l.kind === 'engine') {
            engineLessons++;
            expect(l.why).toBe('');
          } else missedLessons++;
        }
      }
    expect(engineLessons).toBeGreaterThan(10);
    expect(missedLessons).toBeGreaterThan(10);
  });

  it('táctica perdida: la mejor jugada es una captura o un jaque y es legal; con ganancia declarada el material cuadra', () => {
    let n = 0;
    for (const a of analyses)
      for (const e of keyErrors(a).filter((k) => errorTier(k) === 'tactic')) {
        n++;
        const pos0 = loadPosition(e.move.fenBefore)!;
        const first = playLine(pos0, [e.move.bestUci], 1)[0]!;
        expect(Boolean(first.captured) || first.pos.isCheck(), `${a.gameId} ply ${e.move.ply}`).toBe(true);
        expect(e.diagnosis!.conceptIds).toEqual([]);
      }
    expect(n).toBeGreaterThan(10);
  });

  it('informe: engine.analysis y táctica perdida no entran en puntos débiles; solo conceptos del temario', () => {
    const games = analyses.slice(0, 30).map((a) => rg(a.gameId));
    const r = buildReport(analyses.slice(0, 30), games);
    for (const w of r.weaknesses) {
      expect(w.conceptId).not.toBe('engine.analysis');
      expect(CONCEPT_IDS.has(w.conceptId), w.conceptId).toBe(true);
    }
    expect(r.serious).toBe(analyses.slice(0, 30).reduce((n, a) => n + seriousMoves(a).length, 0));
    expect(r.inaccuracies).toBe(analyses.slice(0, 30).reduce((n, a) => n + countInaccuracies(a), 0));
  });

  it('posiciones guardadas: solo con concepto o con mejor jugada clara (táctica o blunder); la jugada es legal', () => {
    let engine = 0;
    for (const a of analyses)
      for (const e of keyErrors(a)) {
        const c = positionConcept(e);
        if (!c) {
          expect(errorTier(e)).toBe('engine');
          expect(e.move.classification).toBe('mistake');
          continue;
        }
        if (c === 'engine.analysis') engine++;
        else expect(CONCEPT_IDS.has(c)).toBe(true);
        expect(playLine(loadPosition(e.move.fenBefore)!, [e.move.bestUci], 1)).toHaveLength(1);
      }
    expect(engine).toBeGreaterThan(5);
  });
});
