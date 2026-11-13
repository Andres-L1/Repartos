import { describe, it, expect } from 'vitest';
import {
  appearanceClass,
  balanceAfter,
  boardClass,
  buyState,
  confirmText,
  daysUntilChedex,
  missingChedex,
  missingText,
  piecesClass,
  priceText,
  rewardLines,
  sanitizeEquipped,
  shortfallText,
  streakMarks,
} from '../../web/src/shop.js';
import { catalogCredits, creditRows, LIBRARIES } from '../../web/src/credits.js';
import { CATALOG } from '../../src/shop/catalog.js';

const streak = (days: number, toNext: number) => ({ days, daysToNextChedex: toNext, daysPerChedex: 5 });

describe('tienda: precio y saldo', () => {
  it('faltan N Chedex nunca es negativo', () => {
    expect(missingChedex(3, 1)).toBe(2);
    expect(missingChedex(2, 2)).toBe(0);
    expect(missingChedex(2, 9)).toBe(0);
  });
  it('saldo tras comprar', () => {
    expect(balanceAfter(2, 5)).toBe(3);
    expect(balanceAfter(3, 1)).toBe(0);
  });
  it('textos de precio y de lo que falta', () => {
    expect(priceText(0)).toBe('Incluido');
    expect(priceText(3)).toBe('3 Chedex');
    expect(missingText(1)).toBe('Te falta 1 Chedex');
    expect(missingText(2)).toBe('Te faltan 2 Chedex');
  });
  it('días hasta tener los Chedex que faltan, según la racha', () => {
    expect(daysUntilChedex(0, streak(3, 2))).toBe(0);
    expect(daysUntilChedex(1, streak(3, 2))).toBe(2);
    expect(daysUntilChedex(3, streak(3, 2))).toBe(12);
  });
  it('frase de saldo insuficiente con el siguiente Chedex', () => {
    expect(shortfallText(2, 1, streak(2, 3))).toBe('Te falta 1 Chedex. Llegará con 3 días más de racha.');
    expect(shortfallText(3, 1, streak(0, 5))).toBe('Te faltan 2 Chedex. Llegarán con 10 días más de racha.');
    expect(shortfallText(1, 1, streak(2, 3))).toBe('');
  });
  it('confirmación: precio y saldo restante', () => {
    expect(confirmText('Pizarra', 2, 3)).toBe('Pizarra cuesta 2 Chedex. Después te quedarán 1 Chedex.');
  });
});

describe('tienda: marcas de racha', () => {
  it('rellena tantas marcas como días llevas hacia el siguiente Chedex', () => {
    expect(streakMarks(streak(0, 5))).toEqual({ filled: 0, total: 5 });
    expect(streakMarks(streak(7, 3))).toEqual({ filled: 2, total: 5 });
    expect(streakMarks(streak(4, 1))).toEqual({ filled: 4, total: 5 });
    expect(streakMarks(streak(10, 5))).toEqual({ filled: 0, total: 5 });
  });
});

describe('tienda: estado de compra', () => {
  const shop = { balance: 2, protectors: { count: 0, max: 2 } };
  it('poseído, comprable y sin saldo', () => {
    expect(buyState({ kind: 'board', price: 2, owned: true }, shop)).toBe('owned');
    expect(buyState({ kind: 'board', price: 2, owned: false }, shop)).toBe('buyable');
    expect(buyState({ kind: 'pieces', price: 3, owned: false }, shop)).toBe('short');
  });
  it('el protector se puede volver a comprar hasta el máximo', () => {
    expect(buyState({ kind: 'protector', price: 2, owned: false }, shop)).toBe('buyable');
    expect(buyState({ kind: 'protector', price: 2, owned: false }, { balance: 9, protectors: { count: 2, max: 2 } })).toBe('full');
  });
});

describe('tienda: clases de tema y piezas', () => {
  it('cada tablero del catálogo tiene su clase', () => {
    for (const i of CATALOG.filter((x) => x.kind === 'board')) expect(boardClass(i.id)).toBe(`theme-${i.id}`);
  });
  it('un id desconocido o ausente cae en los predeterminados', () => {
    expect(boardClass('inventado')).toBe('theme-noche');
    expect(boardClass(undefined)).toBe('theme-noche');
    expect(piecesClass('x')).toBe('pieces-contorno');
    expect(piecesClass('geo')).toBe('pieces-geo');
  });
  it('apariencia combinada', () => {
    expect(appearanceClass({ pieces: 'geo', board: 'brasa' })).toBe('theme-brasa pieces-geo');
    expect(appearanceClass(null)).toBe('theme-noche pieces-contorno');
  });
  it('sanitizeEquipped descarta ids desconocidos', () => {
    expect(sanitizeEquipped({ pieces: 'geo', board: 'nada' })).toEqual({ pieces: 'geo', board: 'noche' });
    expect(sanitizeEquipped(undefined)).toEqual({ pieces: 'contorno', board: 'noche' });
    expect(sanitizeEquipped({ pieces: 'cburnett', board: 'clasico' })).toEqual({ pieces: 'cburnett', board: 'clasico' });
  });
});

describe('tienda: resultado de lección', () => {
  it('Chedex ganado y protector usado', () => {
    expect(rewardLines(1, false, 5)).toEqual(['Has ganado 1 Chedex por tu racha de 5 días.']);
    expect(rewardLines(0, true, 6)).toEqual(['Usaste un protector: tu racha continúa.']);
    expect(rewardLines(undefined, undefined, 3)).toEqual([]);
  });
});

describe('créditos', () => {
  it('agrupa los objetos con el mismo crédito', () => {
    const boards = catalogCredits().find((g) => g.kind === 'board')!;
    const rows = creditRows(boards.items);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.names).toEqual(['Noche', 'Clásico', 'Pizarra', 'Bosque', 'Papel', 'Brasa']);
  });
  it('cubre todo el catálogo y las librerías obligatorias', () => {
    const ids = catalogCredits().flatMap((g) => g.items.map((i) => i.id));
    expect(ids.sort()).toEqual(CATALOG.map((i) => i.id).sort());
    const names = LIBRARIES.map((l) => l.name).join(' ');
    for (const n of ['chessground', 'chessops', 'cburnett', 'DM Sans']) expect(names).toContain(n);
  });
});
