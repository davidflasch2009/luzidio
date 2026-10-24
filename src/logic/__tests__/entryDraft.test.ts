import type { Entry } from '../../db/types';
import {
  deriveTitle,
  emptyDraft,
  normalizeTag,
  normalizeTags,
  prepareDraft,
  splitTagInput,
  validateDraft,
  MAX_TAGS,
} from '../entryDraft';
import { emptyFilter, filterEntries, isFilterActive, matchesQuery } from '../entryFilter';

describe('entryDraft', () => {
  it('normalisiert Tags', () => {
    expect(normalizeTag('  #Fliegen   hoch ')).toBe('Fliegen hoch');
    expect(normalizeTag('x'.repeat(60))).toHaveLength(40);
    expect(normalizeTags(['Schule', 'schule', ' ', 'ÜBER', 'über'])).toEqual(['Schule', 'ÜBER']);
    expect(normalizeTags(Array.from({ length: 30 }, (_, i) => `t${i}`))).toHaveLength(MAX_TAGS);
    expect(splitTagInput('Fliegen, Schule;Hund\n ,')).toEqual(['Fliegen', 'Schule', 'Hund']);
  });

  it('leitet Titel ab', () => {
    expect(deriveTitle('  Mein   Titel ', 'egal', false)).toBe('Mein Titel');
    expect(deriveTitle('', 'Ich war in einem riesigen Haus mit vielen Türen', false)).toBe('Ich war in einem riesigen Haus …');
    expect(deriveTitle('', 'Kurz', false)).toBe('Kurz');
    expect(deriveTitle('', '', true)).toBe('Sprachmemo');
    expect(deriveTitle('', '   ', false)).toBe('Ohne Titel');
    expect(deriveTitle('', 'Donaudampfschifffahrtsgesellschaftskapitänsmütze und noch mehr', false)).toMatch(/…$/);
  });

  it('validiert Entwürfe', () => {
    const d = emptyDraft('2026-10-24');
    expect(validateDraft(d)).toBe('empty');
    expect(validateDraft({ ...d, audioFile: 'a.m4a' })).toBeNull();
    expect(validateDraft({ ...d, body: 'Traum', clarity: 6 })).toBe('clarity');
    expect(validateDraft({ ...d, body: 'Traum', mood: 9 as never })).toBe('mood');
    expect(validateDraft({ ...d, body: 'Traum', dreamDate: 'gestern' })).toBe('date');
    expect(validateDraft({ ...d, body: 'Traum', mood: 3 })).toBeNull();
  });

  it('bereitet Entwürfe zum Speichern vor', () => {
    const out = prepareDraft({ ...emptyDraft('2026-10-24'), body: '  Wald  ', tags: ['a', 'A', ''] });
    expect(out).toMatchObject({ title: 'Wald', body: 'Wald', tags: ['a'] });
  });
});

const entry = (over: Partial<Entry>): Entry => ({
  id: 'x',
  dreamDate: '2026-10-24',
  title: '',
  body: '',
  audioFile: null,
  mood: null,
  clarity: 0,
  isLucid: false,
  createdAt: '',
  updatedAt: '',
  tags: [],
  ...over,
});

describe('entryFilter', () => {
  const entries = [
    entry({ id: '1', title: 'Über den Wolken', tags: ['Fliegen'], isLucid: true }),
    entry({ id: '2', body: 'In der Schule war eine Prüfung', tags: ['Schule', 'Prüfung'] }),
    entry({ id: '3', body: 'Hund im Garten', tags: [] }),
  ];

  it('sucht ohne Beachtung der Groß-/Kleinschreibung in Titel, Text und Tags', () => {
    expect(matchesQuery(entries[0] as Entry, 'über wolken')).toBe(true);
    expect(matchesQuery(entries[0] as Entry, 'fliegen')).toBe(true);
    expect(matchesQuery(entries[0] as Entry, '   ')).toBe(true);
    expect(filterEntries(entries, { ...emptyFilter, query: 'PRÜFUNG' }).map((e) => e.id)).toEqual(['2']);
  });

  it('filtert nach Tags und Klarträumen', () => {
    expect(filterEntries(entries, { ...emptyFilter, tags: ['schule'] }).map((e) => e.id)).toEqual(['2']);
    expect(filterEntries(entries, { ...emptyFilter, tags: ['Schule', 'Fliegen'] })).toEqual([]);
    expect(filterEntries(entries, { ...emptyFilter, lucidOnly: true }).map((e) => e.id)).toEqual(['1']);
    expect(filterEntries(entries, emptyFilter)).toHaveLength(3);
  });

  it('erkennt aktive Filter', () => {
    expect(isFilterActive(emptyFilter)).toBe(false);
    expect(isFilterActive({ ...emptyFilter, query: ' a ' })).toBe(true);
    expect(isFilterActive({ ...emptyFilter, lucidOnly: true })).toBe(true);
    expect(isFilterActive({ ...emptyFilter, tags: ['x'] })).toBe(true);
  });
});
