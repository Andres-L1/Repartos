/**
 * Contrato HTTP entre web/ y worker/ (Cloudflare Worker + D1). Cookie de sesión sellada HttpOnly.
 * Errores: { error: string } con código HTTP adecuado (400 validación, 401 sin sesión, 403 sin permiso o cuenta
 * no autorizada, 404, 409 conflicto).
 *
 * Acceso restringido a alumnos de TopChess: solo entran la administración (src/shared/admin.ts) y las cuentas de cp_allowed_users.
 *
 * Acceso: SOLO con Lichess (OAuth PKCE sin scopes; el token de Lichess nunca se guarda y se revoca al terminar).
 *   GET  /auth/login                                           -> 303 a lichess.org/oauth
 *   GET  /auth/callback?code&state                             -> 303 a /aprender (o /entrar?auth=failed, o /entrar?acceso=denegado&usuario=... si la cuenta no está autorizada)
 *   POST /auth/logout                                          -> {ok:true}   (borra la cookie)
 *
 * API (JSON, bajo /api):
 * GET  /api/me                                                 -> {user, isAdmin, equipped, level, levelChosen}   (401 sin sesión)
 * GET  /api/map                                                -> {units: MapUnit[]}   (con nivel elegido: placedOpen/recommended)
 * GET  /api/level                                              -> LevelInfo   (nivel elegido, sugerido por Lichess y tarjetas de los 6 niveles)
 * PUT  /api/level {level}                                      -> LevelInfo   (guarda la elección; nivel inválido: 400)
 * GET  /api/lessons/:id                                        -> {lesson}
 * POST /api/lessons/:id/complete {correct, total, mistakes}    -> {progress, chedexEarned, protectorUsed, profile}
 * GET  /api/profile                                            -> {profile}
 * GET    /api/admin/access                                     -> AccessOverview   (solo administración; el resto de /api/admin/* igual)
 * POST   /api/admin/allowed {username}                          -> AccessOverview   (400 usuario no válido, 409 duplicado o tope)
 * DELETE /api/admin/allowed/:id                                 -> AccessOverview   (quita el acceso; sus datos no se borran)
 * POST   /api/admin/requests/:id/approve                        -> AccessOverview   (autoriza desde una solicitud)
 * DELETE /api/admin/requests/:id                                -> AccessOverview   (descarta la solicitud)
 * POST /api/explain {kind:'lesson',lessonId,stepKind,stepIndex} | {kind:'error',fen,played,best} -> {text, cached}   (429 topes, 503 sin IA; ver worker/ai.ts)
 * GET    /api/admin/ai                                         -> AiUsage          (solo administración)
 * GET    /api/openings/stats?fen=&source=masters      -> OpeningsStats | {unavailable:true}   (opcional: 404 {disabled:true} si OPENINGS_STATS_ENABLED no está activo; ver worker/openings.ts)
 * GET    /api/repertoire                                      -> {moves: RepMove[]}   (repertorio del alumno; src/openings/repertoire.ts)
 * POST   /api/repertoire/add {color,moves:[{key,uci}]}         -> {moves}   (400 jugada ilegal o repertorio lleno; ignora repetidas)
 * POST   /api/repertoire/remove {color,key,uci} | /clear {color} -> {moves}
 * GET  /api/outline                                          -> {units: OutlineUnit[]}   (público, solo lectura: unidades y títulos de lección, SIN contenido)
 */
import type { Lesson } from '../content/schema.js';
import type { Level } from '../types.js';
import type { ReviewPosition } from '../review/srs.js';
import type { LevelHint } from './levels.js';

/** Usuario de Lichess. */
export interface User {
  /** id de Lichess (minúsculas). */
  id: string;
  username: string;
}

/** Alumno autorizado, solicitud de acceso denegada y lista completa que devuelve /api/admin/*. Fechas en ms epoch. */
export interface AllowedUser {
  id: string;
  username: string;
  addedAt: number;
}
export interface AccessRequest {
  id: string;
  username: string;
  firstAt: number;
  lastAt: number;
  attempts: number;
}
export interface AccessOverview {
  allowed: AllowedUser[];
  requests: AccessRequest[];
  maxAllowed: number;
}

/** Cuerpo de POST /api/explain: el servidor toma de su contenido (lecciones) o calcula (errores) todos los hechos. */
export type ExplainBody =
  | { kind: 'lesson'; lessonId: string; stepKind: 'practice' | 'evaluation'; stepIndex: number }
  | { kind: 'error'; fen: string; played: string; best: string };
export interface ExplainResponse {
  text: string;
  cached: boolean;
}
/** Uso de la IA del día UTC (panel de administración). */
/** Estadísticas de una posición del explorador de Lichess, ya reducidas por el servidor. */
export interface OpeningsStats {
  white: number;
  draws: number;
  black: number;
  opening: { eco: string; name: string } | null;
  moves: { uci: string; san: string; white: number; draws: number; black: number }[];
}

export interface AiUsage {
  available: boolean;
  today: { calls: number; tokens: number; cached: number };
  /** Mes UTC: `spendEur` solo con tarifas configuradas; `pct` es el consumo frente al tope (euros o tokens); `cut`: ya cortado (90 %). */
  month: { calls: number; cached: number; tokens: number; spendEur: number | null; pct: number; cut: boolean };
  pricesMissing: boolean;
}

/** Lo que envía el servidor en `profile`. */
export interface Profile {
  level: Level; // nivel educativo interno (no Elo)
  streakDays: number;
  longestStreak: number;
  lessonsCompleted: number;
  /** conceptId -> errores acumulados, base del repaso futuro (Fase 3). */
  weakConcepts: Record<string, number>;
}


export type LessonStatus = 'locked' | 'available' | 'completed';
export interface MapLesson {
  id: string;
  title: string;
  objective: string;
  status: LessonStatus;
  bestScore?: number; // 0..1
}
/** Ritmos de Lichess que cuentan para la sugerencia: rápidas y clásicas primero; blitz solo si no hay Elo fiable en ellas (bullet no). */
export type PlacementPerf = 'rapid' | 'classical' | 'blitz';
/** Qué devolvió Lichess de un ritmo en el último login y por qué cuenta o no. */
export type SeenState = 'absent' | 'invalid' | 'provisional' | 'few_games' | 'reliable';
export interface SeenPerf {
  state: SeenState;
  rating?: number;
  games?: number;
}
export interface PlacementSeen {
  /** Lichess envió el objeto `perfs`. */
  perfsPresent: boolean;
  rapid: SeenPerf;
  classical: SeenPerf;
  blitz: SeenPerf;
}
/** Tarjeta de un nivel para la pantalla de elección. `available`: el temario ya tiene unidades de ese nivel. */
export interface LevelCard {
  id: Level;
  label: string;
  minElo: number;
  maxElo: number;
  blurb: string;
  available: boolean;
}
export interface LevelInfo {
  /** Nivel elegido por el alumno (null si aún no eligió). */
  chosen: Level | null;
  /** Sugerencia a partir del Elo fiable de Lichess (null sin datos fiables). */
  suggested: Level | null;
  hint: LevelHint | null;
  levels: LevelCard[];
  /** El nivel elegido aún no tiene contenido: se abre todo lo actual. */
  comingSoon: boolean;
}
export interface SetLevelBody {
  level: Level;
}

export interface MapUnit {
  id: string;
  order: number;
  title: string;
  description: string;
  level: Level;
  status: LessonStatus;
  /** true: abierta por la colocación (todas sus lecciones disponibles como repaso, sin dar XP ni progreso). */
  placedOpen?: boolean;
  /** true: unidad recomendada para empezar según la colocación. */
  recommended?: boolean;
  lessons: MapLesson[];
}

/** Vista pública del temario: sin contenido de lecciones, sin estado ni progreso. */
export interface OutlineLesson {
  id: string;
  title: string;
}
export interface OutlineUnit {
  id: string;
  order: number;
  title: string;
  description: string;
  level: Level;
  lessons: OutlineLesson[];
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  bestScore: number; // 0..1
  attempts: number;
}

export interface CompleteLessonBody {
  correct: number; // aciertos en la evaluación
  total: number;
  /** conceptIds fallados, si se conocen. */
  mistakes: string[];
}

export type LessonResponse = { lesson: Lesson };

// ---------------------------------------------------------------------------------------------
// Tienda y moneda Chedex (ver docs/shop-design.md y src/shop/catalog.ts)
//
// GET  /api/shop                                  -> Shop
// POST /api/shop/buy   {itemId}                   -> Shop   (400 sin saldo / ya lo tienes / protector al máximo; 404 id desconocido)
// POST /api/shop/equip {kind:'pieces'|'board', itemId} -> Shop   (400 si no lo tienes)
// GET  /api/me incluye `equipped` para pintar los tableros desde el primer momento.
// POST /api/lessons/:id/complete devuelve además `chedexEarned` y `protectorUsed`.
// ---------------------------------------------------------------------------------------------
export type ShopKind = 'pieces' | 'board' | 'protector';

export interface ShopItem {
  id: string;
  kind: ShopKind;
  name: string;
  description: string;
  price: number;
  /** Incluido desde el inicio (precio 0). */
  free: boolean;
  owned: boolean;
  equipped: boolean;
  credit: string;
}

export interface Equipped {
  pieces: string;
  board: string;
}

export interface Shop {
  /** Chedex disponibles. */
  balance: number;
  /** Chedex ganados en total (informativo). */
  earnedTotal: number;
  protectors: { count: number; max: number };
  streak: {
    days: number;
    /** Días de racha que faltan para el siguiente Chedex (1..5; si hoy cumple el hito, 5). */
    daysToNextChedex: number;
    daysPerChedex: number;
  };
  equipped: Equipped;
  items: ShopItem[];
}

// Ampliación (servidor de la tienda): formas de respuesta añadidas, sin cambiar lo anterior.
/** POST /api/lessons/:id/complete: además de {progress, profile}. */
export interface CompleteLessonShopExtras {
  /** Chedex ganados con esta lección (0 o 1). */
  chedexEarned: number;
  /** Se consumió un protector para cubrir un día sin estudiar. */
  protectorUsed: boolean;
}
/** GET /api/me: además de {user, isAdmin}. */
export interface MeShopExtras {
  equipped: Equipped;
}
// Errores: itemId con formato no válido -> 400; id que no existe en el catálogo -> 404; equip con kind que no
// corresponde al objeto -> 400. Los precios los fija siempre el servidor (se ignora cualquier precio del cuerpo).

// Ampliación (partidas repasadas). POST /api/review/complete con sesión.
// 400: gameId fuera de /^[A-Za-z0-9]{8}$/, concepto inexistente en CONCEPTS o más de 6 conceptos (los duplicados cuentan una vez).
export interface CompleteReviewBody {
  gameId: string;
  concepts: string[];
  /** Errores propios (máx. 3) para repasar con calendario; opcional por compatibilidad. */
  positions?: ReviewPosition[];
}
/** `counted` es true solo en la primera llamada por usuario y partida (la única que suma a cp_weak_concepts). */
export interface CompleteReviewResponse {
  counted: boolean;
}

// Sesión diaria de repaso (con sesión). El servidor guarda las soluciones y verifica cada jugada.
// GET /api/session/status -> SessionStatus. GET /api/session -> SessionStart (409 { error } si no hay nada que repasar).
// POST /api/session/answer (AnswerBody) -> AnswerResult (404 si el elemento no es del usuario, está cerrado o caducó).
// POST /api/session/finish (FinishBody) -> FinishResult (404 sesión ajena, inexistente o caducada a las 24 h; 409 sin elementos terminados).
export interface SessionStatus {
  /** Conceptos vencidos hoy. */
  due: number;
  /** Próximo vencimiento futuro (ISO) o null. */
  nextDueAt: string | null;
}
/** Sin soluciones: el alumno mueve primero desde `fen`. */
export interface SessionItem {
  itemId: string;
  kind: 'own' | 'puzzle' | 'bank';
  conceptId: string;
  fen: string;
  prompt: string;
}
export interface SessionStart {
  sessionId: string;
  items: SessionItem[];
}
export interface AnswerBody {
  itemId: string;
  uci: string;
  /** Qué respuesta de este elemento es (1, 2, ...). Un reenvío de la ya contada devuelve el mismo resultado sin contar otra vez. */
  attempt?: number;
}
/** `reply`: jugada del rival tras un acierto. `solution`: resto de la línea, solo tras el segundo fallo. */
export interface AnswerResult {
  correct: boolean;
  reply?: string;
  done: boolean;
  solution?: string[];
  tryAgain?: boolean;
}
export interface FinishBody {
  sessionId: string;
}
export interface FinishResult {
  /** Por concepto: `correct` = primera posición a la primera (mueve la caja); `misses` = jugadas falladas en la sesión. */
  reviewed: { conceptId: string; correct: boolean; misses: number }[];
  nextDueAt: string | null;
  streak: number;
}
