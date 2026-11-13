import { capitalize, joinList, pieceName, withArticle } from './explain.js';

/**
 * Textos de la mini lección del error (repaso de partidas). Español llano, tuteo, una idea por frase,
 * sin jerga. Las preguntas de la pausa se responden tocando una casilla del tablero ANTES de la jugada
 * del alumno; por eso casi todas empiezan por «Si mueves …»: piden imaginar la jugada antes de hacerla.
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

// --- Gramática: género y número de las piezas («el alfil», «la dama»; «atacado», «atacada»). ---

const FEMININE = new Set(['rook', 'queen']);
const PLURAL: Record<string, string> = {
  pawn: 'peones',
  knight: 'caballos',
  bishop: 'alfiles',
  rook: 'torres',
  queen: 'damas',
  king: 'reyes',
};
const NUMBER = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho'];

const fem = (role: string): boolean => FEMININE.has(role);
/** «tu dama», «tu caballo». */
const yours = (role: string): string => `tu ${pieceName(role)}`;
/** «la dama rival», «el caballo rival». */
const theirs = (role: string): string => `${withArticle(role)} rival`;
/** Pronombre de objeto directo: «lo» / «la». */
const pron = (role: string): string => (fem(role) ? 'la' : 'lo');
/** «atacado» / «atacada». */
const agree = (stem: string, role: string): string => `${stem}${fem(role) ? 'a' : 'o'}`;

/** Agrupa piezas iguales: ['rook'] -> «tu torre» (o «una torre»); ['pawn', 'pawn'] -> «dos peones». */
function pieceList(roles: string[], single: 'yours' | 'indefinite'): string {
  const counts = new Map<string, number>();
  for (const r of roles) counts.set(r, (counts.get(r) ?? 0) + 1);
  return joinList(
    [...counts].map(([role, n]) => {
      if (n > 1) return `${NUMBER[n] ?? n} ${PLURAL[role] ?? pieceName(role)}`;
      if (single === 'yours') return yours(role);
      return `${fem(role) ? 'una' : 'un'} ${pieceName(role)}`;
    }),
  );
}

/**
 * Una jugada dicha con palabras, para que un principiante la entienda sin saber notación:
 * «mover la dama a d5», «capturar el peón de e5 con la torre», «enrocar corto». La notación de Lichess
 * (`san`) solo se añade entre paréntesis, y se omite cuando repetiría la casilla (un avance de peón: «g4»).
 */
export interface MoveWords {
  /** Infinitivo: «mover la dama a d5». */
  inf: string;
  /** Segunda persona, presente: «mueves la dama a d5». */
  you: string;
  /** Segunda persona, pasado: «moviste la dama a d5». */
  past: string;
  san?: string;
}

const paren = (w: MoveWords): string => (w.san ? ` (${w.san})` : '');
/** «mueves la dama a d5 (Qd5)». */
export const youMove = (w: MoveWords): string => `${w.you}${paren(w)}`;
/** «moviste la dama a d5 (Qd5)». */
export const youMoved = (w: MoveWords): string => `${w.past}${paren(w)}`;

/** Preguntas de la pausa. Cada una tiene una única respuesta comprobable en una casilla de la evidencia. */
export const PAUSE = {
  /** Pieza colgada que no se movió: la respuesta es la casilla de esa pieza. */
  hangingStill: (w: MoveWords) => `Si ${youMove(w)}, ¿qué pieza tuya puede comerse gratis el rival?`,
  /** Pieza colgada recién movida: la respuesta es la pieza rival que la captura. */
  hangingMoved: (w: MoveWords, role: string, square: string) =>
    `Si ${youMove(w)}, ¿qué pieza rival puede comerse gratis ${yours(role)} en ${square}?`,
  /** Cambio malo sobre una pieza que ya estaba en su casilla: la respuesta es esa pieza. */
  exchangeStill: (w: MoveWords) => `Si ${youMove(w)}, ¿qué pieza tuya puede capturar el rival saliendo ganando?`,
  /** Cambio malo al llevar una pieza a una casilla atacada: la respuesta es la pieza rival que captura primero. */
  exchangeMoved: (w: MoveWords, role: string, square: string) =>
    `Si ${youMove(w)}, ¿qué pieza rival puede capturar ${yours(role)} en ${square}?`,
  /** Horquilla: la respuesta es la casilla desde la que la pieza rival ataca dos piezas y gana una. */
  fork: (w: MoveWords, forker: string) =>
    `Si ${youMove(w)}, ¿a qué casilla puede ir ${theirs(forker)} para atacar dos piezas tuyas a la vez y ganarte una?`,
  /** Clavada: la respuesta es la pieza clavada. */
  pin: (w: MoveWords, behind: string) =>
    `Si ${youMove(w)}, ¿qué pieza tuya no podrá moverse porque está tapando a ${yours(behind)}?`,
  /** Mate del rival en una jugada: la respuesta es la casilla del mate. */
  mateAllowed: (w: MoveWords, mater: string) =>
    `Si ${youMove(w)}, ¿en qué casilla puede darte jaque mate ${theirs(mater)}?`,
  /** Mate propio en una jugada desaprovechado: la respuesta es la pieza que da mate. */
  mateMissed1: () => 'Aquí puedes dar jaque mate en una jugada. ¿Con qué pieza?',
  /** Ataque a la descubierta: la respuesta es la pieza rival que se aparta. */
  discovered: (w: MoveWords, target: string, square: string) =>
    `Si ${youMove(w)}, ¿qué pieza rival puede apartarse y destapar un ataque contra ${yours(target)} en ${square}?`,
};

/**
 * «Qué pasó»: una frase para principiantes construida con la evidencia verificada del diagnóstico
 * (nunca con la frase técnica `diagnosis.fact`). Nombra la pieza y las casillas, concuerda en género
 * y no culpa al alumno.
 */
export const HAPPENED = {
  /** La pieza que acabas de mover queda sin protección. */
  hangingMoved: (role: string, square: string, attacker: string, from: string) =>
    `Tu ${pieceName(role)} en ${square} se queda sin protección, y ${theirs(attacker)} de ${from} ${pron(role)} captura gratis.`,
  /** La pieza ya estaba atacada y sin protección antes de tu jugada. */
  hangingThreatened: (role: string, square: string, attacker: string, from: string) =>
    `Tu ${pieceName(role)} en ${square} ya estaba ${agree('atacad', role)} y sin protección, y ${theirs(attacker)} de ${from} ${pron(role)} captura gratis.`,
  /** Tu jugada deja sin protección otra pieza. */
  hangingLeft: (role: string, square: string, attacker: string, from: string) =>
    `Después de tu jugada, tu ${pieceName(role)} en ${square} se queda sin protección, y ${theirs(attacker)} de ${from} ${pron(role)} captura gratis.`,
  /** Cambio en el que das más de lo que recibes. */
  exchange: (square: string, given: string[], received: string[]) =>
    received.length
      ? `En ${square} entregas ${pieceList(given, 'yours')} y solo recibes ${pieceList(received, 'indefinite')}.`
      : `En ${square} entregas ${pieceList(given, 'yours')} y no recibes nada a cambio.`,
  /** Cambio sin cadena reproducible (no debería ocurrir con un diagnóstico verificado). */
  exchangeGeneric: (square: string) => `En ${square} el cambio te sale mal: das más de lo que recibes.`,
  fork: (forker: string, square: string, targets: { role: string; square: string }[]) =>
    `${capitalize(theirs(forker))} va a ${square} y ataca a la vez ${joinList(targets.map((t) => `a ${yours(t.role)} en ${t.square}`))}.`,
  /**
   * Clavada contra el rey: dice por qué la pieza no puede moverse. La ganancia del rival solo se afirma
   * si el diagnóstico la verificó (`wins`).
   */
  pinKing: (pinned: string, square: string, pinner: string, pinnerSquare: string, wins: boolean) =>
    `Tu ${pieceName(pinned)} en ${square} no puede moverse, porque tu rey quedaría en jaque por ${theirs(pinner)} en ${pinnerSquare}${
      wins ? `, y el rival acaba ganando tu ${pieceName(pinned)}` : ''
    }.`,
  /** Clavada contra otra pieza: moverla dejaría atacada la pieza de detrás. */
  pinPiece: (pinned: string, square: string, pinner: string, pinnerSquare: string, behind: string, behindSquare: string, wins: boolean) =>
    `Tu ${pieceName(pinned)} en ${square} no debe moverse, porque dejaría a ${yours(behind)} en ${behindSquare} ${agree('atacad', behind)} por ${theirs(pinner)} en ${pinnerSquare}${
      wins ? `, y el rival acaba ganando tu ${pieceName(pinned)}` : ''
    }.`,
  mateAllowed1: (w: MoveWords, mater: string, square: string) =>
    `${capitalize(youMoved(w))} y ${theirs(mater)} da jaque mate en ${square}.`,
  mateAllowedN: (w: MoveWords, mater: string, square: string) =>
    `${capitalize(youMoved(w))} y el rival tiene una serie de jaques que acaba en jaque mate, con ${theirs(mater)} en ${square}.`,
  mateMissed1: (role: string, from: string, to: string, w: MoveWords) =>
    `Con ${yours(role)} de ${from} podías dar jaque mate en ${to}, y en su lugar ${youMoved(w)}.`,
  mateMissedN: (role: string, from: string, w: MoveWords) =>
    `Moviendo ${yours(role)} de ${from} empezabas una serie de jaques que acababa en jaque mate, y en su lugar ${youMoved(w)}.`,
  discovered: (
    moved: string,
    from: string,
    to: string,
    slider: string,
    sliderSquare: string,
    target: string,
    targetSquare: string,
    loss?: string,
  ) => {
    const attack = target === 'king' ? 'dando jaque a tu rey' : `atacando a ${yours(target)} en ${targetSquare}`;
    const tail = loss ? `; al final pierdes ${loss}` : '';
    return `${capitalize(theirs(moved))} se mueve de ${from} a ${to} y deja a ${theirs(slider)} en ${sliderSquare} ${attack}${tail}.`;
  },
  /** Sin datos suficientes en la evidencia: se nombra la jugada y, si la hay, la casilla clave. */
  fallback: (w: MoveWords, square?: string) =>
    `${capitalize(youMoved(w))} y tu rival sale ganando${square ? ` en ${square}` : ''}.`,
};

/** «Qué debías hacer»: la jugada mejor en una frase, con palabras y la notación entre paréntesis. */
export const BEST = {
  plain: (w: MoveWords) => `Una jugada mejor era ${w.inf}${paren(w)}.`,
  mate1: (w: MoveWords) => `Una jugada mejor era ${w.inf}, que daba jaque mate y ganaba la partida${paren(w)}.`,
  mateN: (w: MoveWords) => `Una jugada mejor era ${w.inf}${paren(w)}, que empezaba una serie de jaques que terminaba en jaque mate.`,
};
