import type { EntryInput, Mood } from '../db/types';

export const MAX_TAG_LENGTH = 40;
export const MAX_TAGS = 20;
export const MAX_TITLE_LENGTH = 120;

export const moodOptions: { value: Mood; label: string; short: string }[] = [
  { value: 1, label: 'Sehr unangenehm', short: '😣' },
  { value: 2, label: 'Unangenehm', short: '😕' },
  { value: 3, label: 'Neutral', short: '😐' },
  { value: 4, label: 'Angenehm', short: '🙂' },
  { value: 5, label: 'Sehr angenehm', short: '😊' },
];

export const clarityOptions = [0, 1, 2, 3, 4, 5].map((v) => ({
  value: v,
  label: `Klarheit ${v} von 5`,
  short: String(v),
}));

/** Bereinigt einen Tag: Leerraum zusammenfassen, Länge begrenzen, führendes # entfernen. */
export function normalizeTag(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().replace(/^#+\s*/, '').slice(0, MAX_TAG_LENGTH).trim();
}

/** Entfernt leere und doppelte Tags (ohne Beachtung der Groß-/Kleinschreibung). */
export function normalizeTags(tags: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of tags) {
    const n = normalizeTag(t);
    const key = n.toLocaleLowerCase('de');
    if (!n || seen.has(key)) continue;
    seen.add(key);
    out.push(n);
    if (out.length >= MAX_TAGS) break;
  }
  return out;
}

/** Zerlegt eine Eingabe wie „Fliegen, Schule; Hund“ in einzelne Tags. */
export function splitTagInput(input: string): string[] {
  return input
    .split(/[,;\n]/)
    .map(normalizeTag)
    .filter(Boolean);
}

/** Titel aus den ersten Wörtern des Textes, falls keiner angegeben wurde. */
export function deriveTitle(title: string, body: string, hasAudio: boolean): string {
  const t = title.replace(/\s+/g, ' ').trim();
  if (t) return t.slice(0, MAX_TITLE_LENGTH);
  const words = body.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  if (words.length === 0) return hasAudio ? 'Sprachmemo' : 'Ohne Titel';
  let out = words.slice(0, 6).join(' ');
  if (out.length > 50) out = `${out.slice(0, 49).trimEnd()}…`;
  else if (words.length > 6) out += ' …';
  return out;
}

export type DraftError = 'empty' | 'clarity' | 'mood' | 'date';

/** Prüft einen Entwurf; ein Traum braucht Text oder ein Sprachmemo. */
export function validateDraft(draft: EntryInput): DraftError | null {
  if (!draft.body.trim() && !draft.audioFile) return 'empty';
  if (!Number.isInteger(draft.clarity) || draft.clarity < 0 || draft.clarity > 5) return 'clarity';
  if (draft.mood !== null && !moodOptions.some((m) => m.value === draft.mood)) return 'mood';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.dreamDate)) return 'date';
  return null;
}

export const draftErrorMessages: Record<DraftError, string> = {
  empty: 'Schreib ein paar Worte oder nimm ein Sprachmemo auf.',
  clarity: 'Die Klarheit muss zwischen 0 und 5 liegen.',
  mood: 'Bitte wähle eine gültige Stimmung.',
  date: 'Das Datum ist ungültig.',
};

/** Bereitet einen Entwurf zum Speichern vor (Titel, Tags, Leerraum). */
export function prepareDraft(draft: EntryInput): EntryInput {
  return {
    ...draft,
    title: deriveTitle(draft.title, draft.body, !!draft.audioFile),
    body: draft.body.trim(),
    tags: normalizeTags(draft.tags),
  };
}

export function emptyDraft(dreamDate: string): EntryInput {
  return { dreamDate, title: '', body: '', audioFile: null, mood: null, clarity: 0, isLucid: false, tags: [] };
}
