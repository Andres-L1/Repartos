/** Sesión diaria de repaso: el servidor elige las posiciones, guarda las líneas y verifica cada jugada. */
import type { AnswerResult, FinishResult, SessionItem, SessionStart, SessionStatus } from '../src/shared/api.js';
import type { Level } from '../src/types.js';
import { EXERCISES } from '../src/pedagogy/exercises.js';
import { mirrorExercise } from '../src/pedagogy/mirror.js';
import { LEVELS } from '../src/shared/levels.js';
import { difficultyForLevel, dueAfter, maxRatingForLevel, nextBox, themeForConcept } from '../src/review/srs.js';
import { Chess } from 'chessops/chess';
import { parseFen } from 'chessops/fen';
import { makeSquare, parseUci } from 'chessops/util';
import type { Db, Stmt } from './db.js';
import { CONCEPT_IDS } from './srs.js';
import { takePuzzle } from './puzzles.js';

export const SESSION_SIZE = 5;
export const SESSION_TTL_MS = 86_400_000;
export const UCI_RE = /^[a-h][1-8][a-h][1-8][qrbn]?$/;
/** Banco para la sesión: cada ejercicio y su espejo con el otro color (id + '.m'). EXERCISES no cambia. */
const BANK = new Map(EXERCISES.flatMap((e) => [e, mirrorExercise(e)]).map((e) => [e.id, e]));

interface ItemRow {
  id: string;
  session_id: string;
  concept_id: string;
  kind: SessionItem['kind'];
  source_id: string | null;
  fen: string;
  line_json: string;
  step: number;
  attempts: number;
  first_try_ok: number | null;
  status: 'open' | 'done' | 'counted' | 'closed'; // done: respondido; counted: contado en finish; closed: cerrado sin responder
}

/** Enroque como rey sobre su torre (e1h1) pasa a rey a destino (e1g1); lo demás igual. */
function canonical(pos: Chess, uci: string): string {
  const m = parseUci(uci);
  if (!m || !('from' in m)) return uci;
  const king = pos.board.get(m.from);
  const target = pos.board.get(m.to);
  if (king?.role !== 'king' || target?.role !== 'rook' || target.color !== king.color) return uci;
  const from = makeSquare(m.from);
  return from + (m.to > m.from ? 'g' : 'c') + from[1];
}

/**
 * ¿`uci` es la jugada esperada en el paso `step` de la línea? Compara el enroque en forma canónica y, como Lichess
 * en los puzles de mate, si la esperada da jaque mate vale cualquier jugada legal que también lo dé.
 */
function isExpected(fen: string, line: string[], step: number, uci: string): boolean {
  const want = line[step];
  if (want === undefined) return false;
  if (uci === want) return true;
  try {
    const pos = Chess.fromSetup(parseFen(fen).unwrap()).unwrap();
    for (const u of line.slice(0, step)) pos.play(parseUci(u)!);
    return canonical(pos, uci) === canonical(pos, want) || (mates(pos, want) && mates(pos, uci));
  } catch {
    return false;
  }
}

function mates(pos: Chess, uci: string): boolean {
  const m = parseUci(uci);
  if (!m || !pos.isLegal(m)) return false;
  const after = pos.clone();
  after.play(m);
  return after.isCheckmate();
}

const sideToMove = (fen: string) => (fen.split(' ')[1] === 'b' ? 'negras' : 'blancas');
/** Solo lo que el alumno puede ver: nunca la línea ni la solución. */
const toItem = (r: Pick<ItemRow, 'id' | 'kind' | 'concept_id' | 'fen' | 'source_id'>): SessionItem => ({
  itemId: r.id,
  kind: r.kind,
  conceptId: r.concept_id,
  fen: r.fen,
  prompt: promptFor(r),
});
function promptFor(r: Pick<ItemRow, 'kind' | 'fen' | 'source_id'>): string {
  const side = sideToMove(r.fen);
  if (r.kind === 'bank') return BANK.get(r.source_id ?? '')?.prompt ?? `Juegan ${side}. Encuentra la mejor jugada.`;
  if (r.kind === 'own') return `Juegan ${side}. En tu partida aquí había algo mejor. Encuéntralo.`;
  return `Juegan ${side}. Encuentra la mejor continuación.`;
}

/** Vencidos: filas con due_at <= ahora y conceptos fallados sin fila (caja 1, vencidos). Más fallados primero. */
async function dueConcepts(db: Db, userId: string, nowMs: number): Promise<string[]> {
  const rows = await db.all<{ concept_id: string }>(
    `SELECT c.concept_id FROM (
       SELECT concept_id FROM cp_review_schedule WHERE user_id = ? AND due_at <= ?
       UNION
       SELECT concept_id FROM cp_weak_concepts WHERE user_id = ?
         AND concept_id NOT IN (SELECT concept_id FROM cp_review_schedule WHERE user_id = ?)
     ) c LEFT JOIN cp_weak_concepts w ON w.user_id = ? AND w.concept_id = c.concept_id
     ORDER BY COALESCE(w.count, 0) DESC, c.concept_id`,
    [userId, nowMs, userId, userId, userId],
  );
  return rows.map((r) => r.concept_id).filter((c) => CONCEPT_IDS.has(c));
}

export async function nextDueAt(db: Db, userId: string, nowMs: number): Promise<string | null> {
  const r = await db.first<{ t: number | null }>('SELECT MIN(due_at) AS t FROM cp_review_schedule WHERE user_id = ? AND due_at > ?', [userId, nowMs]);
  return r?.t != null ? new Date(r.t).toISOString() : null;
}

export async function sessionStatus(db: Db, userId: string, nowMs: number): Promise<SessionStatus> {
  return { due: (await dueConcepts(db, userId, nowMs)).length, nextDueAt: await nextDueAt(db, userId, nowMs) };
}

async function openSession(db: Db, userId: string, nowMs: number): Promise<SessionStart | null> {
  const open = await db.first<{ session_id: string }>(
    "SELECT session_id FROM cp_session_items WHERE user_id = ? AND status = 'open' AND created_at > ? ORDER BY created_at DESC LIMIT 1",
    [userId, nowMs - SESSION_TTL_MS],
  );
  if (!open) return null;
  const rows = await db.all<ItemRow>(
    "SELECT * FROM cp_session_items WHERE user_id = ? AND session_id = ? AND status = 'open' ORDER BY rowid",
    [userId, open.session_id],
  );
  return { sessionId: open.session_id, items: rows.map(toItem) };
}

/**
 * Sesión abierta de menos de 24 h o una nueva. null si no hay nada que repasar.
 * Varias peticiones a la vez: cada una prepara su sesión, pero solo una gana el reclamo de cp_session_claims
 * (comparar y cambiar sobre el reclamo leído al empezar) y solo esa inserta sus elementos; las demás devuelven
 * los puzles que tomaron al depósito y releen la sesión ganadora.
 */
export async function startSession(
  db: Db,
  userId: string,
  level: Level,
  nowMs: number,
  random: () => number = Math.random,
): Promise<SessionStart | null> {
  for (let tries = 0; tries < 2; tries++) {
    const prev = (await db.first<{ session_id: string }>('SELECT session_id FROM cp_session_claims WHERE user_id = ?', [userId]))?.session_id ?? null;
    const open = await openSession(db, userId, nowMs);
    if (open) return open;
    const res = await newSession(db, userId, level, nowMs, random, prev);
    if (res !== 'lost') return res;
  }
  return openSession(db, userId, nowMs);
}

async function newSession(
  db: Db,
  userId: string,
  level: Level,
  nowMs: number,
  random: () => number,
  prevClaim: string | null,
): Promise<SessionStart | null | 'lost'> {
  const concepts = await dueConcepts(db, userId, nowMs);
  if (!concepts.length) return null;
  const sessionId = crypto.randomUUID();
  const used = new Set<string>();
  const deadThemes = new Set<string>(); // depósito sin puzles de ese tema: no se vuelve a consultar
  const difficulty = difficultyForLevel(level);
  const maxRating = maxRatingForLevel(level);
  const lvl = (l: Level) => LEVELS.findIndex((x) => x.id === l);
  const items: Omit<ItemRow, 'session_id' | 'step' | 'attempts' | 'first_try_ok' | 'status'>[] = [];

  async function pick(conceptId: string) {
    const own = (
      await db.all<{ id: string; fen: string; best_uci: string }>(
        'SELECT id, fen, best_uci FROM cp_review_positions WHERE user_id = ? AND concept_id = ? AND solved_at IS NULL ORDER BY created_at, rowid',
        [userId, conceptId],
      )
    ).find((p) => !used.has(p.id));
    if (own) return { kind: 'own' as const, source_id: own.id, fen: own.fen, line: [own.best_uci] };
    const theme = themeForConcept(conceptId);
    if (theme && !deadThemes.has(theme)) {
      const p = await takePuzzle(db, theme, difficulty, nowMs, maxRating);
      if (p) return { kind: 'puzzle' as const, source_id: p.puzzleId, fen: p.fen, line: p.line };
      deadThemes.add(theme);
    }
    // Banco: el del nivel del alumno; si no hay de ese nivel, el más cercano.
    const ex = EXERCISES.filter((e) => e.conceptId === conceptId && !used.has(e.id)).sort(
      (a, b) => Math.abs(lvl(a.level) - lvl(level)) - Math.abs(lvl(b.level) - lvl(level)),
    )[0];
    if (!ex) return null;
    used.add(ex.id); // el original y su espejo cuentan como el mismo
    const v = random() < 0.5 ? BANK.get(`${ex.id}.m`)! : ex; // blancas o negras al azar
    return { kind: 'bank' as const, source_id: v.id, fen: v.fen, line: v.solutionUci };
  }

  // Un elemento por concepto en cada vuelta; con menos de 5 conceptos se repite concepto con otra posición.
  for (let added = true; added && items.length < SESSION_SIZE; ) {
    added = false;
    for (const conceptId of concepts) {
      if (items.length >= SESSION_SIZE) break;
      const p = await pick(conceptId);
      if (!p) continue;
      used.add(p.source_id);
      items.push({ id: crypto.randomUUID(), concept_id: conceptId, kind: p.kind, source_id: p.source_id, fen: p.fen, line_json: JSON.stringify(p.line) });
      added = true;
    }
  }
  if (!items.length) return null;
  // Atómico: el reclamo solo cambia si sigue como se leyó, y los elementos solo entran si el reclamo es de esta sesión.
  await db.batch([
    {
      sql: `INSERT INTO cp_session_claims (user_id, session_id, created_at) VALUES (?,?,?)
            ON CONFLICT(user_id) DO UPDATE SET session_id = excluded.session_id, created_at = excluded.created_at
            WHERE cp_session_claims.session_id IS ?`,
      params: [userId, sessionId, nowMs, prevClaim],
    },
    ...items.map((it) => ({
      sql: `INSERT INTO cp_session_items (id, user_id, session_id, concept_id, kind, source_id, fen, line_json, created_at)
            SELECT ?,?,?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM cp_session_claims WHERE user_id = ? AND session_id = ?)`,
      params: [it.id, userId, sessionId, it.concept_id, it.kind, it.source_id, it.fen, it.line_json, nowMs, userId, sessionId],
    })),
  ]);
  const won = await db.first<{ id: string }>('SELECT id FROM cp_session_items WHERE id = ?', [items[0]!.id]);
  if (won) return { sessionId, items: items.map(toItem) };
  const taken = items.filter((it) => it.kind === 'puzzle').map((it) => it.source_id!);
  if (taken.length)
    await db.run(`UPDATE cp_puzzle_pool SET used_at = NULL WHERE used_at = ? AND puzzle_id IN (${taken.map(() => '?').join(',')})`, [nowMs, ...taken]);
  return 'lost';
}

/**
 * null: el elemento no es del usuario, está cerrado o caducó (404). 'race': otra respuesta se registró a la vez (409).
 * `attempt` (1, 2, ...): qué respuesta del elemento cree el cliente que envía. Si ya se procesó la anterior a esa
 * (reenvío tras un corte de red o doble envío), se devuelve el mismo resultado sin contar nada. Sin `attempt`
 * (cliente antiguo) se evalúa contra el estado actual.
 */
export async function answerItem(
  db: Db,
  userId: string,
  itemId: string,
  uci: string,
  nowMs: number,
  attempt?: number,
): Promise<AnswerResult | null | 'race'> {
  for (let tries = 0; tries < 2; tries++) {
    const r = await db.first<ItemRow>(
      "SELECT * FROM cp_session_items WHERE id = ? AND user_id = ? AND status IN ('open', 'done') AND created_at > ?",
      [itemId, userId, nowMs - SESSION_TTL_MS],
    );
    if (!r) return null;
    const line = JSON.parse(r.line_json) as string[];
    const processed = r.step / 2 + r.attempts; // respuestas ya contadas en este elemento
    if (attempt !== undefined && attempt === processed) return replay(r, line, uci);
    if (r.status !== 'open') return null;
    if (attempt !== undefined && attempt !== processed + 1) return 'race';
    const res = evaluate(r, line, uci);
    // Condicionada al estado leído: un doble envío concurrente no avanza dos veces.
    const ok = await db.first<{ id: string }>(
      `UPDATE cp_session_items SET step = ?, attempts = ?, first_try_ok = ?, status = ?
       WHERE id = ? AND user_id = ? AND status = 'open' AND step = ? AND attempts = ? RETURNING id`,
      [res.step, res.attempts, res.firstTryOk, res.out.done ? 'done' : 'open', r.id, userId, r.step, r.attempts],
    );
    if (!ok) {
      if (attempt === undefined) return 'race';
      continue; // otra petición del mismo intento ganó: se relee y se devuelve su resultado
    }
    if (res.out.correct && res.out.done && r.kind === 'own' && r.source_id)
      await db.run('UPDATE cp_review_positions SET solved_at = COALESCE(solved_at, ?) WHERE id = ? AND user_id = ?', [nowMs, r.source_id, userId]);
    return res.out;
  }
  return 'race';
}

function evaluate(r: ItemRow, line: string[], uci: string) {
  let step = r.step;
  let attempts = r.attempts;
  let firstTryOk = r.first_try_ok;
  let out: AnswerResult;
  if (isExpected(r.fen, line, r.step, uci)) {
    const reply = line[r.step + 1];
    step = r.step + 2;
    const done = step >= line.length;
    if (done && firstTryOk === null) firstTryOk = 1;
    out = { correct: true, ...(reply ? { reply } : {}), done };
  } else {
    attempts++;
    firstTryOk = 0; // cualquier fallo en el elemento cuenta como no acertado a la primera
    out = attempts >= 2 ? { correct: false, done: true, solution: line.slice(r.step) } : { correct: false, done: false, tryAgain: true };
  }
  return { step, attempts, firstTryOk, out };
}

/**
 * Resultado de la última respuesta ya contada, reconstruido del estado. Fue un acierto si no hubo fallos, si la
 * línea terminó sin agotar los intentos, o si la jugada reenviada es la esperada en el paso anterior.
 */
function replay(r: ItemRow, line: string[], uci: string): AnswerResult {
  const wasCorrect =
    r.step >= 2 && (r.attempts === 0 || (r.status === 'done' && r.attempts < 2) || (r.status === 'open' && isExpected(r.fen, line, r.step - 2, uci)));
  if (wasCorrect) {
    const reply = line[r.step - 1];
    return { correct: true, ...(reply ? { reply } : {}), done: r.step >= line.length };
  }
  return r.attempts >= 2 ? { correct: false, done: true, solution: line.slice(r.step) } : { correct: false, done: false, tryAgain: true };
}

/**
 * Plan de finish. 'missing': sesión inexistente, ajena o caducada (24 h) (404). 'empty': nada terminado (409).
 * Ya terminada: devuelve el mismo resultado sin sentencias (idempotente).
 * Las cajas solo se mueven si due_at <= ahora: un segundo finish concurrente no las mueve otra vez.
 */
export async function finishPlan(
  db: Db,
  userId: string,
  sessionId: string,
  nowMs: number,
): Promise<'missing' | 'empty' | { reviewed: FinishResult['reviewed']; stmts: Stmt[] }> {
  // Caducada a las 24 h como answer: sus respuestas ya no cuentan.
  const rows = await db.all<ItemRow>('SELECT * FROM cp_session_items WHERE user_id = ? AND session_id = ? AND created_at > ? ORDER BY rowid', [
    userId,
    sessionId,
    nowMs - SESSION_TTL_MS,
  ]);
  if (!rows.length) return 'missing';
  const finished = rows.filter((r) => r.status === 'done' || r.status === 'counted');
  if (!finished.length) return 'empty';
  const reviewed: FinishResult['reviewed'] = [];
  for (const r of finished) {
    const seen = reviewed.find((x) => x.conceptId === r.concept_id);
    if (seen) seen.misses += r.attempts;
    else reviewed.push({ conceptId: r.concept_id, correct: r.first_try_ok === 1, misses: r.attempts });
  }
  if (!rows.some((r) => r.status === 'done')) return { reviewed, stmts: [] };

  const boxes = new Map(
    (await db.all<{ concept_id: string; box: number }>('SELECT concept_id, box FROM cp_review_schedule WHERE user_id = ?', [userId])).map((b) => [b.concept_id, b.box]),
  );
  const stmts: Stmt[] = reviewed.map(({ conceptId, correct }): Stmt => {
    const box = nextBox(boxes.get(conceptId) ?? 1, correct);
    return {
      sql: `INSERT INTO cp_review_schedule (user_id, concept_id, box, due_at, last_at) VALUES (?,?,?,?,?)
            ON CONFLICT(user_id, concept_id) DO UPDATE SET box = excluded.box, due_at = excluded.due_at, last_at = excluded.last_at
            WHERE cp_review_schedule.due_at <= ?`,
      params: [userId, conceptId, box, dueAfter(box, nowMs), nowMs, nowMs],
    };
  });
  stmts.push(
    { sql: "UPDATE cp_session_items SET status = 'counted' WHERE user_id = ? AND session_id = ? AND status = 'done'", params: [userId, sessionId] },
    { sql: "UPDATE cp_session_items SET status = 'closed' WHERE user_id = ? AND session_id = ? AND status = 'open'", params: [userId, sessionId] },
  );
  return { reviewed, stmts };
}
