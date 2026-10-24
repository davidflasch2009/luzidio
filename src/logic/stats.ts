import type { Entry, TagStat } from '../db/types';
import { addDays, diffDays, startOfWeek, type DateKey } from './dates';

export type WeekBucket = { weekStart: DateKey; count: number; lucid: number };

/** Einträge pro Woche (Mo–So) für die letzten `weeks` Wochen, älteste zuerst. */
export function entriesPerWeek(entries: readonly Pick<Entry, 'dreamDate' | 'isLucid'>[], today: DateKey, weeks = 8): WeekBucket[] {
  const current = startOfWeek(today);
  const buckets: WeekBucket[] = Array.from({ length: weeks }, (_, i) => ({
    weekStart: addDays(current, -7 * (weeks - 1 - i)),
    count: 0,
    lucid: 0,
  }));
  const index = new Map(buckets.map((b, i) => [b.weekStart, i]));
  for (const e of entries) {
    const i = index.get(startOfWeek(e.dreamDate));
    if (i === undefined) continue;
    const b = buckets[i] as WeekBucket;
    b.count++;
    if (e.isLucid) b.lucid++;
  }
  return buckets;
}

function uniqueDays(entries: readonly Pick<Entry, 'dreamDate'>[]): Set<DateKey> {
  return new Set(entries.map((e) => e.dreamDate));
}

/**
 * Aktuelle Serie: aufeinanderfolgende Tage mit mindestens einem Eintrag. Die Serie
 * gilt noch, wenn heute (noch) nichts notiert wurde, aber gestern.
 */
export function currentStreak(entries: readonly Pick<Entry, 'dreamDate'>[], today: DateKey): number {
  const days = uniqueDays(entries);
  let day = days.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (days.has(day)) {
    streak++;
    day = addDays(day, -1);
  }
  return streak;
}

export function longestStreak(entries: readonly Pick<Entry, 'dreamDate'>[]): number {
  const sorted = [...uniqueDays(entries)].sort();
  let best = 0;
  let run = 0;
  let prev: DateKey | null = null;
  for (const d of sorted) {
    run = prev !== null && diffDays(prev, d) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

/**
 * Erinnerungsquote: Anteil der Tage mit Traumerinnerung in den letzten `windowDays`
 * Tagen (inkl. heute). Gezählt wird erst ab dem ersten Eintrag, damit neue Nutzer
 * nicht mit 0 % starten. Liefert null ohne Einträge.
 */
export function recallRate(
  entries: readonly Pick<Entry, 'dreamDate'>[],
  today: DateKey,
  windowDays = 30,
): { rate: number; daysWithDream: number; days: number } | null {
  const days = uniqueDays(entries);
  const past = [...days].filter((d) => diffDays(d, today) >= 0);
  if (past.length === 0) return null;
  const first = past.sort()[0] as DateKey;
  const span = Math.min(windowDays, diffDays(first, today) + 1);
  let hit = 0;
  for (let i = 0; i < span; i++) if (days.has(addDays(today, -i))) hit++;
  return { rate: hit / span, daysWithDream: hit, days: span };
}

export type Summary = {
  total: number;
  lucid: number;
  lucidShare: number;
  averageClarity: number | null;
  withAudio: number;
};

export function summarize(entries: readonly Pick<Entry, 'isLucid' | 'clarity' | 'audioFile'>[]): Summary {
  const total = entries.length;
  const lucid = entries.filter((e) => e.isLucid).length;
  const clarity = total ? entries.reduce((s, e) => s + e.clarity, 0) / total : null;
  return {
    total,
    lucid,
    lucidShare: total ? lucid / total : 0,
    averageClarity: clarity === null ? null : Math.round(clarity * 10) / 10,
    withAudio: entries.filter((e) => e.audioFile).length,
  };
}

/** Häufigste verwendete Tags (Traumzeichen). */
export function topDreamSigns(stats: readonly TagStat[], limit = 5): TagStat[] {
  return stats.filter((s) => s.count > 0).slice(0, limit);
}

export function formatPercent(rate: number): string {
  return `${Math.round(rate * 100)} %`;
}
