import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { UNITS } from '../../src/content/index.js';
import { numberUnits } from '../../src/shared/unitNumber.js';

describe('numeración de unidades que ve el alumno', () => {
  it('es la posición en la ruta, aunque `order` tenga huecos o esté desordenado', () => {
    const r = numberUnits([{ id: 'c', order: 15 }, { id: 'a', order: 3 }, { id: 'b', order: 14 }]);
    expect(r.map((u) => [u.id, u.n])).toEqual([['a', 1], ['b', 2], ['c', 3]]);
  });

  it('no modifica ids ni `order` ni la lista de entrada', () => {
    const input = [{ id: 'x', order: 9 }, { id: 'y', order: 2 }];
    const r = numberUnits(input);
    expect(input.map((u) => u.id)).toEqual(['x', 'y']);
    expect(r.map((u) => [u.id, u.order])).toEqual([['y', 2], ['x', 9]]);
  });

  it('con el temario real, las unidades van de 1 a N sin saltos y u15 no es la «Unidad 14» del campo order', () => {
    const r = numberUnits(UNITS);
    expect(r.map((u) => u.n)).toEqual(UNITS.map((_, i) => i + 1));
    const u15 = r.find((u) => u.id === 'u15')!;
    expect(u15.n).toBe(r.filter((u) => u.order <= u15.order).length);
  });

  it('las pantallas que numeran unidades usan `n`, nunca el campo `order`', () => {
    for (const f of ['MapScreen', 'ProfileScreen', 'LandingSections']) {
      const src = readFileSync(new URL(`../../web/src/screens/${f}.tsx`, import.meta.url), 'utf8');
      expect(src, f).not.toMatch(/Unidad \{[\w.]*order\}|de la unidad \{[\w.]*order\}|\{[\w.]*order\}\.\{j/);
      expect(src, f).toContain('numberUnits');
    }
  });
});
