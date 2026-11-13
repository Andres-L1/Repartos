import { Chess } from 'chessops/chess';
import { parseFen } from 'chessops/fen';
import type { AnalyzedMove, MoveClass, Score } from '../types.js';
import { Engine, type EngineResult } from './engine.js';
import { parseGame, uciToSan } from './pgn.js';

export interface AnalyzeOptions {
  /** Profundidad de búsqueda (por defecto 12). */
  depth?: number;
  /** Se llama tras analizar cada posición: (hechas, total). */
  onProgress?: (done: number, total: number) => void;
}

const MATE_CP = 1000;

/** Valor numérico (blancas) de un Score, topado en ±1000; los mates valen ±1000. */
export function scoreToCp(s: Score): number {
  if (s.mate !== undefined) return s.mate > 0 ? MATE_CP : -MATE_CP;
  return Math.max(-MATE_CP, Math.min(MATE_CP, s.cp ?? 0));
}

export function classify(cpLoss: number): MoveClass {
  if (cpLoss <= 20) return 'best';
  if (cpLoss <= 50) return 'good';
  if (cpLoss <= 100) return 'inaccuracy';
  if (cpLoss <= 250) return 'mistake';
  return 'blunder';
}

/** Posición terminal (mate o tablas): no hace falta motor. Devuelve null si hay jugadas legales. */
function terminalResult(fen: string): EngineResult | null {
  const pos = Chess.fromSetup(parseFen(fen).unwrap()).unwrap();
  if (!pos.isEnd()) return null;
  if (pos.isCheckmate()) {
    // Mate dado: gana quien NO tiene el turno. Se codifica como cp extremo (un "mate 0" no tiene signo).
    return { score: { cp: pos.turn === 'white' ? -10000 : 10000 }, bestUci: '', pv: [] };
  }
  return { score: { cp: 0 }, bestUci: '', pv: [] };
}

export async function analyzeGame(pgn: string, opts: AnalyzeOptions = {}): Promise<AnalyzedMove[]> {
  const depth = opts.depth ?? 12;
  const game = parseGame(pgn);
  const fens = [game.moves[0]!.fenBefore, ...game.moves.map((m) => m.fenAfter)];
  const engine = new Engine();
  await engine.init();
  const results: EngineResult[] = [];
  try {
    for (let i = 0; i < fens.length; i++) {
      const fen = fens[i]!;
      results.push(terminalResult(fen) ?? (await engine.analyze(fen, { depth })));
      opts.onProgress?.(i + 1, fens.length);
    }
  } finally {
    await engine.close();
  }

  return game.moves.map((m, i) => {
    const before = results[i]!;
    const after = results[i + 1]!;
    let cpLoss: number;
    if (m.uci === before.bestUci) {
      cpLoss = 0;
    } else {
      const b = scoreToCp(before.score);
      const a = scoreToCp(after.score);
      cpLoss = m.color === 'white' ? b - a : a - b;
      cpLoss = Math.max(0, Math.min(MATE_CP, Math.round(cpLoss)));
    }
    return {
      ply: m.ply,
      color: m.color,
      fenBefore: m.fenBefore,
      fenAfter: m.fenAfter,
      san: m.san,
      uci: m.uci,
      scoreBefore: before.score,
      scoreAfter: after.score,
      bestUci: before.bestUci,
      bestSan: before.bestUci ? uciToSan(m.fenBefore, before.bestUci) : m.san,
      pv: before.pv,
      pvAfter: after.pv,
      cpLoss,
      classification: classify(cpLoss),
    };
  });
}
