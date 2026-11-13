import type { Color } from '../types.js';

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
