import type { AnalyzedMove, Color, MoveClass } from '../../src/types.js';
import type { GameAnalysis, ReviewGame } from '../../src/review/types.js';

export function mv(ply: number, color: Color, classification: MoveClass = 'good', cpLoss = 0): AnalyzedMove {
  return {
    ply, color, fenBefore: '', fenAfter: '', san: 'x', uci: 'a1a2',
    scoreBefore: { cp: 0 }, scoreAfter: { cp: 0 }, bestUci: 'a1a3', bestSan: 'y',
    pv: [], pvAfter: [], cpLoss, classification,
  };
}

export const game = (gameId: string, moves: AnalyzedMove[], color: Color = 'white'): GameAnalysis => ({ gameId, color, moves });

export const rg = (id: string, result: ReviewGame['result'] = 'win', createdAt = 0): ReviewGame => ({
  id, color: 'white', result, speed: 'blitz', createdAt, pgn: '',
});
