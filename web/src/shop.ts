/**
 * Partes puras de la tienda (sin DOM, sin React): precios, saldo, textos de «faltan N Chedex» y clases de tablero/piezas.
 * Se prueban en test/web/shop.test.ts.
 */
import { CATALOG, DEFAULT_BOARD, DEFAULT_PIECES, type ShopKind } from '../../src/shop/catalog';
import type { Equipped, Shop, ShopItem } from '../../src/shared/api';

export const DEFAULT_EQUIPPED: Equipped = { pieces: DEFAULT_PIECES, board: DEFAULT_BOARD };

export const KIND_LABEL: Record<ShopKind, string> = {
  pieces: 'Piezas',
  board: 'Tableros',
  protector: 'Protector de racha',
};

const BOARD_IDS = CATALOG.filter((i) => i.kind === 'board').map((i) => i.id);
const PIECES_IDS = CATALOG.filter((i) => i.kind === 'pieces').map((i) => i.id);

/** Clase de tema de tablero. Un id desconocido cae en el tema por defecto, nunca en una clase inventada. */
export function boardClass(id: string | null | undefined): string {
  return `theme-${id && BOARD_IDS.includes(id) ? id : DEFAULT_BOARD}`;
}

/** Clase del conjunto de piezas (`pieces-cburnett`, `pieces-geo`). */
export function piecesClass(id: string | null | undefined): string {
  return `pieces-${id && PIECES_IDS.includes(id) ? id : DEFAULT_PIECES}`;
}

export function appearanceClass(eq: Equipped | null | undefined): string {
  const e = eq ?? DEFAULT_EQUIPPED;
  return `${boardClass(e.board)} ${piecesClass(e.pieces)}`;
}

/** Acepta solo ids conocidos al leer un `equipped` que viene de fuera. */
export function sanitizeEquipped(eq: Partial<Equipped> | null | undefined): Equipped {
  return {
    pieces: eq?.pieces && PIECES_IDS.includes(eq.pieces) ? eq.pieces : DEFAULT_PIECES,
    board: eq?.board && BOARD_IDS.includes(eq.board) ? eq.board : DEFAULT_BOARD,
  };
}

/** «1 Chedex», «3 Chedex»: la palabra no cambia con el número. */
export function chedexText(n: number): string {
  return `${n} Chedex`;
}

export function dayText(n: number): string {
  return `${n} ${n === 1 ? 'día' : 'días'}`;
}

export function priceText(price: number): string {
  return price === 0 ? 'Incluido' : chedexText(price);
}

/** Chedex que faltan para pagar `price` con `balance` (nunca negativo). */
export function missingChedex(price: number, balance: number): number {
  return Math.max(0, price - balance);
}

/** Saldo que quedaría tras pagar (nunca negativo: si no alcanza, 0). */
export function balanceAfter(price: number, balance: number): number {
  return Math.max(0, balance - price);
}

/**
 * Días de racha hasta tener `missing` Chedex más: el primero llega en `daysToNext`
 * y cada uno siguiente, `daysPer` días después.
 */
export function daysUntilChedex(missing: number, streak: Shop['streak']): number {
  if (missing <= 0) return 0;
  return streak.daysToNextChedex + (missing - 1) * streak.daysPerChedex;
}

/** «Te falta 1 Chedex» / «Te faltan 3 Chedex». */
export function missingText(missing: number): string {
  return missing === 1 ? 'Te falta 1 Chedex' : `Te faltan ${missing} Chedex`;
}

/** Frase completa para un saldo insuficiente, sin presionar. */
export function shortfallText(price: number, balance: number, streak: Shop['streak']): string {
  const missing = missingChedex(price, balance);
  if (missing === 0) return '';
  const days = daysUntilChedex(missing, streak);
  return `${missingText(missing)}. ${missing === 1 ? 'Llegará' : 'Llegarán'} con ${days} ${days === 1 ? 'día más' : 'días más'} de racha.`;
}

/** Marcas rellenas de las cinco (o `daysPerChedex`) hacia el siguiente Chedex. */
export function streakMarks(streak: Shop['streak']): { filled: number; total: number } {
  const total = Math.max(1, streak.daysPerChedex);
  const filled = Math.min(total, Math.max(0, total - streak.daysToNextChedex));
  return { filled, total };
}

export function progressText(streak: Shop['streak']): string {
  const { filled, total } = streakMarks(streak);
  return `${filled} de ${total} días hacia el siguiente Chedex`;
}

export type BuyState = 'owned' | 'buyable' | 'short' | 'full';

/** Estado de compra de un objeto: poseído, comprable, saldo insuficiente o protectores al máximo. */
export function buyState(item: Pick<ShopItem, 'kind' | 'price' | 'owned'>, shop: Pick<Shop, 'balance' | 'protectors'>): BuyState {
  if (item.kind === 'protector') {
    if (shop.protectors.count >= shop.protectors.max) return 'full';
  } else if (item.owned) {
    return 'owned';
  }
  return shop.balance >= item.price ? 'buyable' : 'short';
}

/** Texto de confirmación de compra: precio y saldo restante. */
export function confirmText(name: string, price: number, balance: number): string {
  return `${name} cuesta ${chedexText(price)}. Después te quedarán ${chedexText(balanceAfter(price, balance))}.`;
}

/** Objetos de un tipo, en el orden del catálogo. */
export function itemsOf(shop: Pick<Shop, 'items'>, kind: ShopKind): ShopItem[] {
  return shop.items.filter((i) => i.kind === kind);
}

/** Lo que se puede equipar: lo poseído de piezas y tableros. */
export function ownedEquippable(shop: Pick<Shop, 'items'>, kind: 'pieces' | 'board'): ShopItem[] {
  return shop.items.filter((i) => i.kind === kind && i.owned);
}

/** Frase del resultado de lección; vacía si no hay nada que contar. */
export function rewardLines(chedexEarned: number | undefined, protectorUsed: boolean | undefined, streakDays: number | undefined): string[] {
  const lines: string[] = [];
  if (chedexEarned && chedexEarned > 0) {
    const days = streakDays ?? 0;
    lines.push(
      days > 0
        ? `Has ganado ${chedexText(chedexEarned)} por tu racha de ${dayText(days)}.`
        : `Has ganado ${chedexText(chedexEarned)} por tu racha.`,
    );
  }
  if (protectorUsed) lines.push('Usaste un protector: tu racha continúa.');
  return lines;
}
