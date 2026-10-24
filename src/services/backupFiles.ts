import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { getDb } from '../db/client';
import { deleteAllData, importData, readAllData, type ImportSummary } from '../db/backupRepo';
import { backupFileName, createBackup, mergeImportedSettings, parseBackup } from '../logic/backup';
import type { Settings } from '../logic/settings';
import { deleteAllAudio, readAudioBase64, writeAudioBase64 } from './audioFiles';
import { cancelAllNotifications } from './notifications';

export type ExportResult = { ok: true; entries: number } | { ok: false; error: string };

/** Erstellt eine JSON-Sicherung aller Daten (inkl. Sprachmemos) und öffnet den Teilen-Dialog. */
export async function exportAll(): Promise<ExportResult> {
  try {
    const data = await readAllData(await getDb());
    const audio: Record<string, string> = {};
    for (const e of data.entries) {
      if (!e.audioFile) continue;
      const b64 = await readAudioBase64(e.audioFile);
      if (b64) audio[e.audioFile] = b64;
    }
    const backup = createBackup({ ...data, audio });
    const file = new File(Paths.cache, backupFileName());
    if (file.exists) file.delete();
    file.create();
    await file.write(JSON.stringify(backup));
    if (!(await Sharing.isAvailableAsync())) {
      return { ok: false, error: 'Teilen ist auf diesem Gerät nicht verfügbar.' };
    }
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/json',
      UTI: 'public.json',
      dialogTitle: 'Luzidio-Sicherung speichern',
    });
    return { ok: true, entries: data.entries.length };
  } catch {
    return { ok: false, error: 'Die Sicherung konnte nicht erstellt werden.' };
  }
}

export type ImportResult =
  | { ok: true; summary: ImportSummary; skipped: number; settings: Settings }
  | { ok: false; error: string; canceled?: boolean };

/** Lässt eine Sicherungsdatei auswählen und führt sie mit den vorhandenen Daten zusammen. */
export async function importFromFile(current: Settings): Promise<ImportResult> {
  try {
    const picked = await DocumentPicker.getDocumentAsync({
      type: ['application/json', 'text/plain', '*/*'],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (picked.canceled || !picked.assets[0]) return { ok: false, error: '', canceled: true };
    const file = new File(picked.assets[0].uri);
    const parsed = parseBackup(await file.text());
    if (!parsed.ok) return { ok: false, error: parsed.error };
    const { backup } = parsed;
    // Erst Audiodateien schreiben, dann Datenbank – so verweist kein Eintrag auf eine fehlende Datei.
    for (const [name, b64] of Object.entries(backup.audio)) await writeAudioBase64(name, b64);
    const entries = backup.entries.map((e) => (e.audioFile && !backup.audio[e.audioFile] ? { ...e, audioFile: null } : e));
    const summary = await importData(await getDb(), { entries, tags: backup.tags, progress: backup.progress });
    return { ok: true, summary, skipped: parsed.skippedEntries, settings: mergeImportedSettings(current, backup.settings) };
  } catch {
    return { ok: false, error: 'Die Datei konnte nicht gelesen werden.' };
  }
}

/** Löscht wirklich alles: Datenbank, Sprachmemos und geplante Benachrichtigungen. */
export async function wipeEverything(): Promise<void> {
  await deleteAllData(await getDb());
  deleteAllAudio();
  await cancelAllNotifications();
}
