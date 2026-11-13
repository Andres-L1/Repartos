import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseGame } from '../../src/analysis/pgn.js';
import { gamesUrl, isValidUsername, parseNdjson, pickGames, toReviewGame } from '../../src/lichess/games.js';
import { fetchRecentGames, LichessError } from '../../src/lichess/fetch.js';
import type { LichessGame } from '../../src/review/types.js';

const NDJSON = readFileSync(new URL('../fixtures/lichess-games.ndjson', import.meta.url), 'utf8');
const USER = 'DrNykterstein';

function game(over: Partial<LichessGame> = {}): LichessGame {
  return {
    id: 'abc12345',
    speed: 'blitz',
    variant: 'standard',
    status: 'mate',
    createdAt: 1000,
    moves: 'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5',
    winner: 'white',
    players: { white: { id: 'alice', rating: 1500 }, black: { id: 'bob', rating: 1400 } },
    ...over,
  };
}

describe('isValidUsername / gamesUrl', () => {
  it('valida el formato de usuario', () => {
    expect(isValidUsername('a b')).toBe(false);
    expect(isValidUsername('a')).toBe(false);
    expect(isValidUsername('Dr_Nyk-1')).toBe(true);
  });
  it('construye la URL con los parámetros acordados', () => {
    const u = new URL(gamesUrl('Alice'));
    expect(u.origin + u.pathname).toBe('https://lichess.org/api/games/user/Alice');
    expect(u.searchParams.get('max')).toBe('30');
    expect(u.searchParams.get('perfType')).toBe('blitz,rapid,classical,correspondence');
    expect(u.searchParams.get('moves')).toBe('true');
    expect(u.searchParams.get('opening')).toBe('true');
    expect(u.searchParams.get('clocks')).toBe('true');
    expect(new URL(gamesUrl('Alice', 5)).searchParams.get('max')).toBe('5');
  });
});

describe('parseNdjson', () => {
  it('devuelve [] para texto vacío', () => expect(parseNdjson('')).toEqual([]));
  it('ignora líneas vacías o inválidas', () => {
    const line = JSON.stringify({ id: 'x', variant: 'standard', speed: 'blitz', status: 'mate', createdAt: 1, moves: 'e4', players: { white: {}, black: {} } });
    expect(parseNdjson(`\n${line}\nno es json\n\n`)).toHaveLength(1);
  });
  it('lee el fixture real', () => {
    const games = parseNdjson(NDJSON);
    expect(games.length).toBe(12);
    expect(games[0]!.id).toBeTruthy();
    expect(typeof games[0]!.moves).toBe('string');
  });
});

describe('toReviewGame', () => {
  it('descarta variantes, abortadas, noStart, cortas y usuario ajeno', () => {
    expect(toReviewGame(game({ variant: 'chess960' }), 'alice')).toBeNull();
    expect(toReviewGame(game({ status: 'aborted' }), 'alice')).toBeNull();
    expect(toReviewGame(game({ status: 'noStart' }), 'alice')).toBeNull();
    expect(toReviewGame(game({ moves: 'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O' }), 'alice')).toBeNull();
    expect(toReviewGame(game(), 'carol')).toBeNull();
  });
  it('descarta partidas sin terminar (started, created, unknownFinish)', () => {
    for (const status of ['started', 'created', 'unknownFinish'])
      expect(toReviewGame(game({ status, winner: undefined }), 'alice')).toBeNull();
    expect(toReviewGame(game({ status: 'draw', winner: undefined }), 'alice')?.result).toBe('draw');
  });
  it('detecta el color sin distinguir mayúsculas y el resultado', () => {
    const w = toReviewGame(game(), 'ALICE')!;
    expect(w.color).toBe('white');
    expect(w.result).toBe('win');
    const b = toReviewGame(game(), 'Bob')!;
    expect(b.color).toBe('black');
    expect(b.result).toBe('loss');
    const d = toReviewGame(game({ winner: undefined, status: 'draw' }), 'bob')!;
    expect(d.result).toBe('draw');
  });
  it('genera un PGN que parseGame entiende', () => {
    const r = toReviewGame(game({ opening: { name: 'Ruy Lopez' } }), 'alice')!;
    expect(r.opening).toBe('Ruy Lopez');
    expect(r.pgn).toContain('[White "alice"]');
    expect(r.pgn).toContain('[Result "1-0"]');
    expect(parseGame(r.pgn).moves).toHaveLength(12);
  });
  it('incluye FEN y SetUp con initialFen', () => {
    const fen = 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2';
    const r = toReviewGame(game({ initialFen: fen, moves: 'Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6' }), 'alice')!;
    expect(r.pgn).toContain('[SetUp "1"]');
    expect(r.pgn).toContain(`[FEN "${fen}"]`);
    expect(parseGame(r.pgn).moves).toHaveLength(12);
  });
  it('todas las partidas válidas del fixture producen PGN legal', () => {
    const picked = pickGames(parseNdjson(NDJSON), USER, 12);
    expect(picked.length).toBeGreaterThan(0);
    for (const g of picked) expect(() => parseGame(g.pgn)).not.toThrow();
  });
});

describe('pickGames', () => {
  it('devuelve como máximo 10 en el orden recibido', () => {
    const many = Array.from({ length: 15 }, (_, i) => game({ id: `g${i}` }));
    const picked = pickGames(many, 'alice');
    expect(picked).toHaveLength(10);
    expect(picked.map((g) => g.id)).toEqual(many.slice(0, 10).map((g) => g.id));
  });
});

describe('fetchRecentGames', () => {
  const okLine = JSON.stringify(game());
  const resp = (status: number, body = '') => (async () => new Response(body, { status })) as unknown as typeof fetch;

  it('devuelve las partidas y pide NDJSON', async () => {
    let accept = '';
    const fetchImpl = (async (_u: unknown, init?: RequestInit) => {
      accept = new Headers(init?.headers).get('Accept') ?? '';
      return new Response(okLine + '\n');
    }) as unknown as typeof fetch;
    const games = await fetchRecentGames('alice', { fetchImpl });
    expect(games).toHaveLength(1);
    expect(accept).toBe('application/x-ndjson');
  });
  it('mapea 404 a not_found', async () => {
    await expect(fetchRecentGames('alice', { fetchImpl: resp(404) })).rejects.toMatchObject({ kind: 'not_found' });
  });
  it('mapea 429 a rate_limited', async () => {
    await expect(fetchRecentGames('alice', { fetchImpl: resp(429) })).rejects.toMatchObject({ kind: 'rate_limited' });
  });
  it('mapea fallo de red a network', async () => {
    const fetchImpl = (async () => { throw new TypeError('fail'); }) as unknown as typeof fetch;
    const err = await fetchRecentGames('alice', { fetchImpl }).catch((e) => e);
    expect(err).toBeInstanceOf(LichessError);
    expect(err.kind).toBe('network');
  });
  it('mapea un cuerpo no NDJSON a bad_response', async () => {
    await expect(fetchRecentGames('alice', { fetchImpl: resp(200, '<html>hola</html>') })).rejects.toMatchObject({ kind: 'bad_response' });
  });
  it('propaga el aborto', async () => {
    const ac = new AbortController();
    ac.abort();
    const fetchImpl = (async (_u: unknown, init?: RequestInit) => {
      if (init?.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      return new Response(okLine);
    }) as unknown as typeof fetch;
    await expect(fetchRecentGames('alice', { fetchImpl, signal: ac.signal })).rejects.toMatchObject({ name: 'AbortError' });
  });
});

describe('parseNdjson con el formato real de Lichess', () => {
  it('aplana players.*.user.id y opening.name', () => {
    const g = parseNdjson(NDJSON)[0]!;
    expect(g.players.white.id).toBe('drnykterstein');
    expect(typeof g.players.white.rating).toBe('number');
    expect(g.opening?.name).toBeTruthy();
  });
});
