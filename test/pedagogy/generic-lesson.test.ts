import { describe, expect, it } from 'vitest';
import { makeFen } from 'chessops/fen';
import { loadPosition, playLine } from '../../src/diagnosis/chess-utils.js';
import { diagnoseMissedTactic } from '../../src/diagnosis/index.js';
import { buildErrorLesson } from '../../src/pedagogy/error-lesson.js';
import { evalChange, evalState } from '../../src/pedagogy/review-copy.js';
import type { KeyError } from '../../src/review/types.js';
import type { AnalyzedMove, Score } from '../../src/types.js';

const JARGON = /evaluaci[oó]n|centipe[oó]n|\bcp\b|peones? de|motor ve|[+-]\d+[.,]\d/i;

function mk(fen: string, uci: string, pv: string[], before: Score, after: Score): AnalyzedMove {
  const pos = loadPosition(fen)!;
  const played = playLine(pos, [uci])[0]!;
  return {
    ply: 21, color: pos.turn, fenBefore: fen, fenAfter: makeFen(played.pos.toSetup()), san: played.san, uci,
    scoreBefore: before, scoreAfter: after, bestUci: pv[0]!, bestSan: playLine(pos, [pv[0]!])[0]!.san,
    pv, pvAfter: [], cpLoss: 600, classification: 'blunder',
  };
}

const FREE = mk('4k3/8/8/3q4/8/8/8/3QK3 w - - 0 1', 'e1e2', ['d1d5'], { cp: 900 }, { cp: 0 });
const FORK = mk('r3k3/8/8/3N4/8/8/8/4K3 w - - 0 1', 'e1e2', ['d5c7', 'e8d7', 'c7a8'], { cp: 500 }, { cp: 0 });
// Solo motor: se mueve el rey y la mejor es un avance de peón (nada que las reglas puedan explicar).
const QUIET = mk('4k3/8/8/8/8/8/P7/4K3 w - - 0 1', 'e1d1', ['a2a4', 'e8d7', 'a4a5', 'd7c6', 'a5a6'], { cp: 400 }, { cp: 40 });

const engineErr = (move: AnalyzedMove): KeyError => ({ gameId: 'g', move, diagnosis: null });

describe('lección de táctica perdida', () => {
  it('captura: hecho comprobado, línea, pista sin la jugada y sin pausa', () => {
    const err: KeyError = { gameId: 'g', move: FREE, diagnosis: diagnoseMissedTactic(FREE) };
    const l = buildErrorLesson(err, 'beginner');
    expect(l.kind).toBe('missed');
    expect(l.conceptId).toBe('engine.analysis');
    expect(l.pause).toBeUndefined();
    expect(l.happened.text).toBe('Podías capturar la dama de d5 con la dama y el rival no podía recapturar. En su lugar, moviste el rey a e2 (Ke2).');
    expect(l.why).not.toBe('');
    expect(l.best.hint).toBe('Pista: mira primero las capturas que puedes hacer.');
    expect(l.best.hint).not.toMatch(/d5|Qxd5/);
    expect(l.line!.ucis).toEqual(['d1d5']);
    expect(JSON.stringify(l)).not.toMatch(JARGON);
  });

  it('jaque que gana material: la línea se muestra en el tablero y es legal', () => {
    const err: KeyError = { gameId: 'g', move: FORK, diagnosis: diagnoseMissedTactic(FORK) };
    const l = buildErrorLesson(err, 'beginner');
    expect(l.happened.text).toBe(
      'Podías dar jaque con el caballo y, siguiendo la línea del motor, ganar el valor de una torre. En su lugar, moviste el rey a e2 (Ke2).',
    );
    expect(l.best.hint).toBe('Pista: mira primero los jaques que puedes dar.');
    expect(l.line!.sans).toEqual(['Nc7+', 'Kd7', 'Nxa8']);
    // fens[i] es la posición tras la media jugada i
    const pos = loadPosition(FORK.fenBefore)!;
    expect(playLine(pos, l.line!.ucis).map((s) => makeFen(s.pos.toSetup()))).toEqual(l.line!.fens);
  });
});

describe('lección solo con análisis del motor (engine.analysis)', () => {
  const l = buildErrorLesson(engineErr(QUIET), 'beginner');

  it('dice cuánto cambia la partida sin cifras y reconoce que no hay causa comprobada', () => {
    expect(l.kind).toBe('engine');
    expect(l.conceptId).toBe('engine.analysis');
    expect(l.happened.text).toBe(
      'Antes de tu jugada tenías la partida ganada con claridad; después de mover el rey a d1 (Kd1), la partida pasa a estar igualada. ' +
        'No he podido comprobar una causa concreta (una pieza sin defensa, un cambio malo, un ataque doble...), así que no te la voy a suponer.',
    );
    expect(l.happened.text).not.toMatch(JARGON);
  });

  it('sin pausa ni «por qué»: no inventa una explicación estratégica', () => {
    expect(l.pause).toBeUndefined();
    expect(l.why).toBe('');
  });

  it('muestra la mejor jugada y la línea principal corta (legal, como máximo 5 medias jugadas)', () => {
    expect(l.best.uci).toBe('a2a4');
    expect(l.best.text).toBe('El motor prefería mover el peón a a4. Línea principal del motor: a4 Kd7 a5 Kc6 a6.');
    expect(l.line!.sans).toEqual(['a4', 'Kd7', 'a5', 'Kc6', 'a6']);
    expect(l.line!.fens).toHaveLength(5);
  });

  it('pista del primer fallo: nombra la pieza, nunca la jugada ni la casilla de destino', () => {
    expect(l.best.hint).toBe('Pista: la jugada mejor la hace el peón.');
    expect(l.best.hint).not.toMatch(/a4|a2/);
  });

  it('si la línea del motor no empieza por la mejor jugada, la línea es solo esa jugada', () => {
    const odd = { ...QUIET, pv: ['e1e2'] };
    expect(buildErrorLesson(engineErr(odd), 'beginner').line!.ucis).toEqual(['a2a4']);
  });
});

describe('estado de la partida en palabras', () => {
  it('cubre los tramos desde el punto de vista de quien mueve', () => {
    expect(evalState({ cp: 350 }, 'white')).toBe('winning');
    expect(evalState({ cp: 150 }, 'white')).toBe('better');
    expect(evalState({ cp: 60 }, 'white')).toBe('slightly_better');
    expect(evalState({ cp: 10 }, 'white')).toBe('equal');
    expect(evalState({ cp: -80 }, 'white')).toBe('slightly_worse');
    expect(evalState({ cp: -200 }, 'white')).toBe('worse');
    expect(evalState({ cp: -500 }, 'white')).toBe('lost');
    expect(evalState({ cp: 350 }, 'black')).toBe('lost');
    expect(evalState({ mate: 3 }, 'white')).toBe('mate_for');
    expect(evalState({ mate: 3 }, 'black')).toBe('mate_against');
  });

  it('con el mismo tramo antes y después solo dice que baja el margen', () => {
    const w = { inf: 'jugar Qd5', you: 'x', past: 'x' };
    expect(evalChange('winning', 'winning', w)).toBe('Antes de tu jugada tenías la partida ganada con claridad. Con jugar Qd5 se reduce mucho tu ventaja.');
    expect(evalChange('lost', 'lost', w)).toContain('tu situación empeora todavía más');
  });
});
