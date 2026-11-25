/**
 * Tablebase de Lichess (Syzygy, hasta 7 piezas) para verificar finales de forma exacta.
 * Caché en test/fixtures/tablebase/positions.json: los tests leen solo la caché (sin red, deterministas) y
 * `npm run verify:finales -- --refresh` la vuelve a pedir a https://tablebase.lichess.ovh.
 * Solo se envía el FEN de cada posición de ejercicio.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { Chess } from 'chessops/chess';
import { makeFen, parseFen } from 'chessops/fen';
import { makeSan } from 'chessops/san';
import { parseUci } from 'chessops/util';
import { MAX_BRANCHES } from '../../src/content/schema.ts';
import type { Branch } from '../../src/shared/moves.ts';

export interface TbMove {
  uci: string;
  /** Resultado para el bando que mueve DESPUÉS de esta jugada (el rival). */
  category: string;
  dtz: number | null;
  dtm: number | null;
}
export interface TbEntry {
  category: string;
  dtz: number | null;
  dtm: number | null;
  moves: TbMove[];
}
export type TbCache = Record<string, TbEntry>;

export const CACHE_PATH = 'test/fixtures/tablebase/positions.json';
const API = 'https://tablebase.lichess.ovh/standard';

/** Clave de caché: tablero, turno, enroques y al paso (sin relojes, que no cambian el resultado salvo la regla de 50). */
export const tbKey = (fen: string): string => fen.split(' ').slice(0, 4).join(' ');

export function loadCache(path = CACHE_PATH): TbCache {
  return existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as TbCache) : {};
}

export function saveCache(cache: TbCache, path = CACHE_PATH): void {
  mkdirSync(dirname(path), { recursive: true });
  const sorted = Object.fromEntries(Object.keys(cache).sort().map((k) => [k, cache[k]!]));
  writeFileSync(path, JSON.stringify(sorted, null, 1) + '\n');
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let lastCall = 0;

/** Pide una posición a la API: 400 ms entre peticiones y reintento con espera creciente ante 429 o error de red. */
export async function fetchEntry(fen: string): Promise<TbEntry> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const wait = lastCall + 400 - Date.now();
    if (wait > 0) await sleep(wait);
    lastCall = Date.now();
    let res: Response;
    try {
      res = await fetch(`${API}?fen=${encodeURIComponent(tbKey(fen) + ' 0 1')}`, { headers: { 'User-Agent': 'chess-content-verifier' } });
    } catch {
      await sleep(2000 * (attempt + 1));
      continue;
    }
    if (res.status === 429) {
      await sleep(60_000);
      continue;
    }
    if (!res.ok) throw new Error(`tablebase ${res.status} para ${fen}: ${await res.text()}`);
    const j = (await res.json()) as TbEntry & { moves: TbMove[] };
    return {
      category: j.category,
      dtz: j.dtz ?? null,
      dtm: j.dtm ?? null,
      moves: j.moves.map((m) => ({ uci: m.uci, category: m.category, dtz: m.dtz ?? null, dtm: m.dtm ?? null })),
    };
  }
  throw new Error(`tablebase: sin respuesta tras varios intentos para ${fen}`);
}

export type Probe = (fen: string) => TbEntry;

/** Consulta solo la caché; si falta la posición, error (los tests no usan la red). */
export const cacheProbe =
  (cache: TbCache): Probe =>
  (fen) => {
    const e = cache[tbKey(fen)];
    if (!e) throw new Error(`falta en la caché de la tablebase: ${tbKey(fen)} (npm run verify:finales -- --refresh)`);
    return e;
  };

const FLIP: Record<string, string> = {
  win: 'loss',
  loss: 'win',
  draw: 'draw',
  'cursed-win': 'blessed-loss',
  'blessed-loss': 'cursed-win',
};
/** Resultado para quien mueve tras jugar `m` (la tablebase lo da desde el lado del rival). */
export const moverResult = (m: TbMove): string => FLIP[m.category] ?? `?${m.category}`;

const load = (fen: string) => Chess.fromSetup(parseFen(fen).unwrap()).unwrap();
const san = (pos: Chess, uci: string) => makeSan(pos, parseUci(uci)!);

/** FEN de cada posición de la línea antes de cada jugada (índice i = antes de line[i]). */
export function lineFens(fen: string, line: readonly string[]): string[] {
  const pos = load(fen);
  const out: string[] = [];
  for (const u of line) {
    out.push(makeFen(pos.toSetup()));
    pos.play(parseUci(u)!);
  }
  return out;
}

/** Modo de criterio: `category` (todas las jugadas que conservan el resultado) u `optimal` (ver `checkLine`). */
export type Mode = 'category' | 'optimal';

/** Los ejercicios avanzados (u15 en adelante y ex.rook.05+) usan el criterio `optimal`; los anteriores, `category`. */
export const modeFor = (key: string): Mode => (/^(u1[5-9]\.|ex\.rook\.0[5-9])/.test(key) ? 'optimal' : 'category');

/** Distancia para ordenar jugadas del mismo resultado: DTM si todas la traen (hasta 6 piezas) y, si no, DTZ. */
const distance = (moves: TbMove[]): ((m: TbMove) => number) =>
  moves.every((m) => m.dtm !== null) ? (m) => Math.abs(m.dtm!) : (m) => Math.abs(m.dtz ?? 0);

/**
 * Criterio exacto de un ejercicio de finales (lista de errores; vacía si cumple):
 * - En cada jugada del alumno, la posición es ganada o tablas para él (nada de «cursed-win»: la regla de 50 jugadas
 *   cambiaría el resultado) y las jugadas aceptadas (la de la línea y, en la última, `alt`) son EXACTAMENTE las que
 *   cumplen el criterio. `category`: todas las que conservan el resultado. `optimal`: si la posición está ganada,
 *   solo las que además ganan lo antes posible (menor DTM; menor DTZ si no hay DTM), de modo que una jugada que gana
 *   pero alarga el final se trata como una degradación; si son tablas, todas las que conservan las tablas.
 *   Toda jugada que cumple y no está aceptada es un error, igual que toda aceptada que no cumple. En las jugadas
 *   intermedias del alumno se aceptan la de la línea y las primeras jugadas de `branches`; cada rama debe llegar hasta el
 *   final de la línea con su propia continuación (alumno óptimo, rival que más resiste) y, en su última jugada, `alt`.
 * - En cada respuesta del rival, la jugada conserva su mejor resultado y, si pierde, es una de las que más resisten
 *   (`category`: máxima distancia a la conversión, DTZ, o al mate, DTM; `optimal`: máxima distancia por DTM, o por
 *   DTZ si no hay DTM).
 */
export function checkLine(
  probe: Probe,
  fen: string,
  line: readonly string[],
  alt: readonly string[] = [],
  mode: Mode = 'category',
  branches: readonly Branch[] = [],
): string[] {
  const last = line.length - 1;
  const errors = checkPath(probe, fen, line, mode, 0, (i) => [line[i]!, ...(i === last ? alt : branches.filter((b) => b.at === i).map((b) => b.line[0]!))], () => true);
  if (branches.length > MAX_BRANCHES) errors.push(`${branches.length} ramas: el máximo es ${MAX_BRANCHES}`);
  const seen = new Set<string>();
  for (const b of branches) {
    const tag = `rama ${b.at}:${b.line[0]}`;
    if (seen.has(`${b.at}:${b.line[0]}`)) errors.push(`${tag}: repetida`);
    seen.add(`${b.at}:${b.line[0]}`);
    if (b.at % 2 !== 0 || b.at >= last) errors.push(`${tag}: debe ser una jugada intermedia del alumno (para la última está \`alt\`)`);
    else if (b.line.length % 2 === 0 || b.at + b.line.length !== line.length) errors.push(`${tag}: la continuación falta o no llega hasta el final de la línea (${b.at + b.line.length} frente a ${line.length} medias jugadas)`);
    else if (b.line[0] === line[b.at]) errors.push(`${tag}: es la jugada de la línea principal`);
    else {
      const full = [...line.slice(0, b.at), ...b.line];
      const bl = full.length - 1;
      // En la rama: jugadas del alumno óptimas y rival que más resiste; solo la última jugada exige completitud (`alt`).
      for (const e of checkPath(probe, fen, full, mode, b.at, (i) => [full[i]!, ...(i === bl ? (b.alt ?? []) : [])], (i) => i === bl)) errors.push(`${tag}: ${e}`);
    }
  }
  return errors;
}

/**
 * Comprueba las jugadas de `line` desde el índice `from`. `accepted(i)` son las jugadas que la lección acepta en la
 * jugada i del alumno; `complete(i)` indica si, además, toda jugada que cumple el criterio debe estar aceptada.
 */
function checkPath(
  probe: Probe,
  fen: string,
  line: readonly string[],
  mode: Mode,
  from: number,
  accepted: (i: number) => string[],
  complete: (i: number) => boolean,
): string[] {
  const errors: string[] = [];
  const fens = lineFens(fen, line);
  line.forEach((uci, i) => {
    if (i < from) return;
    const cur = load(fens[i]!);
    const e = probe(fens[i]!);
    const tag = `${i % 2 === 0 ? 'alumno' : 'rival'} ${san(cur, uci)}`;
    const mine = e.moves.find((m) => m.uci === uci);
    if (!mine) {
      errors.push(`${tag}: la tablebase no lista la jugada`);
      return;
    }
    if (i % 2 === 1) {
      if (moverResult(mine) !== e.category) errors.push(`${tag}: el rival empeora su resultado (${e.category} -> ${moverResult(mine)})`);
      else if (e.category === 'loss') {
        const keep = e.moves.filter((m) => moverResult(m) === 'loss');
        if (mode === 'optimal') {
          const d = distance(keep);
          const best = Math.max(...keep.map(d));
          if (d(mine) < best) errors.push(`${tag}: el rival tenía una defensa más resistente (${d(mine)} frente a ${best})`);
        } else {
          const bestDtz = Math.max(...keep.map((m) => m.dtz ?? 0));
          const withDtm = keep.every((m) => m.dtm !== null);
          const bestDtm = withDtm ? Math.max(...keep.map((m) => m.dtm!)) : null;
          if ((mine.dtz ?? 0) < bestDtz && !(bestDtm !== null && mine.dtm === bestDtm))
            errors.push(`${tag}: el rival tenía una defensa más resistente (DTZ ${mine.dtz} frente a ${bestDtz})`);
        }
      }
      return;
    }
    if (e.category !== 'win' && e.category !== 'draw') {
      errors.push(`${tag}: posición ${e.category} para el alumno (solo se admiten ganadas o tablas)`);
      return;
    }
    let keepMoves = e.moves.filter((m) => moverResult(m) === e.category);
    if (mode === 'optimal' && e.category === 'win') {
      const d = distance(keepMoves);
      const best = Math.min(...keepMoves.map(d));
      keepMoves = keepMoves.filter((m) => d(m) === best);
    }
    const keep = new Set(keepMoves.map((m) => m.uci));
    const ok = new Set(accepted(i));
    // Si la última jugada de la línea da mate, la corrección compartida (isExpectedMove) acepta cualquier mate: no hace falta listarlos en `alt`.
    if (i === line.length - 1 && playsMate(cur, uci)) for (const m of e.moves) if (playsMate(cur, m.uci)) ok.add(m.uci);
    const what = mode === 'optimal' && e.category === 'win' ? 'gana lo antes posible' : `conserva el resultado (${e.category})`;
    for (const a of ok) if (!keep.has(a)) errors.push(`${tag}: ${san(cur, a)} no ${what}`);
    if (complete(i)) for (const k of keep) if (!ok.has(k)) errors.push(`${tag}: ${san(cur, k)} también ${what} y no se acepta`);
  });
  return errors;
}

/**
 * Para los pasos de ONLY_RESULT (el texto dice «la única jugada»): las jugadas que conservan el resultado de la posición
 * son exactamente la de la línea y, si el ejercicio es de una jugada, las de `alt`.
 */
export function onlyResultErrors(probe: Probe, fen: string, line: readonly string[], alt: readonly string[] = []): string[] {
  const e = probe(fen);
  const want = new Set([line[0]!, ...(line.length === 1 ? alt : [])]);
  const have = new Set(e.moves.filter((m) => moverResult(m) === e.category).map((m) => m.uci));
  const pos = load(fen);
  const name = (u: string) => san(pos, u);
  return [...have].filter((u) => !want.has(u)).map((u) => `${name(u)} también conserva el resultado (${e.category}) y el texto dice que no`).concat([...want].filter((u) => !have.has(u)).map((u) => `${name(u)} no conserva el resultado (${e.category})`));
}

const playsMate = (pos: Chess, uci: string): boolean => {
  const next = pos.clone();
  next.play(parseUci(uci)!);
  return next.isCheckmate();
};

/** Resumen legible de una posición: resultado y jugadas agrupadas por resultado para quien mueve. */
export function describeEntry(fen: string, e: TbEntry): string {
  const pos = load(fen);
  const groups = new Map<string, string[]>();
  for (const m of e.moves) {
    const r = moverResult(m);
    groups.set(r, [...(groups.get(r) ?? []), `${san(pos, m.uci)}(${m.uci} dtz ${m.dtz}${m.dtm !== null ? ` dtm ${m.dtm}` : ''})`]);
  }
  return [`${e.category} dtz ${e.dtz} dtm ${e.dtm}`, ...[...groups].map(([r, ms]) => `  ${r}: ${ms.join(' ')}`)].join('\n');
}
