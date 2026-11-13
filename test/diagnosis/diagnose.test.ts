import { describe, expect, it } from 'vitest';
import { makeFen } from 'chessops/fen';
import { loadPosition, playLine } from '../../src/diagnosis/chess-utils.js';
import { diagnose } from '../../src/diagnosis/index.js';
import type { AnalyzedMove, MoveClass, Score } from '../../src/types.js';

interface Opts {
  fen: string;
  uci: string;
  pvAfter: string[];
  pv?: string[];
  classification?: MoveClass;
  scoreBefore?: Score;
  scoreAfter?: Score;
  ply?: number;
}

/** Construye un AnalyzedMove real: fenAfter se calcula con chessops y se comprueba la legalidad de pvAfter y pv. */
function mk(o: Opts): AnalyzedMove {
  const pos = loadPosition(o.fen);
  if (!pos) throw new Error('FEN inválido: ' + o.fen);
  const color = pos.turn;
  const played = playLine(pos, [o.uci]);
  expect(played.length, 'la jugada debe ser legal').toBe(1);
  const fenAfter = makeFen(played[0]!.pos.toSetup());
  expect(playLine(played[0]!.pos, o.pvAfter).length, 'pvAfter debe ser legal').toBe(o.pvAfter.length);
  const pv = o.pv ?? [o.uci];
  expect(playLine(pos, pv).length, 'pv debe ser legal').toBe(pv.length);
  return {
    ply: o.ply ?? 1,
    color,
    fenBefore: o.fen,
    fenAfter,
    san: playLine(pos, [o.uci])[0]!.san,
    uci: o.uci,
    scoreBefore: o.scoreBefore ?? { cp: 0 },
    scoreAfter: o.scoreAfter ?? { cp: color === 'white' ? -300 : 300 },
    bestUci: pv[0]!,
    bestSan: playLine(pos, [pv[0]!])[0]!.san,
    pv,
    pvAfter: o.pvAfter,
    cpLoss: 300,
    classification: o.classification ?? 'blunder',
  };
}

describe('hanging_piece', () => {
  it('dama movida a una casilla atacada y sin defensa', () => {
    const d = diagnose(mk({ fen: '4k3/4n3/8/8/8/8/8/3QK3 w - - 0 1', uci: 'd1d5', pvAfter: ['e7d5'] }));
    expect(d?.type).toBe('hanging_piece');
    expect(d?.fact).toContain('d5');
    expect(d?.fact).toContain('dama');
    expect(d?.fact).toContain('caballo');
    expect(d?.evidence.refutationUci).toBe('e7d5');
    expect(d?.evidence.materialLostCp).toBe(900);
    expect(d?.conceptIds).toEqual(['tactics.hanging_piece']);
    expect(d?.color).toBe('white');
  });

  it('otra pieza (no la movida) queda colgada', () => {
    const d = diagnose(mk({ fen: '4k3/8/8/8/1b6/2N5/8/R3K3 w - - 0 1', uci: 'a1b1', pvAfter: ['b4c3'] }));
    expect(d?.type).toBe('hanging_piece');
    expect(d?.evidence.squares).toContain('c3');
    expect(d?.fact).toContain('caballo en c3');
    expect(d?.evidence.materialLostCp).toBe(300);
  });

  it('negativo: pieza capturada pero defendida -> no es hanging', () => {
    const d = diagnose(mk({ fen: '4k3/4n3/8/8/8/2N5/8/3QK3 w - - 0 1', uci: 'd1d5', pvAfter: ['e7d5', 'c3d5'] }));
    expect(d?.type).not.toBe('hanging_piece');
  });

  it('negativo: cambio igual de caballos no es pérdida', () => {
    const d = diagnose(mk({ fen: '4k3/8/2n5/4n3/2N5/8/8/4K3 w - - 0 1', uci: 'c4e5', pvAfter: ['c6e5'] }));
    expect(d).toBeNull();
  });
});

describe('bad_exchange', () => {
  it('permite dama por caballo', () => {
    const d = diagnose(mk({ fen: '4k3/4n3/8/8/8/2N5/8/3QK3 w - - 0 1', uci: 'd1d5', pvAfter: ['e7d5', 'c3d5'] }));
    expect(d?.type).toBe('bad_exchange');
    expect(d?.fact).toContain('d5');
    expect(d?.fact).toContain('dama');
    expect(d?.fact).toContain('caballo');
    expect(d?.evidence.materialLostCp).toBe(600);
    expect(d?.conceptIds).toEqual(['tactics.bad_exchange']);
  });

  it('captura propia: torre por peón defendido', () => {
    const d = diagnose(mk({ fen: '4k3/8/3p4/4p3/2N5/8/8/4RK2 w - - 0 1', uci: 'e1e5', pvAfter: ['d6e5', 'c4e5'] }));
    expect(d?.type).toBe('bad_exchange');
    expect(d?.evidence.materialLostCp).toBe(300);
    expect(d?.fact).toContain('torre');
    expect(d?.fact).toContain('peón');
  });

  it('negativo: cambio equilibrado de caballos', () => {
    expect(diagnose(mk({ fen: '4k3/8/2n5/4n3/2N5/8/8/4K3 w - - 0 1', uci: 'c4e5', pvAfter: ['c6e5'] }))).toBeNull();
  });
});

describe('fork', () => {
  it('caballo negro ataca rey y dama (Cf3+)', () => {
    const d = diagnose(
      mk({ fen: '4k3/8/8/4n3/8/8/3Q1PPP/6K1 w - - 0 1', uci: 'g2g3', pvAfter: ['e5f3', 'g1g2', 'f3d2'] }),
    );
    expect(d?.type).toBe('fork');
    expect(d?.evidence.squares[0]).toBe('f3');
    expect(d?.evidence.squares).toEqual(expect.arrayContaining(['g1', 'd2']));
    expect(d?.fact).toContain('rey en g1');
    expect(d?.fact).toContain('dama en d2');
    expect(d?.evidence.refutationUci).toBe('e5f3');
    expect(d?.conceptIds).toEqual(['tactics.fork']);
  });

  it('peón negro ataca caballo y torre (e5)', () => {
    const d = diagnose(mk({ fen: '4k3/4p3/8/8/3N1R2/8/8/6K1 w - - 0 1', uci: 'g1h1', pvAfter: ['e7e5', 'd4f5', 'e5f4'] }));
    expect(d?.type).toBe('fork');
    expect(d?.fact).toContain('peón');
    expect(d?.evidence.squares).toEqual(expect.arrayContaining(['e5', 'd4', 'f4']));
    expect(d?.evidence.materialLostCp).toBe(500);
  });

  it('negativo: sin captura verificada en pvAfter no se emite', () => {
    expect(diagnose(mk({ fen: '4k3/8/8/4n3/8/8/3Q1PPP/6K1 w - - 0 1', uci: 'g2g3', pvAfter: ['e5f3', 'g1g2'] }))).toBeNull();
  });
});

describe('pin', () => {
  it('caballo clavado al rey y ganado por un peón', () => {
    const d = diagnose(
      mk({ fen: '4k3/8/8/b2p4/8/2N5/8/4K2R w - - 0 1', uci: 'h1g1', pvAfter: ['d5d4', 'g1g2', 'd4c3'] }),
    );
    expect(d?.type).toBe('pin');
    expect(d?.fact).toContain('caballo en c3');
    expect(d?.fact).toContain('alfil en a5');
    expect(d?.fact).toContain('rey');
    expect(d?.evidence.squares).toEqual(['a5', 'c3', 'e1']);
    expect(d?.conceptIds).toEqual(['tactics.pin']);
  });

  it('clavada relativa: caballo contra la dama', () => {
    const d = diagnose(
      mk({ fen: '3r2k1/8/4p3/8/3N4/8/7P/3Q2K1 w - - 0 1', uci: 'h2h3', pvAfter: ['e6e5', 'g1h2', 'e5d4'] }),
    );
    expect(d?.type).toBe('pin');
    expect(d?.fact).toContain('caballo en d4');
    expect(d?.fact).toContain('dama en d1');
    expect(d?.evidence.pieces).toEqual(['rook', 'knight', 'queen']);
  });

  it('negativo: la pieza clavada no llega a perderse', () => {
    expect(diagnose(mk({ fen: '4k3/8/8/b2p4/8/2N5/8/4K2R w - - 0 1', uci: 'h1g1', pvAfter: ['d5d4', 'g1g2'] }))).toBeNull();
  });
});

describe('mate_threat', () => {
  it('permite mate del loco en 1 (g4 Qh4#)', () => {
    const d = diagnose(
      mk({
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/8/5P2/PPPPP1PP/RNBQKBNR w KQkq - 0 2',
        uci: 'g2g4',
        pvAfter: ['d8h4'],
        scoreAfter: { mate: -1 },
        ply: 3,
      }),
    );
    expect(d?.type).toBe('mate_threat');
    expect(d?.fact).toContain('mate en 1 jugada');
    expect(d?.fact).toContain('Qh4#');
    expect(d?.evidence.squares).toEqual(expect.arrayContaining(['h4', 'e1']));
    expect(d?.conceptIds).toEqual(['tactics.mate_threat']);
  });

  it('permite mate de pasillo en 2', () => {
    const d = diagnose(
      mk({
        fen: 'r5k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
        uci: 'e1e4',
        pvAfter: ['a8a1', 'e4e1', 'a1e1'],
        scoreAfter: { mate: -2 },
      }),
    );
    expect(d?.type).toBe('mate_threat');
    expect(d?.fact).toContain('mate en 2 jugadas');
    expect(d?.fact).toContain('Rxe1#');
  });

  it('(b) tenía mate en 1 y no lo jugó', () => {
    const d = diagnose(
      mk({
        fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
        uci: 'h2h3',
        pv: ['e1e8'],
        pvAfter: ['g7g6'],
        scoreBefore: { mate: 1 },
        scoreAfter: { cp: 800 },
      }),
    );
    expect(d?.type).toBe('mate_threat');
    expect(d?.fact).toContain('Había mate en 1 jugada con Re8#');
    expect(d?.evidence.refutationUci).toBe('e1e8');
  });

  it('(b) mate en 1 desaprovechado por las negras-blancas (Rd8#)', () => {
    const d = diagnose(
      mk({
        fen: '7k/6pp/8/8/8/8/5PPP/3R2K1 w - - 0 1',
        uci: 'd1d7',
        pv: ['d1d8'],
        pvAfter: ['g7g6'],
        scoreBefore: { mate: 1 },
        scoreAfter: { cp: 500 },
      }),
    );
    expect(d?.type).toBe('mate_threat');
    expect(d?.fact).toContain('Rd8#');
  });

  it('negativo: ya estaba perdido por mate antes de la jugada', () => {
    const d = diagnose(
      mk({
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/8/5P2/PPPPP1PP/RNBQKBNR w KQkq - 0 2',
        uci: 'g2g4',
        pvAfter: ['d8h4'],
        scoreBefore: { mate: -1 },
        scoreAfter: { mate: -1 },
      }),
    );
    expect(d?.type).not.toBe('mate_threat');
  });
});

describe('casos generales (null)', () => {
  const base = { fen: '4k3/4n3/8/8/8/8/8/3QK3 w - - 0 1', uci: 'd1d5', pvAfter: ['e7d5'] };

  it('ignora jugadas best/good', () => {
    expect(diagnose(mk({ ...base, classification: 'best' }))).toBeNull();
    expect(diagnose(mk({ ...base, classification: 'good' }))).toBeNull();
  });

  it('jugada tranquila sin refutación verificable', () => {
    expect(
      diagnose(
        mk({
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          uci: 'e2e4',
          pvAfter: ['e7e5'],
          classification: 'inaccuracy',
        }),
      ),
    ).toBeNull();
  });

  it('pvAfter ilegal: no se inventa nada', () => {
    const m = mk(base);
    expect(diagnose({ ...m, pvAfter: ['a1a8'] })).toBeNull();
    expect(diagnose({ ...m, pvAfter: [] })).toBeNull();
  });

  it('fenAfter inconsistente con la jugada: null', () => {
    const m = mk(base);
    expect(diagnose({ ...m, fenAfter: m.fenBefore })).toBeNull();
    expect(diagnose({ ...m, fenBefore: 'basura' })).toBeNull();
  });
});

describe('captura propia seguida de recaptura', () => {
  it('torre captura peón defendido: ahora es bad_exchange (torre por peón), no hanging_piece', () => {
    const d = diagnose(mk({ fen: '4k3/8/3p4/4p3/8/8/8/4RK2 w - - 0 1', uci: 'e1e5', pvAfter: ['d6e5'] }));
    expect(d?.type).toBe('bad_exchange');
    expect(d?.fact).toContain('se recibe peón');
    expect(d?.evidence.materialLostCp).toBe(400);
  });
});

describe('pin ampliada (corrección validación Fase 1, bug 2)', () => {
  it('v11 ply 17 Tf1: ...d4 ataca el Cc3 clavado por Ab4 contra el rey y luego lo captura', () => {
    const d = diagnose(
      mk({
        fen: 'r1b1k2r/p1p1qppp/2p2n2/3pP3/1b6/2NB4/PPP2PPP/R1BQK2R w KQkq - 1 9',
        uci: 'h1f1',
        pvAfter: ['d5d4', 'a2a3', 'd4c3', 'a3b4', 'c3b2', 'c1b2'],
        classification: 'mistake',
        ply: 17,
      }),
    );
    expect(d?.type).toBe('pin');
    expect(d?.fact).toContain('caballo en c3');
    expect(d?.fact).toContain('clavado');
    expect(d?.evidence.squares).toEqual(['b4', 'c3', 'e1']);
    expect(d?.evidence.refutationUci).toBe('d4c3');
    expect(d?.conceptIds).toEqual(['tactics.pin']);
  });

  it('explotación inmediata: un peón captura en pvAfter[0] la pieza clavada y ya atacada (no atendida)', () => {
    const d = diagnose(mk({ fen: '4k3/8/8/8/1b1p4/2N5/8/R3K3 w - - 0 1', uci: 'a1a2', pvAfter: ['d4c3'] }));
    expect(d?.type).toBe('pin');
    expect(d?.evidence.refutationUci).toBe('d4c3');
    expect(d?.fact).toContain('No atendiste la amenaza sobre el caballo en c3');
  });

  it('negativo: captura inmediata por la propia pieza clavadora es pieza colgada, no clavada', () => {
    const d = diagnose(mk({ fen: '4k3/8/8/8/1b6/2N5/8/R3K3 w - - 0 1', uci: 'a1b1', pvAfter: ['b4c3'] }));
    expect(d?.type).toBe('hanging_piece');
  });

  it('negativo: la pieza clavada nunca se captura en la línea', () => {
    const d = diagnose(mk({ fen: '4k3/8/8/8/1b1p4/2N5/8/R3K3 w - - 0 1', uci: 'a1a2', pvAfter: ['d4d3'], classification: 'mistake' }));
    expect(d).toBeNull();
  });
});

describe('discovered_attack (bug 3)', () => {
  const petroff = 'rnbqkb1r/pppp1ppp/8/4N3/4n3/8/PPPPQPPP/RNB1KB1R b KQkq - 1 4';
  it('v07 ply 8 ...Nf6??: Nc6+ jaque a la descubierta de la dama y ataque a Qd8', () => {
    const d = diagnose(
      mk({ fen: petroff, uci: 'e4f6', pvAfter: ['e5c6', 'f8e7', 'c6d8', 'e8d8', 'd2d4', 'a7a5'], ply: 8, classification: 'blunder' }),
    );
    expect(d?.type).toBe('discovered_attack');
    expect(d?.color).toBe('black');
    expect(d?.fact).toContain('Nc6+');
    expect(d?.fact).toContain('descubre jaque');
    expect(d?.fact).toContain('dama en e2');
    expect(d?.evidence.refutationUci).toBe('e5c6');
    expect(d?.evidence.squares).toEqual(['e2', 'e5', 'c6', 'e8']);
    expect(d?.evidence.materialLostCp).toBeGreaterThanOrEqual(200);
    expect(d?.conceptIds).toEqual(['tactics.discovered_attack']);
  });

  it('ataque a la descubierta sin jaque: la torre ataca la dama al moverse el caballo', () => {
    const d = diagnose(
      mk({ fen: '3q2k1/8/8/8/3N4/8/8/3RK3 b - - 0 1', uci: 'g8h8', pvAfter: ['d4b5', 'd8d1', 'e1d1'] }),
    );
    expect(d?.type).toBe('discovered_attack');
    expect(d?.fact).toContain('descubre un ataque');
    expect(d?.fact).toContain('dama en d8');
  });

  it('negativo: la descubierta no gana material en la línea -> no se emite', () => {
    const d = diagnose(mk({ fen: petroff, uci: 'e4f6', pvAfter: ['e5c6', 'f8e7'], classification: 'blunder' }));
    expect(d).toBeNull();
  });
});

describe('arbitraje hanging_piece vs bad_exchange en capturas (bug 1)', () => {
  it('v06 ply 17 Bxh7+: alfil por peón es bad_exchange e incluye el peón ganado', () => {
    const d = diagnose(
      mk({
        fen: 'r1bq1rk1/p4ppp/1pnbpn2/2pp4/3P4/2PBPNB1/PP1N1PPP/R2QK2R w KQ - 0 9',
        uci: 'd3h7',
        pvAfter: ['f6h7', 'e1g1', 'd6g3', 'h2g3'],
        classification: 'mistake',
        ply: 17,
      }),
    );
    expect(d?.type).toBe('bad_exchange');
    expect(d?.fact).toContain('Bxh7+');
    expect(d?.fact).toContain('se entrega alfil');
    expect(d?.fact).toContain('se recibe peón');
    expect(d?.fact).not.toContain('recién movido');
  });
});

describe('ignorar una amenaza previa (bug 4)', () => {
  it('hanging_piece: pieza ya atacada y sin defensa antes de la jugada', () => {
    const d = diagnose(mk({ fen: '4k3/8/1b6/8/3N4/8/8/R3K3 w - - 0 1', uci: 'a1a2', pvAfter: ['b6d4'] }));
    expect(d?.type).toBe('hanging_piece');
    expect(d?.fact).toContain('No atendiste la amenaza sobre el caballo en d4');
    expect(d?.evidence.refutationUci).toBe('b6d4');
    expect(d?.evidence.materialLostCp).toBe(300);
  });

  it('hanging_piece: si la jugada quita el defensor, la causa es la jugada (no "no atendiste")', () => {
    const d = diagnose(mk({ fen: '4k3/8/1b6/8/3N4/8/8/3QK3 w - - 0 1', uci: 'd1c1', pvAfter: ['b6d4'] }));
    expect(d?.type).toBe('hanging_piece');
    expect(d?.fact).not.toContain('No atendiste');
  });

  it('bad_exchange: alfil atacado por peón (hxg5 Cxg5) ya antes de la jugada', () => {
    const d = diagnose(mk({ fen: '4k3/8/7p/6B1/8/5N2/8/4K3 w - - 0 1', uci: 'e1e2', pvAfter: ['h6g5', 'f3g5'] }));
    expect(d?.type).toBe('bad_exchange');
    expect(d?.fact).toContain('No atendiste la amenaza sobre el alfil en g5');
    expect(d?.fact).toContain('hxg5');
  });

  it('bad_exchange: mover el alfil a g5 (casilla atacada) NO es "no atender la amenaza"', () => {
    const d = diagnose(mk({ fen: '4k3/8/7p/8/5B2/5N2/8/4K3 w - - 0 1', uci: 'f4g5', pvAfter: ['h6g5', 'f3g5'] }));
    expect(d?.type).toBe('bad_exchange');
    expect(d?.fact).not.toContain('No atendiste');
  });
});
