import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { CATALOG, DEFAULT_BOARD, DEFAULT_PIECES, getItem } from '../../src/shop/catalog.js';

const css = readFileSync('web/src/shop.css', 'utf8');
const landing = readFileSync('web/src/landing.css', 'utf8');

describe('catálogo: valores por defecto', () => {
  it('ids únicos', () => {
    const ids = CATALOG.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('los predeterminados existen, son del tipo correcto y gratuitos', () => {
    expect(DEFAULT_PIECES).toBe('contorno');
    expect(DEFAULT_BOARD).toBe('noche');
    expect(getItem(DEFAULT_PIECES)).toMatchObject({ kind: 'pieces', price: 0, credit: 'Chedex, material propio' });
    expect(getItem(DEFAULT_BOARD)).toMatchObject({ kind: 'board', price: 0, credit: 'Chedex, material propio' });
  });
  it('se conservan los gratuitos antiguos y los precios', () => {
    expect(getItem('cburnett')!.price).toBe(0);
    expect(getItem('clasico')!.price).toBe(0);
    expect(getItem('geo')!.price).toBe(3);
    for (const id of ['pizarra', 'bosque', 'papel', 'brasa', 'protector']) expect(getItem(id)!.price).toBe(2);
  });
});

describe('Noche y Contorno en CSS', () => {
  it('existe la clase del tema noche con marco y colores de casilla', () => {
    expect(css).toMatch(/\.theme-noche \{[^}]*--sq-dark: #1f242d/);
    expect(css).toMatch(/--sq-light: #454c58/);
    expect(css).toContain('.board-frame.theme-noche');
    expect(css).toContain('#2a303a');
    expect(css).toContain('#4a525e');
  });
  it('las 12 clases de pieza Contorno apuntan a su SVG, solo bajo la clase del conjunto', () => {
    for (const col of ['white', 'black'])
      for (const [role, l] of Object.entries({ pawn: 'P', knight: 'N', bishop: 'B', rook: 'R', queen: 'Q', king: 'K' })) {
        const c = col === 'white' ? 'w' : 'b';
        expect(css).toContain(`.pieces-contorno .cg-wrap piece.${role}.${col} { background-image: url('/pieces/contorno/${c}${l}.svg'); }`);
      }
  });
  it('los 12 SVG existen', () => {
    for (const c of 'wb') for (const l of 'KQRBNP') expect(existsSync(`web/public/pieces/contorno/${c}${l}.svg`)).toBe(true);
  });
  it('cada juego ilustrado tiene sus 12 reglas y sus 12 WebP; cada tablero nuevo, su tema', () => {
    const illustrated = CATALOG.filter((i) => i.kind === 'pieces' && i.credit.includes('IA'));
    expect(illustrated.map((i) => i.id)).toEqual(['plano', 'pixel', 'neon', 'catedral', 'egipto', 'vikingo', 'olimpo', 'samurai', 'sombras', 'cosmos']);
    for (const { id } of illustrated)
      for (const col of ['white', 'black'])
        for (const [role, l] of Object.entries({ pawn: 'P', knight: 'N', bishop: 'B', rook: 'R', queen: 'Q', king: 'K' })) {
          const f = `${col[0]}${l}.webp`;
          expect(css).toContain(`.pieces-${id} .cg-wrap piece.${role}.${col} { background-image: url('/pieces/${id}/${f}'); }`);
          expect(existsSync(`web/public/pieces/${id}/${f}`)).toBe(true);
        }
    for (const { id } of illustrated) {
      expect(getItem(`${id}-tablero`)).toMatchObject({ kind: 'board', credit: 'Chedex, material propio' });
      expect(css).toMatch(new RegExp(`\\.theme-${id}-tablero \\{[^}]*--sq-light`));
    }
  });
  it('la landing ya no usa el tema ascua', () => {
    expect(landing).not.toContain('theme-ascua');
  });
});
