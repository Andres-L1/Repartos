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

/** Verificados solo con Stockfish (scripts/verify-fase4.mts --bank): aquí, legalidad, mate y balance final. */
const ENGINE_ONLY = new Set(['tactics.defensive_move', 'tactics.interference', 'tactics.clearance']);
/** Finales: verificados de forma exacta con la tablebase (test/content/unitsE.test.ts); aquí, solo legalidad. */
const TABLEBASE = (conceptId: string) => conceptId.startsWith('endgame.');

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

      // Sacrificios de 5 medias jugadas: la búsqueda de profundidad 3 no los ve (Stockfish: scripts/verify-fase4.mts --bank).
      const longSac = e.solutionUci.length >= 5 && !playLine(e.fen, e.solutionUci).isCheckmate();
      if (longSac) {
        it('la línea termina con al menos dos peones más para quien juega', () => {
          const me = load(e.fen).turn;
          const val = { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 0 } as const;
          const mat = (p: ReturnType<typeof load>) => [...p.board].reduce((s, [, x]) => s + (x.color === me ? 1 : -1) * val[x.role], 0);
          expect(mat(playLine(e.fen, e.solutionUci)) - mat(load(e.fen))).toBeGreaterThanOrEqual(2);
        });
      }

      // Conceptos de Competitivo: defensas y líneas largas que la búsqueda de profundidad 3 no ve; solo Stockfish.
      if (ENGINE_ONLY.has(e.conceptId) && playLine(e.fen, e.solutionUci).isCheckmate()) {
        it('la línea termina en jaque mate', () => expect(playLine(e.fen, e.solutionUci).isCheckmate()).toBe(true));
      }

      if (e.conceptId !== 'tactics.mate_threat' && !isPinCreation(e.fen) && !longSac && !ENGINE_ONLY.has(e.conceptId) && !TABLEBASE(e.conceptId)) {
        it('la solución es la mejor jugada y es única salvo sus alternativas (búsqueda de material)', () => {
          const ranked = rankMoves(e.fen, 3);
          const accepted = [e.solutionUci[0], ...(e.alt ?? [])];
          expect(accepted).toContain(ranked[0]!.uci);
          // margen claro sobre la mejor jugada no aceptada
          const other = ranked.find((r) => !accepted.includes(r.uci));
          expect(ranked[0]!.score - (other?.score ?? -Infinity)).toBeGreaterThanOrEqual(100);
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
