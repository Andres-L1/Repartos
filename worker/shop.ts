import type { Equipped, Shop, ShopItem } from '../src/shared/api.js';
import {
  CATALOG,
  DEFAULT_BOARD,
  DEFAULT_PIECES,
  PROTECTOR_ID,
  PROTECTOR_MAX,
  STREAK_DAYS_PER_CHEDEX,
  getItem,
} from '../src/shop/catalog.js';
import type { Db, Stmt } from './db.js';
import { dayOf, yesterdayOf } from './progress.js';

/**
 * Reglas de racha, Chedex y protector. TODOS los días son días naturales UTC (YYYY-MM-DD, `dayOf`).
 * - Con la última lección superada "hoy" o "ayer" la racha sigue viva.
 * - Con la última lección "anteayer" (pasó EXACTAMENTE un día natural sin estudiar) la racha sigue viva
 *   solo si hay un protector: al completar una lección se consume uno y hoy se suma como día normal.
 *   En lecturas (perfil/tienda) el protector cubre ese hueco SIN consumirse.
 * - Con 2 o más días naturales sin estudiar (última lección de hace 3+ días) la racha se reinicia
 *   aunque haya protectores.
 */
export const dayBeforeYesterdayOf = (d: Date): string => dayOf(new Date(d.getTime() - 2 * 86_400_000));

/** Racha efectiva para mostrar (no consume nada). */
export function effectiveStreak(
  p: { streak_days: number; last_active_date: string | null },
  t: Date,
  protectors: number,
): number {
  const last = p.last_active_date;
  if (last === dayOf(t) || last === yesterdayOf(t)) return p.streak_days;
  if (last === dayBeforeYesterdayOf(t) && protectors > 0) return p.streak_days;
  return 0;
}

/** Racha tras superar una lección en un día nuevo (lastActive !== hoy). */
export function advanceStreak(
  p: { streak_days: number; last_active_date: string | null },
  t: Date,
  protectors: number,
): { streak: number; protectorUsed: boolean } {
  if (p.last_active_date === yesterdayOf(t)) return { streak: p.streak_days + 1, protectorUsed: false };
  if (p.last_active_date === dayBeforeYesterdayOf(t) && protectors > 0 && p.streak_days > 0)
    return { streak: p.streak_days + 1, protectorUsed: true };
  return { streak: 1, protectorUsed: false };
}

export const earnsChedex = (streak: number): boolean => streak > 0 && streak % STREAK_DAYS_PER_CHEDEX === 0;
/** Días que faltan para el siguiente Chedex: 1..5 (con racha 0 o en un hito, 5). */
export const daysToNextChedex = (days: number): number => STREAK_DAYS_PER_CHEDEX - (days % STREAK_DAYS_PER_CHEDEX);

export const protectorCount = async (db: Db, userId: string): Promise<number> =>
  (await db.first<{ count: number }>('SELECT count FROM cp_protectors WHERE user_id = ?', [userId]))?.count ?? 0;

export const balanceOf = async (db: Db, userId: string): Promise<number> =>
  (await db.first<{ b: number | null }>('SELECT SUM(delta) AS b FROM cp_wallet_ledger WHERE user_id = ?', [userId]))?.b ?? 0;

/** Sentencias de la transacción de completar lección: ingreso de Chedex y consumo de protector. */
export function streakRewardStmts(userId: string, today: string, streak: number, protectorUsed: boolean, nowIso: string): Stmt[] {
  const out: Stmt[] = [];
  if (protectorUsed) {
    // Marca única por día (INSERT sin OR IGNORE: un doble envío concurrente aborta todo el lote) + descuento.
    out.push({
      sql: "INSERT INTO cp_wallet_ledger (user_id, delta, reason, ref, created_at) VALUES (?, 0, 'protector_used', ?, ?)",
      params: [userId, today, nowIso],
    });
    out.push({ sql: 'UPDATE cp_protectors SET count = count - 1 WHERE user_id = ? AND count > 0', params: [userId] });
  }
  if (earnsChedex(streak)) {
    out.push({
      sql: "INSERT INTO cp_wallet_ledger (user_id, delta, reason, ref, created_at) VALUES (?, 1, 'streak_milestone', ?, ?)",
      params: [userId, `${today}:${streak}`, nowIso],
    });
  }
  return out;
}

/**
 * Racha tras una actividad que cuenta (lección superada o sesión de repaso terminada), con las sentencias
 * de ingreso de Chedex y consumo de protector. Si ya contó hoy, no cambia nada.
 */
export async function streakAdvance(
  db: Db,
  userId: string,
  p: { streak_days: number; last_active_date: string | null },
  t: Date,
): Promise<{ streak: number; lastActive: string | null; protectorUsed: boolean; chedexEarned: number; rewards: Stmt[] }> {
  const today = dayOf(t);
  if (p.last_active_date === today)
    return { streak: p.streak_days, lastActive: today, protectorUsed: false, chedexEarned: 0, rewards: [] };
  const { streak, protectorUsed } = advanceStreak(p, t, await protectorCount(db, userId));
  const rewards = streakRewardStmts(userId, today, streak, protectorUsed, t.toISOString());
  return { streak, lastActive: today, protectorUsed, chedexEarned: earnsChedex(streak) ? 1 : 0, rewards };
}

/** Escribe la racha solo si sigue como se leyó (`p`): dos actividades del mismo día a la vez no la avanzan dos veces. */
export function streakUpdate(userId: string, p: { streak_days: number; last_active_date: string | null }, streak: number, lastActive: string | null): Stmt {
  return {
    sql: `UPDATE cp_profiles SET streak_days = ?, longest_streak = MAX(longest_streak, ?), last_active_date = ?
          WHERE user_id = ? AND streak_days = ? AND last_active_date IS ?`,
    params: [streak, streak, lastActive, userId, p.streak_days, p.last_active_date],
  };
}

/** Error de índice único o restricción (D1 y node:sqlite): la transacción se revirtió entera. */
export const isUnique = (e: unknown): boolean => /UNIQUE|constraint/i.test(e instanceof Error ? e.message : '');

export async function equippedFor(db: Db, userId: string): Promise<Equipped> {
  const r = await db.first<{ pieces: string; board: string }>('SELECT pieces, board FROM cp_equipped WHERE user_id = ?', [userId]);
  const ok = (id: string | undefined, kind: 'pieces' | 'board', fallback: string) =>
    id !== undefined && getItem(id)?.kind === kind ? id : fallback;
  return { pieces: ok(r?.pieces, 'pieces', DEFAULT_PIECES), board: ok(r?.board, 'board', DEFAULT_BOARD) };
}

export async function ownedIds(db: Db, userId: string): Promise<Set<string>> {
  const rows = await db.all<{ item_id: string }>('SELECT item_id FROM cp_inventory WHERE user_id = ?', [userId]);
  const s = new Set(rows.map((r) => r.item_id));
  for (const i of CATALOG) if (i.price === 0 && i.kind !== 'protector') s.add(i.id);
  return s;
}

export async function buildShop(db: Db, userId: string, streakDays: number): Promise<Shop> {
  const [balance, earned, count, equipped, owned] = await Promise.all([
    balanceOf(db, userId),
    db.first<{ e: number | null }>("SELECT SUM(delta) AS e FROM cp_wallet_ledger WHERE user_id = ? AND reason = 'streak_milestone'", [userId]),
    protectorCount(db, userId),
    equippedFor(db, userId),
    ownedIds(db, userId),
  ]);
  const items: ShopItem[] = CATALOG.map((i) => ({
    id: i.id,
    kind: i.kind,
    name: i.name,
    description: i.description,
    price: i.price,
    free: i.price === 0,
    // El protector es consumible: nunca "poseído" como objeto; su cantidad va en `protectors`.
    owned: i.kind !== 'protector' && owned.has(i.id),
    equipped: (i.kind === 'pieces' && equipped.pieces === i.id) || (i.kind === 'board' && equipped.board === i.id),
    credit: i.credit,
  }));
  return {
    balance,
    earnedTotal: earned?.e ?? 0,
    protectors: { count, max: PROTECTOR_MAX },
    streak: { days: streakDays, daysToNextChedex: daysToNextChedex(streakDays), daysPerChedex: STREAK_DAYS_PER_CHEDEX },
    equipped,
    items,
  };
}

export type BuyResult = 'ok' | 'unknown' | 'owned' | 'max' | 'funds';

/** Compra atómica: el precio sale del catálogo; el saldo nunca queda negativo ni se supera el máximo de protectores. */
export async function buyItem(db: Db, userId: string, itemId: string, nowIso: string): Promise<BuyResult> {
  const item = getItem(itemId);
  if (!item) return 'unknown';
  const isProtector = item.id === PROTECTOR_ID;
  if (isProtector) {
    if ((await protectorCount(db, userId)) >= PROTECTOR_MAX) return 'max';
  } else if ((await ownedIds(db, userId)).has(item.id)) return 'owned';
  if ((await balanceOf(db, userId)) < item.price) return 'funds';

  // Protector: se puede comprar varias veces -> ref única por compra. Resto: ref = id del objeto (única por usuario).
  const ref = isProtector ? `${PROTECTOR_ID}:${crypto.randomUUID()}` : item.id;
  // El INSERT del libro solo inserta si, EN ESTA transacción, hay saldo y hueco; el resto depende de que exista esa fila.
  const stmts: Stmt[] = [
    {
      sql: `INSERT INTO cp_wallet_ledger (user_id, delta, reason, ref, created_at)
            SELECT ?, ?, 'purchase', ?, ?
            WHERE (SELECT COALESCE(SUM(delta), 0) FROM cp_wallet_ledger WHERE user_id = ?) >= ?
              AND (? = 0 OR COALESCE((SELECT count FROM cp_protectors WHERE user_id = ?), 0) < ?)`,
      params: [userId, -item.price, ref, nowIso, userId, item.price, isProtector ? 1 : 0, userId, PROTECTOR_MAX],
    },
    isProtector
      ? {
          sql: `INSERT INTO cp_protectors (user_id, count)
                SELECT ?, 1 WHERE EXISTS (SELECT 1 FROM cp_wallet_ledger WHERE user_id = ? AND reason = 'purchase' AND ref = ?)
                ON CONFLICT(user_id) DO UPDATE SET count = count + 1`,
          params: [userId, userId, ref],
        }
      : {
          sql: `INSERT OR IGNORE INTO cp_inventory (user_id, item_id, acquired_at)
                SELECT ?, ?, ? WHERE EXISTS (SELECT 1 FROM cp_wallet_ledger WHERE user_id = ? AND reason = 'purchase' AND ref = ?)`,
          params: [userId, item.id, nowIso, userId, ref],
        },
  ];
  try {
    await db.batch(stmts);
  } catch (e) {
    if (/UNIQUE|constraint/i.test(e instanceof Error ? e.message : '')) return 'owned'; // compra concurrente de lo mismo
    throw e;
  }
  const done = await db.first('SELECT 1 AS x FROM cp_wallet_ledger WHERE user_id = ? AND reason = ? AND ref = ?', [userId, 'purchase', ref]);
  if (done) return 'ok';
  // No se insertó: perdió una carrera (saldo o hueco).
  return isProtector && (await protectorCount(db, userId)) >= PROTECTOR_MAX ? 'max' : 'funds';
}

export async function equipItem(
  db: Db,
  userId: string,
  kind: 'pieces' | 'board',
  itemId: string,
): Promise<'ok' | 'unknown' | 'bad_kind' | 'not_owned'> {
  const item = getItem(itemId);
  if (!item) return 'unknown';
  if (item.kind !== kind) return 'bad_kind';
  if (!(await ownedIds(db, userId)).has(item.id)) return 'not_owned';
  const cur = await equippedFor(db, userId);
  const next = { ...cur, [kind]: item.id };
  await db.run(
    `INSERT INTO cp_equipped (user_id, pieces, board) VALUES (?,?,?)
     ON CONFLICT(user_id) DO UPDATE SET pieces = excluded.pieces, board = excluded.board`,
    [userId, next.pieces, next.board],
  );
  return 'ok';
}
