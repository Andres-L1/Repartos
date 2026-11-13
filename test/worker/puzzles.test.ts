import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { openTestDb } from './sqlite-db.js';
import { takePuzzle } from '../../worker/puzzles.js';

const { puzzles } = JSON.parse(readFileSync(new URL('../fixtures/lichess-puzzles.json', import.meta.url), 'utf8')) as { puzzles: any[] };
const DAY = 86_400_000;
const NOW = 1_000_000_000_000;

const fakeFetch = (body: unknown, status = 200) => {
  const f = (async () => { f.calls++; return new Response(JSON.stringify(body), { status }); }) as unknown as typeof fetch & { calls: number };
  f.calls = 0;
  return f;
};
const seed = (db: ReturnType<typeof openTestDb>, n: number, fetchedAt = NOW, used = false) => {
  for (let i = 0; i < n; i++)
    db.raw.prepare("INSERT INTO cp_puzzle_pool VALUES (?, 'fork', 'easier', 1500, 'f', '[\"e2e4\"]', ?, ?)").run(`s${i}`, fetchedAt, used ? 1 : null);
};
const rows = (db: ReturnType<typeof openTestDb>) => (db.raw.prepare('SELECT COUNT(*) AS n FROM cp_puzzle_pool').get() as any).n;

describe('takePuzzle', () => {
  it('depósito vacío: un fetch y devuelve uno válido', async () => {
    const db = openTestDb(); const f = fakeFetch({ puzzles });
    const p = await takePuzzle(db, 'fork', 'easier', NOW, f);
    expect(f.calls).toBe(1);
    expect(p?.line[0]).toBe(puzzles.find((x) => x.puzzle.id === p!.puzzleId).puzzle.solution[0]);
    expect(p?.fen).toBeTruthy();
    expect(rows(db)).toBe(3);
  });
  it('con 10 o más sin usar y reciente: cero fetch', async () => {
    const db = openTestDb(); seed(db, 10); const f = fakeFetch({ puzzles });
    expect(await takePuzzle(db, 'fork', 'easier', NOW + DAY, f)).not.toBeNull();
    expect(f.calls).toBe(0);
  });
  it('el puzle inválido del lote no entra', async () => {
    const db = openTestDb();
    const bad = { game: { pgn: puzzles[0].game.pgn }, puzzle: { ...puzzles[0].puzzle, id: 'bad00', solution: ['a1a1'] } };
    await takePuzzle(db, 'fork', 'easier', NOW, fakeFetch({ puzzles: [bad, puzzles[1]] }));
    expect(rows(db)).toBe(1);
  });
  it('429 o red caída: null y no escribe', async () => {
    const db = openTestDb();
    expect(await takePuzzle(db, 'fork', 'easier', NOW, fakeFetch({}, 429))).toBeNull();
    expect(await takePuzzle(db, 'fork', 'easier', NOW, (async () => { throw new Error('red'); }) as unknown as typeof fetch)).toBeNull();
    expect(await takePuzzle(db, 'fork', 'easier', NOW, fakeFetch({ nada: 1 }))).toBeNull();
    expect(rows(db)).toBe(0);
  });
  it('tras un 429 no vuelve a llamar a Lichess durante un minuto', async () => {
    const db = openTestDb();
    const f = fakeFetch({}, 429);
    await takePuzzle(db, 'fork', 'easier', NOW, f);
    await takePuzzle(db, 'pin', 'normal', NOW + 59_000, f);
    expect(f.calls).toBe(1);
    await takePuzzle(db, 'fork', 'easier', NOW + 60_000, f);
    expect(f.calls).toBe(2);
  });
  it('no entrega el mismo puzle dos veces', async () => {
    const db = openTestDb(); const f = fakeFetch({ puzzles });
    const ids = new Set<string>();
    for (let i = 0; i < 3; i++) ids.add((await takePuzzle(db, 'fork', 'easier', NOW, f))!.puzzleId);
    expect(ids.size).toBe(3);
    expect(await takePuzzle(db, 'fork', 'easier', NOW, f)).toBeNull();
  });
  it('rellena por caducidad de 7 días', async () => {
    const db = openTestDb(); seed(db, 10); const f = fakeFetch({ puzzles });
    await takePuzzle(db, 'fork', 'easier', NOW + 8 * DAY, f);
    expect(f.calls).toBe(1);
    expect(rows(db)).toBe(13);
  });
});
