import { Directory, File, Paths } from 'expo-file-system';

import { createId } from '../logic/random';

/**
 * Sprachmemos liegen in <Dokumente>/audio. In der Datenbank steht nur der
 * Dateiname, weil sich der absolute Container-Pfad (iOS) bei Updates ändert.
 */
function audioDir(): Directory {
  return new Directory(Paths.document, 'audio');
}

function ensureAudioDir(): Directory {
  const dir = audioDir();
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

const SAFE_NAME = /^[A-Za-z0-9._-]+$/;

function fileFor(name: string): File {
  if (!SAFE_NAME.test(name)) throw new Error('Ungültiger Dateiname');
  return new File(audioDir(), name);
}

export function audioUri(name: string): string {
  return fileFor(name).uri;
}

export function audioExists(name: string): boolean {
  try {
    return fileFor(name).exists;
  } catch {
    return false;
  }
}

/** Kopiert eine frische Aufnahme (temporäre Datei) dauerhaft und gibt den Dateinamen zurück. */
export async function persistRecording(tempUri: string): Promise<string> {
  const dir = ensureAudioDir();
  const src = new File(tempUri);
  const ext = /^\.[A-Za-z0-9]{1,5}$/.test(src.extension) ? src.extension : '.m4a';
  const name = `memo-${createId()}${ext}`;
  const dest = new File(dir, name);
  await src.copy(dest);
  return name;
}

/** Löscht eine Datei; Fehler (z. B. schon gelöscht) werden ignoriert. */
export function deleteUri(uri: string): void {
  try {
    const f = new File(uri);
    if (f.exists) f.delete();
  } catch {
    // Datei existiert nicht mehr – nichts zu tun.
  }
}

export function deleteAudio(name: string | null): void {
  if (!name) return;
  try {
    const f = fileFor(name);
    if (f.exists) f.delete();
  } catch {
    // ignorieren
  }
}

export async function readAudioBase64(name: string): Promise<string | null> {
  try {
    const f = fileFor(name);
    return f.exists ? await f.base64() : null;
  } catch {
    return null;
  }
}

export async function writeAudioBase64(name: string, base64: string): Promise<void> {
  ensureAudioDir();
  const f = fileFor(name);
  if (!f.exists) f.create({ intermediates: true });
  await f.write(base64, { encoding: 'base64' });
}

/** Entfernt Audiodateien, auf die kein Eintrag mehr verweist. */
export function removeUnreferencedAudio(referenced: readonly string[]): number {
  const keep = new Set(referenced);
  const dir = audioDir();
  if (!dir.exists) return 0;
  let removed = 0;
  for (const item of dir.list()) {
    if (item instanceof File && !keep.has(item.name)) {
      try {
        item.delete();
        removed++;
      } catch {
        // ignorieren
      }
    }
  }
  return removed;
}

export function deleteAllAudio(): void {
  try {
    const dir = audioDir();
    if (dir.exists) dir.delete();
  } catch {
    // ignorieren
  }
}
