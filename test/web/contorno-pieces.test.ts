/** Comprobaciones sin navegador del juego «Contorno»; los límites medidos están en scripts/check-piece-bounds.mts. */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DIR = resolve(import.meta.dirname, '../../web/public/pieces/contorno');
const NAMES = ['K', 'Q', 'R', 'B', 'N', 'P'].flatMap((p) => [`w${p}`, `b${p}`]);
const read = (n: string) => readFileSync(`${DIR}/${n}.svg`, 'utf8');

describe('piezas Contorno', () => {
  it('las 12 comparten viewBox cuadrado 45x45 y no fijan ancho/alto propios', () => {
    for (const n of NAMES) {
      const s = read(n);
      expect(s, n).toMatch(/^<svg [^>]*viewBox="0 0 45 45"/);
      expect(s.match(/<svg [^>]*>/)![0], n).not.toMatch(/\swidth=|\sheight=/);
    }
  });
  it('cada sprite lleva su degradado con id propio y la sombra elíptica común', () => {
    const ids = NAMES.map((n) => /linearGradient id="([^"]+)"/.exec(read(n))?.[1]);
    expect(new Set(ids).size).toBe(12);
    for (const n of NAMES) expect(read(n), n).toContain('<ellipse cx="22.5" cy="40.5"');
  });
  it('mismo trazo naranja de marca y relleno distinto por color', () => {
    for (const n of NAMES) expect(read(n), n).toContain('stroke="#f18b42"');
    expect(read('wK')).toContain('#f6f8fb');
    expect(read('bK')).toContain('#434a59');
  });
});
