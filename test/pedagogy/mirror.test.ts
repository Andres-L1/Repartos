import { describe, expect, it } from 'vitest';
import { Chess } from 'chessops/chess';
import { parseFen, makeFen } from 'chessops/fen';
import { parseUci } from 'chessops/util';
import { EXERCISES } from '../../src/pedagogy/exercises.js';
import { mirrorExercise, mirrorFen, mirrorText, mirrorUci } from '../../src/pedagogy/mirror.js';

describe('ejercicios en espejo (negras)', () => {
  it('cada espejo: FEN válido, juegan las otras, toda la línea legal, mismo concepto y nivel', () => {
    for (const ex of EXERCISES) {
      const m = mirrorExercise(ex);
      expect(m.id, ex.id).toBe(`${ex.id}.m`);
      expect([m.conceptId, m.level], ex.id).toEqual([ex.conceptId, ex.level]);
      const pos = Chess.fromSetup(parseFen(m.fen).unwrap()).unwrap();
      expect(pos.turn, ex.id).toBe(ex.fen.split(' ')[1] === 'w' ? 'black' : 'white');
      for (const u of m.solutionUci) {
        const mv = parseUci(u)!;
        expect(pos.isLegal(mv), `${ex.id} ${u}`).toBe(true);
        pos.play(mv);
      }
      expect(mirrorFen(m.fen), ex.id).toBe(ex.fen); // involución
    }
  });

  it('enroque y al paso coherentes; coronación conserva la pieza', () => {
    expect(mirrorFen('r3k2r/8/8/3pP3/8/8/8/R3K2R w Kq d6 0 1')).toBe('r3k2r/8/8/8/3Pp3/8/8/R3K2R b Qk d3 0 1');
    const pos = Chess.fromSetup(parseFen(mirrorFen('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1')).unwrap()).unwrap();
    expect(pos.isLegal(parseUci(mirrorUci('e1g1'))!)).toBe(true);
    expect(mirrorUci('b7b8n')).toBe('b2b1n');
    expect(makeFen(Chess.fromSetup(parseFen(mirrorFen('8/1P4k1/8/8/8/8/6K1/8 w - - 0 1')).unwrap()).unwrap().toSetup())).toBe('8/6k1/8/8/8/8/1p4K1/8 b - - 0 1');
  });

  it('el enunciado cambia colores y casillas', () => {
    expect(mirrorText('Juegan blancas. La torre negra de d5 y el rey negro.')).toBe('Juegan negras. La torre blanca de d4 y el rey blanco.');
    const black = EXERCISES.map(mirrorExercise).filter((m) => m.fen.split(' ')[1] === 'b');
    for (const m of black) expect(m.prompt, m.id).toMatch(/^Juegan negras/);
  });
});
