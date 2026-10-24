import { addDays, atMinutes, toDateKey, type DateKey } from './dates';
import { WBTB_MAX_OFFSET, WBTB_MIN_OFFSET } from './settings';

export const WBTB_ID_PREFIX = 'wbtb-';
export const wbtbOffsets = [270, 300, 330, 360] as const;

export type WbtbPlan = {
  /** Datum des Abends, an dem die Nacht beginnt. */
  nightOf: DateKey;
  bedtime: Date;
  alarm: Date;
  /** Hinweis, falls der Wecker zu nah an oder nach der Aufwachzeit liegt. */
  warning: string | null;
};

/** Schlafdauer in Minuten zwischen Schlafenszeit und Aufwachzeit. */
export function sleepDuration(bedMinutes: number, wakeMinutes: number): number {
  const d = (wakeMinutes - bedMinutes + 1440) % 1440;
  return d === 0 ? 1440 : d;
}

/**
 * Berechnet den WBTB-Wecker für die nächste Nacht, deren Weckzeit noch in der
 * Zukunft liegt. Uhrzeiten werden als lokale Wanduhrzeit gebildet, damit eine
 * Zeitumstellung in der Nacht die Rechnung nicht verschiebt.
 */
export function planWbtb(now: Date, bedMinutes: number, wakeMinutes: number, offsetMinutes: number): WbtbPlan {
  const offset = Math.min(WBTB_MAX_OFFSET, Math.max(WBTB_MIN_OFFSET, offsetMinutes));
  const today = toDateKey(now);
  // Schlafenszeit nach Mitternacht (z. B. 00:30) gehört zum Abend davor.
  const bedAfterMidnight = bedMinutes < 12 * 60;
  for (const back of [-1, 0, 1]) {
    const nightOf = addDays(today, back);
    const bedtime = atMinutes(nightOf, bedMinutes + (bedAfterMidnight ? 1440 : 0));
    const alarm = atMinutes(nightOf, bedMinutes + (bedAfterMidnight ? 1440 : 0) + offset);
    if (alarm.getTime() > now.getTime() + 60_000) {
      const sleep = sleepDuration(bedMinutes, wakeMinutes);
      const warning =
        offset >= sleep
          ? 'Der Wecker läge nach deiner Aufwachzeit. Wähle einen kürzeren Abstand oder prüfe deine Zeiten.'
          : sleep - offset < 90
            ? 'Nach dem Wecker bleibt wenig Schlafzeit. Plane genug Zeit zum Wiederschlafen ein.'
            : null;
      return { nightOf, bedtime, alarm, warning };
    }
  }
  // Unerreichbar, da die Nacht von morgen immer in der Zukunft liegt.
  throw new Error('Keine WBTB-Zeit gefunden');
}

export function wbtbId(nightOf: DateKey): string {
  return `${WBTB_ID_PREFIX}${nightOf}`;
}

export function formatOffset(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} Std.` : `${h},${Math.round((m / 60) * 10)} Std.`;
}
