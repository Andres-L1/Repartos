import { Hono, type Context } from 'hono';
import { cors } from 'hono/cors';
import { bodyLimit } from 'hono/body-limit';
import type {
  BillingMode,
  CompleteLessonBody,
  CompleteReviewResponse,
  FinishResult,
  LessonProgress,
  LevelCard,
  LevelInfo,
  Profile,
  Subscription,
  SubscriptionStatus,
  User,
} from '../src/shared/api.js';
import type { Db, Stmt } from './db.js';
import type { BillingProvider, SubscriptionRecord } from './billing.js';
import { handleCallback, handleLogin, handleLogout, readSession, type AuthConfig } from './auth.js';
import { describePerfs, parseSeen, selectPerf } from './placement.js';
import { levelPlan } from './level.js';
import { LEVELS, suggestLevel } from '../src/shared/levels.js';
import type { Level } from '../src/types.js';
import {
  buildMap,
  computeStatuses,
  computeXp,
  dayOf,
  findLesson,
  passMarkFor,
  yesterdayOf,
  type ContentSource,
  type ProgressRow,
} from './progress.js';
import { completeReview, parseCompleteReview } from './review.js';
import { answerItem, finishPlan, nextDueAt, sessionStatus, startSession, UCI_RE } from './session.js';
import { CONCEPT_IDS, touchSchedule } from './srs.js';
import { buildShop, buyItem, effectiveStreak, equipItem, equippedFor, isUnique, protectorCount, streakAdvance, streakUpdate } from './shop.js';

export interface AppDeps {
  db: Db;
  content: ContentSource;
  billingMode: BillingMode;
  /** Proveedor de pago; solo se usa con billingMode 'dev'. */
  billing: BillingProvider;
  /** SESSION_SECRET (32 bytes base64url). */
  sessionSecret: string | undefined;
  /** PUBLIC_ORIGIN, p. ej. https://chedexpulse.app. */
  publicOrigin: string | undefined;
  now?: () => Date;
  /** Origen de desarrollo extra permitido por CORS (solo local). */
  devOrigin?: string | undefined;
  /** Sirve los estáticos para rutas que no son /api ni /auth (binding ASSETS). */
  assets?: { fetch(req: Request): Promise<Response> } | undefined;
  /** fetch para la API anónima de Lichess (puzles); por defecto el global. Los tests lo sustituyen. */
  fetchImpl?: typeof fetch | undefined;
  /** Azar del banco de la sesión (blancas o espejo con negras); los tests lo fijan. */
  random?: () => number;
}

const MAX_BODY = 16 * 1024;
const DEFAULT_DAILY_GOAL = 20;

type Env = { Variables: { user: User } };
type Ctx = Context<Env>;

class HttpError extends Error {
  constructor(public status: 400 | 401 | 402 | 403 | 404 | 409 | 413 | 415 | 501, message: string) {
    super(message);
  }
}

const isInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v);
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

async function readJson(c: Context): Promise<Record<string, unknown>> {
  const ct = c.req.header('content-type') ?? '';
  if (!ct.toLowerCase().includes('application/json')) throw new HttpError(415, 'Content-Type debe ser application/json');
  let v: unknown;
  try {
    v = JSON.parse(await c.req.text());
  } catch {
    throw new HttpError(400, 'JSON no válido');
  }
  if (!isObj(v)) throw new HttpError(400, 'Se esperaba un objeto JSON');
  return v;
}

interface ProfileRow {
  xp: number;
  streak_days: number;
  longest_streak: number;
  last_active_date: string | null;
  daily_goal_xp: number;
  xp_today: number;
  xp_today_date: string | null;
}

export function createApp(deps: AppDeps) {
  const { db, content, billing, billingMode } = deps;
  const now = deps.now ?? (() => new Date());
  const app = new Hono<Env>();

  const auth: AuthConfig = {
    secret: deps.sessionSecret,
    origin: deps.publicOrigin,
    now,
    onLogin: async (u, perfs) => {
      const t = now().toISOString();
      const sel = selectPerf(perfs); // validación estricta; lo no fiable o fuera de rango se descarta
      await db.batch([
        {
          sql: `INSERT INTO cp_users (id, username, created_at, last_login_at) VALUES (?,?,?,?)
                ON CONFLICT(id) DO UPDATE SET username = excluded.username, last_login_at = excluded.last_login_at`,
          params: [u.id, u.username, t, t],
        },
        ensureProfileStmt(u.id),
        // Se refresca en cada login; la elección del usuario (mode) no se toca.
        {
          sql: `INSERT INTO cp_placement (user_id, source, perf, rating, games, mode, fetched_at) VALUES (?,?,?,?,?,NULL,?)
                ON CONFLICT(user_id) DO UPDATE SET source = excluded.source, perf = excluded.perf,
                  rating = excluded.rating, games = excluded.games, fetched_at = excluded.fetched_at`,
          params: [u.id, sel.source, sel.perf, sel.rating, sel.games, t],
        },
        // Qué envió Lichess de cada ritmo, para poder explicárselo al usuario.
        {
          sql: `INSERT INTO cp_placement_seen (user_id, seen_json, fetched_at) VALUES (?,?,?)
                ON CONFLICT(user_id) DO UPDATE SET seen_json = excluded.seen_json, fetched_at = excluded.fetched_at`,
          params: [u.id, JSON.stringify(describePerfs(perfs)), t],
        },
      ]);
    },
  };
  const ensureProfileStmt = (userId: string): Stmt => ({
    sql: 'INSERT OR IGNORE INTO cp_profiles (user_id, daily_goal_xp) VALUES (?, ?)',
    params: [userId, DEFAULT_DAILY_GOAL],
  });

  // ---------- cabeceras, CORS, límites ----------
  app.use('*', async (c, next) => {
    await next();
    const p = new URL(c.req.url).pathname;
    if (p.startsWith('/api/') || p.startsWith('/auth/')) {
      c.header('X-Content-Type-Options', 'nosniff');
      c.header('X-Frame-Options', 'DENY');
      c.header('Referrer-Policy', 'no-referrer');
      c.header('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
      // El temario público (/api/outline) no depende de la sesión: cacheable unos minutos. Todo lo demás, nunca.
      c.header('Cache-Control', p === '/api/outline' && c.res.status === 200 ? 'public, max-age=300' : 'no-store');
    }
  });
  app.use(
    '/api/*',
    cors({
      origin: (o) => (deps.devOrigin && o === deps.devOrigin ? o : null),
      credentials: true,
      allowHeaders: ['Content-Type'],
      allowMethods: ['GET', 'POST', 'PUT', 'OPTIONS'],
      maxAge: 600,
    }),
  );
  // Defensa CSRF adicional: peticiones que cambian estado solo desde el origen propio (o el de desarrollo).
  app.use('/api/*', async (c, next) => {
    if (c.req.method !== 'GET' && c.req.method !== 'OPTIONS') {
      const origin = c.req.header('origin');
      if (origin) {
        let ok = origin === deps.publicOrigin || (!!deps.devOrigin && origin === deps.devOrigin);
        try {
          ok = ok || new URL(origin).host === new URL(c.req.url).host;
        } catch {
          ok = false;
        }
        if (!ok) return c.json({ error: 'Origen no permitido' }, 403);
      }
    }
    await next();
  });
  app.use(
    '/api/*',
    bodyLimit({ maxSize: MAX_BODY, onError: (c) => c.json({ error: 'Cuerpo demasiado grande' }, 413) }),
  );
  app.onError((err, c) => {
    if (err instanceof HttpError) return c.json({ error: err.message }, err.status);
    console.error('error interno:', err instanceof Error ? err.message : 'desconocido'); // sin cuerpos ni secretos
    return c.json({ error: 'Error interno' }, 500);
  });
  app.notFound(async (c) => {
    const p = new URL(c.req.url).pathname;
    if (!p.startsWith('/api/') && !p.startsWith('/auth/') && deps.assets) return deps.assets.fetch(c.req.raw);
    return c.json({ error: 'No encontrado' }, 404);
  });

  // ---------- helpers de datos ----------
  async function subscriptionFor(userId: string): Promise<Subscription> {
    const base = { priceEurPerMonth: 10 as const };
    if (billingMode === 'beta_open') return { status: 'none', provider: 'none', beta: true, ...base };
    const row = await db.first<{ status: string; provider: string; current_period_end: string | null }>(
      'SELECT status, provider, current_period_end FROM cp_subscriptions WHERE user_id = ?',
      [userId],
    );
    if (!row) return { status: 'none', provider: 'dev', beta: false, ...base };
    let status = row.status as SubscriptionStatus;
    const end = row.current_period_end ?? undefined;
    if (end && new Date(end).getTime() <= now().getTime()) status = 'none'; // periodo vencido
    return {
      status,
      ...base,
      provider: row.provider as 'dev' | 'stripe',
      beta: false,
      ...(status !== 'none' && end ? { currentPeriodEnd: end } : {}),
    };
  }
  /** Acceso a lecciones de pago: siempre en beta abierta; en 'dev', suscripción activa o cancelada dentro del periodo. */
  const hasAccess = async (userId: string) =>
    billingMode === 'beta_open' || (await subscriptionFor(userId)).status !== 'none';

  async function progressMap(userId: string): Promise<Map<string, ProgressRow>> {
    const rows = await db.all<{ lesson_id: string; completed: number; best_score: number }>(
      'SELECT lesson_id, completed, best_score FROM cp_lesson_progress WHERE user_id = ?',
      [userId],
    );
    return new Map(rows.map((r) => [r.lesson_id, { completed: r.completed === 1, bestScore: r.best_score }]));
  }

  async function loadProfile(userId: string): Promise<ProfileRow> {
    await db.run(ensureProfileStmt(userId).sql, ensureProfileStmt(userId).params);
    return (await db.first<ProfileRow>('SELECT * FROM cp_profiles WHERE user_id = ?', [userId]))!;
  }

  const isLevel = (v: unknown): v is Level => typeof v === 'string' && LEVELS.some((l) => l.id === v);

  /** Nivel que eligió el alumno (null si aún no eligió). */
  async function chosenLevel(userId: string): Promise<Level | null> {
    const row = await db.first<{ level: string }>('SELECT level FROM cp_user_level WHERE user_id = ?', [userId]);
    return row && isLevel(row.level) ? row.level : null;
  }

  async function profileFor(userId: string): Promise<Profile> {
    const p = await loadProfile(userId);
    const t = now();
    // Racha efectiva (días UTC): hoy/ayer, o un hueco de exactamente un día cubierto por un protector (sin consumirlo).
    const streakDays = effectiveStreak(p, t, await protectorCount(db, userId));
    const weak = await db.all<{ concept_id: string; count: number }>(
      'SELECT concept_id, count FROM cp_weak_concepts WHERE user_id = ?',
      [userId],
    );
    const completed = await db.first<{ n: number }>(
      'SELECT COUNT(*) AS n FROM cp_lesson_progress WHERE user_id = ? AND completed = 1',
      [userId],
    );
    return {
      xp: p.xp,
      level: (await chosenLevel(userId)) ?? 'initiation',
      streakDays,
      longestStreak: p.longest_streak,
      dailyGoalXp: p.daily_goal_xp,
      xpToday: p.xp_today_date === dayOf(t) ? p.xp_today : 0,
      lessonsCompleted: completed?.n ?? 0,
      weakConcepts: Object.fromEntries(weak.map((w) => [w.concept_id, w.count])),
    };
  }

  // ---------- auth (solo Lichess) ----------
  app.get('/auth/login', (c) => handleLogin(c, auth));
  app.get('/auth/callback', (c) => handleCallback(c, auth));
  app.post('/auth/logout', (c) => handleLogout(c, auth));

  const requireAuth = async (c: Ctx, next: () => Promise<void>) => {
    const s = await readSession(c, auth);
    if (!s) return c.json({ error: 'Sesión requerida' }, 401);
    c.set('user', { id: s.id, username: s.username });
    await next();
  };

  app.get('/api/config', (c) => c.json({ billingMode }));

  // Temario público: solo ids, títulos, orden, descripción y nivel. Nunca el contenido de las lecciones.
  app.get('/api/outline', (c) =>
    c.json({
      units: [...content.units]
        .sort((a, b) => a.order - b.order)
        .map((u) => ({
          id: u.id,
          order: u.order,
          title: u.title,
          description: u.description,
          level: u.level,
          lessons: u.lessons.map((l) => ({ id: l.id, title: l.title })),
        })),
    }),
  );

  app.get('/api/me', requireAuth, async (c) => {
    const user = c.get('user');
    const chosen = await chosenLevel(user.id);
    return c.json({
      user,
      subscription: await subscriptionFor(user.id),
      billingMode,
      equipped: await equippedFor(db, user.id),
      level: chosen ?? 'initiation',
      levelChosen: chosen !== null,
    });
  });

  // ---------- mapa y lecciones ----------
  /** Efecto en el mapa: solo con nivel elegido; sin elección, ninguno. */
  async function levelEffect(userId: string) {
    const level = await chosenLevel(userId);
    if (!level) return { openUnitIds: new Set<string>(), recommendedUnitId: null };
    const plan = levelPlan(level, content);
    return { openUnitIds: new Set(plan.openUnitIds), recommendedUnitId: plan.recommendedUnitId };
  }

  app.get('/api/map', requireAuth, async (c) => {
    const userId = c.get('user').id;
    return c.json({ units: buildMap(content.units, await progressMap(userId), await levelEffect(userId)) });
  });

  async function levelInfoFor(userId: string): Promise<LevelInfo> {
    const chosen = await chosenLevel(userId);
    const seenRow = await db.first<{ seen_json: string }>('SELECT seen_json FROM cp_placement_seen WHERE user_id = ?', [userId]);
    const { level, hint } = suggestLevel(parseSeen(seenRow?.seen_json));
    const levels: LevelCard[] = LEVELS.map((l) => ({ ...l, available: content.units.some((u) => u.level === l.id) }));
    return { chosen, suggested: level, hint, levels, comingSoon: chosen !== null && levelPlan(chosen, content).comingSoon };
  }

  app.get('/api/level', requireAuth, async (c) => c.json(await levelInfoFor(c.get('user').id)));

  app.put('/api/level', requireAuth, async (c) => {
    const userId = c.get('user').id;
    const b = await readJson(c);
    if (!isLevel(b.level)) throw new HttpError(400, 'level debe ser uno de los 6 niveles');
    await db.run(
      `INSERT INTO cp_user_level (user_id, level, chosen_at) VALUES (?,?,?)
       ON CONFLICT(user_id) DO UPDATE SET level = excluded.level, chosen_at = excluded.chosen_at`,
      [userId, b.level, now().toISOString()],
    );
    return c.json(await levelInfoFor(userId));
  });

  /** Valida existencia, suscripción (solo 'dev') y bloqueo por progreso. */
  async function lessonAccess(userId: string, id: string) {
    const lesson = findLesson(content, id);
    if (!lesson) throw new HttpError(404, 'Lección no encontrada');
    if (!lesson.demo && !(await hasAccess(userId))) throw new HttpError(402, 'Requiere suscripción activa');
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
      last_xp: number;
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
        xpGained: prev.last_xp,
        chedexEarned: 0,
        protectorUsed: false,
        profile: await profileFor(userId),
      });
    }

    const passed = body.correct >= passMarkFor(lesson, body.total);
    const alreadyCompleted = prev?.completed === 1;
    const xpGained = computeXp({ correct: body.correct, total: body.total, alreadyCompleted, passed });
    const score = body.correct / body.total;
    const completed = alreadyCompleted || passed;
    const best = Math.max(prev?.best_score ?? 0, score);
    const attempts = (prev?.attempts ?? 0) + 1;

    // Perfil: XP, XP de hoy y racha (día natural UTC; solo cuenta una lección superada).
    const p = await loadProfile(userId);
    const today = dayOf(t);
    // Reglas de días UTC en worker/shop.ts: un hueco de exactamente un día consume un protector.
    const { streak, lastActive, protectorUsed, chedexEarned, rewards } = passed
      ? await streakAdvance(db, userId, p, t)
      : { streak: p.streak_days, lastActive: p.last_active_date, protectorUsed: false, chedexEarned: 0, rewards: [] as Stmt[] };
    const xpToday = (p.xp_today_date === today ? p.xp_today : 0) + xpGained;

    const stmts: Stmt[] = [
      // Reclamo del intento (índice único): de dos envíos concurrentes que leyeron el mismo `prev`, solo uno confirma.
      {
        sql: "INSERT INTO cp_wallet_ledger (user_id, delta, reason, ref, created_at) VALUES (?, 0, 'lesson_attempt', ?, ?)",
        params: [userId, `${lesson.id}:${attempts}`, t.toISOString()],
      },
      {
        sql: `INSERT INTO cp_lesson_progress (user_id, lesson_id, completed, best_score, attempts, completed_at, last_key, last_at, last_xp)
              VALUES (?,?,?,?,?,?,?,?,?)
              ON CONFLICT(user_id, lesson_id) DO UPDATE SET completed=excluded.completed, best_score=excluded.best_score,
                attempts=excluded.attempts, completed_at=COALESCE(cp_lesson_progress.completed_at, excluded.completed_at),
                last_key=excluded.last_key, last_at=excluded.last_at, last_xp=excluded.last_xp`,
        params: [userId, lesson.id, completed ? 1 : 0, best, attempts, completed ? t.toISOString() : null, key, t.getTime(), xpGained],
      },
      ...body.mistakes.filter((m) => CONCEPT_IDS.has(m)).map((m) => touchSchedule(userId, m, t.getTime())),
      ...body.mistakes.map(
        (m): Stmt => ({
          sql: `INSERT INTO cp_weak_concepts (user_id, concept_id, count) VALUES (?,?,1)
                ON CONFLICT(user_id, concept_id) DO UPDATE SET count = count + 1`,
          params: [userId, m],
        }),
      ),
      {
        sql: `UPDATE cp_profiles SET xp = xp + ?, xp_today = CASE WHEN xp_today_date = ? THEN xp_today + ? ELSE ? END, xp_today_date = ?
              WHERE user_id = ?`,
        params: [xpGained, today, xpGained, xpGained, today, userId],
      },
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
          xpGained,
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
          xpGained: 0,
          chedexEarned: 0,
          protectorUsed: false,
          profile: await profileFor(userId),
        });
      }
    }
    return c.json({
      progress: toProgress({ completed: completed ? 1 : 0, best_score: best, attempts }),
      xpGained,
      chedexEarned,
      protectorUsed,
      profile: await profileFor(userId),
    });
  });

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
    const s = await startSession(db, userId, level, now().getTime(), deps.fetchImpl, deps.random);
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

  // ---------- perfil ----------
  app.get('/api/profile', requireAuth, async (c) => c.json({ profile: await profileFor(c.get('user').id) }));

  app.put('/api/profile/daily-goal', requireAuth, async (c) => {
    const b = await readJson(c);
    if (!isInt(b.xp) || b.xp < 5 || b.xp > 1000) throw new HttpError(400, 'xp debe ser un entero entre 5 y 1000');
    const userId = c.get('user').id;
    await loadProfile(userId); // asegura fila
    await db.run('UPDATE cp_profiles SET daily_goal_xp = ? WHERE user_id = ?', [b.xp, userId]);
    return c.json({ profile: await profileFor(userId) });
  });

  // ---------- tienda ----------
  const shopFor = async (userId: string) => buildShop(db, userId, (await profileFor(userId)).streakDays);

  app.get('/api/shop', requireAuth, async (c) => c.json(await shopFor(c.get('user').id)));

  const readItemId = (v: unknown): string => {
    if (typeof v !== 'string' || !/^[a-z0-9_-]{1,40}$/.test(v)) throw new HttpError(400, 'itemId no válido');
    return v;
  };

  // Solo se lee itemId: cualquier precio u otro campo del cuerpo se ignora (el precio lo fija el catálogo del servidor).
  app.post('/api/shop/buy', requireAuth, async (c) => {
    const userId = c.get('user').id;
    const itemId = readItemId((await readJson(c)).itemId);
    await loadProfile(userId); // asegura fila de perfil
    const r = await buyItem(db, userId, itemId, now().toISOString());
    if (r === 'unknown') throw new HttpError(404, 'Objeto no encontrado');
    if (r === 'owned') throw new HttpError(400, 'Ya tienes este objeto');
    if (r === 'max') throw new HttpError(400, 'Ya tienes el máximo de protectores');
    if (r === 'funds') throw new HttpError(400, 'No tienes Chedex suficientes');
    return c.json(await shopFor(userId));
  });

  app.post('/api/shop/equip', requireAuth, async (c) => {
    const userId = c.get('user').id;
    const b = await readJson(c);
    if (b.kind !== 'pieces' && b.kind !== 'board') throw new HttpError(400, "kind debe ser 'pieces' o 'board'");
    const itemId = readItemId(b.itemId);
    const r = await equipItem(db, userId, b.kind, itemId);
    if (r === 'unknown') throw new HttpError(404, 'Objeto no encontrado');
    if (r === 'bad_kind') throw new HttpError(400, 'El objeto no es de ese tipo');
    if (r === 'not_owned') throw new HttpError(400, 'No tienes este objeto');
    return c.json(await shopFor(userId));
  });

  // ---------- facturación ----------
  const saveSub = (userId: string, r: SubscriptionRecord) =>
    db.run(
      `INSERT INTO cp_subscriptions (user_id, status, provider, current_period_end, external_id) VALUES (?,?,?,?,?)
       ON CONFLICT(user_id) DO UPDATE SET status=excluded.status, provider=excluded.provider,
         current_period_end=excluded.current_period_end, external_id=excluded.external_id`,
      [userId, r.status, r.provider, r.currentPeriodEnd ?? null, r.externalId ?? null],
    );
  const comingSoon = () => {
    if (billingMode === 'beta_open') throw new HttpError(501, 'Los pagos llegarán próximamente. Ahora estamos en beta abierta.');
  };

  app.get('/api/billing', requireAuth, async (c) => c.json({ subscription: await subscriptionFor(c.get('user').id) }));

  app.post('/api/billing/subscribe', requireAuth, async (c) => {
    comingSoon();
    const userId = c.get('user').id;
    if ((await subscriptionFor(userId)).status === 'active') return c.json({ subscription: await subscriptionFor(userId) }); // idempotente
    await saveSub(userId, await billing.subscribe(userId, now()));
    return c.json({ subscription: await subscriptionFor(userId) });
  });

  app.post('/api/billing/cancel', requireAuth, async (c) => {
    comingSoon();
    const userId = c.get('user').id;
    const cur = await subscriptionFor(userId);
    if (cur.status === 'none') throw new HttpError(409, 'No hay suscripción que cancelar');
    if (cur.status === 'canceled') return c.json({ subscription: cur });
    const row = await db.first<{ external_id: string | null }>(
      'SELECT external_id FROM cp_subscriptions WHERE user_id = ?',
      [userId],
    );
    await saveSub(
      userId,
      await billing.cancel(
        userId,
        {
          status: cur.status,
          provider: cur.provider === 'stripe' ? 'stripe' : 'dev',
          currentPeriodEnd: cur.currentPeriodEnd,
          externalId: row?.external_id ?? undefined,
        },
        now(),
      ),
    );
    return c.json({ subscription: await subscriptionFor(userId) });
  });

  return app;
}
