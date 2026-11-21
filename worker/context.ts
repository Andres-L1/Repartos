/** Contexto compartido por las rutas: acceso a datos y helpers que usan varios dominios (perfil, nivel, sesión, acceso). */
import type { Profile } from '../src/shared/api.js';
import type { Db, Stmt } from './db.js';
import { recordDenied, type AccessMode } from './access.js';
import { clearedCookies, readSession, type AuthConfig } from './auth.js';
import { describePerfs, selectPerf } from './placement.js';
import { levelPlan } from './level.js';
import { LEVELS } from '../src/shared/levels.js';
import type { Level } from '../src/types.js';
import { isAdmin } from '../src/shared/admin.js';
import type { ContentSource, ProgressRow } from './progress.js';
import { effectiveStreak, protectorCount } from './shop.js';
import type { Ctx } from './http.js';
import { resolveAi, type AiSettings } from './ai.js';

export interface AppDeps {
  db: Db;
  content: ContentSource;
  /**
   * 'allowlist' (valor por defecto, el de producción): solo entran la administración y las cuentas de cp_allowed_users.
   * 'open': sin lista (solo para los tests y el desarrollo local).
   */
  accessMode?: AccessMode;
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
  /** Explicaciones con IA (clave y límites del Worker; `transport` falso en los tests). Sin clave ni transporte: desactivadas. */
  ai?: AiSettings;
}

interface ProfileRow {
  streak_days: number;
  longest_streak: number;
  last_active_date: string | null;
}

export function createContext(deps: AppDeps) {
  const { db, content } = deps;
  const restricted = (deps.accessMode ?? 'allowlist') !== 'open';
  const now = deps.now ?? (() => new Date());
  const ai = resolveAi(deps.ai);

  const auth: AuthConfig = {
    secret: deps.sessionSecret,
    origin: deps.publicOrigin,
    now,
    isAllowed: async (u) =>
      !restricted || isAdmin(u.id) || !!(await db.first('SELECT 1 FROM cp_allowed_users WHERE lichess_id = ?', [u.id])),
    onDenied: (u) => recordDenied(db, u, now().getTime()),
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
    // Una sola consulta por clave primaria: cuenta borrada (DELETE /api/account desde otro dispositivo) o ya no autorizada.
    const row = await db.first<{ allowed: number | null }>(
      'SELECT (SELECT 1 FROM cp_allowed_users WHERE lichess_id = u.id) AS allowed FROM cp_users u WHERE u.id = ?',
      [s.id],
    );
    const denied = row && restricted && !isAdmin(s.id) && !row.allowed;
    if (!row || denied) {
      const res = denied
        ? c.json({ error: 'Tu cuenta ya no tiene acceso a Chedex Pulse. Pide a tu profesor de TopChess que te autorice.', code: 'no_access' }, 403)
        : c.json({ error: 'Sesión requerida' }, 401);
      for (const ck of clearedCookies(deps.publicOrigin!)) res.headers.append('Set-Cookie', ck);
      return res;
    }
    c.set('user', { id: s.id, username: s.username });
    await next();
  };

  return {
    deps, db, content, now, auth, requireAuth, ai,
    ensureProfileStmt, progressMap, loadProfile, isLevel, chosenLevel, profileFor, levelEffect,
  };
}

export type AppContext = ReturnType<typeof createContext>;
