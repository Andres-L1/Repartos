import { pieceName, withArticle } from './explain.js';

/**
 * Textos de la mini lección del error (repaso de partidas). Español llano, tuteo, una idea por frase,
 * sin jerga. Las preguntas de la pausa se responden tocando una casilla del tablero ANTES de la jugada
 * del alumno; por eso casi todas empiezan por «Si juegas …»: piden imaginar la jugada antes de hacerla.
 */

/** Regla de una frase por concepto: un hábito que el alumno puede aplicar antes de cada jugada. */
const RULES: Record<string, string> = {
  'tactics.hanging_piece': 'Antes de mover, mira si tu pieza queda protegida.',
  'tactics.bad_exchange': 'Antes de cambiar, cuenta lo que das y lo que recibes.',
  'tactics.fork': 'Antes de mover, mira si una pieza rival puede atacar dos tuyas a la vez.',
  'tactics.pin': 'Antes de mover, mira si alguna pieza tuya tapa a tu rey o a tu dama.',
  'tactics.mate_threat': 'Antes de mover, mira qué jaques puede darte el rival y cuáles puedes dar tú.',
  'tactics.discovered_attack': 'Antes de mover, mira qué piezas rivales tapan líneas hacia tu rey o tu dama.',
};

const FALLBACK_RULE = 'Antes de mover, mira qué puede hacer tu rival después.';

export function ruleFor(conceptId: string): string {
  return RULES[conceptId] ?? FALLBACK_RULE;
}

/** «Por qué importa»: una línea, sin jerga. */
const WHY: Record<string, string> = {
  'tactics.hanging_piece': 'Una pieza que nadie protege se pierde gratis, sin recibir nada a cambio.',
  'tactics.bad_exchange': 'Si das una pieza que vale más que la que recibes, sales perdiendo.',
  'tactics.fork': 'Con una sola jugada no puedes salvar dos piezas, así que pierdes una.',
  'tactics.pin': 'Una pieza que no se puede mover no puede escapar cuando la atacan.',
  'tactics.mate_threat': 'El jaque mate decide la partida: vale más que cualquier pieza.',
  'tactics.discovered_attack': 'Salen dos amenazas a la vez y solo puedes parar una.',
};

const FALLBACK_WHY = 'Esta jugada le dio ventaja a tu rival.';

export function whyFor(conceptId: string): string {
  return WHY[conceptId] ?? FALLBACK_WHY;
}

/** Material perdido en piezas, para quien todavía no piensa en peones de valor. */
export function lossInPieces(cp: number): string {
  const n = Math.round(Math.abs(cp) / 100);
  if (n <= 1) return 'un peón';
  if (n === 2) return 'dos peones';
  if (n === 3) return 'un alfil o un caballo';
  if (n === 4) return 'algo más que un alfil o un caballo';
  if (n === 5) return 'una torre';
  if (n <= 7) return 'más que una torre';
  if (n === 8) return 'casi la dama';
  if (n === 9) return 'la dama';
  return 'más que la dama';
}

/** «tu dama», «tu caballo». */
const yours = (role: string): string => `tu ${pieceName(role)}`;
/** «la dama rival», «el caballo rival». */
const theirs = (role: string): string => `${withArticle(role)} rival`;

/** Preguntas de la pausa. Cada una tiene una única respuesta comprobable en una casilla de la evidencia. */
export const PAUSE = {
  /** Pieza colgada que no se movió: la respuesta es la casilla de esa pieza. */
  hangingStill: (move: string) => `Si juegas ${move}, ¿qué pieza tuya se puede comer gratis el rival?`,
  /** Pieza colgada recién movida: la respuesta es la pieza rival que la captura. */
  hangingMoved: (move: string, role: string, square: string) =>
    `Si juegas ${move}, ¿qué pieza rival puede comerse gratis ${yours(role)} en ${square}?`,
  /** Cambio malo sobre una pieza que ya estaba en su casilla: la respuesta es esa pieza. */
  exchangeStill: (move: string) => `Si juegas ${move}, ¿qué pieza tuya puede capturar el rival saliendo ganando?`,
  /** Cambio malo al llevar una pieza a una casilla atacada: la respuesta es la pieza rival que captura primero. */
  exchangeMoved: (move: string, role: string, square: string) =>
    `Si juegas ${move}, ¿qué pieza rival puede capturar ${yours(role)} en ${square}?`,
  /** Horquilla: la respuesta es la casilla desde la que la pieza rival ataca dos piezas. */
  fork: (move: string, forker: string) =>
    `Si juegas ${move}, ¿a qué casilla puede ir ${theirs(forker)} para atacar dos piezas tuyas a la vez?`,
  /** Clavada: la respuesta es la pieza clavada. */
  pin: (move: string, behind: string) =>
    `Si juegas ${move}, ¿qué pieza tuya no podrá moverse porque está tapando a ${yours(behind)}?`,
  /** Mate del rival en una jugada: la respuesta es la casilla del mate. */
  mateAllowed: (move: string, mater: string) =>
    `Si juegas ${move}, ¿en qué casilla puede darte jaque mate ${theirs(mater)}?`,
  /** Mate propio en una jugada desaprovechado: la respuesta es la pieza que da mate. */
  mateMissed1: () => 'Aquí puedes dar jaque mate en una jugada. ¿Con qué pieza?',
  /** Mate propio en varias jugadas desaprovechado: la respuesta es la pieza que empieza. */
  mateMissedN: () => 'Aquí tienes una serie de jaques que acaba en jaque mate. ¿Con qué pieza empiezas?',
  /** Ataque a la descubierta: la respuesta es la pieza rival que se aparta. */
  discovered: (move: string, target: string) =>
    `Si juegas ${move}, ¿qué pieza rival puede apartarse y destapar un ataque contra ${yours(target)}?`,
};

/** «Qué debías hacer»: la jugada mejor en una frase. */
export const BEST = {
  plain: (san: string) => `Una jugada mejor era ${san}.`,
  mate1: (san: string) => `Con ${san} dabas jaque mate y ganabas la partida.`,
  mateN: (san: string) => `Con ${san} empezaba un ataque que terminaba en jaque mate.`,
};
