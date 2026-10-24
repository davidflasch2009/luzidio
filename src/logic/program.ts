import type { ProgressRow } from '../db/types';
import { addDays, diffDays, formatDateShort, type DateKey } from './dates';

export const PROGRAM_DAYS = 30;

export type DayStatus = 'completed' | 'available' | 'locked';

export type ProgramState = {
  statuses: DayStatus[];
  completedCount: number;
  /** Tag, der jetzt bearbeitet werden kann, oder null. */
  currentDay: number | null;
  /** Nächster gesperrter Tag und ab wann er frei wird (falls bekannt). */
  nextUnlock: { day: number; on: DateKey } | null;
  finished: boolean;
};

/**
 * Freischaltregel: Tag 1 ist immer frei. Tag N wird frei, sobald Tag N−1 erledigt
 * ist UND seitdem ein neuer Kalendertag begonnen hat. Wer pausiert, verpasst nichts.
 */
export function computeProgramState(progress: readonly ProgressRow[], today: DateKey): ProgramState {
  const done = new Map<number, DateKey>();
  for (const p of progress) {
    if (Number.isInteger(p.day) && p.day >= 1 && p.day <= PROGRAM_DAYS) done.set(p.day, p.completedOn);
  }
  const statuses: DayStatus[] = [];
  let currentDay: number | null = null;
  let nextUnlock: ProgramState['nextUnlock'] = null;
  for (let day = 1; day <= PROGRAM_DAYS; day++) {
    if (done.has(day)) {
      statuses.push('completed');
      continue;
    }
    const prev = done.get(day - 1);
    const available = day === 1 || (prev !== undefined && diffDays(prev, today) >= 1);
    if (available) {
      statuses.push('available');
      if (currentDay === null) currentDay = day;
    } else {
      statuses.push('locked');
      if (nextUnlock === null && prev !== undefined) {
        const on = addDays(prev, 1);
        nextUnlock = { day, on: diffDays(today, on) >= 1 ? on : addDays(today, 1) };
      }
    }
  }
  const completedCount = done.size;
  return { statuses, completedCount, currentDay, nextUnlock, finished: completedCount === PROGRAM_DAYS };
}

export function canComplete(state: ProgramState, day: number): boolean {
  return state.statuses[day - 1] === 'available';
}

/** Woche (1–4) eines Programmtags; Woche 4 umfasst die Tage 22–30. */
export function weekOfDay(day: number): number {
  return Math.min(4, Math.floor((day - 1) / 7) + 1);
}

export const weekTitles: Record<number, string> = {
  1: 'Woche 1 · Träume erinnern',
  2: 'Woche 2 · Realitätschecks & Traumzeichen',
  3: 'Woche 3 · MILD',
  4: 'Woche 4 · WBTB & Stabilisieren',
};

/** Geschätzte Lesezeit in Minuten (ca. 150 Wörter pro Minute für aufmerksames Lesen eines Lerntexts). */
export function readingMinutes(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 150));
}

/** Kurzer Statussatz für Übersicht und Heute-Bildschirm. */
export function programStatusText(state: ProgramState, today: DateKey): string {
  if (state.finished) return 'Programm abgeschlossen – du kannst alle Lektionen jederzeit wieder lesen.';
  if (state.currentDay !== null) return `Heute dran: Tag ${state.currentDay}`;
  if (state.nextUnlock) {
    const when = diffDays(today, state.nextUnlock.on) === 1 ? 'morgen' : `am ${formatDateShort(state.nextUnlock.on)}`;
    return `Tag ${state.nextUnlock.day} wird ${when} freigeschaltet.`;
  }
  return '';
}
