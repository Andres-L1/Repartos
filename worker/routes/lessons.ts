/** Lecciones: contenido, demo y finalización (progreso, racha, Chedex, conceptos fallados). */
import type { Hono } from 'hono';
import type { AppContext } from '../context.js';
import { HttpError, isInt, readJson, type Env } from '../http.js';
import type { CompleteLessonBody, LessonProgress } from '../../src/shared/api.js';
import type { Stmt } from '../db.js';
import { computeStatuses, findLesson, passMarkFor } from '../progress.js';
import { isUnique, streakAdvance, streakUpdate } from '../shop.js';
import { CONCEPT_IDS, touchSchedule, weakConceptStmt } from '../srs.js';

export function registerLessonRoutes(app: Hono<Env>, k: AppContext): void {
  const { db, content, now, requireAuth, progressMap, loadProfile, profileFor, levelEffect } = k;
  /** Valida existencia y bloqueo por progreso. */
  async function lessonAccess(userId: string, id: string) {
    const lesson = findLesson(content, id);
    if (!lesson) throw new HttpError(404, 'Lección no encontrada');
    const st = computeStatuses(content.units, await progressMap(userId), await levelEffect(userId)).lessonStatus.get(id);
    if (st === 'locked') throw new HttpError(403, 'Lección bloqueada: completa antes las anteriores');
    return lesson;
  }

  app.get('/api/lessons/:id', requireAuth, async (c) =>
    c.json({ lesson: await lessonAccess(c.get('user').id, c.req.param('id') ?? '') }),
  );

  app.get('/api/demo', (c) => {
    for (const u of content.units) for (const l of u.lessons) if (l.demo) return c.json({ lesson: l });
    throw new HttpError(404, 'No hay lección demo');
  });

  app.post('/api/lessons/:id/complete', requireAuth, async (c) => {
    const userId = c.get('user').id;
    const lesson = await lessonAccess(userId, c.req.param('id') ?? '');
    const b = await readJson(c);
    const { correct, total } = b;
    if (!isInt(correct) || !isInt(total) || total < 1 || total > 100 || correct < 0 || correct > total)
      throw new HttpError(400, 'correct/total no válidos');
    if (lesson.evaluation.length > 0 && total !== lesson.evaluation.length)
      throw new HttpError(400, 'total no coincide con la evaluación de la lección');
    const rawMistakes = b.mistakes ?? [];
    if (
      !Array.isArray(rawMistakes) ||
      rawMistakes.length > 50 ||
      !rawMistakes.every((m) => typeof m === 'string' && /^[\w.:-]{1,64}$/.test(m))
    )
      throw new HttpError(400, 'mistakes no válido');
    const body: CompleteLessonBody = { correct, total, mistakes: rawMistakes as string[] };

    const t = now();
    const prev = await db.first<{
      completed: number;
      best_score: number;
      attempts: number;
      last_key: string | null;
      last_at: number | null;
    }>('SELECT * FROM cp_lesson_progress WHERE user_id = ? AND lesson_id = ?', [userId, lesson.id]);
    const key = JSON.stringify([body.correct, body.total, [...body.mistakes].sort()]);
    const toProgress = (r: { completed: number; best_score: number; attempts: number }): LessonProgress => ({
      lessonId: lesson.id,
      completed: r.completed === 1,
      bestScore: r.best_score,
      attempts: r.attempts,
    });
    // Doble envío (mismo resultado en <10 s): no se vuelve a contar nada.
    if (prev && prev.last_key === key && prev.last_at !== null && t.getTime() - prev.last_at < 10_000) {
      return c.json({
        progress: toProgress(prev),
        chedexEarned: 0,
        protectorUsed: false,
        profile: await profileFor(userId),
      });
    }

    const passed = body.correct >= passMarkFor(lesson, body.total);
    const alreadyCompleted = prev?.completed === 1;
    const score = body.correct / body.total;
    const completed = alreadyCompleted || passed;
    const best = Math.max(prev?.best_score ?? 0, score);
    const attempts = (prev?.attempts ?? 0) + 1;

    // Perfil: racha (día natural UTC; solo cuenta una lección superada).
    const p = await loadProfile(userId);
    // Reglas de días UTC en worker/shop.ts: un hueco de exactamente un día consume un protector.
    const { streak, lastActive, protectorUsed, chedexEarned, rewards } = passed
      ? await streakAdvance(db, userId, p, t)
      : { streak: p.streak_days, lastActive: p.last_active_date, protectorUsed: false, chedexEarned: 0, rewards: [] as Stmt[] };

    const stmts: Stmt[] = [
      // Reclamo del intento (índice único): de dos envíos concurrentes que leyeron el mismo `prev`, solo uno confirma.
      {
        sql: "INSERT INTO cp_wallet_ledger (user_id, delta, reason, ref, created_at) VALUES (?, 0, 'lesson_attempt', ?, ?)",
        params: [userId, `${lesson.id}:${attempts}`, t.toISOString()],
      },
      {
        sql: `INSERT INTO cp_lesson_progress (user_id, lesson_id, completed, best_score, attempts, completed_at, last_key, last_at)
              VALUES (?,?,?,?,?,?,?,?)
              ON CONFLICT(user_id, lesson_id) DO UPDATE SET completed=excluded.completed, best_score=excluded.best_score,
                attempts=excluded.attempts, completed_at=COALESCE(cp_lesson_progress.completed_at, excluded.completed_at),
                last_key=excluded.last_key, last_at=excluded.last_at`,
        params: [userId, lesson.id, completed ? 1 : 0, best, attempts, completed ? t.toISOString() : null, key, t.getTime()],
      },
      ...body.mistakes.filter((m) => CONCEPT_IDS.has(m)).map((m) => touchSchedule(userId, m, t.getTime())),
      ...body.mistakes.map((m) => weakConceptStmt(userId, m)),
      // Los reclamos de intentos viejos ya no hacen falta (solo choca el siguiente): la tabla guarda ≤2 filas por lección.
      ...(attempts > 2
        ? [{ sql: "DELETE FROM cp_wallet_ledger WHERE user_id = ? AND reason = 'lesson_attempt' AND ref = ?", params: [userId, `${lesson.id}:${attempts - 2}`] }]
        : []),
    ];
    // Racha condicionada a lo leído: si otra actividad ya la avanzó hoy, no se pisa.
    const streakStmts: Stmt[] = passed ? [streakUpdate(userId, p, streak, lastActive), ...rewards] : [];
    try {
      // Progreso, racha, protector e ingreso de Chedex: una sola transacción atómica.
      await db.batch([...stmts, ...streakStmts]);
    } catch (e) {
      if (!isUnique(e)) throw e;
      try {
        // El hito/protector de hoy ya lo registró otra actividad (sesión o lección a la vez): se cuenta la lección sin él.
        if (!streakStmts.length) throw e;
        await db.batch(stmts);
        return c.json({
          progress: toProgress({ completed: completed ? 1 : 0, best_score: best, attempts }),
          chedexEarned: 0,
          protectorUsed: false,
          profile: await profileFor(userId),
        });
      } catch (e2) {
        if (!isUnique(e2)) throw e2;
        // Doble envío concurrente: el otro ya reclamó este intento; no se cuenta nada.
        return c.json({
          progress: toProgress((await db.first<{ completed: number; best_score: number; attempts: number }>(
            'SELECT completed, best_score, attempts FROM cp_lesson_progress WHERE user_id = ? AND lesson_id = ?', [userId, lesson.id])) ?? { completed: 0, best_score: 0, attempts: 0 }),
          chedexEarned: 0,
          protectorUsed: false,
          profile: await profileFor(userId),
        });
      }
    }
    return c.json({
      progress: toProgress({ completed: completed ? 1 : 0, best_score: best, attempts }),
      chedexEarned,
      protectorUsed,
      profile: await profileFor(userId),
    });
  });

}
