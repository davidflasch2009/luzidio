/**
 * Datumshilfen auf Basis lokaler Kalendertage ('YYYY-MM-DD').
 * Rechnen über Kalenderkomponenten statt Millisekunden, damit Sommerzeit-
 * wechsel (23- oder 25-Stunden-Tage) keine Tage verschieben.
 */

export type DateKey = string;

const DATE_KEY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isDateKey(value: unknown): value is DateKey {
  if (typeof value !== 'string') return false;
  const m = DATE_KEY_RE.exec(value);
  if (!m) return false;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.getFullYear() === Number(m[1]) && d.getMonth() === Number(m[2]) - 1 && d.getDate() === Number(m[3]);
}

export function toDateKey(date: Date): DateKey {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Lokale Mitternacht des Tages. */
export function parseDateKey(key: DateKey): Date {
  const m = DATE_KEY_RE.exec(key);
  if (!m) throw new Error(`Ungültiges Datum: ${key}`);
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

export function addDays(key: DateKey, days: number): DateKey {
  const d = parseDateKey(key);
  return toDateKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() + days));
}

/** Anzahl Kalendertage von a bis b (b − a). */
export function diffDays(a: DateKey, b: DateKey): number {
  const da = parseDateKey(a);
  const db = parseDateKey(b);
  const ua = Date.UTC(da.getFullYear(), da.getMonth(), da.getDate());
  const ub = Date.UTC(db.getFullYear(), db.getMonth(), db.getDate());
  return Math.round((ub - ua) / 86400000);
}

/** Lokales Datum mit Uhrzeit (Minuten seit Mitternacht, darf ≥ 1440 sein → Folgetag). */
export function atMinutes(key: DateKey, minutes: number): Date {
  const d = parseDateKey(key);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), Math.floor(minutes / 60), minutes % 60, 0, 0);
}

export function minutesOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** Montag der Woche (ISO-Woche beginnt montags). */
export function startOfWeek(key: DateKey): DateKey {
  const d = parseDateKey(key);
  const weekday = (d.getDay() + 6) % 7; // Mo = 0
  return addDays(key, -weekday);
}

const WEEKDAYS = ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'];
const WEEKDAYS_LONG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const MONTHS = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'];
const MONTHS_LONG = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

/** z. B. „Sa., 24. Okt. 2026“ */
export function formatDateShort(key: DateKey): string {
  const d = parseDateKey(key);
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** z. B. „Samstag, 24. Oktober“ */
export function formatDateLong(key: DateKey): string {
  const d = parseDateKey(key);
  return `${WEEKDAYS_LONG[d.getDay()]}, ${d.getDate()}. ${MONTHS_LONG[d.getMonth()]}`;
}

/** „Heute“, „Gestern“ oder Kurzdatum. */
export function formatRelativeDay(key: DateKey, today: DateKey): string {
  const diff = diffDays(key, today);
  if (diff === 0) return 'Heute';
  if (diff === 1) return 'Gestern';
  if (diff === -1) return 'Morgen';
  return formatDateShort(key);
}

/** z. B. „14:05“ */
export function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/** Dauer in Sekunden als „m:ss“. */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
