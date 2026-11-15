/** Contexto compartido por las rutas: acceso a datos y helpers que usan varios dominios (perfil, nivel, suscripción, sesión). */
import type { BillingMode, ProfileData, Subscription, SubscriptionStatus } from '../src/shared/api.js';
import type { Db, Stmt } from './db.js';
import type { BillingProvider } from './billing.js';
import { clearedCookies, readSession, type AuthConfig } from './auth.js';
import { describePerfs, selectPerf } from './placement.js';
import { levelPlan } from './level.js';
import { LEVELS } from '../src/shared/levels.js';
import type { Level } from '../src/types.js';
import { isAdmin } from '../src/shared/admin.js';
import type { ContentSource, ProgressRow } from './progress.js';
import { effectiveStreak, protectorCount } from './shop.js';
import type { Ctx } from './http.js';

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
  /** Azar del banco de la sesión (blancas o espejo con negras); los tests lo fijan. */
  random?: () => number;
}

interface ProfileRow {
  streak_days: number;
  longest_streak: number;
  last_active_date: string | null;
}

export function createContext(deps: AppDeps) {
  const { db, content, billing, billingMode } = deps;
  const now = deps.now ?? (() => new Date());

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
    sql: 'INSERT OR IGNORE INTO cp_profiles (user_id) VALUES (?)',
    params: [userId],
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
    billingMode === 'beta_open' || isAdmin(userId) || (await subscriptionFor(userId)).status !== 'none';

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

  async function profileFor(userId: string): Promise<ProfileData> {
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
      level: (await chosenLevel(userId)) ?? 'initiation',
      streakDays,
      longestStreak: p.longest_streak,
      lessonsCompleted: completed?.n ?? 0,
      weakConcepts: Object.fromEntries(weak.map((w) => [w.concept_id, w.count])),
    };
  }

  /** Efecto en el mapa: solo con nivel elegido; sin elección, ninguno. */
  async function levelEffect(userId: string) {
    // Administración: todas las unidades abiertas (como repaso, sin regalar progreso), con o sin nivel elegido.
    if (isAdmin(userId)) return { openUnitIds: new Set(content.units.map((u) => u.id)), recommendedUnitId: null };
    const level = await chosenLevel(userId);
    if (!level) return { openUnitIds: new Set<string>(), recommendedUnitId: null };
    const plan = levelPlan(level, content);
    return { openUnitIds: new Set(plan.openUnitIds), recommendedUnitId: plan.recommendedUnitId };
  }

  const requireAuth = async (c: Ctx, next: () => Promise<void>) => {
    const s = await readSession(c, auth);
    if (!s) return c.json({ error: 'Sesión requerida' }, 401);
    // Cuenta borrada (DELETE /api/account desde otro dispositivo o navegador): la cookie sigue firmada pero ya no hay usuario.
    if (!(await db.first('SELECT 1 FROM cp_users WHERE id = ?', [s.id]))) {
      const res = c.json({ error: 'Sesión requerida' }, 401);
      for (const ck of clearedCookies(deps.publicOrigin!)) res.headers.append('Set-Cookie', ck);
      return res;
    }
    c.set('user', { id: s.id, username: s.username });
    await next();
  };

  return {
    deps, db, content, billing, billingMode, now, auth, requireAuth,
    ensureProfileStmt, subscriptionFor, hasAccess, progressMap, loadProfile, isLevel, chosenLevel, profileFor, levelEffect,
  };
}

export type AppContext = ReturnType<typeof createContext>;
