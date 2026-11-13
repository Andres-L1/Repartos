import { describe, expect, it } from 'vitest';
import type { AnalyzedMove } from '../../src/types';
import { fenAt, indexBeforePly, indexOfPly, initViewer, lastMoveAt, viewerReducer } from '../../web/src/review/gameViewer';

const mv = (ply: number, uci: string): AnalyzedMove =>
  ({ ply, uci, color: ply % 2 ? 'white' : 'black', fenBefore: `b${ply}`, fenAfter: `a${ply}` }) as AnalyzedMove;
const moves = [mv(1, 'e2e4'), mv(2, 'e7e5'), mv(3, 'g1f3')];

describe('visor de la partida', () => {
  it('prev y next se quedan dentro de los límites', () => {
    let s = initViewer(3);
    expect(viewerReducer(s, { type: 'prev' }).index).toBe(0);
    s = viewerReducer(s, { type: 'next' });
    expect(s.index).toBe(1);
    s = { ...s, index: 3 };
    expect(viewerReducer(s, { type: 'next' }).index).toBe(3);
  });
  it('first, last y goto recortan', () => {
    const s = initViewer(3, 1);
    expect(viewerReducer(s, { type: 'first' }).index).toBe(0);
    expect(viewerReducer(s, { type: 'last' }).index).toBe(3);
    expect(viewerReducer(s, { type: 'goto', index: 99 }).index).toBe(3);
    expect(viewerReducer(s, { type: 'goto', index: -4 }).index).toBe(0);
    expect(viewerReducer(s, { type: 'goto', index: 2 }).index).toBe(2);
    expect(initViewer(3, 50).index).toBe(3);
  });
  it('fen y última jugada por posición', () => {
    expect(fenAt(moves, 0)).toBe('b1');
    expect(fenAt(moves, 2)).toBe('a2');
    expect(fenAt(moves, 3)).toBe('a3');
    expect(fenAt([], 0)).toBeUndefined();
    expect(lastMoveAt(moves, 0)).toBeUndefined();
    expect(lastMoveAt(moves, 3)).toEqual(['g1', 'f3']);
  });
  it('posición antes y después de una jugada', () => {
    expect(indexBeforePly(moves, 3)).toBe(2);
    expect(fenAt(moves, indexBeforePly(moves, 3))).toBe('a2');
    expect(indexOfPly(moves, 3)).toBe(3);
    expect(indexBeforePly(moves, 99)).toBe(0);
  });
});
