import type { Db, RunResult, SqlParam } from '../db/types';

type Statement = {
  run: (...params: SqlParam[]) => { changes: number | bigint; lastInsertRowid: number | bigint };
  all: (...params: SqlParam[]) => unknown[];
  get: (...params: SqlParam[]) => unknown;
};
type NodeDb = { exec: (sql: string) => void; prepare: (sql: string) => Statement; close: () => void };

function loadSqlite(): { DatabaseSync: new (path: string) => NodeDb } {
  // node:sqlite meldet beim Laden eine ExperimentalWarning – für saubere Testausgabe unterdrücken.
  const original = process.emitWarning;
  process.emitWarning = () => undefined;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('node:sqlite');
  } finally {
    process.emitWarning = original;
  }
}

/** In-Memory-SQLite für Tests, mit derselben Schnittstelle wie in der App. */
export function createTestDb(): Db & { close: () => void } {
  const { DatabaseSync } = loadSqlite();
  const db = new DatabaseSync(':memory:');
  let depth = 0;
  return {
    execAsync: async (sql) => {
      db.exec(sql);
    },
    runAsync: async (sql, params = []): Promise<RunResult> => {
      const r = db.prepare(sql).run(...params);
      return { changes: Number(r.changes), lastInsertRowId: Number(r.lastInsertRowid) };
    },
    getAllAsync: async <T,>(sql: string, params: SqlParam[] = []) => db.prepare(sql).all(...params) as T[],
    getFirstAsync: async <T,>(sql: string, params: SqlParam[] = []) => (db.prepare(sql).get(...params) as T) ?? null,
    withTransactionAsync: async (task) => {
      if (depth > 0) throw new Error('Verschachtelte Transaktion');
      depth++;
      db.exec('BEGIN');
      try {
        await task();
        db.exec('COMMIT');
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      } finally {
        depth--;
      }
    },
    close: () => db.close(),
  };
}
