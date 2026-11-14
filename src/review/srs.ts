/** Repaso espaciado: cajas, temas de Lichess y arranque de puzles. Puro (sin node:), compartido con el navegador. */
import { Chess } from 'chessops/chess';
import { parseFen } from 'chessops/fen';
import { makeUci, parseUci } from 'chessops/util';
import { parseGame } from '../analysis/pgn.js';
import type { Level } from '../types.js';

export const BOX_DAYS = [1, 2, 4, 8, 16] as const;
const DAY_MS = 86_400_000;

/** Acierto sube una caja (tope 5); fallo vuelve a la 1. */
export function nextBox(box: number, correct: boolean): number {
  return correct ? Math.min(box + 1, BOX_DAYS.length) : 1;
}

/** Milisegundos del próximo vencimiento desde `nowMs` para una caja 1..5. */
export function dueAfter(box: number, nowMs: number): number {
  return nowMs + BOX_DAYS[Math.min(Math.max(box, 1), BOX_DAYS.length) - 1]! * DAY_MS;
}

/** Concepto -> tema de Lichess. `tactics.bad_exchange` no tiene tema: usa el banco de ejercicios. */
const THEME_BY_CONCEPT: Record<string, string> = {
  'tactics.hanging_piece': 'hangingPiece',
  'tactics.fork': 'fork',
  'tactics.pin': 'pin',
  'tactics.discovered_attack': 'discoveredAttack',
  'tactics.mate_threat': 'mate',
};

export function themeForConcept(conceptId: string): string | null {
  return THEME_BY_CONCEPT[conceptId] ?? null;
}

export function conceptForThemes(themes: string[]): string | null {
  for (const t of themes) {
    const hit = Object.keys(THEME_BY_CONCEPT).find((c) => THEME_BY_CONCEPT[c] === t);
    if (hit) return hit;
  }
  return null;
}

export type PuzzleDifficulty = 'easiest' | 'easier' | 'normal' | 'harder' | 'hardest';

// Calibración PROVISIONAL: ajustar con datos reales de aciertos por nivel. Valoraciones medidas el 2026-11-14:
// easiest 687-1082, easier 964-1173, normal 1297-1667, hardest 1801-2327 (harder sin medir).
const DIFFICULTY_BY_LEVEL: Record<Level, PuzzleDifficulty> = {
  beginner: 'easiest',
  initiation: 'easiest',
  basic: 'easier',
  intermediate: 'normal',
  advanced: 'harder',
  competitive: 'hardest',
};

/** Valoración máxima de puzle por nivel (PROVISIONAL); null: sin tope. Sin puzle bajo el tope se usa el banco. */
const MAX_PUZZLE_RATING: Record<Level, number | null> = {
  beginner: 800,
  initiation: 1000,
  basic: 1200,
  intermediate: 1500,
  advanced: 1800,
  competitive: null,
};

export function difficultyForLevel(level: Level): PuzzleDifficulty {
  return DIFFICULTY_BY_LEVEL[level];
}

export function maxRatingForLevel(level: Level): number | null {
  return MAX_PUZZLE_RATING[level];
}

/** Combinaciones que el depósito debe tener: cada tema de Lichess por cada dificultad que usa algún nivel. */
export const POOL_COMBOS: { theme: string; difficulty: PuzzleDifficulty }[] = [...new Set(Object.values(THEME_BY_CONCEPT))].flatMap((theme) =>
  [...new Set(Object.values(DIFFICULTY_BY_LEVEL))].map((difficulty) => ({ theme, difficulty })),
);

/** Posición propia guardada para repasar (error del alumno): contrato compartido cliente/servidor. */
export interface ReviewPosition {
  ply: number;
  conceptId: string;
  fen: string;
  bestUci: string;
}

/**
 * Reproduce el PGN completo de Lichess y comprueba que toda la línea de solución se puede jugar
 * (`solution[0]` es la jugada del alumno). Devuelve el FEN final y la línea, o null si algo falla.
 */
export function puzzleStart(pgn: string, solution: string[]): { fen: string; line: string[] } | null {
  try {
    if (!solution.length) return null;
    const moves = parseGame(pgn).moves;
    const fen = moves[moves.length - 1]!.fenAfter;
    const pos = Chess.fromSetup(parseFen(fen).unwrap()).unwrap();
    for (const uci of solution) {
      const m = parseUci(uci);
      if (!m || !pos.isLegal(m) || makeUci(m) !== uci) return null;
      pos.play(m);
    }
    return { fen, line: [...solution] };
  } catch {
    return null;
  }
}
