/** Corpus real de partidas con los resultados del motor guardados (sin motor en los tests). Lo genera scripts/corpus/build.mts. */
import { readFileSync } from 'node:fs';
import { Chess } from 'chessops/chess';
import { makeFen, parseFen } from 'chessops/fen';
import { makeSan } from 'chessops/san';
import { parseUci } from 'chessops/util';
import { assembleMoves } from '../../src/analysis/core.js';
import type { EngineResult } from '../../src/analysis/engine-like.js';
import type { ParsedMove } from '../../src/analysis/pgn.js';
import type { GameAnalysis } from '../../src/review/types.js';
import type { Color } from '../../src/types.js';

export interface CorpusGame {
  id: string;
  source: string;
  initialFen: string;
  ucis: string[];
  results: EngineResult[];
}
export interface CorpusFile {
  depth: number;
  engine: string;
  games: CorpusGame[];
}

export function loadCorpusFile(): CorpusFile {
  return JSON.parse(readFileSync(new URL('../fixtures/corpus/analyses.json', import.meta.url), 'utf8')) as CorpusFile;
}

/** Reconstruye las jugadas analizadas de una partida del corpus. */
export function corpusMoves(g: CorpusGame) {
  const pos = Chess.fromSetup(parseFen(g.initialFen).unwrap()).unwrap();
  const parsed: ParsedMove[] = g.ucis.map((uci, i) => {
    const move = parseUci(uci)!;
    const fenBefore = makeFen(pos.toSetup());
    const color: Color = pos.turn;
    const san = makeSan(pos, move);
    pos.play(move);
    return { san, uci, fenBefore, fenAfter: makeFen(pos.toSetup()), ply: i + 1, color };
  });
  return assembleMoves(parsed, g.results);
}

/** Cada partida del corpus desde el punto de vista de cada bando (el alumno puede ser cualquiera). */
export function corpusAnalyses(): GameAnalysis[] {
  return loadCorpusFile().games.flatMap((g) => {
    const moves = corpusMoves(g);
    return (['white', 'black'] as const).map((color) => ({ gameId: `${g.id}.${color[0]}`, color, moves }));
  });
}
