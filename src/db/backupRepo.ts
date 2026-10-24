import type { BackupContent, BackupTag } from '../logic/backup';
import { listEntries, upsertEntry } from './entries';
import { completeDay, listProgress } from './progress';
import { loadSettings } from './settingsRepo';
import { listTagStats, removeOrphanTags, setWatched } from './tags';
import type { Db } from './types';

/** Liest alle Daten für den Export (ohne Audiodaten). */
export async function readAllData(db: Db): Promise<Omit<BackupContent, 'audio'>> {
  const [entries, tagStats, progress, settings] = await Promise.all([
    listEntries(db),
    listTagStats(db),
    listProgress(db),
    loadSettings(db),
  ]);
  const tags: BackupTag[] = tagStats.map((t) => ({ name: t.name, watched: t.watched }));
  return { entries, tags, progress, settings };
}

export type ImportSummary = { entries: number; signs: number; days: number };

/**
 * Führt importierte Daten mit den vorhandenen zusammen: Einträge mit gleicher ID
 * werden überschrieben, alles andere bleibt erhalten. Läuft in einer Transaktion.
 */
export async function importData(db: Db, data: Omit<BackupContent, 'audio' | 'settings'>): Promise<ImportSummary> {
  let signs = 0;
  await db.withTransactionAsync(async () => {
    for (const e of data.entries) await upsertEntry(db, e);
    for (const t of data.tags) {
      if (t.watched) {
        await setWatched(db, t.name, true);
        signs++;
      }
    }
    for (const p of data.progress) await completeDay(db, p.day, p.completedOn);
    await removeOrphanTags(db);
  });
  return { entries: data.entries.length, signs, days: data.progress.length };
}

/** Löscht alle Daten der App aus der Datenbank. */
export async function deleteAllData(db: Db): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM entry_tags');
    await db.runAsync('DELETE FROM entries');
    await db.runAsync('DELETE FROM tags');
    await db.runAsync('DELETE FROM program_progress');
    await db.runAsync('DELETE FROM settings');
  });
}
