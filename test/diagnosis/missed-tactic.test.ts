import { describe, expect, it } from 'vitest';
import { makeFen } from 'chessops/fen';
import { loadPosition, playLine } from '../../src/diagnosis/chess-utils.js';
import { diagnose, diagnoseMissedTactic } from '../../src/diagnosis/index.js';
import type { AnalyzedMove, MoveClass } from '../../src/types.js';

/** Jugada real: `uci` es lo que jugó el alumno; `pv` la línea del motor desde fenBefore (pv[0] = la mejor). */
function mk(fen: string, uci: string, pv: string[], classification: MoveClass = 'blunder', over: Partial<AnalyzedMove> = {}): AnalyzedMove {
  const pos = loadPosition(fen)!;
  const played = playLine(pos, [uci]);
  expect(played.length, 'jugada legal').toBe(1);
  expect(playLine(pos, pv).length, 'pv legal').toBe(pv.length);
  return {
    ply: 21,
    color: pos.turn,
    fenBefore: fen,
    fenAfter: makeFen(played[0]!.pos.toSetup()),
    san: played[0]!.san,
    uci,
    scoreBefore: { cp: pos.turn === 'white' ? 600 : -600 },
    scoreAfter: { cp: 0 },
    bestUci: pv[0]!,
    bestSan: playLine(pos, [pv[0]!])[0]!.san,
    pv,
    pvAfter: [],
    cpLoss: 600,
    classification,
    ...over,
  };
}

describe('táctica perdida (missed_tactic)', () => {
  it('captura que gana una pieza sin recaptura posible', () => {
    const m = mk('4k3/8/8/3q4/8/8/8/3QK3 w - - 0 1', 'e1e2', ['d1d5']);
    const d = diagnoseMissedTactic(m)!;
    expect(d.type).toBe('missed_tactic');
    expect(d.conceptIds).toEqual([]);
    expect(d.evidence).toMatchObject({ tactic: 'free_capture', squares: ['d1', 'd5'], pieces: ['queen', 'queen'], gainCp: 900, refutationUci: 'd1d5' });
    expect(d.fact).toBe('Con Qxd5 se capturaba la dama en d5 y no se podía recapturar en d5.');
  });

  it('serie de capturas con recaptura que deja ganancia neta (peón por caballo)', () => {
    const m = mk('4k3/8/4p3/3n4/4P3/8/8/4K3 w - - 0 1', 'e1e2', ['e4d5', 'e6d5']);
    const d = diagnoseMissedTactic(m)!;
    expect(d.evidence).toMatchObject({ tactic: 'winning_exchange', gainCp: 200, pieces: ['pawn', 'knight'] });
    expect(d.fact).toContain('exd5 exd5');
  });

  it('jaque que lleva a mate', () => {
    const m = mk('6k1/5ppp/8/8/8/8/8/R3K3 w - - 0 1', 'e1e2', ['a1a8']);
    const d = diagnoseMissedTactic(m)!;
    expect(d.evidence).toMatchObject({ tactic: 'check_mate', pieces: ['rook', 'king'] });
    expect(d.fact).toContain('mate: Ra8#');
  });

  it('jaque que gana material (horquilla de caballo con jaque)', () => {
    const m = mk('r3k3/8/8/3N4/8/8/8/4K3 w - - 0 1', 'e1e2', ['d5c7', 'e8d7', 'c7a8']);
    const d = diagnoseMissedTactic(m)!;
    expect(d.evidence).toMatchObject({ tactic: 'check_wins', gainCp: 500 });
  });

  it('no se emite si la captura pierde material, si solo gana un peón, o si el alumno jugó la mejor', () => {
    // Qxd5 exd5: dama por peón.
    expect(diagnoseMissedTactic(mk('4k3/8/4p3/3p4/8/8/8/3QK3 w - - 0 1', 'e1e2', ['d1d5', 'e6d5']))).toBeNull();
    // Gana solo un peón: por debajo del mínimo.
    expect(diagnoseMissedTactic(mk('4k3/8/8/3p4/8/8/8/3QK3 w - - 0 1', 'e1e2', ['d1d5']))).toBeNull();
    // El alumno jugó la mejor.
    expect(diagnoseMissedTactic(mk('4k3/8/8/3q4/8/8/8/3QK3 w - - 0 1', 'd1d5', ['d1d5'], 'best'))).toBeNull();
    // La mejor jugada no es una captura ni un jaque.
    expect(diagnoseMissedTactic(mk('4k3/8/8/8/8/8/8/3QK3 w - - 0 1', 'e1e2', ['d1d2']))).toBeNull();
  });

  it('no se emite si la línea corta una captura mía con recaptura posible (resultado sin comprobar)', () => {
    // El motor solo dio Qxd5: tras la captura el rival podría recapturar (exd5), así que no hay ganancia comprobada.
    expect(diagnoseMissedTactic(mk('4k3/8/4p3/3q4/8/8/8/3QK3 w - - 0 1', 'e1e2', ['d1d5']))).toBeNull();
  });

  it('no se emite si pv[0] no coincide con la mejor jugada o falta la línea', () => {
    expect(diagnoseMissedTactic(mk('4k3/8/8/3q4/8/8/8/3QK3 w - - 0 1', 'e1e2', ['d1d5'], 'blunder', { bestUci: 'e1d2' }))).toBeNull();
    expect(diagnoseMissedTactic(mk('4k3/8/8/3q4/8/8/8/3QK3 w - - 0 1', 'e1e2', ['d1d5'], 'blunder', { pv: [] }))).toBeNull();
  });

  it('no se emite para jugadas buenas', () => {
    expect(diagnoseMissedTactic(mk('4k3/8/8/3q4/8/8/8/3QK3 w - - 0 1', 'e1e2', ['d1d5'], 'good'))).toBeNull();
  });

  it('diagnose() no devuelve nunca missed_tactic (va aparte, con menor prioridad)', () => {
    const m = mk('4k3/8/8/3q4/8/8/8/3QK3 w - - 0 1', 'e1e2', ['d1d5']);
    expect(diagnose(m)?.type).not.toBe('missed_tactic');
  });
});
