import { describe, expect, it } from 'vitest';
import { EXERCISES } from '../../src/pedagogy/exercises.js';
import { CONCEPTS } from '../../src/pedagogy/concepts.js';
import { makeUci } from 'chessops/util';
import { legalMoves, load, pinnedPieces, playLine, playMove, rankMoves } from './helpers.js';

/** Ejercicio de clavada donde aún no hay pieza rival clavada (hay que crearla). */
function isPinCreation(fen: string): boolean {
  const pos = load(fen);
  pos.turn = pos.turn === 'white' ? 'black' : 'white';
  return pinnedPieces(pos).length === 0;
}

describe('banco de ejercicios', () => {
  it('ids únicos y al menos 4 ejercicios por concepto', () => {
    expect(new Set(EXERCISES.map((e) => e.id)).size).toBe(EXERCISES.length);
    for (const c of CONCEPTS) {
      expect(EXERCISES.filter((e) => e.conceptId === c.id).length).toBeGreaterThanOrEqual(4);
    }
  });

  it('cada ejercicio referencia un concepto existente y tiene enunciado', () => {
    const ids = new Set(CONCEPTS.map((c) => c.id));
    for (const e of EXERCISES) {
      expect(ids.has(e.conceptId), e.id).toBe(true);
      expect(e.prompt.length, e.id).toBeGreaterThan(10);
      expect(e.solutionUci.length, e.id).toBeGreaterThan(0);
    }
  });

  for (const e of EXERCISES) {
    describe(e.id, () => {
      it('FEN legal y solución legal', () => {
        expect(() => load(e.fen)).not.toThrow();
        expect(() => playLine(e.fen, e.solutionUci)).not.toThrow();
      });

      if (e.conceptId !== 'tactics.mate_threat' && !isPinCreation(e.fen)) {
        it('la solución es la mejor jugada y es única (búsqueda de material)', () => {
          const ranked = rankMoves(e.fen, 3);
          expect(ranked[0]!.uci).toBe(e.solutionUci[0]);
          // margen claro sobre la segunda mejor jugada
          expect(ranked[0]!.score - (ranked[1]?.score ?? -Infinity)).toBeGreaterThanOrEqual(100);
        });
      }

      if (e.conceptId === 'tactics.mate_threat') {
        it('la solución da jaque mate', () => {
          const pos = playLine(e.fen, e.solutionUci);
          expect(pos.isCheckmate()).toBe(true);
        });
        it('es el único mate en una', () => {
          const pos = load(e.fen);
          const mates: string[] = [];
          for (const r of rankMoves(e.fen, 1)) if (r.score > 50000) mates.push(r.uci);
          expect(mates).toEqual([e.solutionUci[0]]);
          void pos;
        });
      }

      if (e.conceptId === 'tactics.pin') {
        it('tras la solución hay una pieza rival clavada', () => {
          const pos = playLine(e.fen, e.solutionUci);
          expect(pinnedPieces(pos).length).toBeGreaterThan(0);
        });
        if (isPinCreation(e.fen)) {
          it('es la única jugada que crea una clavada', () => {
            const pos = load(e.fen);
            const creators = legalMoves(pos)
              .filter((m) => pinnedPieces(playMove(pos, m)).length > 0)
              .map((m) => makeUci(m));
            expect(creators).toEqual([e.solutionUci[0]]);
          });
        }
      }
    });
  }
});
