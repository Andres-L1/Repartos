/** Implementación de Db sobre node:sqlite para tests. Aplica migrations/*.sql tal cual (mismo SQL que D1). */
import { DatabaseSync } from 'node:sqlite';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Db, SqlValue, Stmt } from '../../worker/db.js';

const MIGRATIONS_DIR = fileURLToPath(new URL('../../migrations/', import.meta.url));

export function openTestDb(): Db & { raw: DatabaseSync } {
  const raw = new DatabaseSync(':memory:');
  raw.exec('PRAGMA foreign_keys = ON'); // D1 también aplica claves foráneas
  for (const f of readdirSync(MIGRATIONS_DIR).filter((n) => n.endsWith('.sql')).sort())
    raw.exec(readFileSync(MIGRATIONS_DIR + f, 'utf8'));
  const run = (sql: string, params: SqlValue[] = []) => raw.prepare(sql).run(...params);
  return {
    raw,
    first: async <T>(sql: string, params: SqlValue[] = []) => (raw.prepare(sql).get(...params) as T | undefined) ?? null,
    all: async <T>(sql: string, params: SqlValue[] = []) => raw.prepare(sql).all(...params) as T[],
    run: async (sql, params) => {
      run(sql, params);
    },
    batch: async (stmts: Stmt[]) => {
      raw.exec('BEGIN');
      try {
        for (const s of stmts) run(s.sql, s.params);
        raw.exec('COMMIT');
      } catch (e) {
        raw.exec('ROLLBACK');
        throw e;
      }
    },
  };
}
