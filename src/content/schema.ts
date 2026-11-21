/**
 * Esquema del contenido educativo (spec §5.2): introducción, explicación, práctica, corrección y evaluación.
 * Las posiciones se verifican por código en test/content/. Textos en español.
 */
import type { Level } from '../types.js';
import type { Branch } from '../shared/moves.js';

export type { Branch };
/** Tope de ramas por ejercicio: el árbol de variantes es pequeño y acotado (se comprueba en test/content). */
export const MAX_BRANCHES = 6;

export interface BoardMark {
  /** Casillas a resaltar, ej. ['e4']. */
  squares?: string[];
  /** Flechas como pares de casillas, ej. [['e2','e4']]. */
  arrows?: [string, string][];
}

/** Paso de explicación sobre un tablero: el alumno lee y a veces interactúa. */
export interface ExplainStep extends BoardMark {
  fen: string;
  text: string;
}

/** Ejercicio con jugadas obligadas. El alumno mueve primero. */
export interface PracticeStep extends BoardMark {
  fen: string;
  prompt: string;
  /** Línea correcta en UCI alternando alumno/rival (jugadas pares del rival se juegan solas). */
  solutionUci: string[];
  /**
   * Otras jugadas aceptadas en la última jugada del alumno (UCI), verificadas con motor como igual de buenas.
   * Si la solución da mate, además vale cualquier mate (src/shared/moves.ts).
   */
  alt?: string[];
  /**
   * Alternativas en las jugadas INTERMEDIAS del alumno (`alt` solo vale en la última). Cada rama trae su
   * continuación completa precalculada y verificada (el rival responde según la posición, no según la línea
   * principal); ver `Branch` en src/shared/moves.ts. Como mucho MAX_BRANCHES.
   */
  branches?: Branch[];
  hint?: string;
  /** Corrección: explicación mostrada tras acertar o fallar. */
  explanationCorrect: string;
  /** Mensaje genérico de fallo; opcional por jugada incorrecta frecuente (UCI -> texto). */
  explanationWrong: string;
  wrongByMove?: Record<string, string>;
}

export interface Lesson {
  id: string; // ej. 'u01.l01'
  unitId: string;
  title: string;
  /** Qué sabrá hacer el alumno al terminar. */
  objective: string;
  /** conceptos de src/pedagogy/concepts.ts que trabaja, si aplica. */
  conceptIds?: string[];
  /** 1. Introducción: para qué sirve. */
  intro: string;
  /** 2. Explicación con tablero. */
  explanation: ExplainStep[];
  /** 3-4. Práctica con corrección. */
  practice: PracticeStep[];
  /** 5. Evaluación: situaciones NUEVAS, no repetidas de la práctica. */
  evaluation: PracticeStep[];
  /** Mínimo de aciertos en la evaluación para completar (por defecto, todos menos uno). */
  passMark?: number;
}

export interface Unit {
  id: string; // 'u01'
  order: number;
  title: string;
  description: string;
  level: Level;
  /** Unidades que deben estar completadas para desbloquear esta (vacío = abierta). */
  requires: string[];
  lessons: Lesson[];
}
