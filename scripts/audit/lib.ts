/**
 * Funciones puras del auditor de contenido: legalidad, comparación con el motor y lint de texto.
 * Sin E/S ni motor: se prueban en test/audit/. Ver scripts/audit/README.md.
 */
import { Chess, normalizeMove } from 'chessops/chess';
import { parseFen, INITIAL_FEN } from 'chessops/fen';
import { parseSan } from 'chessops/san';
import { makeUci, parseUci } from 'chessops/util';
import type { Move, Role } from 'chessops/types';

export type Severity = 'grave' | 'importante' | 'aviso';
export type FindingType =
  | 'FEN_ILEGAL'
  | 'SOLUCION_ILEGAL'
  | 'SOLUCION_NO_ES_LA_MEJOR'
  | 'SOLUCION_SUBOPTIMA_GANADORA'
  | 'SOLUCION_EN_POSICION_PERDIDA'
  | 'SOLUCION_DIRIGIDA_NO_OPTIMA'
  | 'ALTERNATIVA_IGUAL_O_MEJOR'
  | 'ALTERNATIVA_EN_POSICION_GANADA'
  | 'MATE_MULTIPLE'
  | 'AFIRMACION_FALSA'
  | 'SAN_ILEGAL'
  | 'SAN_JAQUE_FALSO'
  | 'SAN_MATE_FALSO'
  | 'NOTACION_MEZCLADA'
  | 'FRASE_LARGA'
  | 'CULPA'
  | 'EMOJI';

export const SEVERITY: Record<FindingType, Severity> = {
  FEN_ILEGAL: 'grave',
  SOLUCION_ILEGAL: 'grave',
  SOLUCION_NO_ES_LA_MEJOR: 'grave',
  SAN_ILEGAL: 'grave',
  AFIRMACION_FALSA: 'importante',
  MATE_MULTIPLE: 'importante',
  ALTERNATIVA_IGUAL_O_MEJOR: 'importante',
  SAN_JAQUE_FALSO: 'importante',
  SAN_MATE_FALSO: 'importante',
  SOLUCION_SUBOPTIMA_GANADORA: 'aviso',
  SOLUCION_EN_POSICION_PERDIDA: 'aviso',
  SOLUCION_DIRIGIDA_NO_OPTIMA: 'aviso',
  ALTERNATIVA_EN_POSICION_GANADA: 'aviso',
  NOTACION_MEZCLADA: 'aviso',
  FRASE_LARGA: 'aviso',
  CULPA: 'aviso',
  EMOJI: 'aviso',
};

export interface Finding {
  type: FindingType;
  detail: string;
}

const f = (type: FindingType, detail: string): Finding => ({ type, detail });

// ───────────── Posiciones ─────────────

export function loadPos(fen: string): Chess | string {
  const setup = parseFen(fen);
  if (setup.isErr) return `FEN no válido: ${String(setup.error)}`;
  const r = Chess.fromSetup(setup.unwrap());
  return r.isErr ? `posición ilegal: ${String(r.error)}` : r.unwrap();
}

export function legalMoves(pos: Chess): Move[] {
  const out: Move[] = [];
  for (const [from, dests] of pos.allDests())
    for (const to of dests) {
      const promo = pos.board.get(from)?.role === 'pawn' && (to >> 3 === 0 || to >> 3 === 7);
      out.push(promo ? { from, to, promotion: 'queen' } : { from, to });
    }
  return out;
}

export function uciMove(pos: Chess, uci: string): Move | undefined {
  const m = parseUci(uci);
  if (!m) return undefined;
  const n = normalizeMove(pos, m);
  return pos.isLegal(n) ? n : undefined;
}

/** Jugadas (UCI) que dan jaque mate en una. */
export function matesInOne(pos: Chess): string[] {
  return legalMoves(pos)
    .filter((m) => {
      const p = pos.clone();
      p.play(m);
      return p.isCheckmate();
    })
    .map(makeUci);
}

const VALUE: Record<Role, number> = { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 0 };

/** Material del bando `color` menos el del rival. */
export function materialBalance(pos: Chess, color: 'white' | 'black'): number {
  let s = 0;
  for (const sq of pos.board.occupied) {
    const p = pos.board.get(sq)!;
    s += (p.color === color ? 1 : -1) * VALUE[p.role];
  }
  return s;
}

// ───────────── Motor ─────────────

export interface Line {
  cp?: number;
  mate?: number;
  pv: string[];
}

/** Escala única (desde el bando que mueve): mate en N = 20000 − 100·N, así un mate más largo cuenta como peor. */
export function lineScore(l: { cp?: number; mate?: number }): number {
  if (l.mate !== undefined) return l.mate > 0 ? 20000 - 100 * l.mate : -20000 - 100 * l.mate;
  return l.cp ?? 0;
}

export const fmtScore = (l: { cp?: number; mate?: number }): string =>
  l.mate !== undefined ? `#${l.mate}` : `${(l.cp ?? 0) >= 0 ? '+' : ''}${((l.cp ?? 0) / 100).toFixed(2)}`;

export const THRESHOLDS = { worse: 60, alt: 30, stillWinning: 300 };

/**
 * Compara la jugada de la solución con las líneas del motor (MultiPV) de la misma posición.
 * `solLine` es la valoración de la solución: su línea MultiPV si está entre ellas o un `searchmoves` aparte.
 */
export function compareSolution(
  lines: Line[],
  solUci: string,
  solLine: Line,
  san: (uci: string) => string,
  /** El enunciado nombra la casilla de destino («Avanza el peón hasta d4»): se pide esa jugada, no la mejor. */
  directed = false,
): Finding[] {
  const out: Finding[] = [];
  const best = lines[0];
  if (!best) return out;
  const sol = lineScore(solLine);
  const loss = lineScore(best) - sol;
  const bestUci = best.pv[0]!;
  if (bestUci !== solUci && loss > THRESHOLDS.worse) {
    const msg = `${san(solUci)} (${fmtScore(solLine)}) pierde ${loss} cp frente a ${san(bestUci)} (${fmtScore(best)})`;
    // Solo es grave si la jugada cambia el resultado: no si sigue ganando, ni si la posición ya estaba perdida.
    if (directed) out.push(f('SOLUCION_DIRIGIDA_NO_OPTIMA', msg));
    else if (sol >= THRESHOLDS.stillWinning) out.push(f('SOLUCION_SUBOPTIMA_GANADORA', msg));
    else if (lineScore(best) <= -THRESHOLDS.stillWinning) out.push(f('SOLUCION_EN_POSICION_PERDIDA', msg));
    else out.push(f('SOLUCION_NO_ES_LA_MEJOR', msg));
  }
  if (directed) return out;
  for (const l of lines) {
    const u = l.pv[0];
    if (!u || u === solUci) continue;
    const s = lineScore(l);
    if (s < sol - THRESHOLDS.alt) continue;
    const msg = `${san(u)} (${fmtScore(l)}) frente a la solución ${san(solUci)} (${fmtScore(solLine)}): candidata a jugada aceptada`;
    // Con la partida ya ganada casi todo gana; importa si la alternativa es un mate tan rápido o un mate donde la solución no lo es.
    const decided = sol >= THRESHOLDS.stillWinning && (solLine.mate === undefined ? l.mate === undefined : s < sol);
    out.push(f(decided ? 'ALTERNATIVA_EN_POSICION_GANADA' : 'ALTERNATIVA_IGUAL_O_MEJOR', msg));
  }
  return out;
}

/** ¿El enunciado nombra la casilla de destino de la jugada? */
export const isDirected = (prompt: string, uci: string): boolean => new RegExp(`\\b${uci.slice(2, 4)}\\b`).test(prompt);

// ───────────── Afirmaciones del enunciado ─────────────

const NUM: Record<string, number> = { una: 1, un: 1, '1': 1, dos: 2, '2': 2, tres: 3, '3': 3, cuatro: 4, '4': 4 };

export interface Claims {
  /** Mate pedido; `n` si el enunciado da el número de jugadas. */
  mate?: { n?: number };
  winsMaterial?: boolean;
}

export function parseClaims(prompt: string): Claims {
  const t = prompt.toLowerCase();
  const c: Claims = {};
  const n = t.match(/mate en (una|un|dos|tres|cuatro|\d)\b/);
  if (n) c.mate = { n: NUM[n[1]!] };
  else if (/\b(da|dar|busca|encuentra)\s+(el\s+)?(jaque\s+)?mate\b/.test(t)) c.mate = {};
  if (/\bgana(r|s)?\s+(material|la dama|una torre|la torre|un peón|una pieza|el caballo|el alfil|un caballo|un alfil|la pieza)/.test(t))
    c.winsMaterial = true;
  return c;
}

/** Comprueba «mate (en N)»: la línea de la solución acaba en mate y no es más larga de lo dicho. */
export function checkMateClaim(fen: string, solution: string[], claim: { n?: number }, best?: Line): Finding[] {
  const pos = loadPos(fen);
  if (typeof pos === 'string') return [];
  for (const u of solution) {
    const m = uciMove(pos, u);
    if (!m) return [];
    pos.play(m);
  }
  const out: Finding[] = [];
  const plies = solution.length;
  if (!pos.isCheckmate()) out.push(f('AFIRMACION_FALSA', `el enunciado pide mate y la línea de solución (${plies} medias jugadas) no termina en mate`));
  else if (claim.n !== undefined && plies !== 2 * claim.n - 1)
    out.push(f('AFIRMACION_FALSA', `dice mate en ${claim.n} y la solución mata en ${(plies + 1) / 2}`));
  if (best && claim.n !== undefined && !(best.mate !== undefined && best.mate > 0 && best.mate <= claim.n))
    out.push(f('AFIRMACION_FALSA', `dice mate en ${claim.n} y el motor no ve mate en ${claim.n} (mejor: ${fmtScore(best)})`));
  return out;
}

/**
 * Comprueba «gana material»: tras la solución y la mejor respuesta del rival (línea del motor),
 * el material del bando que mueve sube al menos un peón. Un mate también vale.
 */
export function checkMaterialClaim(fen: string, solLine: Line): Finding[] {
  if (solLine.mate !== undefined && solLine.mate > 0) return [];
  const pos = loadPos(fen);
  if (typeof pos === 'string') return [];
  const me = pos.turn;
  const before = materialBalance(pos, me);
  const pv = solLine.pv.slice(0, 4);
  let bestGain = 0;
  for (let i = 0; i < pv.length; i++) {
    const m = uciMove(pos, pv[i]!);
    if (!m) break;
    pos.play(m);
    // Se mide tras la respuesta del rival (o al final de la línea): así cuenta la recaptura.
    if (i % 2 === 1 || i === pv.length - 1) bestGain = Math.max(bestGain, materialBalance(pos, me) - before);
  }
  return bestGain >= 1 ? [] : [f('AFIRMACION_FALSA', `dice que gana material y tras la línea del motor (${pv.join(' ')}) el material no sube`)];
}

// ───────────── Lint de texto ─────────────

export const MAX_WORDS = 30;

const BLAME: RegExp[] = [
  /\bmal\b/i,
  /\b(error|culpa) tuy[oa]\b/i,
  /\btu (error|culpa|fallo)\b/i,
  /\b(fallaste|has fallado|te equivocaste|te has equivocado)\b/i,
  /\b(torpe|tont[oa]|estúpid[oa]|inútil|pésim[oa]|horrible|desastre)\b/i,
  /\b(deberías haber|no sabes|otra vez no)\b/i,
];

export function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?…])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const words = (s: string) => s.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

export function lintText(text: string): Finding[] {
  const out: Finding[] = [];
  for (const s of sentences(text)) {
    const n = words(s);
    if (n > MAX_WORDS) out.push(f('FRASE_LARGA', `${n} palabras: «${s.length > 90 ? s.slice(0, 87) + '…' : s}»`));
  }
  for (const re of BLAME) {
    const m = text.match(re);
    if (m) out.push(f('CULPA', `«${m[0]}»: revisar si culpa al alumno`));
  }
  const emo = text.match(/\p{Extended_Pictographic}/gu);
  if (emo) out.push(f('EMOJI', emo.join(' ')));
  for (const t of sanTokens(text))
    if (t.spanish) out.push(f('NOTACION_MEZCLADA', `${t.raw} usa letra española; la app usa la inglesa (${t.san})`));
  return out;
}

// ───────────── Jugadas citadas en el texto ─────────────

export interface SanToken {
  raw: string;
  /** SAN inglés (C/A/T/D traducidas a N/B/R/Q). */
  san: string;
  spanish: boolean;
  numbered: boolean;
  /** Texto que sigue al token (para «es mate», «da jaque»). */
  after: string;
}

const ES: Record<string, string> = { C: 'N', A: 'B', T: 'R', D: 'Q' };
const SAN_RE =
  /(?<![\p{L}\p{N}.])(?:(\d+)\.(?:\.\.)?\s*|\.\.\.)?(O-O-O|O-O|[KQRBNCATD]?[a-h]?[1-8]?x?[a-h][1-8](?:=[QRBNDTAC])?[+#]?)(?![\p{L}\p{N}])/gu;

/**
 * Jugadas citadas: con letra de pieza, captura, enroque, jaque/mate o número de jugada.
 * Las casillas sueltas («la casilla e4») no cuentan, salvo como respuesta dentro de una secuencia numerada.
 */
export function sanTokens(text: string): SanToken[] {
  const out: SanToken[] = [];
  let prevEnd = -1;
  let prevNumbered = false;
  for (const m of text.matchAll(SAN_RE)) {
    const raw = m[2]!;
    const numbered = m[1] !== undefined || m[0].startsWith('...');
    const strong = /^O-O|^[KQRBNCATD]|x|[+#]$/.test(raw);
    // Respuesta en secuencia: «1.e4 e5» (solo espacio entre medias).
    const reply = prevNumbered && /^\s+$/.test(text.slice(prevEnd, m.index));
    const end = m.index! + m[0].length;
    if (!numbered && !strong && !reply) continue;
    prevEnd = end;
    prevNumbered = numbered;
    const spanish = /^[CATD]/.test(raw);
    const san = raw.replace(/^[CATD]/, (c) => ES[c]!).replace(/=([DTAC])/, (_, c: string) => '=' + ES[c]!);
    out.push({ raw, san, spanish, numbered, after: text.slice(end, end + 40) });
  }
  return out;
}

function withTurnFlipped(pos: Chess): Chess {
  const p = pos.clone();
  p.turn = p.turn === 'white' ? 'black' : 'white';
  p.epSquare = undefined;
  return p;
}

/** Posiciones tras jugar `san` en `pos` (una «R» puede ser torre o, en notación española, rey). */
function playSan(pos: Chess, san: string): Chess[] {
  const clean = san.replace(/[+#]$/, '');
  const out: Chess[] = [];
  for (const s of clean.startsWith('R') ? [clean, 'K' + clean.slice(1)] : [clean]) {
    const m = parseSan(pos, s);
    if (!m) continue;
    const next = pos.clone();
    next.play(m);
    out.push(next);
  }
  return out;
}

/** `pos` tras 1..`depth` jugadas intermedias no citadas. */
function* expand(pos: Chess, depth: number): Generator<Chess> {
  if (!depth) return;
  for (const m of legalMoves(pos)) {
    const q = pos.clone();
    q.play(m);
    yield q;
    yield* expand(q, depth - 1);
  }
}

const ROLE: Record<string, Role> = { K: 'king', Q: 'queen', R: 'rook', B: 'bishop', N: 'knight' };

/** ¿Es una jugada ya hecha? (relatos como «las blancas sacaron la dama con 2.Qh5»): la pieza está en su destino. */
function alreadyPlayed(pos: Chess, san: string): boolean {
  const m = san.match(/^([KQRBN])?.*?([a-h][1-8])(?:=[QRBN])?[+#]?$/);
  if (!m) return false;
  const p = pos.board.get((m[2]!.charCodeAt(0) - 97) + 8 * (Number(m[2]![1]) - 1));
  return !!p && p.role === (m[1] ? ROLE[m[1]] : 'pawn');
}

/**
 * Comprueba las jugadas citadas en `text`. Contextos, por orden: las posiciones que dejan las jugadas citadas
 * antes (secuencias «1.Qg1 Kh4 2.Qh2#»), las de `fens` (la del paso primero y luego su línea), la inicial, y
 * todas ellas con el turno cambiado (amenazas del rival). Para no dar ilegal por error, también vale si la
 * jugada es legal tras una jugada intermedia no citada («cuando el rey se mueva, Nxa8») o si ya está hecha.
 * Un «+»/«#» se da por falso solo si no es jaque/mate en ningún contexto, ni tras hasta dos jugadas intermedias
 * («después de cualquier movimiento del rey, Rh8 es mate»).
 */
export function checkSanMentions(text: string, fens: string[]): Finding[] {
  const bases = [...fens, INITIAL_FEN].map(loadPos).filter((p): p is Chess => typeof p !== 'string');
  const out: Finding[] = [];
  let history: Chess[] = [];
  for (const t of sanTokens(text)) {
    const ctx = [...history, ...bases];
    const all = [...ctx, ...ctx.map(withTurnFlipped)];
    const claimsMate = t.raw.endsWith('#') || /^\s*(es|da)\s+(jaque\s+)?mate\b/i.test(t.after);
    const claimsCheck = t.raw.endsWith('+') || /^\s*(es|da)\s+jaque\b(?!\s+mate)/i.test(t.after);
    const ok = (p: Chess) => (claimsMate ? p.isCheckmate() : claimsCheck ? p.isCheck() : true);
    const deeper = (depth: number, test: (p: Chess) => boolean) => {
      for (const p of all) for (const q of expand(p, depth)) for (const r of playSan(q, t.san)) if (test(r)) return r;
      return undefined;
    };
    const results = all.flatMap((p) => playSan(p, t.san));
    if (!results.length) {
      const r = deeper(1, ok) ?? deeper(1, () => true);
      if (r) results.push(r);
      else {
        if (!bases.some((p) => alreadyPlayed(p, t.san)))
          out.push(f('SAN_ILEGAL', `«${t.raw}» no es legal en la posición del paso ni en su línea`));
        continue;
      }
    }
    // Un mate rara vez sale por azar tras dos jugadas; un jaque sí, por eso solo los mates se buscan más hondo.
    const chosen = results.find(ok) ?? (claimsMate ? deeper(2, ok) : undefined);
    // Se guardan todas las lecturas posibles: el texto puede seguir desde cualquiera.
    history = [...(chosen ? [chosen] : []), ...results, ...history].slice(0, 40);
    if (!chosen) out.push(claimsMate ? f('SAN_MATE_FALSO', `el texto da «${t.raw}» como mate y no lo es`) : f('SAN_JAQUE_FALSO', `el texto da «${t.raw}» como jaque y no lo es`));
  }
  return out;
}
