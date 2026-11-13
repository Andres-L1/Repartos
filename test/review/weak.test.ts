import { describe, expect, it } from 'vitest';
import { topWeakConcepts } from '../../src/review/weak.js';

describe('topWeakConcepts', () => {
  it('ordena por recuento descendente', () => {
    expect(topWeakConcepts({ a: 1, b: 5, c: 3 }).map((x) => x.conceptId)).toEqual(['b', 'c', 'a']);
  });
  it('desempata por id', () => {
    expect(topWeakConcepts({ z: 2, a: 2, m: 2 }).map((x) => x.conceptId)).toEqual(['a', 'm', 'z']);
  });
  it('devuelve como mucho 3 por defecto y respeta n', () => {
    const w = { a: 4, b: 3, c: 2, d: 1 };
    expect(topWeakConcepts(w)).toHaveLength(3);
    expect(topWeakConcepts(w, 2)).toHaveLength(2);
  });
  it('vacío', () => {
    expect(topWeakConcepts({})).toEqual([]);
  });
  it('ignora recuentos 0 o negativos', () => {
    expect(topWeakConcepts({ a: 0, b: -2, c: 1 })).toEqual([{ conceptId: 'c', count: 1 }]);
  });
});
