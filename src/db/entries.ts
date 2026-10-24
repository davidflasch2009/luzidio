import { createId } from '../logic/random';
import { removeOrphanTags, setEntryTags } from './tags';
import type { Db, Entry, EntryInput, Mood } from './types';

type EntryRow = {
  id: string;
  dream_date: string;
  title: string;
  body: string;
  audio_file: string | null;
  mood: number | null;
  clarity: number;
  is_lucid: number;
  created_at: string;
  updated_at: string;
  tag_names: string | null;
};

const TAG_SEPARATOR = '\u001f';

const SELECT_ENTRIES = `
  SELECT e.*, (
    SELECT group_concat(name, '${TAG_SEPARATOR}') FROM (
      SELECT t.name AS name FROM entry_tags et JOIN tags t ON t.id = et.tag_id
      WHERE et.entry_id = e.id ORDER BY t.name COLLATE NOCASE
    )
  ) AS tag_names
  FROM entries e`;

function toMood(v: number | null): Mood | null {
  return v !== null && v >= 1 && v <= 5 ? (v as Mood) : null;
}

function mapRow(r: EntryRow): Entry {
  return {
    id: r.id,
    dreamDate: r.dream_date,
    title: r.title,
    body: r.body,
    audioFile: r.audio_file,
    mood: toMood(r.mood),
    clarity: r.clarity,
    isLucid: r.is_lucid === 1,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    tags: r.tag_names ? r.tag_names.split(TAG_SEPARATOR) : [],
  };
}

/** Alle Einträge, neueste Traumnacht zuerst. */
export async function listEntries(db: Db): Promise<Entry[]> {
  const rows = await db.getAllAsync<EntryRow>(`${SELECT_ENTRIES} ORDER BY e.dream_date DESC, e.created_at DESC`);
  return rows.map(mapRow);
}

export async function getEntry(db: Db, id: string): Promise<Entry | null> {
  const row = await db.getFirstAsync<EntryRow>(`${SELECT_ENTRIES} WHERE e.id = ?`, [id]);
  return row ? mapRow(row) : null;
}

export async function createEntry(db: Db, input: EntryInput, now: Date = new Date(), id: string = createId()): Promise<string> {
  const ts = now.toISOString();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO entries (id, dream_date, title, body, audio_file, mood, clarity, is_lucid, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, input.dreamDate, input.title, input.body, input.audioFile, input.mood, input.clarity, input.isLucid ? 1 : 0, ts, ts],
    );
    await setEntryTags(db, id, input.tags);
  });
  return id;
}

export async function updateEntry(db: Db, id: string, input: EntryInput, now: Date = new Date()): Promise<boolean> {
  let changed = false;
  await db.withTransactionAsync(async () => {
    const r = await db.runAsync(
      `UPDATE entries SET dream_date = ?, title = ?, body = ?, audio_file = ?, mood = ?, clarity = ?, is_lucid = ?, updated_at = ?
       WHERE id = ?`,
      [input.dreamDate, input.title, input.body, input.audioFile, input.mood, input.clarity, input.isLucid ? 1 : 0, now.toISOString(), id],
    );
    changed = r.changes > 0;
    if (!changed) return;
    await setEntryTags(db, id, input.tags);
    await removeOrphanTags(db);
  });
  return changed;
}

/** Löscht einen Eintrag und gibt den Namen seiner Audiodatei zurück (zum Aufräumen). */
export async function deleteEntry(db: Db, id: string): Promise<string | null> {
  const row = await db.getFirstAsync<{ audio_file: string | null }>('SELECT audio_file FROM entries WHERE id = ?', [id]);
  if (!row) return null;
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM entry_tags WHERE entry_id = ?', [id]);
    await db.runAsync('DELETE FROM entries WHERE id = ?', [id]);
    await removeOrphanTags(db);
  });
  return row.audio_file;
}

/** Fügt einen Eintrag mit fester ID ein oder überschreibt ihn (für den Import). */
export async function upsertEntry(db: Db, entry: Entry): Promise<void> {
  await db.runAsync(
    `INSERT INTO entries (id, dream_date, title, body, audio_file, mood, clarity, is_lucid, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET dream_date = excluded.dream_date, title = excluded.title, body = excluded.body,
       audio_file = excluded.audio_file, mood = excluded.mood, clarity = excluded.clarity, is_lucid = excluded.is_lucid,
       created_at = excluded.created_at, updated_at = excluded.updated_at`,
    [
      entry.id,
      entry.dreamDate,
      entry.title,
      entry.body,
      entry.audioFile,
      entry.mood,
      entry.clarity,
      entry.isLucid ? 1 : 0,
      entry.createdAt,
      entry.updatedAt,
    ],
  );
  await setEntryTags(db, entry.id, entry.tags);
}

/** Alle referenzierten Audiodateien (zum Aufräumen verwaister Dateien). */
export async function listAudioFiles(db: Db): Promise<string[]> {
  const rows = await db.getAllAsync<{ audio_file: string }>('SELECT audio_file FROM entries WHERE audio_file IS NOT NULL');
  return rows.map((r) => r.audio_file);
}
