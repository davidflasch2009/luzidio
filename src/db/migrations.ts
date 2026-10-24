import type { Db } from './types';

/**
 * Versionierte Migrationen. Index 0 = Version 1 usw.
 * Bestehende Einträge NIE ändern – nur neue anhängen.
 */
export const migrations: readonly string[] = [
  `
  CREATE TABLE entries (
    id          TEXT PRIMARY KEY NOT NULL,
    dream_date  TEXT NOT NULL,
    title       TEXT NOT NULL DEFAULT '',
    body        TEXT NOT NULL DEFAULT '',
    audio_file  TEXT,
    mood        INTEGER,
    clarity     INTEGER NOT NULL DEFAULT 0,
    is_lucid    INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
  );
  CREATE INDEX idx_entries_date ON entries(dream_date);

  CREATE TABLE tags (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL UNIQUE COLLATE NOCASE,
    is_watched  INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE entry_tags (
    entry_id TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
    tag_id   INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (entry_id, tag_id)
  );
  CREATE INDEX idx_entry_tags_tag ON entry_tags(tag_id);

  CREATE TABLE program_progress (
    day          INTEGER PRIMARY KEY NOT NULL,
    completed_on TEXT NOT NULL
  );

  CREATE TABLE settings (
    key   TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );
  `,
];

export const LATEST_VERSION = migrations.length;

export async function getSchemaVersion(db: Db): Promise<number> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  return row?.user_version ?? 0;
}

/**
 * Bringt die Datenbank auf den neuesten Stand. Jede Migration läuft in einer
 * eigenen Transaktion zusammen mit dem Hochsetzen der Version – bricht eine
 * Migration ab, bleibt die Datenbank auf dem vorherigen Stand.
 */
export async function migrate(db: Db): Promise<number> {
  await db.execAsync('PRAGMA foreign_keys = ON');
  const current = await getSchemaVersion(db);
  if (current > LATEST_VERSION) {
    throw new Error(
      `Die Datenbank stammt von einer neueren App-Version (${current} > ${LATEST_VERSION}). Bitte aktualisiere Luzidio.`,
    );
  }
  for (let v = current; v < LATEST_VERSION; v++) {
    const sql = migrations[v] as string;
    await db.withTransactionAsync(async () => {
      await db.execAsync(sql);
      await db.execAsync(`PRAGMA user_version = ${v + 1}`);
    });
  }
  return LATEST_VERSION;
}
