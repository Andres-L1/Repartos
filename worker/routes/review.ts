/** Partidas repasadas y sesión diaria de repaso. */
import type { Hono } from 'hono';
import type { AppContext } from '../context.js';
import { HttpError, isInt, readJson, type Env } from '../http.js';
import type { CompleteReviewResponse, FinishResult } from '../../src/shared/api.js';
import { completeReview, parseCompleteReview } from '../review.js';
import { UCI_RE, answerItem, finishPlan, nextDueAt, sessionStatus, startSession } from '../session.js';
import { isUnique, streakAdvance, streakUpdate } from '../shop.js';

export function registerReviewRoutes(app: Hono<Env>, k: AppContext): void {
  const { db, now, requireAuth, loadProfile, chosenLevel, profileFor, deps } = k;
  // ---------- partidas repasadas ----------
  app.post('/api/review/complete', requireAuth, async (c) => {
    const parsed = parseCompleteReview(await readJson(c));
    if (typeof parsed === 'string') throw new HttpError(400, parsed);
    const counted = await completeReview(db, c.get('user').id, parsed.gameId, parsed.concepts, now().toISOString(), parsed.positions);
    return c.json({ counted } satisfies CompleteReviewResponse);
  });

  // ---------- sesión diaria de repaso ----------
  app.get('/api/session/status', requireAuth, async (c) => c.json(await sessionStatus(db, c.get('user').id, now().getTime())));

  app.get('/api/session', requireAuth, async (c) => {
    const userId = c.get('user').id;
    const level = (await chosenLevel(userId)) ?? 'initiation';
    const s = await startSession(db, userId, level, now().getTime(), deps.random);
    if (!s) throw new HttpError(409, 'Hoy no toca repasar');
    return c.json(s);
  });

  app.post('/api/session/answer', requireAuth, async (c) => {
    const b = await readJson(c);
    if (typeof b.itemId !== 'string' || b.itemId.length > 64 || typeof b.uci !== 'string' || !UCI_RE.test(b.uci))
      throw new HttpError(400, 'itemId/uci no válidos');
    if (b.attempt !== undefined && (!isInt(b.attempt) || b.attempt < 1 || b.attempt > 100)) throw new HttpError(400, 'attempt no válido');
    const r = await answerItem(db, c.get('user').id, b.itemId, b.uci, now().getTime(), b.attempt as number | undefined);
    if (r === null) throw new HttpError(404, 'Ejercicio no encontrado');
    if (r === 'race') throw new HttpError(409, 'Respuesta ya registrada');
    return c.json(r);
  });

  app.post('/api/session/finish', requireAuth, async (c) => {
    const userId = c.get('user').id;
    const b = await readJson(c);
    if (typeof b.sessionId !== 'string' || b.sessionId.length > 64) throw new HttpError(400, 'sessionId no válido');
    const t = now();
    const plan = await finishPlan(db, userId, b.sessionId, t.getTime());
    if (plan === 'missing') throw new HttpError(404, 'Sesión no encontrada');
    if (plan === 'empty') throw new HttpError(409, 'Responde al menos un ejercicio antes de terminar');
    if (plan.stmts.length) {
      // Racha con la misma regla que las lecciones (sin XP); cajas, elementos y racha en una sola transacción.
      const p = await loadProfile(userId);
      const s = await streakAdvance(db, userId, p, t);
      try {
        await db.batch([...plan.stmts, streakUpdate(userId, p, s.streak, s.lastActive), ...s.rewards]);
      } catch (e) {
        // Doble envío o lección terminada a la vez: otra transacción ya registró el ingreso/consumo (índice único) y esta se
        // revierte entera. Se reaplican solo cajas y elementos: las cajas exigen due_at <= ahora, así que nada se mueve dos veces.
        if (!(s.rewards.length && isUnique(e))) throw e;
        await db.batch(plan.stmts);
      }
    }
    return c.json({
      reviewed: plan.reviewed,
      nextDueAt: await nextDueAt(db, userId, t.getTime()),
      streak: (await profileFor(userId)).streakDays,
    } satisfies FinishResult);
  });

}
