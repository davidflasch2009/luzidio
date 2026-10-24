import { normalizeTag, normalizeTags } from '../logic/entryDraft';
import type { Db, TagStat } from './types';

async function ensureTag(db: Db, name: string): Promise<number> {
  await db.runAsync('INSERT INTO tags (name) VALUES (?) ON CONFLICT(name) DO NOTHING', [name]);
  const row = await db.getFirstAsync<{ id: number }>('SELECT id FROM tags WHERE name = ?', [name]);
  if (!row) throw new Error(`Tag konnte nicht angelegt werden: ${name}`);
  return row.id;
}

/** Ersetzt die Tags eines Eintrags. Muss innerhalb einer Transaktion laufen. */
export async function setEntryTags(db: Db, entryId: string, tags: readonly string[]): Promise<void> {
  await db.runAsync('DELETE FROM entry_tags WHERE entry_id = ?', [entryId]);
  for (const name of normalizeTags(tags)) {
    const tagId = await ensureTag(db, name);
    await db.runAsync('INSERT OR IGNORE INTO entry_tags (entry_id, tag_id) VALUES (?, ?)', [entryId, tagId]);
  }
}

/** Entfernt Tags, die weder verwendet noch als Traumzeichen markiert sind. */
export async function removeOrphanTags(db: Db): Promise<void> {
  await db.runAsync(
    'DELETE FROM tags WHERE is_watched = 0 AND id NOT IN (SELECT DISTINCT tag_id FROM entry_tags)',
  );
}

/** Alle Tags mit Häufigkeit, häufigste zuerst. */
export async function listTagStats(db: Db): Promise<TagStat[]> {
  const rows = await db.getAllAsync<{ name: string; count: number; is_watched: number }>(
    `SELECT t.name, COUNT(et.entry_id) AS count, t.is_watched
     FROM tags t LEFT JOIN entry_tags et ON et.tag_id = t.id
     GROUP BY t.id
     ORDER BY count DESC, t.name COLLATE NOCASE ASC`,
  );
  return rows.map((r) => ({ name: r.name, count: r.count, watched: r.is_watched === 1 }));
}

/** Eigene Traumzeichen (für Realitätschecks). */
export async function listWatchedSigns(db: Db): Promise<string[]> {
  const rows = await db.getAllAsync<{ name: string }>(
    'SELECT name FROM tags WHERE is_watched = 1 ORDER BY name COLLATE NOCASE',
  );
  return rows.map((r) => r.name);
}

/** Markiert einen Tag als eigenes Traumzeichen (legt ihn bei Bedarf an) oder hebt die Markierung auf. */
export async function setWatched(db: Db, rawName: string, watched: boolean): Promise<void> {
  const name = normalizeTag(rawName);
  if (!name) return;
  if (watched) {
    await db.runAsync(
      'INSERT INTO tags (name, is_watched) VALUES (?, 1) ON CONFLICT(name) DO UPDATE SET is_watched = 1',
      [name],
    );
  } else {
    await db.runAsync('UPDATE tags SET is_watched = 0 WHERE name = ?', [name]);
    await removeOrphanTags(db);
  }
}
