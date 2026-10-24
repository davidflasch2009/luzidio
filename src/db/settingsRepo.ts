import { sanitizeSettings, type Settings } from '../logic/settings';
import type { Db } from './types';

const KEY = 'app';

export async function loadSettings(db: Db): Promise<Settings> {
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [KEY]);
  if (!row) return sanitizeSettings(null);
  try {
    return sanitizeSettings(JSON.parse(row.value));
  } catch {
    return sanitizeSettings(null);
  }
}

export async function saveSettings(db: Db, settings: Settings): Promise<void> {
  await db.runAsync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    [KEY, JSON.stringify(settings)],
  );
}
