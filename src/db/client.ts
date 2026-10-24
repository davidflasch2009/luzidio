import * as SQLite from 'expo-sqlite';

import { migrate } from './migrations';
import type { Db } from './types';

let dbPromise: Promise<Db> | null = null;

function wrap(raw: SQLite.SQLiteDatabase): Db {
  return {
    execAsync: (sql) => raw.execAsync(sql),
    runAsync: (sql, params = []) => raw.runAsync(sql, params),
    getAllAsync: (sql, params = []) => raw.getAllAsync(sql, params),
    getFirstAsync: (sql, params = []) => raw.getFirstAsync(sql, params),
    withTransactionAsync: (task) => raw.withTransactionAsync(task),
  };
}

/** Öffnet die Datenbank einmalig und führt ausstehende Migrationen aus. */
export function getDb(): Promise<Db> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const raw = await SQLite.openDatabaseAsync('luzidio.db');
      await raw.execAsync('PRAGMA journal_mode = WAL');
      const db = wrap(raw);
      await migrate(db);
      return db;
    })().catch((e: unknown) => {
      dbPromise = null;
      throw e;
    });
  }
  return dbPromise;
}
