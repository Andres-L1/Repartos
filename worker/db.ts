/**
 * Capa de datos asíncrona. Implementaciones:
 *  - D1 (producción y `wrangler dev`): `d1Db(env.PULSE_DB)`.
 *  - node:sqlite (tests): test/worker/sqlite-db.ts. Mismo SQL, compatible con D1 (SQLite).
 * Solo se usan APIs que D1 ofrece: sentencias preparadas y `batch` (atómico). Sin BEGIN/COMMIT.
 */
export type SqlValue = string | number | null;

export interface Stmt {
  sql: string;
  params?: SqlValue[];
}

export interface Db {
  first<T>(sql: string, params?: SqlValue[]): Promise<T | null>;
  all<T>(sql: string, params?: SqlValue[]): Promise<T[]>;
  run(sql: string, params?: SqlValue[]): Promise<void>;
  /** Ejecuta las sentencias de forma atómica (todo o nada). */
  batch(stmts: Stmt[]): Promise<void>;
}

/** Subconjunto estructural de D1Database (evita depender de @cloudflare/workers-types, que choca con lib DOM). */
export interface D1StatementLike {
  bind(...values: unknown[]): D1StatementLike;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
}
export interface D1Like {
  prepare(sql: string): D1StatementLike;
  batch(statements: D1StatementLike[]): Promise<unknown[]>;
}

export function d1Db(d1: D1Like): Db {
  const stmt = (sql: string, params: SqlValue[] = []) => d1.prepare(sql).bind(...params);
  return {
    first: <T>(sql: string, params?: SqlValue[]) => stmt(sql, params).first<T>(),
    all: async <T>(sql: string, params?: SqlValue[]) => (await stmt(sql, params).all<T>()).results,
    run: async (sql, params) => {
      await stmt(sql, params).run();
    },
    batch: async (stmts) => {
      if (stmts.length) await d1.batch(stmts.map((s) => stmt(s.sql, s.params)));
    },
  };
}
