import { describe, it, expect } from 'vitest';
import { openTestDb } from './sqlite-db.js';
import { touchSchedule, parsePositions } from '../../worker/srs.js';

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const ok = { ply: 1, conceptId: 'tactics.fork', fen: START, bestUci: 'e2e4' };
const DAY = 86_400_000;

describe('touchSchedule', () => {
  const setup = async () => {
    const db = openTestDb();
    await db.run("INSERT INTO cp_users (id, username, created_at, last_login_at) VALUES ('u','n','x','x')");
    return db;
  };
  const row = (db: Awaited<ReturnType<typeof setup>>) => db.raw.prepare('SELECT box, due_at FROM cp_review_schedule').get() as any;

  it('sin fila: caja 1 y vence en 1 día', async () => {
    const db = await setup();
    await db.batch([touchSchedule('u', 'tactics.fork', 1000)]);
    expect(row(db)).toEqual({ box: 1, due_at: 1000 + DAY });
  });
  it('caja 3: vuelve a la 1 con el mismo vencimiento', async () => {
    const db = await setup();
    db.raw.exec("INSERT INTO cp_review_schedule VALUES ('u','tactics.fork',3,5000,NULL)");
    await db.batch([touchSchedule('u', 'tactics.fork', 1000)]);
    expect(row(db)).toEqual({ box: 1, due_at: 5000 });
  });
  it('caja 4 con vencimiento lejano: vuelve a la 1 y vence en 1 día', async () => {
    const db = await setup();
    db.raw.exec(`INSERT INTO cp_review_schedule VALUES ('u','tactics.fork',4,${1000 + 8 * DAY},NULL)`);
    await db.batch([touchSchedule('u', 'tactics.fork', 1000)]);
    expect(row(db)).toEqual({ box: 1, due_at: 1000 + DAY });
  });
  it('caja 1: sin cambios', async () => {
    const db = await setup();
    db.raw.exec("INSERT INTO cp_review_schedule VALUES ('u','tactics.fork',1,5000,NULL)");
    await db.batch([touchSchedule('u', 'tactics.fork', 1000)]);
    expect(row(db)).toEqual({ box: 1, due_at: 5000 });
  });
});

describe('parsePositions', () => {
  it('acepta un caso válido', () => expect(parsePositions([ok])).toEqual([ok]));
  it('rechaza lo inválido', () => {
    for (const bad of [
      [{ ...ok, fen: 'basura' }],
      [{ ...ok, bestUci: 'e2e5' }],
      [{ ...ok, conceptId: 'nope' }],
      [ok, ok, ok, ok],
      [{ ...ok, ply: 0 }],
      'x',
    ]) expect(typeof parsePositions(bad)).toBe('string');
  });
});
