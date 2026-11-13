/**
 * Contrato HTTP entre web/ y worker/ (Cloudflare Worker + D1). Cookie de sesión sellada HttpOnly.
 * Errores: { error: string } con código HTTP adecuado (400 validación, 401 sin sesión, 402 requiere suscripción
 * (solo BILLING_MODE=dev), 403, 404, 501 no disponible todavía).
 *
 * Acceso: SOLO con Lichess (OAuth PKCE sin scopes; el token de Lichess nunca se guarda y se revoca al terminar).
 *   GET  /auth/login                                           -> 303 a lichess.org/oauth
 *   GET  /auth/callback?code&state                             -> 303 a /aprender (o /entrar?auth=failed)
 *   POST /auth/logout                                          -> {ok:true}   (borra la cookie)
 *
 * API (JSON, bajo /api):
 * GET  /api/config                                             -> {billingMode}                    (público)
 * GET  /api/me                                                 -> {user, subscription, billingMode}   (401 sin sesión)
 * GET  /api/map                                                -> {units: MapUnit[]}   (con colocación: placedOpen/recommended)
 * GET  /api/placement                                          -> Placement   (colocación inicial por Elo de Lichess: rápidas/clásicas, o blitz si no hay)
 * POST /api/placement {mode:'lichess'|'scratch'}                -> Placement   (guarda la elección; 'lichess' sin Elo fiable: 400)
 * GET  /api/lessons/:id                                        -> {lesson}   (402 solo en 'dev' si no demo y sin suscripción)
 * POST /api/lessons/:id/complete {correct, total, mistakes}    -> {progress, xpGained, profile}
 * GET  /api/profile                                            -> {profile}
 * PUT  /api/profile/daily-goal {xp}                            -> {profile}
 * GET  /api/billing                                            -> {subscription}
 * POST /api/billing/subscribe                                  -> {subscription}  ('dev': activa al instante; 'beta_open': 501)
 * POST /api/billing/cancel                                     -> {subscription}  ('beta_open': 501)
 * GET  /api/demo                                               -> {lesson}         (lección demo, sin sesión)
 * GET  /api/outline                                            -> {units: OutlineUnit[]}   (público, solo lectura: unidades y títulos de lección, SIN contenido)
 */
import type { Lesson } from '../content/schema.js';
import type { Level } from '../types.js';

/** Usuario de Lichess. */
export interface User {
  /** id de Lichess (minúsculas). */
  id: string;
  username: string;
}

/**
 * 'beta_open': beta abierta, todas las lecciones accesibles, sin pagos (producción por defecto).
 * 'dev': proveedor de pago simulado (solo local).
 */
export type BillingMode = 'beta_open' | 'dev';

export type SubscriptionStatus = 'none' | 'active' | 'canceled';
export interface Subscription {
  status: SubscriptionStatus;
  priceEurPerMonth: 10;
  provider: 'none' | 'dev' | 'stripe';
  /** true en beta abierta: no hay precio ni suscripción. */
  beta: boolean;
  currentPeriodEnd?: string; // ISO
}

export interface Profile {
  xp: number;
  level: Level; // nivel educativo interno (no Elo)
  streakDays: number;
  longestStreak: number;
  dailyGoalXp: number;
  xpToday: number;
  lessonsCompleted: number;
  /** conceptId -> errores acumulados, base del repaso futuro (Fase 3). */
  weakConcepts: Record<string, number>;
}

export type LessonStatus = 'locked' | 'available' | 'completed';
export interface MapLesson {
  id: string;
  title: string;
  objective: string;
  demo: boolean;
  status: LessonStatus;
  bestScore?: number; // 0..1
}
/** Ritmos de Lichess que cuentan para la colocación: rápidas y clásicas primero; blitz solo si no hay Elo fiable en ellas (bullet no). */
export type PlacementPerf = 'rapid' | 'classical' | 'blitz';
export type PlacementMode = 'lichess' | 'scratch';
/**
 * Colocación inicial. `recommendedUnitId` y `openUnitIds` son la SUGERENCIA calculada con el Elo y el contenido actual;
 * solo afectan al mapa cuando `mode` es 'lichess'. `chosen`: el usuario ya eligió (si no, mostrar la bienvenida).
 * `mode` por defecto: 'lichess' si hay Elo fiable, 'scratch' si no.
 */
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
export interface Placement {
  /** null si todavía no hay registro (cuentas anteriores a esta función: vuelve a entrar para verlo). */
  seen: PlacementSeen | null;
  source: 'lichess' | 'none';
  perf: PlacementPerf | null;
  rating: number | null;
  /** Partidas jugadas en ese ritmo. */
  games: number | null;
  mode: PlacementMode;
  chosen: boolean;
  recommendedUnitId: string | null;
  openUnitIds: string[];
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
/** POST /api/lessons/:id/complete: además de {progress, xpGained, profile}. */
export interface CompleteLessonShopExtras {
  /** Chedex ganados con esta lección (0 o 1). */
  chedexEarned: number;
  /** Se consumió un protector para cubrir un día sin estudiar. */
  protectorUsed: boolean;
}
/** GET /api/me: además de {user, subscription, billingMode}. */
export interface MeShopExtras {
  equipped: Equipped;
}
// Errores: itemId con formato no válido -> 400; id que no existe en el catálogo -> 404; equip con kind que no
// corresponde al objeto -> 400. Los precios los fija siempre el servidor (se ignora cualquier precio del cuerpo).
