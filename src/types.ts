/**
 * Contratos compartidos entre las 4 capas de Chedex Pulse.
 * Capa 1 (analysis) -> Capa 2 (diagnosis) -> Capa 3 (pedagogy) -> Capa 4 (recomendación).
 * Cada capa solo depende de este archivo, nunca de otra capa, para poder sustituir librerías.
 */

export type Level =
  | 'beginner' // 0-400
  | 'initiation' // 400-800
  | 'basic' // 800-1100
  | 'intermediate' // 1100-1400
  | 'advanced' // 1400-1700
  | 'competitive'; // 1700-2000

export type Color = 'white' | 'black';

/** Evaluación SIEMPRE desde el punto de vista de las blancas. Exactamente uno de cp/mate. */
export interface Score {
  cp?: number; // centipeones
  mate?: number; // >0 mate a favor de blancas en N, <0 a favor de negras
}

export type MoveClass = 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';

/** Salida de la Capa 1: una jugada de la partida ya analizada. */
export interface AnalyzedMove {
  ply: number; // 1 = primera jugada de blancas
  color: Color; // quien jugó
  fenBefore: string;
  fenAfter: string;
  san: string;
  uci: string;
  scoreBefore: Score; // eval de la posición antes de la jugada (mejor juego)
  scoreAfter: Score; // eval tras la jugada realmente jugada
  bestUci: string;
  bestSan: string;
  /** Variante principal del motor desde fenBefore (UCI), empezando por bestUci. */
  pv: string[];
  /** Variante del motor desde fenAfter (UCI): la refutación de lo jugado. */
  pvAfter: string[];
  /** Pérdida en centipeones para quien jugó (>=0). Mates se topan en 1000. */
  cpLoss: number;
  classification: MoveClass;
}

export type ErrorType =
  | 'hanging_piece' // pérdida de piezas por falta de defensa
  | 'bad_exchange' // intercambio desfavorable
  | 'fork' // ataque doble
  | 'pin' // clavada
  | 'mate_threat' // amenaza de mate / mate desaprovechado
  | 'discovered_attack'; // jaque / ataque a la descubierta (añadido en la corrección de la validación Fase 1)

/** Salida de la Capa 2: causa VERIFICADA de un error. Si no hay certeza, no se emite. */
export interface Diagnosis {
  type: ErrorType;
  ply: number;
  color: Color; // quien cometió el error
  /** Frase factual y verificada, sin pedagogía. Ej: "El caballo en f3 queda sin defensa y es capturado por ...". */
  fact: string;
  /** Datos concretos comprobados con la librería de ajedrez. */
  evidence: {
    squares: string[]; // casillas implicadas, ej. ['f3','e5']
    pieces: string[]; // ej. ['knight','queen']
    refutationUci?: string; // jugada que castiga el error
    materialLostCp?: number;
  };
  /** ids de la biblioteca de conceptos. */
  conceptIds: string[];
}

/** Salida de la Capa 3. */
export interface Explanation {
  conceptId: string;
  level: Level;
  title: string;
  text: string; // texto en español adaptado al nivel
  verified: boolean; // false => solo se muestra análisis del motor, sin causa
}

/** Concepto de la biblioteca pedagógica (spec §7.2). */
export interface Concept {
  id: string;
  category: string;
  name: string;
  definition: string;
  recommendedLevel: Level;
  learningObjectives: string[];
  detection: string; // descripción de las condiciones de detección
  explanations: Record<Level, string>; // plantillas por nivel, con {placeholders}
  exerciseIds: string[];
  evaluationCriteria: string[];
}

export interface Exercise {
  id: string;
  conceptId: string;
  level: Level;
  fen: string;
  prompt: string; // enunciado en español
  solutionUci: string[]; // línea de solución (el jugador mueve primero)
  hint?: string;
}

/** Resultado final de la Fase 1 por cada error relevante. */
export interface TrainingItem {
  move: AnalyzedMove;
  diagnosis: Diagnosis | null; // null => no se pudo determinar causa fiable
  explanation: Explanation;
  exercises: Exercise[];
}
