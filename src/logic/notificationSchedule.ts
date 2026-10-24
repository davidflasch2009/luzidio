import { morningReminder, realityCheckTexts, refillReminder, signTemplates } from '../content/realityChecks';
import { addDays, atMinutes, toDateKey } from './dates';
import { daysAhead, planningStartDay, planRealityChecks } from './realityCheckPlanner';
import type { Settings } from './settings';

export type NotificationKind = 'rc' | 'refill' | 'morning' | 'wbtb';

export type DesiredNotification =
  | { id: string; kind: NotificationKind; title: string; body: string; at: Date }
  | { id: string; kind: NotificationKind; title: string; body: string; daily: { hour: number; minute: number } };

/** Präfixe der Benachrichtigungen, die von der automatischen Planung verwaltet werden. */
export const MANAGED_PREFIXES = ['rc-', 'refill', 'morning'] as const;
export const MORNING_ID = 'morning';
export const REFILL_ID = 'refill';

export function isManagedId(id: string): boolean {
  return MANAGED_PREFIXES.some((p) => id.startsWith(p));
}

/** Alle gewünschten Erinnerungen (Realitätschecks, Morgen-Erinnerung) für den aktuellen Zeitpunkt. */
export function buildDesiredNotifications(settings: Settings, signs: readonly string[], now: Date): DesiredNotification[] {
  const out: DesiredNotification[] = [];
  if (settings.realityChecksEnabled) {
    const today = toDateKey(now);
    const startDay = planningStartDay(now, settings.wakeMinutes, settings.bedMinutes, today);
    const days = daysAhead(settings.realityChecksPerDay);
    const plan = planRealityChecks({
      startDay,
      days,
      wakeMinutes: settings.wakeMinutes,
      bedMinutes: settings.bedMinutes,
      perDay: settings.realityChecksPerDay,
      now,
      texts: realityCheckTexts,
      signTemplates,
      signs,
    });
    for (const r of plan) out.push({ id: r.id, kind: 'rc', title: r.title, body: r.body, at: r.date });
    // Nach dem letzten geplanten Tag daran erinnern, die App zu öffnen (plant dann neu).
    const refillAt = atMinutes(addDays(startDay, days), settings.wakeMinutes + 60);
    out.push({ id: REFILL_ID, kind: 'refill', title: refillReminder.title, body: refillReminder.body, at: refillAt });
  }
  if (settings.morningReminderEnabled) {
    out.push({
      id: MORNING_ID,
      kind: 'morning',
      title: morningReminder.title,
      body: morningReminder.body,
      daily: { hour: Math.floor(settings.wakeMinutes / 60), minute: settings.wakeMinutes % 60 },
    });
  }
  return out;
}

/** Bereits geplante Benachrichtigung; `when` wie von `whenKey` erzeugt. */
export type ExistingNotification = { id: string; title: string; body: string; when: string };

/** Zeitschlüssel: „d7:30“ für tägliche, „t<Minute seit Epoch>“ für einmalige Benachrichtigungen. */
export function whenKey(trigger: { at: Date } | { daily: { hour: number; minute: number } }): string {
  if ('daily' in trigger) return `d${trigger.daily.hour}:${trigger.daily.minute}`;
  return `t${Math.floor(trigger.at.getTime() / 60000)}`;
}

function signature(id: string, when: string, title: string, body: string): string {
  return `${id}|${when}|${title}|${body}`;
}

/**
 * Vergleicht vorhandene und gewünschte Benachrichtigungen. Nur verwaltete IDs
 * werden angefasst, andere (z. B. WBTB-Wecker) bleiben unberührt.
 */
export function diffNotifications(existing: readonly ExistingNotification[], desired: readonly DesiredNotification[]) {
  const managed = existing.filter((e) => isManagedId(e.id));
  const desiredSig = (d: DesiredNotification) => signature(d.id, whenKey(d), d.title, d.body);
  const existingSig = (e: ExistingNotification) => signature(e.id, e.when, e.title, e.body);
  const desiredSigs = new Set(desired.map(desiredSig));
  const existingSigs = new Set(managed.map(existingSig));
  const toCancel = managed.filter((e) => !desiredSigs.has(existingSig(e))).map((e) => e.id);
  const toSchedule = desired.filter((d) => !existingSigs.has(desiredSig(d)));
  return { toCancel, toSchedule };
}
