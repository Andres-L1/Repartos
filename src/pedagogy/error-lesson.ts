import { attacks, between } from 'chessops/attacks';
import type { Chess } from 'chessops/chess';
import type { Move, Role, Square } from 'chessops/types';
import { makeSquare, parseSquare } from 'chessops/util';
import { VALUE, canCaptureOn, findPins, loadPosition, playLine, replayAsThreat, type Step } from '../diagnosis/chess-utils.js';
import type { KeyError } from '../review/types.js';
import type { Level } from '../types.js';
import { sanIn } from './explain.js';
import { BEST, HAPPENED, PAUSE, lossInPieces, ruleFor, whyFor } from './review-copy.js';

export interface LessonArrow {
  from: string;
  to: string;
  tone: 'bad' | 'good';
}

/**
 * Mini lección de un error clave, en 5 momentos: (1) la posición antes de la jugada (fenBefore),
 * (2) una pausa opcional en la que el alumno toca una casilla, (3) qué pasó, (4) por qué importa y
 * (5) qué debía hacer, con la jugada mejor y la regla de una frase.
 */
export interface ErrorLesson {
  gameId: string;
  ply: number;
  conceptId: string;
  fenBefore: string;
  yourMoveSan: string;
  /** Solo existe si de la evidencia sale una casilla comprobable y única; si no, la interfaz se la salta. */
  pause?: { question: string; correctSquares: string[] };
  happened: { text: string; arrows: LessonArrow[]; circles: string[] };
  why: string;
  best: { uci: string; san: string; text: string };
  rule: string;
}

type Pause = ErrorLesson['pause'];

const arrow = (uci: string, tone: LessonArrow['tone']): LessonArrow => ({ from: uci.slice(0, 2), to: uci.slice(2, 4), tone });

function pieceAt(pos: Chess | null, square: string): { role: Role; color: string } | undefined {
  const s = parseSquare(square);
  return pos && s !== undefined ? pos.board.get(s) : undefined;
}

/** Jugadas legales del bando que mueve (las promociones, a dama). */
function legalMoves(pos: Chess): Move[] {
  const out: Move[] = [];
  for (const [from, dests] of pos.allDests()) {
    const pawn = pos.board.get(from)?.role === 'pawn';
    for (const to of dests) {
      const lastRank = to >> 3 === 0 || to >> 3 === 7;
      out.push(pawn && lastRank ? { from, to, promotion: 'queen' } : { from, to });
    }
  }
  return out;
}

function after(pos: Chess, m: Move): Chess {
  const next = pos.clone();
  next.play(m);
  return next;
}

/** Casillas desde las que el bando que mueve en `pos` puede capturar legalmente en `square`. */
function capturersOn(pos: Chess, square: string): string[] {
  const target = parseSquare(square);
  if (target === undefined) return [];
  return legalMoves(pos)
    .filter((m) => 'from' in m && m.to === target)
    .map((m) => makeSquare((m as { from: Square }).from));
}

/** Piezas (no rey) del bando que NO mueve en `pos` que el rival puede capturar sin recaptura posible. */
function freeCaptures(pos: Chess): Set<string> {
  const victims = pos.board[pos.turn === 'white' ? 'black' : 'white'];
  const out = new Set<string>();
  for (const m of legalMoves(pos)) {
    if (!victims.has(m.to) || pos.board.get(m.to)?.role === 'king') continue;
    if (!canCaptureOn(after(pos, m), m.to)) out.add(makeSquare(m.to));
  }
  return out;
}

/**
 * Lo que gana el bando que mueve con la mejor serie de capturas sobre `target` (cambio estático con
 * jugadas legales; cada bando puede dejar de capturar). En piezas: peón 1, caballo/alfil 3, torre 5, dama 9.
 */
function exchangeGain(pos: Chess, target: Square, depth = 8): number {
  const victim = pos.board.get(target);
  if (!victim || victim.color === pos.turn || depth === 0) return 0;
  let best = 0;
  for (const m of legalMoves(pos)) {
    if (m.to !== target) continue;
    best = Math.max(best, VALUE[victim.role] - exchangeGain(after(pos, m), target, depth - 1));
  }
  return best;
}

/** Piezas (no rey) del bando que NO mueve que el rival puede capturar saliendo ganando material. */
function winningCaptures(pos: Chess): Set<string> {
  const victims = pos.board[pos.turn === 'white' ? 'black' : 'white'];
  const out = new Set<string>();
  for (const s of victims) {
    if (pos.board.get(s)?.role === 'king') continue;
    if (exchangeGain(pos, s) > 0) out.add(makeSquare(s));
  }
  return out;
}

/**
 * Casillas a las que una pieza rival del tipo `role` puede ir para atacar a la vez dos piezas del alumno
 * que de verdad estén en peligro (el rey, una pieza de más valor que la atacante o una pieza sin defensa):
 * el mismo criterio que la regla de horquilla del diagnóstico.
 */
function forkSquares(pos: Chess, role: Role): Set<string> {
  const me = pos.turn === 'white' ? 'black' : 'white';
  const out = new Set<string>();
  for (const m of legalMoves(pos)) {
    if (!('from' in m) || pos.board.get(m.from)?.role !== role) continue;
    const next = after(pos, m);
    const piece = next.board.get(m.to)!;
    let targets = 0;
    for (const t of attacks(piece, m.to, next.board.occupied).intersect(next.board[me])) {
      const p = next.board.get(t)!;
      const undefended = next.kingAttackers(t, me, next.board.occupied).isEmpty();
      if (p.role === 'king' || VALUE[p.role] > VALUE[piece.role] || (undefended && VALUE[p.role] >= 1)) targets++;
    }
    if (targets >= 2) out.add(makeSquare(m.to));
  }
  return out;
}

/**
 * Piezas rivales (del bando que mueve) que tapan la línea de una pieza rival de largo alcance hacia
 * `target` y pueden apartarse de esa línea con una jugada legal.
 */
function discoveryBlockers(pos: Chess, target: Square): Set<string> {
  const them = pos.turn;
  const occ = pos.board.occupied;
  const dests = pos.allDests();
  const out = new Set<string>();
  for (const [slider, piece] of pos.board) {
    if (piece.color !== them || (piece.role !== 'bishop' && piece.role !== 'rook' && piece.role !== 'queen')) continue;
    const line = between(slider, target);
    const inLine = line.intersect(occ);
    if (inLine.size() !== 1) continue;
    const blocker = inLine.first()!;
    if (pos.board.get(blocker)?.color !== them) continue;
    if (!attacks(piece, slider, occ.without(blocker)).has(target)) continue;
    const moves = dests.get(blocker);
    if (moves && moves.diff(line).nonEmpty()) out.add(makeSquare(blocker));
  }
  return out;
}

/** Casillas `from` (o `to`, según `key`) de las jugadas que dan jaque mate en `pos`, opcionalmente solo de un tipo de pieza. */
function matingMoves(pos: Chess, key: 'from' | 'to', role?: Role): Set<string> {
  const out = new Set<string>();
  for (const m of legalMoves(pos)) {
    if (!('from' in m)) continue;
    if (role && pos.board.get(m.from)?.role !== role) continue;
    if (after(pos, m).isCheckmate()) out.add(makeSquare(key === 'from' ? m.from : m.to));
  }
  return out;
}

const onlyIn = (set: Set<string> | string[], square: string): boolean => {
  const list = [...set];
  return list.length === 1 && list[0] === square;
};

/** ¿La refutación del diagnóstico es una jugada del alumno desde fenBefore? (mate propio desaprovechado) */
const isOwnMove = (err: KeyError): boolean => {
  const ref = err.diagnosis.evidence.refutationUci;
  return !!ref && sanIn(err.move.fenBefore, ref) !== undefined;
};

/**
 * Pregunta de la pausa según el tipo de error. La respuesta siempre es una casilla de evidence.squares y
 * se comprueba en el tablero que sea la única respuesta correcta a la pregunta; si no, no hay pausa.
 */
function buildPause(err: KeyError, pos0: Chess | null, pos1: Chess | null): Pause {
  const { move, diagnosis: d } = err;
  const sq = d.evidence.squares;
  const pc = d.evidence.pieces;
  const san = move.san;
  const from = move.uci.slice(0, 2);
  const dest = move.uci.slice(2, 4);
  const mine = (square: string, role?: string) => {
    const p = pieceAt(pos0, square);
    return !!p && p.color === move.color && (role === undefined || p.role === role);
  };
  if (!pos0 || !pos1) return undefined;

  switch (d.type) {
    case 'hanging_piece': {
      const [victim, attacker] = sq;
      const role = pc[0];
      if (!victim || !attacker || !role) return undefined;
      if (dest === victim) {
        // La pieza colgada es la que acaba de moverse: ¿quién se la come? (una sola pieza rival puede)
        if (!onlyIn(capturersOn(pos1, victim), attacker)) return undefined;
        return { question: PAUSE.hangingMoved(san, role, victim), correctSquares: [attacker] };
      }
      if (!mine(victim, role) || !onlyIn(freeCaptures(pos1), victim)) return undefined;
      return { question: PAUSE.hangingStill(san), correctSquares: [victim] };
    }
    case 'bad_exchange': {
      const [square, first] = sq;
      if (!square || !first) return undefined;
      // El cambio lo empieza tu captura: la casilla clave (quién recaptura) no está en la evidencia.
      if (first === from) return undefined;
      if (dest === square) {
        const role = pieceAt(pos1, square)?.role;
        if (!role || !onlyIn(capturersOn(pos1, square), first)) return undefined;
        return { question: PAUSE.exchangeMoved(san, role, square), correctSquares: [first] };
      }
      // La pieza ya estaba ahí: debe ser la única pieza tuya que el rival captura saliendo ganando.
      if (!mine(square) || !onlyIn(winningCaptures(pos1), square)) return undefined;
      return { question: PAUSE.exchangeStill(san), correctSquares: [square] };
    }
    case 'fork': {
      const [forkSquare] = sq;
      const forker = pc[0] as Role | undefined;
      if (!forkSquare || !forker || !onlyIn(forkSquares(pos1, forker), forkSquare)) return undefined;
      return { question: PAUSE.fork(san, forker), correctSquares: [forkSquare] };
    }
    case 'pin': {
      const [pinner, pinned, behind] = sq;
      const pinnedRole = pc[1];
      const behindRole = pc[2];
      if (!pinner || !pinned || !behind || !pinnedRole || !behindRole) return undefined;
      // La clavada debe existir ya tras tu jugada, ser la única pieza tuya clavada y estar en el tablero inicial.
      const pins = findPins(pos1, move.color);
      const same = pins.some((p) => makeSquare(p.pinner) === pinner && makeSquare(p.pinned) === pinned && makeSquare(p.behind) === behind);
      const pinnedSquares = new Set(pins.map((p) => p.pinned));
      if (!same || pinnedSquares.size !== 1 || !mine(pinned, pinnedRole)) return undefined;
      return { question: PAUSE.pin(san, behindRole), correctSquares: [pinned] };
    }
    case 'mate_threat': {
      const [mFrom, mTo] = sq;
      const ref = d.evidence.refutationUci;
      if (!mFrom || !mTo || !ref) return undefined;
      if (isOwnMove(err)) {
        // Mate propio desaprovechado: solo el mate en una jugada, y solo si una única pieza puede darlo.
        // (Un mate en varias jugadas puede empezar de más de una forma: no se pregunta.)
        if (!onlyIn(matingMoves(pos0, 'from'), mFrom)) return undefined;
        return { question: PAUSE.mateMissed1(), correctSquares: [mFrom] };
      }
      // Mate del rival en una jugada (la jugada de mate es la refutación) y única casilla de mate de esa pieza.
      const mater = pc[0] as Role | undefined;
      if (!mater || !ref.startsWith(mFrom + mTo) || !onlyIn(matingMoves(pos1, 'to', mater), mTo)) return undefined;
      return { question: PAUSE.mateAllowed(san, mater), correctSquares: [mTo] };
    }
    case 'discovered_attack': {
      const [, blocker, , target] = sq;
      const targetRole = pc[2];
      const t = target ? parseSquare(target) : undefined;
      if (!blocker || !target || t === undefined || !targetRole) return undefined;
      if (!onlyIn(discoveryBlockers(pos1, t), blocker)) return undefined;
      return { question: PAUSE.discovered(san, targetRole, target), correctSquares: [blocker] };
    }
    default:
      return undefined;
  }
}

/** Cadena de capturas sobre `square` (tu captura inicial, si la hay, y las de la línea del motor). */
function exchangeChain(pos0: Chess, pos1: Chess, err: KeyError, square: Square): Step[] {
  const chain: Step[] = [];
  const played = playLine(pos0, [err.move.uci], 1)[0];
  if (played?.captured && played.to === square) chain.push(played);
  for (const s of playLine(pos1, err.move.pvAfter)) {
    if (s.captured && s.to === square && s.captured.square === square) chain.push(s);
    else break;
  }
  return chain;
}

/** «Qué pasó»: frase para principiantes construida con la evidencia (nunca la frase técnica del diagnóstico). */
function happenedText(err: KeyError, pos0: Chess | null, pos1: Chess | null): string {
  const { move, diagnosis: d } = err;
  const sq = d.evidence.squares;
  const pc = d.evidence.pieces;
  const fallback = whyFor('');
  switch (d.type) {
    case 'hanging_piece': {
      const [victim, attacker] = sq;
      const [role, attackerRole] = pc;
      const ref = d.evidence.refutationUci;
      if (!victim || !attacker || !role || !attackerRole) return fallback;
      if (move.uci.slice(2, 4) === victim) return HAPPENED.hangingMoved(role, victim, attackerRole, attacker);
      // ¿Ya estaba atacada y sin defensa antes de tu jugada? (misma comprobación que el diagnóstico)
      const t = pos0 && ref && move.uci.slice(0, 2) !== victim ? replayAsThreat(pos0, [ref])?.[0] : undefined;
      const threatened =
        !!t?.captured && makeSquare(t.captured.square) === victim && t.captured.role === role && !canCaptureOn(t.pos, t.to);
      return (threatened ? HAPPENED.hangingThreatened : HAPPENED.hangingLeft)(role, victim, attackerRole, attacker);
    }
    case 'bad_exchange': {
      const [square] = sq;
      const s = square ? parseSquare(square) : undefined;
      if (!square || s === undefined) return fallback;
      const chain = pos0 && pos1 ? exchangeChain(pos0, pos1, err, s) : [];
      if (chain.length < 2) return HAPPENED.exchangeGeneric(square);
      const given = chain.filter((x) => x.color !== move.color).map((x) => x.captured!.role);
      const received = chain.filter((x) => x.color === move.color).map((x) => x.captured!.role);
      return HAPPENED.exchange(square, given, received);
    }
    case 'fork': {
      const [forkSquare, ...targets] = sq;
      const [forker, ...roles] = pc;
      if (!forkSquare || !forker) return fallback;
      return HAPPENED.fork(forker, forkSquare, targets.map((square, i) => ({ square, role: roles[i] ?? '' })));
    }
    case 'pin': {
      const [pinner, pinned, behind] = sq;
      const [pinnerRole, pinnedRole, behindRole] = pc;
      if (!pinner || !pinned || !behind || !pinnerRole || !pinnedRole || !behindRole) return fallback;
      return behindRole === 'king'
        ? HAPPENED.pinKing(pinnedRole, pinned, pinnerRole, pinner)
        : HAPPENED.pinPiece(pinnedRole, pinned, pinnerRole, pinner, behindRole, behind);
    }
    case 'mate_threat': {
      const [mFrom, mTo] = sq;
      const role = pc[0];
      const ref = d.evidence.refutationUci;
      if (!mFrom || !mTo || !role || !ref) return fallback;
      if (isOwnMove(err)) {
        const mate1 = !!pos0 && !!playLine(pos0, [ref], 1)[0]?.pos.isCheckmate();
        return mate1 ? HAPPENED.mateMissed1(role, mFrom, mTo, move.san) : HAPPENED.mateMissedN(role, mFrom, move.san);
      }
      return ref.startsWith(mFrom + mTo) ? HAPPENED.mateAllowed1(move.san, role, mTo) : HAPPENED.mateAllowedN(move.san, role, mTo);
    }
    case 'discovered_attack': {
      const [slider, from, to, target] = sq;
      const [sliderRole, movedRole, targetRole] = pc;
      if (!slider || !from || !to || !target || !sliderRole || !movedRole || !targetRole) return fallback;
      const lost = d.evidence.materialLostCp;
      return HAPPENED.discovered(movedRole, from, to, sliderRole, slider, targetRole, target, lost ? lossInPieces(lost) : undefined);
    }
    default:
      return fallback;
  }
}

/** Casillas que se marcan con un círculo en «qué pasó» (siempre de evidence.squares). */
function circlesFor(err: KeyError): string[] {
  const sq = err.diagnosis.evidence.squares;
  switch (err.diagnosis.type) {
    case 'hanging_piece':
    case 'bad_exchange':
      return sq.slice(0, 1);
    case 'fork':
      return sq.slice(1);
    case 'pin':
      return sq.slice(1, 2);
    case 'mate_threat':
      return sq.slice(2, 3);
    case 'discovered_attack':
      return sq.slice(3, 4);
    default:
      return [];
  }
}

/**
 * Construye la mini lección. Los textos están escritos para principiantes en todos los niveles (sin jerga,
 * material en piezas); `level` se mantiene en la firma para poder adaptar el tono más adelante.
 */
export function buildErrorLesson(err: KeyError, _level: Level): ErrorLesson {
  const { move, diagnosis: d } = err;
  const conceptId = d.conceptIds[0] ?? `tactics.${d.type}`;
  const pos0 = loadPosition(move.fenBefore);
  const pos1 = loadPosition(move.fenAfter);

  const bestSan = sanIn(move.fenBefore, move.bestUci) ?? move.bestSan;
  const ref = d.evidence.refutationUci;
  const missedMate = d.type === 'mate_threat' && ref === move.bestUci;
  const bestText = bestSan.endsWith('#') ? BEST.mate1(bestSan) : missedMate ? BEST.mateN(bestSan) : BEST.plain(bestSan);

  const arrows: LessonArrow[] = [arrow(move.uci, 'bad')];
  // La jugada del rival que castiga el error (si es suya: en un mate desaprovechado es la jugada mejor).
  if (ref && ref !== move.bestUci && sanIn(move.fenAfter, ref) !== undefined) arrows.push(arrow(ref, 'bad'));
  arrows.push(arrow(move.bestUci, 'good'));

  const pause = buildPause(err, pos0, pos1);
  return {
    gameId: err.gameId,
    ply: move.ply,
    conceptId,
    fenBefore: move.fenBefore,
    yourMoveSan: move.san,
    ...(pause ? { pause } : {}),
    happened: { text: happenedText(err, pos0, pos1), arrows, circles: circlesFor(err) },
    why: whyFor(conceptId),
    best: { uci: move.bestUci, san: bestSan, text: bestText },
    rule: ruleFor(conceptId),
  };
}
