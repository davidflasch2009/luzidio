import type { Entry } from '../db/types';

export type EntryFilter = {
  query: string;
  /** Eintrag muss alle gewählten Tags haben. */
  tags: string[];
  lucidOnly: boolean;
};

export const emptyFilter: EntryFilter = { query: '', tags: [], lucidOnly: false };

const lower = (s: string) => s.toLocaleLowerCase('de');

/** Entfernt diakritische Zeichen nicht – „Bär“ und „Bar“ bleiben verschieden – aber ignoriert Groß-/Kleinschreibung. */
export function matchesQuery(entry: Entry, query: string): boolean {
  const words = lower(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = lower([entry.title, entry.body, ...entry.tags].join('\n'));
  return words.every((w) => haystack.includes(w));
}

export function filterEntries(entries: readonly Entry[], filter: EntryFilter): Entry[] {
  const wanted = filter.tags.map(lower);
  return entries.filter((e) => {
    if (filter.lucidOnly && !e.isLucid) return false;
    if (wanted.length > 0) {
      const have = new Set(e.tags.map(lower));
      if (!wanted.every((t) => have.has(t))) return false;
    }
    return matchesQuery(e, filter.query);
  });
}

export function isFilterActive(filter: EntryFilter): boolean {
  return filter.query.trim() !== '' || filter.tags.length > 0 || filter.lucidOnly;
}
