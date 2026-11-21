/**
 * Método ruso, parte A: u20 (tablero), u21 (rey), u22 (torre), u23 (jaque) y u24 (enroque).
 * Todo pendiente de validación de profesores. Se importan las unidades directamente por su archivo (no están en el registro).
 * Verificación con chessops: destinos legales, casillas atacadas, respuestas al jaque (mover, bloquear, capturar) y enroque.
 */
import { describe, expect, it } from 'vitest';
import { attacks } from 'chessops/attacks';
import { Chess, normalizeMove } from 'chessops/chess';
import { parseFen } from 'chessops/fen';
import { makeSan } from 'chessops/san';
import { makeSquare, parseSquare, parseUci, squareFile, squareRank } from 'chessops/util';
import type { Color, Role, Square } from 'chessops/types';
import { followMove } from '../../src/shared/moves.js';
import { leaksIn, targetsOf } from '../../scripts/lib/hint-leaks.js';
import type { Lesson, PracticeStep, Unit } from '../../src/content/schema.js';
import { unit as u20 } from '../../src/content/units/u20.js';
import { unit as u21 } from '../../src/content/units/u21.js';
import { unit as u22 } from '../../src/content/units/u22.js';
import { unit as u23 } from '../../src/content/units/u23.js';
import { unit as u24 } from '../../src/content/units/u24.js';
import { fen } from '../../src/content/units/ruso-a-fen.js';

const UNITS: Unit[] = [u20, u21, u22, u23, u24];
const LESSONS: Lesson[] = UNITS.flatMap((u) => u.lessons);
const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// ---------- utilidades chessops ----------

const load = (f: string): Chess => {
  const setup = parseFen(f);
  if (setup.isErr) throw new Error(`FEN no válida: ${f}`);
  const r = Chess.fromSetup(setup.unwrap());
  if (r.isErr) throw new Error(`FEN ilegal (${String(r.error)}): ${f}`);
  return r.unwrap();
};
const opp = (c: Color): Color => (c === 'white' ? 'black' : 'white');
const sq = (s: string): Square => parseSquare(s)!;
const isLight = (s: Square): boolean => (squareFile(s) + squareRank(s)) % 2 === 1;

function mv(pos: Chess, uci: string) {
  return normalizeMove(pos, parseUci(uci)!);
}
function play(pos: Chess, uci: string): Chess {
  const m = mv(pos, uci);
  if (!pos.isLegal(m)) throw new Error(`Jugada ilegal ${uci} (${pos.turn})`);
  const p = pos.clone();
  p.play(m);
  return p;
}
function playLine(f: string, line: readonly string[]): Chess {
  let pos = load(f);
  for (const u of line) pos = play(pos, u);
  return pos;
}
/** ¿La casilla está atacada (o protegida, si hay pieza propia) por alguna pieza de `by`, sin contar la pieza que la ocupa? */
function attackedBy(pos: Chess, s: Square, by: Color): boolean {
  for (const [from, p] of pos.board) if (p.color === by && from !== s && attacks(p, from, pos.board.occupied).has(s)) return true;
  return false;
}
function inCheck(pos: Chess, c: Color): boolean {
  const k = pos.board.kingOf(c);
  return k !== undefined && attackedBy(pos, k, opp(c));
}
/** Jugadas legales en UCI; el enroque en su forma e1g1 (la que usa el contenido). */
function legalCanon(pos: Chess): string[] {
  const out: string[] = [];
  for (const [from, ds] of pos.allDests())
    for (const to of ds) {
      const p = pos.board.get(from)!;
      const t = pos.board.get(to);
      out.push(p.role === 'king' && t?.role === 'rook' && t.color === p.color ? makeSquare(from) + (to > from ? 'g' : 'c') + makeSquare(from)[1] : makeSquare(from) + makeSquare(to));
    }
  return out;
}
const fromOf = (u: string): Square => sq(u.slice(0, 2));
const toOf = (u: string): Square => sq(u.slice(2, 4));
const dist = (a: Square, b: Square): number => Math.max(Math.abs(squareFile(a) - squareFile(b)), Math.abs(squareRank(a) - squareRank(b)));
const placement = (f: string): string => f.split(' ')[0]!;
const boardOf = (pos: Chess): string => makeFenOf(pos);
function makeFenOf(pos: Chess): string {
  // colocación de piezas en formato FEN, sin depender de otros campos
  const rows: string[] = [];
  for (let r = 7; r >= 0; r--) {
    let s = '';
    let n = 0;
    for (let f = 0; f < 8; f++) {
      const p = pos.board.get(f + 8 * r);
      if (!p) n++;
      else {
        if (n) s += n;
        n = 0;
        const ch = { king: 'k', queen: 'q', rook: 'r', bishop: 'b', knight: 'n', pawn: 'p' }[p.role];
        s += p.color === 'white' ? ch.toUpperCase() : ch;
      }
    }
    rows.push(s + (n || ''));
  }
  return rows.join('/');
}

// ---------- reglas de lo que cada ejercicio dice que vale ----------

type Rule = (pos: Chess, uci: string) => boolean;
const role = (pos: Chess, u: string): Role => pos.board.get(fromOf(u))!.role;
const R = (r: Role): Rule => (pos, u) => role(pos, u) === r;
const and = (...rs: Rule[]): Rule => (pos, u) => rs.every((r) => r(pos, u));
const toRank = (n: number): Rule => (_p, u) => Number(u[3]) === n;
const toFile = (f: string): Rule => (_p, u) => u[2] === f;
const lightTo: Rule = (_p, u) => isLight(toOf(u));
const darkTo: Rule = (_p, u) => !isLight(toOf(u));
const diffIs = (d: number): Rule => (_p, u) => squareFile(toOf(u)) - squareRank(toOf(u)) === d;
const sumIs = (d: number): Rule => (_p, u) => squareFile(toOf(u)) + squareRank(toOf(u)) === d;
const capture: Rule = (pos, u) => pos.board.has(toOf(u)) && pos.board.get(toOf(u))!.color !== pos.turn;
const legalAll: Rule = () => true;
const captureUnprotected: Rule = (pos, u) => capture(pos, u) && !attackedBy(play(pos, u), toOf(u), opp(pos.turn));
const givesCheck: Rule = (pos, u) => inCheck(play(pos, u), opp(pos.turn));
/** Respuesta a un jaque: rey (mueve el rey), captura (otra pieza captura al que da jaque) o bloqueo (otra pieza se interpone). */
function kind(pos: Chess, u: string): 'move' | 'capture' | 'block' {
  if (role(pos, u) === 'king') return 'move';
  const k = pos.board.kingOf(pos.turn)!;
  const checkers = [...pos.kingAttackers(k, opp(pos.turn), pos.board.occupied)];
  return checkers.includes(toOf(u)) ? 'capture' : 'block';
}
const kindIs = (k: 'move' | 'capture' | 'block'): Rule => (pos, u) => kind(pos, u) === k;
const nonKing: Rule = (pos, u) => role(pos, u) !== 'king';
const castle = (side?: 'g' | 'c'): Rule => (pos, u) =>
  role(pos, u) === 'king' && Math.abs(squareFile(toOf(u)) - squareFile(fromOf(u))) === 2 && (side === undefined || u[2] === side);
/** El rey acaba pegado a la torre propia (la protege). */
const kingProtectsRook: Rule = (pos, u) => {
  const after = play(pos, u);
  const k = toOf(u);
  for (const [s, p] of after.board) if (p.role === 'rook' && p.color === pos.turn) return dist(k, s) === 1 && role(pos, u) === 'king';
  return false;
};
/** La torre acaba junto a su rey y fuera del alcance de cualquier pieza rival. */
const rookSafeByKing: Rule = (pos, u) => {
  if (role(pos, u) !== 'rook') return false;
  const after = play(pos, u);
  const k = after.board.kingOf(pos.turn)!;
  return dist(toOf(u), k) === 1 && !attackedBy(after, toOf(u), opp(pos.turn));
};

const RULES: Record<string, Rule> = {
  'u20.l02:practice:1': and(R('rook'), toRank(1), lightTo),
  'u20.l02:practice:2': and(R('rook'), toFile('h'), darkTo),
  'u20.l02:practice:3': and(R('rook'), toRank(8), lightTo),
  'u20.l02:evaluation:1': and(R('rook'), toRank(5), darkTo),
  'u20.l02:evaluation:2': and(R('rook'), toFile('c'), lightTo),
  'u20.l03:practice:1': and(R('rook'), diffIs(0)),
  'u20.l03:practice:2': and(R('rook'), sumIs(7)),
  'u20.l03:practice:3': and(R('rook'), diffIs(2)),
  'u20.l03:evaluation:1': and(R('rook'), diffIs(0)),
  'u20.l03:evaluation:2': and(R('rook'), sumIs(7)),
  'u20.l03:evaluation:3': and(R('rook'), diffIs(-2)),
  'u21.l02:practice:1': and(R('king'), capture),
  'u21.l02:practice:2': and(R('king'), capture),
  'u21.l02:practice:3': legalAll,
  'u21.l02:evaluation:1': and(R('king'), capture),
  'u21.l02:evaluation:2': and(R('king'), capture),
  'u21.l02:evaluation:3': legalAll,
  'u21.l03:practice:1': legalAll,
  'u21.l03:practice:2': legalAll,
  'u21.l03:practice:3': and(R('king'), capture),
  'u21.l03:evaluation:1': legalAll,
  'u21.l03:evaluation:2': legalAll,
  'u21.l03:evaluation:3': and(R('king'), capture),
  'u22.l02:practice:1': capture,
  'u22.l02:practice:2': capture,
  'u22.l02:practice:3': capture,
  'u22.l02:evaluation:1': capture,
  'u22.l02:evaluation:2': capture,
  'u22.l02:evaluation:3': capture,
  'u22.l03:practice:1': kingProtectsRook,
  'u22.l03:practice:2': captureUnprotected,
  'u22.l03:practice:3': rookSafeByKing,
  'u22.l03:evaluation:1': kingProtectsRook,
  'u22.l03:evaluation:2': captureUnprotected,
  'u22.l03:evaluation:3': rookSafeByKing,
  'u23.l01:practice:1': givesCheck,
  'u23.l01:practice:2': givesCheck,
  'u23.l01:practice:3': givesCheck,
  'u23.l01:evaluation:1': givesCheck,
  'u23.l01:evaluation:2': givesCheck,
  'u23.l01:evaluation:3': givesCheck,
  'u23.l02:practice:1': legalAll,
  'u23.l02:practice:2': legalAll,
  'u23.l02:practice:3': kindIs('move'),
  'u23.l02:evaluation:1': legalAll,
  'u23.l02:evaluation:2': legalAll,
  'u23.l02:evaluation:3': kindIs('move'),
  'u23.l03:practice:1': kindIs('block'),
  'u23.l03:practice:2': kindIs('capture'),
  'u23.l03:practice:3': nonKing,
  'u23.l03:evaluation:1': kindIs('block'),
  'u23.l03:evaluation:2': kindIs('capture'),
  'u23.l03:evaluation:3': nonKing,
  'u24.l01:practice:1': castle('g'),
  'u24.l01:practice:2': castle('g'),
  'u24.l01:practice:3': castle('g'),
  'u24.l01:evaluation:1': castle('g'),
  'u24.l01:evaluation:2': castle('g'),
  'u24.l01:evaluation:3': castle('g'),
  'u24.l02:practice:1': castle('c'),
  'u24.l02:practice:2': castle('c'),
  'u24.l02:practice:3': castle('c'),
  'u24.l02:evaluation:1': castle('c'),
  'u24.l02:evaluation:2': castle('c'),
  'u24.l02:evaluation:3': castle('c'),
  // en «cuándo no se puede» el único enroque legal (de cualquier lado) es el de la solución
  'u24.l03:practice:1': castle(),
  'u24.l03:practice:2': castle(),
  'u24.l03:practice:3': castle(),
  'u24.l03:evaluation:1': castle(),
  'u24.l03:evaluation:2': legalAll,
  'u24.l03:evaluation:3': castle(),
};

/** Cantidad de jugadas válidas que el texto de corrección anuncia («cuatro casillas», «dos formas»...). */
const SIZES: Record<string, number> = {
  'u20.l02:practice:1': 4,
  'u20.l02:practice:2': 4,
  'u20.l02:practice:3': 4,
  'u20.l02:evaluation:1': 4,
  'u20.l02:evaluation:2': 4,
  'u22.l03:practice:3': 3,
  'u22.l03:evaluation:3': 3,
  'u23.l01:practice:1': 2,
  'u23.l01:practice:3': 2,
  'u23.l01:evaluation:1': 2,
  'u23.l02:practice:1': 6,
  'u23.l02:practice:3': 4,
  'u23.l02:evaluation:1': 6,
  'u23.l02:evaluation:3': 4,
  'u23.l03:practice:3': 1,
  'u23.l03:evaluation:3': 1,
  'u24.l03:evaluation:2': 4,
};

// ---------- afirmaciones de los textos que se comprueban con chessops ----------

type Piece = [string, Color, Role];
type Claim =
  | { onLine: string[]; kind: 'file' | 'rank' | 'diag' | 'anti' }
  | { light?: string[]; dark?: string[] }
  | { dests: string; to: string[] }
  | { destCount: [string, number] }
  | { arrowsLegal: true }
  | { attacked?: string[]; notAttacked?: string[]; by: Color }
  | { legal?: string[]; illegal?: string[] }
  | { check: Color | 'none' }
  | { pieces: Piece[] }
  | { startPieces: Piece[] }
  | { kinds: Record<string, 'move' | 'capture' | 'block'> }
  | { san: [string, string] }
  | { result: { fen: string; uci: string; pieces: Piece[]; noRights?: true; shown?: true } }
  | { extra: { fen: string; legal?: string[]; illegal?: string[] } };

const onLine = (a: string, b: string, kind: 'file' | 'rank' | 'diag' | 'anti'): boolean => {
  const [fa, ra, fb, rb] = [a.charCodeAt(0), Number(a[1]), b.charCodeAt(0), Number(b[1])];
  return kind === 'file' ? fa === fb : kind === 'rank' ? ra === rb : kind === 'diag' ? fa - ra === fb - rb : fa + ra === fb + rb;
};
const START_PIECES: Piece[] = [
  ...(['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'] as Role[]).flatMap((r, i): Piece[] => [
    [`${'abcdefgh'[i]}1`, 'white', r],
    [`${'abcdefgh'[i]}8`, 'black', r],
  ]),
  ...[...'abcdefgh'].flatMap((f): Piece[] => [
    [`${f}2`, 'white', 'pawn'],
    [`${f}7`, 'black', 'pawn'],
  ]),
];

const pickPiece = (p: { color: Color; role: Role } | undefined) => (p ? { color: p.color, role: p.role } : undefined);

function checkClaim(f: string, c: Claim, where: string, step?: { squares?: string[]; arrows?: [string, string][] }): void {
  const pos = load(f);
  if ('onLine' in c) {
    for (const s of c.onLine) expect(onLine(c.onLine[0]!, s, c.kind), `${where}: ${s} no está en la línea`).toBe(true);
  } else if ('light' in c || 'dark' in c) {
    for (const s of (c as { light?: string[] }).light ?? []) expect(isLight(sq(s)), `${where}: ${s} debería ser clara`).toBe(true);
    for (const s of (c as { dark?: string[] }).dark ?? []) expect(isLight(sq(s)), `${where}: ${s} debería ser oscura`).toBe(false);
  } else if ('dests' in c) {
    const got = [...pos.dests(sq(c.dests))].map(makeSquare).sort();
    expect(got, `${where}: destinos de ${c.dests}`).toEqual([...c.to].sort());
  } else if ('destCount' in c) {
    expect([...pos.dests(sq(c.destCount[0]))].length, `${where}: nº de destinos de ${c.destCount[0]}`).toBe(c.destCount[1]);
  } else if ('arrowsLegal' in c) {
    for (const [a, b] of step?.arrows ?? []) expect(legalCanon(pos), `${where}: flecha ${a}${b} no es jugada legal`).toContain(a + b);
  } else if ('by' in c) {
    for (const s of c.attacked ?? []) expect(attackedBy(pos, sq(s), c.by), `${where}: ${s} debería estar atacada por ${c.by}`).toBe(true);
    for (const s of c.notAttacked ?? []) expect(attackedBy(pos, sq(s), c.by), `${where}: ${s} no debería estar atacada por ${c.by}`).toBe(false);
  } else if ('legal' in c || 'illegal' in c) {
    const legal = legalCanon(pos);
    for (const u of (c as { legal?: string[] }).legal ?? []) expect(legal, `${where}: ${u} debería ser legal`).toContain(u);
    for (const u of (c as { illegal?: string[] }).illegal ?? []) expect(legal, `${where}: ${u} debería ser ilegal`).not.toContain(u);
  } else if ('check' in c) {
    for (const col of ['white', 'black'] as Color[]) expect(inCheck(pos, col), `${where}: jaque a ${col}`).toBe(c.check === col);
  } else if ('pieces' in c) {
    for (const [s, col, r] of c.pieces) expect(pickPiece(pos.board.get(sq(s))), `${where}: ${s}`).toEqual({ color: col, role: r });
  } else if ('startPieces' in c) {
    const st = load(START);
    for (const [s, col, r] of c.startPieces) expect(pickPiece(st.board.get(sq(s))), `${where}: ${s}`).toEqual({ color: col, role: r });
  } else if ('kinds' in c) {
    for (const [u, k] of Object.entries(c.kinds)) expect(kind(pos, u), `${where}: ${u}`).toBe(k);
  } else if ('san' in c) {
    expect(makeSan(pos, mv(pos, c.san[0])), where).toBe(c.san[1]);
  } else if ('result' in c) {
    const after = playLine(c.result.fen, [c.result.uci]);
    for (const [s, col, r] of c.result.pieces) expect(pickPiece(after.board.get(sq(s))), `${where}: ${s}`).toEqual({ color: col, role: r });
    if (c.result.shown) expect(boardOf(after), `${where}: la posición mostrada es la que resulta del enroque`).toBe(placement(f));
    if (c.result.noRights) expect(after.castles.castlingRights.isEmpty(), `${where}: tras enrocar se pierden los derechos`).toBe(true);
  } else {
    const ex = (c as { extra: { fen: string; legal?: string[]; illegal?: string[] } }).extra;
    const p = load(ex.fen);
    const legal = legalCanon(p);
    for (const u of ex.legal ?? []) expect(legal, `${where} (${ex.fen}): ${u} debería ser legal`).toContain(u);
    for (const u of ex.illegal ?? []) expect(legal, `${where} (${ex.fen}): ${u} debería ser ilegal`).not.toContain(u);
  }
}

const FILE_E = ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8'];
const ROW_4 = ['a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4'];
const MAIN = ['a1', 'b2', 'c3', 'd4', 'e5', 'f6', 'g7', 'h8'];
const ANTI = ['h1', 'g2', 'f3', 'e4', 'd5', 'c6', 'b7', 'a8'];
const SHORT_FEN = fen('Ke1 Rh1 ke8', 'w', 'K');
const LONG_FEN = fen('Ke1 Ra1 ke8', 'w', 'Q');

/** Afirmaciones de cada paso de explicación (clave `lección:eN`, N desde 0). */
const EXPLAIN_CLAIMS: Record<string, Claim[]> = {
  'u20.l01:e0': [{ onLine: FILE_E, kind: 'file' }],
  'u20.l01:e1': [{ onLine: ROW_4, kind: 'rank' }],
  'u20.l02:e0': [{ light: ['h1', 'a8'], dark: ['a1', 'h8'] }],
  'u20.l02:e1': [{ dark: ['d4', 'e5'], light: ['e4', 'd5'] }],
  'u20.l03:e0': [{ onLine: MAIN, kind: 'diag' }, { dark: MAIN }],
  'u20.l03:e1': [
    { onLine: ANTI, kind: 'anti' },
    { light: ANTI },
    { onLine: ['c1', 'd2', 'e3', 'f4', 'g5', 'h6'], kind: 'diag' },
  ],
  'u20.l04:e0': [{ pieces: START_PIECES }, { extra: { fen: START, legal: ['e2e4'] } }],
  'u20.l04:e1': [{ pieces: START_PIECES }, { light: ['d1'], dark: ['d8'] }],
  'u21.l01:e0': [
    { arrowsLegal: true },
    { dests: 'e4', to: ['d3', 'd4', 'd5', 'e3', 'e5', 'f3', 'f4', 'f5'] },
  ],
  'u21.l01:e1': [{ arrowsLegal: true }, { dests: 'h1', to: ['g1', 'g2', 'h2'] }],
  'u21.l02:e0': [{ arrowsLegal: true }, { legal: ['e4d5'] }, { notAttacked: ['d5'], by: 'black' }],
  'u21.l02:e1': [{ attacked: ['d1', 'd2'], by: 'black' }, { dests: 'e1', to: ['e2', 'f1', 'f2'] }],
  'u21.l03:e0': [{ attacked: ['d5', 'e5', 'f5'], by: 'black' }, { dests: 'e4', to: ['d3', 'd4', 'e3', 'f3', 'f4'] }],
  'u21.l03:e1': [{ attacked: ['f5'], by: 'black' }, { illegal: ['e4f5'] }],
  'u22.l01:e0': [{ arrowsLegal: true }, { destCount: ['d4', 14] }],
  'u22.l01:e1': [
    { arrowsLegal: true },
    { destCount: ['d4', 11] },
    { illegal: ['d4d6', 'd4d7', 'd4d8'] },
    { legal: ['d4d5'] },
  ],
  'u22.l02:e0': [{ legal: ['d4d7'] }, { arrowsLegal: true }],
  'u22.l02:e1': [{ legal: ['d1d5'] }, { illegal: ['d1d8'] }, { arrowsLegal: true }],
  'u22.l03:e0': [{ attacked: ['d4'], by: 'black' }, { attacked: ['d4'], by: 'white' }],
  'u22.l03:e1': [{ attacked: ['d4'], by: 'black' }, { notAttacked: ['d4'], by: 'white' }],
  'u23.l01:e0': [{ check: 'black' }, { attacked: ['e8'], by: 'white' }],
  'u23.l01:e1': [{ check: 'none' }, { notAttacked: ['e8'], by: 'white' }],
  'u23.l02:e0': [
    { check: 'white' },
    { arrowsLegal: true },
    { dests: 'e1', to: ['d1', 'd2', 'f1', 'f2'] },
  ],
  'u23.l02:e1': [
    { check: 'white' },
    { arrowsLegal: true },
    { attacked: ['d1', 'd2'], by: 'black' },
    { dests: 'e1', to: ['f1', 'f2'] },
  ],
  'u23.l03:e0': [{ check: 'white' }, { arrowsLegal: true }, { kinds: { c3g3: 'block' } }],
  'u23.l03:e1': [{ check: 'white' }, { arrowsLegal: true }, { kinds: { a8e8: 'capture' } }],
  'u24.l01:e0': [
    { legal: ['e1g1'] },
    { san: ['e1g1', 'O-O'] },
    { result: { fen: SHORT_FEN, uci: 'e1g1', pieces: [['g1', 'white', 'king'], ['f1', 'white', 'rook']], noRights: true } },
    { extra: { fen: fen('Ke1 rh8 ke8', 'b', 'k'), legal: ['e8g8'] } },
  ],
  'u24.l01:e1': [
    { result: { fen: SHORT_FEN, uci: 'e1g1', shown: true, pieces: [['g1', 'white', 'king'], ['f1', 'white', 'rook']] } },
    { result: { fen: fen('Kg2 rh8 ke8', 'b', 'k'), uci: 'e8g8', pieces: [['g8', 'black', 'king'], ['f8', 'black', 'rook']] } },
  ],
  'u24.l02:e0': [{ legal: ['e1c1'] }, { san: ['e1c1', 'O-O-O'] }, { extra: { fen: fen('Ke1 Ra1 Nb1 ke8', 'w', 'Q'), illegal: ['e1c1'] } }],
  'u24.l02:e1': [
    { result: { fen: LONG_FEN, uci: 'e1c1', shown: true, pieces: [['c1', 'white', 'king'], ['d1', 'white', 'rook']] } },
    { extra: { fen: fen('Ke1 Ra1 Bc1 ke8', 'w', 'Q'), illegal: ['e1c1'] } },
    { extra: { fen: fen('Ke1 Ra1 Qd1 ke8', 'w', 'Q'), illegal: ['e1c1'] } },
  ],
  'u24.l03:e0': [
    { illegal: ['e1g1'] },
    { extra: { fen: fen('Ke1 Rh1 ka8', 'w', '-'), illegal: ['e1g1'] } },
    { extra: { fen: fen('Ke1 Rh1 ka8', 'w', 'K'), legal: ['e1g1'] } },
  ],
  'u24.l03:e1': [
    { attacked: ['f1'], by: 'black' },
    { illegal: ['e1g1'] },
    { extra: { fen: fen('Ke1 Rh1 re8 ka8', 'w', 'K'), illegal: ['e1g1'] } },
    { extra: { fen: fen('Ke1 Rh1 rg8 ka8', 'w', 'K'), illegal: ['e1g1'] } },
    { extra: { fen: fen('Ke1 Rh1 rh8 ka8', 'w', 'K'), legal: ['e1g1'] } },
  ],
};

/** Afirmaciones de los textos de práctica y evaluación (clave `lección:practice|evaluation:N`, N desde 1). */
const EXERCISE_CLAIMS: Record<string, Claim[]> = {
  'u20.l01:practice:3': [],
  'u20.l02:evaluation:3': [{ light: ['b1', 'b3'], dark: ['b2'] }],
  'u20.l04:practice:3': [{ startPieces: [['d1', 'white', 'queen'], ['e1', 'white', 'king']] }],
  'u20.l04:evaluation:1': [{ startPieces: [['d8', 'black', 'queen']] }, { dark: ['d8'] }],
  'u20.l04:evaluation:2': [{ startPieces: [['f1', 'white', 'bishop'], ['g1', 'white', 'knight'], ['e1', 'white', 'king']] }],
  'u20.l04:evaluation:3': [{ startPieces: [['e1', 'white', 'king'], ['d1', 'white', 'queen']] }, { dark: ['e1'] }],
  'u21.l02:practice:2': [{ attacked: ['c5'], by: 'black' }, { notAttacked: ['e3'], by: 'black' }],
  'u21.l02:practice:3': [{ attacked: ['d1', 'd2', 'f1', 'f2'], by: 'black' }],
  'u21.l02:evaluation:2': [{ attacked: ['e6'], by: 'white' }, { notAttacked: ['g4'], by: 'white' }],
  'u21.l02:evaluation:3': [{ attacked: ['f7', 'f8', 'h7', 'h8'], by: 'white' }],
  'u21.l03:practice:1': [{ attacked: ['g5', 'g6', 'g4', 'h4'], by: 'black' }],
  'u21.l03:practice:2': [{ attacked: ['d2', 'e2', 'f2', 'd1'], by: 'black' }],
  'u21.l03:practice:3': [{ attacked: ['d5'], by: 'black' }, { notAttacked: ['f3'], by: 'black' }],
  'u21.l03:evaluation:1': [{ attacked: ['b2', 'b3', 'a4', 'b4'], by: 'white' }],
  'u21.l03:evaluation:2': [{ attacked: ['f2', 'g2', 'h2', 'h1'], by: 'black' }],
  'u21.l03:evaluation:3': [{ attacked: ['d6'], by: 'black' }, { notAttacked: ['f4'], by: 'black' }],
  'u22.l02:practice:2': [{ legal: ['e1e4'] }, { illegal: ['e1e8'] }],
  'u22.l02:evaluation:2': [{ legal: ['a5d5'] }, { illegal: ['a5g5'] }],
  'u22.l03:practice:2': [{ attacked: ['d5'], by: 'black' }, { notAttacked: ['g1'], by: 'black' }],
  'u22.l03:practice:3': [{ attacked: ['h4'], by: 'black' }],
  'u22.l03:evaluation:2': [{ attacked: ['f6'], by: 'black' }, { notAttacked: ['b2'], by: 'black' }],
  'u22.l03:evaluation:3': [{ attacked: ['h4'], by: 'black' }],
  'u23.l02:practice:2': [{ attacked: ['g2', 'h2'], by: 'black' }],
  'u23.l02:evaluation:2': [{ attacked: ['a7', 'b7'], by: 'white' }],
  'u24.l03:practice:1': [{ attacked: ['f1'], by: 'black' }],
  'u24.l03:evaluation:1': [{ attacked: ['g1'], by: 'black' }],
  'u24.l03:practice:3': [{ pieces: [['f1', 'white', 'bishop']] }],
};

// ---------- textos ----------

const sentences = (t: string): string[] => t.split(/(?<=[.!?])\s+/).filter(Boolean);
const words = (t: string): number => t.trim().split(/\s+/).length;
const EMOJI = /\p{Extended_Pictographic}/u;
const BLAME = /\b(mal|error|errores|fallaste|equivocaste|equivocado|incorrecto|torpe|tonto)\b/i;

function textsOf(u: Unit): { where: string; text: string }[] {
  const out: { where: string; text: string }[] = [{ where: `${u.id} descripción`, text: u.description }];
  for (const l of u.lessons) {
    out.push({ where: `${l.id} título`, text: l.title }, { where: `${l.id} objetivo`, text: l.objective }, { where: `${l.id} intro`, text: l.intro });
    l.explanation.forEach((e, i) => out.push({ where: `${l.id} explicación ${i + 1}`, text: e.text }));
    for (const [mode, steps] of [['practice', l.practice], ['evaluation', l.evaluation]] as const)
      steps.forEach((s, i) => {
        const w = `${l.id} ${mode} ${i + 1}`;
        out.push({ where: `${w} enunciado`, text: s.prompt }, { where: `${w} correcto`, text: s.explanationCorrect }, { where: `${w} fallo`, text: s.explanationWrong });
        if (s.hint) out.push({ where: `${w} pista`, text: s.hint });
        for (const [uci, t] of Object.entries(s.wrongByMove ?? {})) out.push({ where: `${w} wrongByMove ${uci}`, text: t });
      });
  }
  return out;
}

const steps = (l: Lesson): { key: string; mode: 'practice' | 'evaluation'; step: PracticeStep }[] => [
  ...l.practice.map((step, i) => ({ key: `${l.id}:practice:${i + 1}`, mode: 'practice' as const, step })),
  ...l.evaluation.map((step, i) => ({ key: `${l.id}:evaluation:${i + 1}`, mode: 'evaluation' as const, step })),
];
const norm = (f: string): string => f.split(' ').slice(0, 4).join(' ');
const sameSet = (a: string[], b: string[]): boolean => a.length === b.length && [...a].sort().join() === [...b].sort().join();

/** Jugadas legales que la app daría por buenas como primera jugada del alumno (incluye ramas y `alt`). */
function acceptedAt(step: PracticeStep, i: number): string[] {
  const line = step.solutionUci.slice(0, i);
  const pos = playLine(step.fen, line);
  const v = { fen: step.fen, solutionUci: step.solutionUci, alt: step.alt, branches: step.branches };
  return legalCanon(pos).filter((u) => followMove(v, step.solutionUci, i, u) !== null);
}

// ---------- tests ----------

describe('método ruso A: estructura (pendiente de validación de profesores)', () => {
  it('unidades u20-u24: orden, nivel y requisitos en cadena', () => {
    expect(UNITS.map((u) => u.id)).toEqual(['u20', 'u21', 'u22', 'u23', 'u24']);
    expect(UNITS.map((u) => u.order)).toEqual([1, 2, 3, 4, 5]);
    UNITS.forEach((u, i) => {
      expect(u.level).toBe('beginner');
      expect(u.requires).toEqual(i === 0 ? [] : [UNITS[i - 1]!.id]);
      expect(u.lessons.length).toBeGreaterThanOrEqual(3);
      expect(u.lessons.length).toBeLessThanOrEqual(4);
      u.lessons.forEach((l, j) => {
        expect(l.id).toBe(`${u.id}.l${String(j + 1).padStart(2, '0')}`);
        expect(l.unitId).toBe(u.id);
      });
    });
    expect(u20.lessons.length).toBe(4);
  });

  it('cada lección: objetivo, intro, 2 explicaciones, 3 prácticas y 3 evaluaciones con textos', () => {
    for (const l of LESSONS) {
      expect(l.objective.length, l.id).toBeGreaterThan(15);
      expect(l.intro.length, l.id).toBeGreaterThan(40);
      expect(l.explanation.length, l.id).toBe(2);
      expect(l.practice.length, l.id).toBe(3);
      expect(l.evaluation.length, l.id).toBe(3);
      for (const e of l.explanation) {
        expect(e.text.length).toBeGreaterThan(40);
        expect((e.squares ?? []).length + (e.arrows ?? []).length, `${l.id}: cada explicación lleva marcas o flechas`).toBeGreaterThan(0);
      }
      for (const { key, step } of steps(l)) {
        expect(step.prompt.length, key).toBeGreaterThan(10);
        expect(step.explanationCorrect.length, key).toBeGreaterThan(20);
        expect(step.explanationWrong.length, key).toBeGreaterThan(20);
        expect(step.solutionUci.length % 2, `${key}: acaba con jugada del alumno`).toBe(1);
      }
      for (const p of l.practice) expect(p.hint, `${l.id}: la práctica lleva pista`).toBeTruthy();
    }
  });

  it('FEN únicas en los ejercicios y la evaluación no repite la práctica', () => {
    const seen = new Map<string, string>();
    for (const l of LESSONS)
      for (const { key, step } of steps(l)) {
        const n = norm(step.fen);
        expect(seen.has(n), `${key} repite ${seen.get(n)}`).toBe(false);
        seen.set(n, key);
      }
  });

  it('textos: frases de 30 palabras o menos, sin emojis y sin culpar', () => {
    for (const u of UNITS)
      for (const { where, text } of textsOf(u)) {
        expect(EMOJI.test(text), `${where}: emoji`).toBe(false);
        expect(BLAME.test(text), `${where}: culpa al alumno «${text}»`).toBe(false);
        for (const s of sentences(text)) expect(words(s), `${where}: «${s}»`).toBeLessThanOrEqual(30);
      }
  });
});

for (const l of LESSONS) {
  describe(`lección ${l.id} ${l.title}`, () => {
    l.explanation.forEach((e, i) => {
      it(`explicación ${i + 1}: FEN y marcas válidas, y lo que dice el texto se cumple`, () => {
        expect(() => load(e.fen), e.fen).not.toThrow();
        for (const s of e.squares ?? []) expect(parseSquare(s), s).toBeDefined();
        for (const [a, b] of e.arrows ?? []) {
          expect(parseSquare(a), a).toBeDefined();
          expect(parseSquare(b), b).toBeDefined();
        }
        const claims = EXPLAIN_CLAIMS[`${l.id}:e${i}`];
        expect(claims, `${l.id} explicación ${i + 1} sin afirmaciones comprobadas`).toBeDefined();
        for (const c of claims!) checkClaim(e.fen, c, `${l.id}:e${i}`, e);
      });
    });

    for (const { key, mode, step } of steps(l)) {
      describe(key, () => {
        it('FEN legal, línea legal, la solución no da mate y las jugadas erróneas son legales y no valen', () => {
          const pos = playLine(step.fen, step.solutionUci);
          expect(pos.isCheckmate(), `${key}: la solución daría mate (valdría cualquier mate)`).toBe(false);
          const start = load(step.fen);
          const legal = legalCanon(start);
          const v = { fen: step.fen, solutionUci: step.solutionUci, alt: step.alt, branches: step.branches };
          for (const [u, t] of Object.entries(step.wrongByMove ?? {})) {
            expect(legal, `${key}: ${u} no es legal`).toContain(u);
            expect(followMove(v, step.solutionUci, 0, u), `${key}: ${u} es una jugada correcta`).toBeNull();
            expect(t.length).toBeGreaterThan(15);
          }
          for (const s of step.squares ?? []) expect(parseSquare(s)).toBeDefined();
        });

        it('la respuesta es exactamente la que dice el ejercicio', () => {
          const rule = RULES[key];
          const first = acceptedAt(step, 0);
          if (rule) {
            const pos = load(step.fen);
            const expected = legalCanon(pos).filter((u) => rule(pos, u));
            expect(first.sort(), `${key}: jugadas válidas según el ejercicio`).toEqual(expected.sort());
          } else {
            const expected = [step.solutionUci[0]!, ...(step.solutionUci.length === 1 ? (step.alt ?? []) : []), ...(step.branches ?? []).filter((b) => b.at === 0).map((b) => b.line[0]!)];
            expect(sameSet(first, expected), `${key}: ${first} frente a ${expected}`).toBe(true);
          }
          if (SIZES[key] !== undefined) expect(first.length, `${key}: nº de respuestas anunciado`).toBe(SIZES[key]);
          // jugadas siguientes del alumno: únicas (más las `alt` en la última)
          for (let i = 2; i < step.solutionUci.length; i += 2) {
            const exp = [step.solutionUci[i]!, ...(i === step.solutionUci.length - 1 ? (step.alt ?? []) : [])];
            expect(sameSet(acceptedAt(step, i), exp), `${key}: jugada ${i / 2 + 1}`).toBe(true);
          }
          if (!rule && step.solutionUci.length > 1) expect(true).toBe(true);
        });

        it('ramas: legales, en jugada par del alumno y llegan al final', () => {
          for (const b of step.branches ?? []) {
            expect(b.at % 2).toBe(0);
            expect(b.line.length % 2).toBe(1);
            expect(b.at + b.line.length, `${key} rama`).toBe(step.solutionUci.length);
            expect(() => playLine(step.fen, [...step.solutionUci.slice(0, b.at), ...b.line]), `${key} rama`).not.toThrow();
            expect(b.line[0]).not.toBe(step.solutionUci[b.at]);
          }
        });

        it('los textos solo afirman hechos comprobados', () => {
          for (const c of EXERCISE_CLAIMS[key] ?? []) checkClaim(step.fen, c, key);
        });

        it('los avisos de fallo no nombran la solución', () => {
          const targets = targetsOf(step.fen, step.solutionUci, step.alt, step.branches);
          expect(targets.length, key).toBeGreaterThan(0);
          const texts: [string, string | undefined][] = [
            ['hint', step.hint],
            ['explanationWrong', step.explanationWrong],
            ...Object.entries(step.wrongByMove ?? {}).map(([u, t]): [string, string] => [`wrongByMove[${u}]`, t]),
          ];
          for (const [kind2, text] of texts) if (text) expect(leaksIn(text, targets, step.prompt), `${kind2}: «${text}»`).toEqual([]);
          if (mode === 'evaluation') expect(step.explanationWrong.length).toBeGreaterThan(20);
        });
      });
    }
  });
}

describe('el detector de reglas funciona (comprobación del propio test)', () => {
  it('distingue mover, bloquear y capturar, y los casos de enroque', () => {
    const p = load(fen('Ke1 Ra8 Rb4 re8 kh7'));
    expect(kind(p, 'e1d1')).toBe('move');
    expect(kind(p, 'b4e4')).toBe('block');
    expect(kind(p, 'a8e8')).toBe('capture');
    expect(legalCanon(load(fen('Ke1 Ra1 Rh1 ke8', 'w', 'KQ')))).toEqual(expect.arrayContaining(['e1g1', 'e1c1']));
    expect(legalCanon(load(fen('Ke1 Ra1 Rh1 re8 kb6', 'w', 'KQ')))).not.toContain('e1g1');
  });
});
