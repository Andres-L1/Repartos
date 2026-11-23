import { describe, it, expect } from 'vitest';
import type { LichessGame } from '../../src/review/types.js';
import { START_KEY } from '../../src/openings/index.js';
import { checkRepMove, nextKey, reachable, repertoireFromGames, verifyOwn, type RepMove } from '../../src/openings/repertoire.js';

const game = (id: string, moves: string, me: 'white' | 'black' = 'white'): LichessGame =>
  ({
    id,
    speed: 'blitz',
    variant: 'standard',
    status: 'resign',
    createdAt: 1,
    moves,
    winner: 'white',
    players: { white: { id: me === 'white' ? 'yo' : 'rival' }, black: { id: me === 'black' ? 'yo' : 'rival' } },
  }) as LichessGame;

const RUY = 'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7';

describe('repertorio', () => {
  it('checkRepMove acepta jugadas legales y rechaza el resto', () => {
    expect(checkRepMove(START_KEY, 'e2e4')).toEqual({ key: START_KEY, uci: 'e2e4' });
    expect(checkRepMove(START_KEY, 'e2e5')).toBeNull();
    expect(checkRepMove('basura', 'e2e4')).toBeNull();
    expect(checkRepMove(START_KEY, 42)).toBeNull();
  });

  it('crea el repertorio con lo que se repite (2+ partidas) y deja fuera lo que no', () => {
    const games = [game('a', RUY), game('b', RUY), game('c', 'd4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O')];
    const m = repertoireFromGames(games, 'yo');
    const first = m.find((x) => x.key === START_KEY)!;
    expect(first.uci).toBe('e2e4'); // d4 solo una vez: no entra
    expect(m.filter((x) => x.key === START_KEY)).toHaveLength(1);
    expect(m.every((x) => x.color === 'white')).toBe(true);
    expect(m.length).toBeGreaterThan(6);
  });

  it('separa por color y sin partidas repetidas no hay nada', () => {
    expect(repertoireFromGames([game('a', RUY)], 'yo')).toEqual([]);
    const m = repertoireFromGames([game('a', RUY, 'black'), game('b', RUY, 'black')], 'yo');
    expect(m.length).toBeGreaterThan(0);
    expect(m.every((x) => x.color === 'black')).toBe(true);
  });

  it('reachable corta las ramas huérfanas', () => {
    const e4 = nextKey(START_KEY, 'e2e4')!;
    const orphan: RepMove = { color: 'white', key: e4, uci: 'e7e5' };
    const root: RepMove = { color: 'white', key: START_KEY, uci: 'e2e4' };
    expect(reachable([orphan])).toEqual([]);
    expect(reachable([orphan, root])).toHaveLength(2);
  });

  it('verifyOwn descarta mis jugadas dudosas y su rama; las del rival no se comprueban', async () => {
    const e4 = nextKey(START_KEY, 'e2e4')!;
    const moves: RepMove[] = [
      { color: 'white', key: START_KEY, uci: 'e2e4' },
      { color: 'white', key: e4, uci: 'e7e5' },
    ];
    // Motor falso: tras 1.e4 la evaluación cae 200 cp para las blancas.
    const engine = {
      analyze: async (fen: string) => ({ score: { cp: fen.startsWith(e4) ? -200 : 0 }, bestUci: '', pv: [] }),
    };
    expect(await verifyOwn(moves, engine)).toEqual([]);
    const ok = { analyze: async () => ({ score: { cp: 10 }, bestUci: '', pv: [] }) };
    const seen: number[] = [];
    expect(await verifyOwn(moves, ok, { onProgress: (d) => seen.push(d) })).toHaveLength(2);
    expect(seen.at(-1)).toBe(1);
  });
});
