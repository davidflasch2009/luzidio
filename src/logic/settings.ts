import type { ThemeMode } from '../theme/colors';

/** Alle Nutzereinstellungen. Uhrzeiten als Minuten seit Mitternacht (0–1439). */
export type Settings = {
  onboardingDone: boolean;
  wakeMinutes: number;
  bedMinutes: number;
  realityChecksEnabled: boolean;
  realityChecksPerDay: number;
  morningReminderEnabled: boolean;
  speechRate: number;
  lockEnabled: boolean;
  themeMode: ThemeMode;
  /** Abstand Schlafenszeit → WBTB-Wecker in Minuten */
  wbtbOffsetMinutes: number;
  /** Datum ('YYYY-MM-DD'), an dem das Programm gestartet wurde */
  programStartedOn: string | null;
};

export const RC_MIN = 3;
export const RC_MAX = 15;
export const SPEECH_RATE_MIN = 0.5;
export const SPEECH_RATE_MAX = 1.1;
export const WBTB_MIN_OFFSET = 270; // 4,5 h
export const WBTB_MAX_OFFSET = 360; // 6 h

export const defaultSettings: Settings = {
  onboardingDone: false,
  wakeMinutes: 7 * 60,
  bedMinutes: 23 * 60,
  realityChecksEnabled: true,
  realityChecksPerDay: 6,
  morningReminderEnabled: true,
  speechRate: 0.8,
  lockEnabled: false,
  themeMode: 'dark',
  wbtbOffsetMinutes: 300,
  programStartedOn: null,
};

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isMinuteOfDay(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < 24 * 60;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Übernimmt nur gültige Werte aus einem unbekannten Objekt (z. B. aus der
 * Datenbank oder einem Import) und füllt den Rest mit Standardwerten.
 */
export function sanitizeSettings(raw: unknown): Settings {
  const s: Settings = { ...defaultSettings };
  if (!raw || typeof raw !== 'object') return s;
  const r = raw as Record<string, unknown>;
  if (typeof r.onboardingDone === 'boolean') s.onboardingDone = r.onboardingDone;
  if (isMinuteOfDay(r.wakeMinutes)) s.wakeMinutes = r.wakeMinutes;
  if (isMinuteOfDay(r.bedMinutes)) s.bedMinutes = r.bedMinutes;
  if (typeof r.realityChecksEnabled === 'boolean') s.realityChecksEnabled = r.realityChecksEnabled;
  if (typeof r.realityChecksPerDay === 'number' && Number.isFinite(r.realityChecksPerDay)) {
    s.realityChecksPerDay = clamp(Math.round(r.realityChecksPerDay), RC_MIN, RC_MAX);
  }
  if (typeof r.morningReminderEnabled === 'boolean') s.morningReminderEnabled = r.morningReminderEnabled;
  if (typeof r.speechRate === 'number' && Number.isFinite(r.speechRate)) {
    s.speechRate = Math.round(clamp(r.speechRate, SPEECH_RATE_MIN, SPEECH_RATE_MAX) * 100) / 100;
  }
  if (typeof r.lockEnabled === 'boolean') s.lockEnabled = r.lockEnabled;
  if (r.themeMode === 'dark' || r.themeMode === 'light' || r.themeMode === 'system') s.themeMode = r.themeMode;
  if (typeof r.wbtbOffsetMinutes === 'number' && Number.isFinite(r.wbtbOffsetMinutes)) {
    s.wbtbOffsetMinutes = clamp(Math.round(r.wbtbOffsetMinutes / 15) * 15, WBTB_MIN_OFFSET, WBTB_MAX_OFFSET);
  }
  if (r.programStartedOn === null || (typeof r.programStartedOn === 'string' && DATE_RE.test(r.programStartedOn))) {
    s.programStartedOn = r.programStartedOn;
  }
  return s;
}

/** Formatiert Minuten seit Mitternacht als „HH:MM“. */
export function formatMinutes(minutes: number): string {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

/** Länge der Wachphase in Minuten (berücksichtigt Schlafenszeit nach Mitternacht). */
export function awakeWindowMinutes(wakeMinutes: number, bedMinutes: number): number {
  const diff = bedMinutes - wakeMinutes;
  return diff > 0 ? diff : diff + 1440;
}
