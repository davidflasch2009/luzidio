import type { Entry, Mood, ProgressRow } from '../db/types';
import { isDateKey } from './dates';
import { normalizeTags } from './entryDraft';
import { PROGRAM_DAYS } from './program';
import { sanitizeSettings, type Settings } from './settings';

export const BACKUP_FORMAT = 1;
export const AUDIO_NAME_RE = /^[A-Za-z0-9._-]{1,120}$/;

export type BackupTag = { name: string; watched: boolean };

export type Backup = {
  app: 'luzidio';
  format: number;
  exportedAt: string;
  settings: Settings;
  entries: Entry[];
  tags: BackupTag[];
  progress: ProgressRow[];
  /** Sprachmemos als Base64, Schlüssel = Dateiname. */
  audio: Record<string, string>;
};

export type BackupContent = Omit<Backup, 'app' | 'format' | 'exportedAt'>;

export function createBackup(content: BackupContent, now: Date = new Date()): Backup {
  return { app: 'luzidio', format: BACKUP_FORMAT, exportedAt: now.toISOString(), ...content };
}

export function backupFileName(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `luzidio-backup-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`;
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown, max = 20000): string | null => (typeof v === 'string' ? v.slice(0, max) : null);
const isIso = (v: unknown): v is string => typeof v === 'string' && !Number.isNaN(Date.parse(v));

function parseEntry(raw: unknown): Entry | null {
  if (!isObj(raw)) return null;
  const id = str(raw.id, 100);
  if (!id || !/^[A-Za-z0-9_-]+$/.test(id)) return null;
  if (!isDateKey(raw.dreamDate)) return null;
  const body = str(raw.body) ?? '';
  const audioFile = typeof raw.audioFile === 'string' && AUDIO_NAME_RE.test(raw.audioFile) ? raw.audioFile : null;
  if (!body.trim() && !audioFile) return null;
  const mood = typeof raw.mood === 'number' && [1, 2, 3, 4, 5].includes(raw.mood) ? (raw.mood as Mood) : null;
  const clarity = typeof raw.clarity === 'number' && Number.isInteger(raw.clarity) ? Math.min(5, Math.max(0, raw.clarity)) : 0;
  const now = new Date().toISOString();
  return {
    id,
    dreamDate: raw.dreamDate,
    title: str(raw.title, 120) ?? '',
    body,
    audioFile,
    mood,
    clarity,
    isLucid: raw.isLucid === true,
    createdAt: isIso(raw.createdAt) ? raw.createdAt : now,
    updatedAt: isIso(raw.updatedAt) ? raw.updatedAt : now,
    tags: Array.isArray(raw.tags) ? normalizeTags(raw.tags.filter((t): t is string => typeof t === 'string')) : [],
  };
}

export type ParseResult =
  | { ok: true; backup: Backup; skippedEntries: number }
  | { ok: false; error: string };

/** Liest und prüft eine Backup-Datei. Ungültige Einträge werden übersprungen statt den Import abzubrechen. */
export function parseBackup(json: string): ParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return { ok: false, error: 'Die Datei ist kein gültiges JSON.' };
  }
  if (!isObj(raw) || raw.app !== 'luzidio') return { ok: false, error: 'Die Datei ist keine Luzidio-Sicherung.' };
  if (typeof raw.format !== 'number' || raw.format > BACKUP_FORMAT) {
    return { ok: false, error: 'Diese Sicherung stammt aus einer neueren App-Version. Bitte aktualisiere Luzidio.' };
  }
  const rawEntries = Array.isArray(raw.entries) ? raw.entries : [];
  const seen = new Set<string>();
  const entries: Entry[] = [];
  for (const r of rawEntries) {
    const e = parseEntry(r);
    if (e && !seen.has(e.id)) {
      seen.add(e.id);
      entries.push(e);
    }
  }
  const tags: BackupTag[] = (Array.isArray(raw.tags) ? raw.tags : [])
    .filter(isObj)
    .map((t) => ({ name: str(t.name, 40)?.trim() ?? '', watched: t.watched === true }))
    .filter((t) => t.name);
  const progress: ProgressRow[] = (Array.isArray(raw.progress) ? raw.progress : [])
    .filter(isObj)
    .filter((p) => typeof p.day === 'number' && Number.isInteger(p.day) && p.day >= 1 && p.day <= PROGRAM_DAYS && isDateKey(p.completedOn))
    .map((p) => ({ day: p.day as number, completedOn: p.completedOn as string }));
  const referenced = new Set(entries.map((e) => e.audioFile).filter((a): a is string => !!a));
  const audio: Record<string, string> = {};
  if (isObj(raw.audio)) {
    for (const [name, data] of Object.entries(raw.audio)) {
      if (referenced.has(name) && typeof data === 'string' && /^[A-Za-z0-9+/=\s]*$/.test(data)) audio[name] = data;
    }
  }
  return {
    ok: true,
    skippedEntries: rawEntries.length - entries.length,
    backup: {
      app: 'luzidio',
      format: raw.format,
      exportedAt: isIso(raw.exportedAt) ? raw.exportedAt : new Date().toISOString(),
      settings: sanitizeSettings(raw.settings),
      entries,
      tags,
      progress,
      audio,
    },
  };
}

/**
 * Einstellungen beim Import zusammenführen: Zeiten und Vorlieben übernehmen,
 * aber gerätespezifische Werte (App-Sperre, Onboarding) vom aktuellen Gerät behalten.
 */
export function mergeImportedSettings(current: Settings, imported: Settings): Settings {
  return { ...imported, lockEnabled: current.lockEnabled, onboardingDone: current.onboardingDone };
}
