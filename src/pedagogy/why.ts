/**
 * «Por qué» automático: generador propio, determinista y sin red. Todo lo que afirma sale de HECHOS de la posición
 * comprobados con chessops (captura, jaque, mate, pieza sin protección, ataque doble, clavada, material de la línea...).
 * Si no hay un hecho que contar no escribe nada: nunca hay relleno. Las plantillas de cada hecho son varias y se
 * eligen con un hash del FEN y la jugada, para que no suene siempre igual pero siempre igual en la misma posición.
 */
import { attacks, between } from 'chessops/attacks';
import type { Chess } from 'chessops/chess';
import type { Color, Role, Square } from 'chessops/types';
import { makeSquare, opposite } from 'chessops/util';
import { VALUE, canCaptureOn, findPins, loadPosition, playLine, settledLoss, withTurnFlipped, type Step } from '../diagnosis/chess-utils.js';

export const MAX_SENTENCES = 3;
export const MAX_CHARS = 300;
/** Una frase con este solapamiento de palabras (o más) con lo que el alumno ya leyó no se repite. */
export const OVERLAP_LIMIT = 0.6;

const NAME: Record<Role, string> = { pawn: 'peón', knight: 'caballo', bishop: 'alfil', rook: 'torre', queen: 'dama', king: 'rey' };
const FEM: Record<Role, boolean> = { pawn: false, knight: false, bishop: false, rook: true, queen: true, king: false };
const the = (r: Role) => `${FEM[r] ? 'la' : 'el'} ${NAME[r]}`;
const a = (r: Role) => `${FEM[r] ? 'una' : 'un'} ${NAME[r]}`;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const at = (r: Role, s: Square) => `${the(r)} en ${makeSquare(s)}`;
const lo = (r: Role) => (FEM[r] ? 'la' : 'lo');
const ado = (r: Role) => (FEM[r] ? 'amenazada' : 'amenazado');
const list = (xs: string[]) => (xs.length < 2 ? (xs[0] ?? '') : `${xs.slice(0, -1).join(', ')} y ${xs.at(-1)}`);

/** Hash estable (FNV-1a) para elegir plantilla: la misma posición y jugada dan siempre el mismo texto. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
const pick = <T>(variants: T[], seed: string): T => variants[hash(seed) % variants.length]!;

interface Piece {
  role: Role;
  sq: Square;
}
interface Capture {
  victim: Piece;
  attacker: Piece;
  /** El rival (el que pierde la pieza) puede recapturar en esa casilla. */
  recapture: boolean;
  /** Material neto que gana quien captura (peones), contando una recaptura. Siempre > 0 aquí. */
  gain: number;
}

/** Capturas que ganan material al bando que mueve en `pos`, contra piezas de `victimColor` (la mejor por pieza capturada). */
function winningCaptures(pos: Chess, victimColor: Color): Capture[] {
  const best = new Map<Square, Capture>();
  for (const [from, dests] of pos.allDests()) {
    const attacker = pos.board.get(from)!;
    for (const to of dests) {
      const victim = pos.board.get(to);
      if (!victim || victim.color !== victimColor || victim.role === 'king') continue;
      const next = pos.clone();
      next.play({ from, to, ...(attacker.role === 'pawn' && (to < 8 || to > 55) ? { promotion: 'queen' as const } : {}) });
      const recapture = canCaptureOn(next, to);
      const gain = VALUE[victim.role] - (recapture ? VALUE[attacker.role] : 0);
      const prev = best.get(to);
      if (gain > 0 && (!prev || gain > prev.gain)) best.set(to, { victim: { role: victim.role, sq: to }, attacker: { role: attacker.role, sq: from }, recapture, gain });
    }
  }
  return [...best.values()].sort((x, y) => y.gain - x.gain || x.victim.sq - y.victim.sq);
}

/** El bando que mueve en `pos` tiene mate en una jugada. */
function hasMateIn1(pos: Chess): boolean {
  for (const [from, dests] of pos.allDests()) {
    const piece = pos.board.get(from)!;
    for (const to of dests) {
      const next = pos.clone();
      next.play({ from, to, ...(piece.role === 'pawn' && (to < 8 || to > 55) ? { promotion: 'queen' as const } : {}) });
      if (next.isCheckmate()) return true;
    }
  }
  return false;
}

/** Piezas rivales (no reyes) que ataca la pieza de `sq` y que de verdad merece la pena atacar: sin ninguna protección o de más valor. */
function forkTargets(pos: Chess, sq: Square): Piece[] {
  const piece = pos.board.get(sq);
  if (!piece || piece.role === 'king') return [];
  const occ = pos.board.occupied;
  const out: Piece[] = [];
  for (const t of attacks(piece, sq, occ)) {
    const v = pos.board.get(t);
    if (!v || v.color === piece.color || v.role === 'king') continue;
    let defended = false;
    for (const [s, p] of pos.board) if (p.color === v.color && s !== t && attacks(p, s, occ).has(t)) defended = true;
    if (!defended || VALUE[v.role] > VALUE[piece.role]) out.push({ role: v.role, sq: t });
  }
  return out.sort((x, y) => x.sq - y.sq);
}

/** Una jugada ya reproducida: posiciones antes y después, datos de la pieza y bando. */
interface Played {
  before: Chess;
  after: Chess;
  step: Step;
  me: Color;
  castle: boolean;
  promoRole?: Role;
}

function play(fen: string, uci: string): Played | null {
  const before = loadPosition(fen);
  if (!before) return null;
  const step = playLine(before, [uci], 1)[0];
  if (!step) return null;
  const parsed = uci.length > 4 ? uci[4] : undefined;
  const promoRole = parsed ? ({ q: 'queen', r: 'rook', b: 'bishop', n: 'knight' } as const)[parsed as 'q'] : undefined;
  return { before, after: step.pos, step, me: step.color, castle: step.san.startsWith('O-O'), ...(promoRole ? { promoRole } : {}) };
}

/** Casillas de las piezas que dan jaque al bando que mueve en `pos`. */
function checkersOf(pos: Chess) {
  const king = pos.board.kingOf(pos.turn);
  return king === undefined ? [] : [...pos.kingAttackers(king, opposite(pos.turn), pos.board.occupied)];
}

/** Quién da jaque tras la jugada, como piezas. */
function checkers(p: Played): Piece[] {
  return checkersOf(p.after).map((s) => ({ role: p.after.board.get(s)!.role, sq: s }));
}

/** Casilla de la pieza capturada por la jugada (la de destino, o la del peón capturado al paso). */
function capturedSquare(s: Step): Square | undefined {
  return s.captured?.square;
}

type Sentence = { kind: string; text: string };

/* ---------- hechos de la jugada que se debe hacer (o la mejor) ---------- */

function goodSentences(fen: string, line: string[], seed: string): Sentence[] {
  const p = play(fen, line[0] ?? '');
  if (!p) return [];
  const { step, before, after, me } = p;
  const out: Sentence[] = [];
  const P = the(step.role);
  const dest = makeSquare(step.to);
  const s = (kind: string, variants: string[]) => out.push({ kind, text: pick(variants, `${seed}|${kind}`) });
  const chk = checkers(p);

  if (after.isCheckmate()) {
    s('mate', [
      `${cap(P)} da jaque mate en ${dest}: el rey rival está atacado y ninguna jugada lo salva.`,
      `${cap(P)} da jaque mate en ${dest}: el rey rival no puede escapar, ni capturar la pieza que ataca, ni taparla.`,
      `Es jaque mate: ${P} en ${dest} ataca al rey y el rival no tiene ninguna jugada legal.`,
    ]);
  } else if (chk.length === 2) {
    s('doublecheck', [
      `Es jaque doble: ${the(chk[0]!.role)} y ${the(chk[1]!.role)} dan jaque a la vez, y el rival solo puede responder moviendo el rey.`,
      `${cap(P)} deja libre una línea y dan jaque dos piezas a la vez: ${the(chk[0]!.role)} y ${the(chk[1]!.role)}. Solo el rey puede moverse.`,
    ]);
  } else if (chk.length === 1 && chk[0]!.sq !== step.to) {
    s('discovered', [
      `Al moverse ${P}, deja libre la línea de ${the(chk[0]!.role)}, que da jaque al rey.`,
      `${cap(P)} se aparta y ${the(chk[0]!.role)} da jaque al descubierto.`,
    ]);
  }

  // Captura: sin recaptura posible, o de una pieza que vale más que la que captura.
  const cs = capturedSquare(step);
  if (step.captured && cs !== undefined && !after.isCheckmate()) {
    const tgt = at(step.captured.role, cs);
    const recapture = canCaptureOn(after, step.to);
    if (!recapture) {
      s('capture-free', [
        `${cap(P)} captura ${tgt} y el rival no puede recapturar.`,
        `${cap(P)} toma ${the(step.captured.role)} en ${dest} gratis: no hay ninguna pieza rival que pueda recapturar.`,
        `Con esa captura se gana ${the(step.captured.role)} sin perder nada, porque nadie puede recapturar en ${dest}.`,
      ]);
    } else if (VALUE[step.captured.role] > VALUE[step.role]) {
      s('capture-wins', [
        `${cap(P)} captura ${tgt}, que vale más. Aunque el rival recapture, se sale ganando.`,
        `${cap(the(step.captured.role))} vale más que ${P}: aunque haya recaptura, el cambio sale a favor.`,
      ]);
    }
  }

  // Ataque doble o amenaza sobre una pieza sin protección.
  const tg = after.isCheckmate() || p.castle || step.role === 'king' ? [] : forkTargets(after, step.to);
  const names = tg.map((t) => at(t.role, t.sq));
  if (tg.length >= 2 || (tg.length === 1 && after.isCheck())) {
    if (after.isCheck()) {
      s('fork', [
        `${cap(P)} da jaque y, a la vez, ataca ${list(names)}.`,
        `Con el jaque, ${P} en ${dest} también ataca ${list(names)}.`,
      ]);
    } else {
      s('fork', [
        `${cap(P)} en ${dest} ataca a la vez ${list(names)}.`,
        `Desde ${dest}, ${P} amenaza ${list(names)} al mismo tiempo.`,
        `Con esa jugada ${P} ataca dos cosas a la vez: ${list(names)}.`,
      ]);
    }
  } else if (tg.length === 1 && !step.captured) {
    const t = tg[0]!;
    let defended = false;
    for (const [sq2, pc] of after.board) if (pc.color !== me && sq2 !== t.sq && attacks(pc, sq2, after.board.occupied).has(t.sq)) defended = true;
    s('attack', [`${cap(P)} en ${dest} ataca ${at(t.role, t.sq)}, que ${defended ? `vale más que ${P}` : 'no tiene ninguna protección'}.`]);
  }

  if (after.isCheck() && !after.isCheckmate() && chk.length === 1 && chk[0]!.sq === step.to && tg.length === 0) {
    s('check', [
      `${cap(P)} da jaque desde ${dest}: el rival tiene que atender al rey antes que a nada.`,
      `${cap(P)} ataca al rey desde ${dest}, así que el rival está obligado a responder al jaque.`,
    ]);
  }

  // Clavada nueva creada por la pieza que se mueve.
  const oldPins = findPins(before, opposite(me));
  const pin = findPins(after, opposite(me)).find(
    (x) => x.pinner === step.to && !oldPins.some((o) => o.pinned === x.pinned && o.behind === x.behind),
  );
  if (pin && !after.isCheckmate())
    s('pin', [
      pin.absolute
        ? `${cap(the(pin.pinnerRole))} en ${dest} clava ${the(pin.pinnedRole)}: si se mueve, el rey rival quedaría en jaque.`
        : `${cap(the(pin.pinnerRole))} en ${dest} clava ${the(pin.pinnedRole)}: si se mueve, ${the(pin.behindRole)} quedaría atacada.`,
    ]);

  // Responder a un jaque.
  if (before.isCheck() && !after.isCheckmate()) {
    const wasChecker = [...checkersOf(before)].some((c) => c === capturedSquare(step));
    if (step.role === 'king') s('escape', [`El rey sale del jaque a una casilla que el rival no controla.`, `El rey se aparta del jaque hacia una casilla segura.`]);
    else if (wasChecker) s('capture-checker', [`${cap(P)} responde al jaque capturando la pieza que lo daba.`, `${cap(P)} quita el jaque capturando a ${the(step.captured!.role)} que atacaba al rey.`]);
    else s('block', [`${cap(P)} responde al jaque poniéndose en medio, entre el rey y la pieza que ataca.`, `${cap(P)} tapa el jaque en ${dest}, en la línea del ataque.`]);
  } else if (!after.isCheckmate()) {
    // Poner a salvo una pieza amenazada.
    const flipped = withTurnFlipped(before);
    if (flipped) {
      const stillAfter = winningCaptures(after, me);
      const saved = winningCaptures(flipped, me).find((t) => {
        const now = t.victim.sq === step.from ? step.to : t.victim.sq;
        return !stillAfter.some((x) => x.victim.sq === now);
      });
      if (saved) {
        const v = saved.victim.role;
        s('saves', [
          `${cap(at(v, saved.victim.sq))} estaba ${ado(v)} por ${the(saved.attacker.role)}; con esa jugada el rival ya no puede ganar${lo(v)}.`,
          `${cap(the(v))} en ${makeSquare(saved.victim.sq)} corría peligro por ${the(saved.attacker.role)} rival. Esa jugada ${lo(v)} deja a salvo.`,
        ]);
      }
    }
  }

  if (p.castle) {
    const kf = (step.to & 7) > 4 ? 6 : 2; // columna final del rey (g o c)
    const rank = me === 'white' ? 0 : 7;
    const dir = me === 'white' ? 1 : -1;
    let shield = 0;
    for (const f of [kf - 1, kf, kf + 1]) {
      const pc = after.board.get((rank + dir) * 8 + f);
      if (pc && pc.role === 'pawn' && pc.color === me) shield++;
    }
    if (shield >= 2)
      s('castle', [`El enroque guarda al rey detrás de sus peones y saca la torre de la esquina.`, `Al enrocar, el rey queda protegido tras sus peones y la torre entra en juego.`]);
    else s('castle', [`El enroque aleja al rey del centro y saca la torre de la esquina.`, `Al enrocar, el rey se pone a un lado y la torre sale de la esquina.`]);
  }

  if (p.promoRole && !after.isCheckmate()) s('promotion', [`El peón llega a la última fila y se convierte en ${the(p.promoRole)}.`, `El peón corona en ${dest}: ahora hay ${a(p.promoRole)} más en el tablero.`]);

  // Material de toda la secuencia correcta.
  if (line.length > 1) {
    const steps = playLine(before, line, 6);
    let lastCap = -1;
    steps.forEach((x, k) => { if (x.captured || x.promotion) lastCap = k; });
    const last = steps.at(-1);
    if (steps.length === line.length && last?.pos.isCheckmate() && last.color === me && !after.isCheckmate())
      s('mate-line', [`La secuencia termina en jaque mate.`, `Siguiendo esa línea, el rival acaba en jaque mate.`]);
    else if (lastCap >= 0 && -settledLoss(before, steps, me, 6) > 0) {
      const mine = steps.slice(0, lastCap + 1).filter((x) => x.color === me && x.captured).map((x) => a(x.captured!.role));
      const theirs = steps.slice(0, lastCap + 1).filter((x) => x.color !== me && x.captured).map((x) => a(x.captured!.role));
      if (mine.length > 1 || theirs.length > 0 || (mine.length === 1 && !step.captured))
        s('line-material', [
          `Siguiendo la secuencia, capturas ${list(mine)} y ${theirs.length ? `el rival solo captura ${list(theirs)}` : 'el rival no captura nada'}.`,
          `En la secuencia ganas ${list(mine)}${theirs.length ? ` y pierdes ${list(theirs)}` : ' sin perder nada'}.`,
        ]);
    }
  }
  return out;
}

/* ---------- hechos de la jugada equivocada o del error ---------- */

function badSentences(fen: string, uci: string, seed: string): Sentence[] {
  const p = play(fen, uci);
  if (!p) return [];
  const { step, before, after, me } = p;
  const out: Sentence[] = [];
  if (after.isEnd()) return out;
  const P = the(step.role);
  const s = (kind: string, variants: string[]) => out.push({ kind, text: pick(variants, `${seed}|${kind}`) });
  const flipped = withTurnFlipped(before);
  const threats = flipped ? winningCaptures(flipped, me) : [];

  if (hasMateIn1(after)) {
    const already = flipped ? hasMateIn1(flipped) : false;
    s('mate-allowed', already
      ? [`El rival ya amenazaba dar jaque mate en una jugada y esa jugada no lo evita.`, `Ya había un jaque mate en una jugada para el rival, y esa jugada no lo para.`]
      : [`Tras esa jugada, el rival puede dar jaque mate en una jugada.`, `Esa jugada deja al rival dar jaque mate en la siguiente.`]);
  }

  const caps = winningCaptures(after, me);
  const top = caps[0];
  if (top) {
    const moved = top.victim.sq === step.to;
    const old = !moved && threats.some((t) => t.victim.sq === top.victim.sq);
    const V = top.victim.role;
    const net = step.captured ? VALUE[step.captured.role] - top.gain : 0;
    if (moved && step.captured && net < 0)
      s('bad-trade', [
        `Capturar ${a(step.captured.role)} con ${P} sale caro: ${the(top.attacker.role)} rival recaptura y se pierde más de lo que se gana.`,
        `${cap(P)} captura ${a(step.captured.role)}, pero ${the(top.attacker.role)} rival puede capturar a ${P} después y el cambio sale perdiendo.`,
      ]);
    else if (old)
      s('ignored-threat', [
        `${cap(at(V, top.victim.sq))} ya estaba ${ado(V)} por ${the(top.attacker.role)} y esa jugada no ${lo(V)} puso a salvo.`,
        `${cap(the(V))} en ${makeSquare(top.victim.sq)} seguía en peligro: ${the(top.attacker.role)} rival podía capturar${lo(V)}.`,
      ]);
    else if (!top.recapture)
      s('hangs', moved
        ? [
            `${cap(P)} queda en ${makeSquare(step.to)} y ${the(top.attacker.role)} rival puede capturar${lo(V)} sin que se pueda recapturar.`,
            `En ${makeSquare(step.to)}, ${P} no tiene protección: ${the(top.attacker.role)} rival puede capturar${lo(V)} gratis.`,
          ]
        : [
            `Tras esa jugada, ${at(V, top.victim.sq)} queda sin protección: ${the(top.attacker.role)} rival puede capturar${lo(V)} gratis.`,
            `Esa jugada deja ${the(V)} en ${makeSquare(top.victim.sq)} sin defensa, y ${the(top.attacker.role)} rival puede capturar${lo(V)}.`,
          ]);
    else
      s('hangs-trade', [
        `${cap(the(top.attacker.role))} rival puede capturar ${at(V, top.victim.sq)}. Aunque se recapture, se pierde material.`,
        `Tras esa jugada, ${at(V, top.victim.sq)} se puede capturar con ${the(top.attacker.role)} y, aun recapturando, sale perdiendo.`,
      ]);
  }

  // El rival puede hacer un ataque doble seguro o descubrir un jaque capturando.
  let fork: { piece: Piece; targets: Piece[] } | undefined;
  let disc: { piece: Piece; victim: Piece; checker: Piece } | undefined;
  for (const [from, dests] of after.allDests()) {
    for (const to of dests) {
      const mover = after.board.get(from)!;
      const next = after.clone();
      const victim = after.board.get(to);
      next.play({ from, to, ...(mover.role === 'pawn' && (to < 8 || to > 55) ? { promotion: 'queen' as const } : {}) });
      if (!fork && !victim && mover.role !== 'king' && !next.isEnd() && !canCaptureOn(next, to)) {
        const t = forkTargets(next, to);
        if (t.length >= 2) fork = { piece: { role: mover.role, sq: to }, targets: t };
      }
      if (!disc && victim && victim.color === me && VALUE[victim.role] >= 3 && next.isCheck()) {
        const c = [...checkersOf(next)].filter((x) => x !== to);
        const king = next.board.kingOf(me);
        // el jaque lo abre la pieza al apartarse: su casilla de salida está entre el atacante y el rey
        if (c.length === 1 && king !== undefined && between(c[0]!, king).has(from)) disc = { piece: { role: mover.role, sq: to }, victim: { role: victim.role, sq: to }, checker: { role: next.board.get(c[0]!)!.role, sq: c[0]! } };
      }
    }
  }
  if (fork)
    s('fork-allowed', [
      `Tras esa jugada, el rival puede mover ${the(fork.piece.role)} a ${makeSquare(fork.piece.sq)} y atacar a la vez ${list(fork.targets.map((t) => at(t.role, t.sq)))}.`,
      `Esa jugada permite que ${the(fork.piece.role)} rival vaya a ${makeSquare(fork.piece.sq)} y amenace ${list(fork.targets.map((t) => at(t.role, t.sq)))} al mismo tiempo.`,
    ]);
  if (disc)
    s('discovered-allowed', [
      `El rival puede capturar ${at(disc.victim.role, disc.victim.sq)} y, al apartarse su ${NAME[disc.piece.role]}, ${the(disc.checker.role)} suya da jaque.`,
    ]);

  const oldPins = findPins(before, me);
  const pin = findPins(after, me).find((x) => !oldPins.some((o) => o.pinned === x.pinned && o.behind === x.behind));
  if (pin)
    s('pin-allowed', [
      pin.absolute
        ? `Tras esa jugada, ${the(pin.pinnerRole)} rival clava ${at(pin.pinnedRole, pin.pinned)}: no puede moverse sin dejar al rey en jaque.`
        : `Tras esa jugada, ${the(pin.pinnerRole)} rival clava ${at(pin.pinnedRole, pin.pinned)}: si se mueve, ${the(pin.behindRole)} queda atacada.`,
    ]);
  return out;
}

/* ---------- solapamiento con lo que el alumno ya ha leído ---------- */

const STOP = new Set(['tras', 'esta', 'esa', 'ese', 'para', 'pero', 'como', 'solo', 'cada', 'sobre', 'hacia', 'desde', 'puede', 'pueden', 'queda', 'quedan', 'donde', 'cuando', 'aunque', 'este', 'esto', 'estos', 'esas', 'ella', 'ellos', 'hace', 'muy', 'mas', 'tiene', 'tienen', 'cuando', 'porque', 'sin', 'con', 'una', 'uno', 'unos', 'unas', 'los', 'las', 'que', 'del']);
const words = (t: string): Set<string> =>
  new Set(
    t
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .split(/[^a-z0-9ñ]+/)
      .filter((w) => (w.length >= 4 || /^[a-h][1-8]$/.test(w)) && !STOP.has(w))
      // raíz tosca: «captura/captura­r/capturan» comparten las seis primeras letras
      .map((w) => (/^[a-h][1-8]$/.test(w) ? w : w.slice(0, 6))),
  );

/** Proporción de palabras de `sentence` que ya aparecen en alguno de los `known`. */
export function overlap(sentence: string, known: string[]): number {
  const w = words(sentence);
  if (w.size === 0) return 1;
  const k = new Set(known.flatMap((t) => [...words(t)]));
  let n = 0;
  for (const x of w) if (k.has(x)) n++;
  return n / w.size;
}

/** Une frases dentro del tope de frases y de caracteres; null si no queda ninguna. */
function assemble(sentences: string[]): string | null {
  const out: string[] = [];
  for (const t of sentences) {
    if (out.length >= MAX_SENTENCES) break;
    if ([...out, t].join(' ').length > MAX_CHARS) continue;
    out.push(t);
  }
  return out.length ? out.join(' ') : null;
}

const decap = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const fresh = (xs: Sentence[], known: string[]) => xs.filter((x) => overlap(x.text, known) < OVERLAP_LIMIT);

export interface LessonWhyInput {
  /** Posición en la que el alumno debe jugar (la de la jugada que se explica). */
  fen: string;
  /** Línea correcta desde `fen` (UCI, alternando alumno y rival). */
  line: string[];
  /** Jugada equivocada que acaba de hacer el alumno, si la hay. */
  played?: string;
  /** Textos que el alumno ya tiene delante (explicación del método, aviso de fallo): no se repiten. */
  known: string[];
}

/** «Por qué» de un paso de lección o evaluación: por qué vale la jugada correcta y, si hubo fallo, por qué falla la jugada hecha. */
export function whyLesson(i: LessonWhyInput): string | null {
  const seed = `${i.fen.split(' ').slice(0, 4).join(' ')}|${i.line[0] ?? ''}`;
  const bad = i.played ? fresh(badSentences(i.fen, i.played, `${seed}|${i.played}`), i.known).slice(0, 1) : [];
  const good = fresh(goodSentences(i.fen, i.line, seed), i.known);
  return assemble([...bad.map((x) => x.text), ...good.map((x) => x.text)]);
}

export interface ErrorWhyInput {
  /** Posición antes de la jugada del alumno. */
  fen: string;
  played: string;
  best: string;
  /** Línea del motor desde `fen` (empieza por la mejor jugada), si el cliente ya la calculó. */
  line?: string[];
  known: string[];
}

/** «Por qué» de un error de partida: qué hacía la jugada del alumno y qué lograba la mejor. */
export function whyError(i: ErrorWhyInput): string | null {
  const seed = `${i.fen.split(' ').slice(0, 4).join(' ')}|${i.played}|${i.best}`;
  const bad = fresh(badSentences(i.fen, i.played, seed), i.known).slice(0, 2);
  const line = i.line && i.line[0] === i.best ? i.line : [i.best];
  const good = fresh(goodSentences(i.fen, line, seed), i.known).slice(0, bad.length ? 2 : 3);
  const parts = good.map((x, k) => (k === 0 && bad.length ? `En cambio, ${decap(x.text)}` : x.text));
  return assemble([...bad.map((x) => x.text), ...parts]);
}

/** Frases sin filtrar por solapamiento (para las pruebas fijas de cada tipo de hecho). */
export function rawWhy(fen: string, line: string[], played?: string): { good: Sentence[]; bad: Sentence[] } {
  const seed = `${fen.split(' ').slice(0, 4).join(' ')}|${line[0] ?? ''}`;
  return { good: goodSentences(fen, line, seed), bad: played ? badSentences(fen, played, `${seed}|${played}`) : [] };
}

