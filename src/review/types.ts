import type { AnalyzedMove, Color, Diagnosis } from '../types.js';

/** Partida tal como la devuelve la API de Lichess (solo los campos que usamos). */
export interface LichessGame {
  id: string;
  speed: string;
  variant: string;
  status: string;
  createdAt: number;
  moves: string;
  initialFen?: string;
  winner?: 'white' | 'black';
  players: {
    white: { id?: string; rating?: number };
    black: { id?: string; rating?: number };
  };
  opening?: { name: string };
}

/** Partida elegible para revisar, con su PGN ya construido. */
export interface ReviewGame {
  id: string;
  color: Color;
  result: 'win' | 'loss' | 'draw';
  speed: string;
  createdAt: number;
  opening?: string;
  pgn: string;
}

/** Análisis completo de una partida: jugadas de ambos bandos y color del alumno. */
export interface GameAnalysis {
  gameId: string;
  color: Color;
  moves: AnalyzedMove[];
}

/** Error clave de una partida con su causa verificada. */
export interface KeyError {
  gameId: string;
  move: AnalyzedMove;
  diagnosis: Diagnosis;
}

export type Phase = 'opening' | 'middlegame' | 'endgame';

/** Punto fuerte respaldado por datos (nunca se inventa). */
export interface Strength {
  kind: 'phase' | 'accuracy' | 'trend';
  phase?: Phase;
  /** phase: tasa de errores de la fase; accuracy: proporción de jugadas best/good; trend: bajada relativa de la tasa de errores. */
  value: number;
}

export interface Report {
  games: { id: string; result: 'win' | 'loss' | 'draw' }[];
  counts: { wins: number; draws: number; losses: number };
  strengths: Strength[];
  weaknesses: { conceptId: string; games: number; occurrences: number }[];
  starError?: KeyError;
  ruleConceptId?: string;
}
