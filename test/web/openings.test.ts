import { describe, it, expect } from 'vitest';
import { Chess } from 'chessops/chess';
import { makeFen } from 'chessops/fen';
import { parseSan } from 'chessops/san';
import data from '../../src/openings/openings.json';
import { bookMoves, buildIndex, keyOfFen, openingAt, openingOfGame, START_KEY, type OpeningLine } from '../../src/openings/index.js';
import { outcomeBar, pct } from '../../web/src/openingsUi.js';

const index = buildIndex(data as unknown as OpeningLine[]);

/** Claves de la posición inicial y de cada jugada de `moves`. */
function walk(moves: string): string[] {
  const pos = Chess.default();
  const keys = [START_KEY];
  for (const san of moves.split(' ')) {
    pos.play(parseSan(pos, san)!);
    keys.push(keyOfFen(makeFen(pos.toSetup()))!);
  }
  return keys;
}

describe('índice de aperturas', () => {
  it('Ruy López tras 1.e4 e5 2.Nf3 Nc6 3.Bb5', () => {
    const o = openingOfGame(index, walk('e4 e5 Nf3 Nc6 Bb5'));
    expect(o?.name).toMatch(/^Ruy Lopez/);
    expect(o?.eco).toBe('C60');
  });

  it("Queen's Gambit tras 1.d4 d5 2.c4", () => {
    expect(openingOfGame(index, walk('d4 d5 c4'))?.name).toMatch(/^Queen's Gambit/);
  });

  it('la posición inicial no tiene apertura y ofrece jugadas de libro', () => {
    expect(openingAt(index, START_KEY)).toBeUndefined();
    expect(openingOfGame(index, [START_KEY])).toBeUndefined();
    const sans = bookMoves(index, START_KEY).map((m) => m.san);
    expect(sans).toEqual(expect.arrayContaining(['e4', 'd4', 'c4', 'Nf3']));
  });

  it('transposiciones: la misma posición por dos órdenes de jugadas da el mismo nombre', () => {
    const a = walk('d4 Nf6 c4 e6 Nc3 Bb4');
    const b = walk('c4 e6 Nc3 Nf6 d4 Bb4');
    expect(a.at(-1)).toBe(b.at(-1));
    expect(openingAt(index, a.at(-1)!)?.name).toMatch(/Nimzo-Indian/);
  });

  it('fuera del libro, el nombre es el de la última posición conocida', () => {
    const keys = walk('e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O h3 Nb8 d4 Nbd7 Nbd2 Bb7 Bc2 Re8 Nf1 Bf8');
    expect(openingOfGame(index, keys)?.name).toMatch(/^Ruy Lopez/);
  });

  it('jugadas del libro: cada una lleva a una apertura con nombre y a una posición coherente', () => {
    const moves = bookMoves(index, walk('e4 e5').at(-1)!);
    const nf3 = moves.find((m) => m.san === 'Nf3')!;
    expect(nf3.named).toBe(true);
    expect(nf3.opening.name).toBeTruthy();
    expect(keyOfFen('esto no es un FEN')).toBeNull();
  });
});

describe('ayudas de la interfaz', () => {
  it('pct reparte con redondeo y suma 100', () => {
    const [w, d, b] = pct({ white: 1, draws: 1, black: 1 });
    expect(w + d + b).toBe(100);
    expect(pct({ white: 0, draws: 0, black: 0 })).toEqual([0, 0, 0]);
    expect(pct({ white: 50, draws: 30, black: 20 })).toEqual([50, 30, 20]);
  });

  it('outcomeBar da texto accesible', () => {
    expect(outcomeBar({ white: 50, draws: 30, black: 20 })).toBe('Blancas ganan 50 %, tablas 30 %, negras ganan 20 %');
  });
});
