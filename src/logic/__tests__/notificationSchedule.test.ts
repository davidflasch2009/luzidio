import {
  buildDesiredNotifications,
  diffNotifications,
  isManagedId,
  whenKey,
  type ExistingNotification,
} from '../notificationSchedule';
import { defaultSettings } from '../settings';

const now = new Date(2026, 9, 24, 9, 0);

function asExisting(list: ReturnType<typeof buildDesiredNotifications>): ExistingNotification[] {
  return list.map((d) => ({ id: d.id, title: d.title, body: d.body, when: whenKey(d) }));
}

describe('buildDesiredNotifications', () => {
  it('plant Realitätschecks, Nachfüll-Hinweis und Morgen-Erinnerung', () => {
    const list = buildDesiredNotifications({ ...defaultSettings, realityChecksPerDay: 6 }, ['Fliegen'], now);
    const rc = list.filter((n) => n.kind === 'rc');
    expect(rc.length).toBeGreaterThan(30);
    expect(rc.length).toBeLessThanOrEqual(48);
    expect(list.filter((n) => n.kind === 'refill')).toHaveLength(1);
    const morning = list.find((n) => n.kind === 'morning');
    expect(morning && 'daily' in morning ? morning.daily : null).toEqual({ hour: 7, minute: 0 });
    expect(list.some((n) => n.body.includes('Fliegen'))).toBe(true);
    // iOS-Limit von 64 geplanten Benachrichtigungen nicht überschreiten (WBTB braucht noch Platz)
    expect(list.length).toBeLessThanOrEqual(60);
  });

  it('bleibt auch mit 15 Checks pro Tag unter dem Limit', () => {
    const list = buildDesiredNotifications({ ...defaultSettings, realityChecksPerDay: 15 }, [], now);
    expect(list.length).toBeLessThanOrEqual(60);
  });

  it('liefert nichts, wenn alles abgeschaltet ist', () => {
    expect(
      buildDesiredNotifications({ ...defaultSettings, realityChecksEnabled: false, morningReminderEnabled: false }, [], now),
    ).toEqual([]);
  });
});

describe('diffNotifications', () => {
  it('plant beim ersten Mal alles', () => {
    const desired = buildDesiredNotifications(defaultSettings, [], now);
    const { toCancel, toSchedule } = diffNotifications([], desired);
    expect(toCancel).toEqual([]);
    expect(toSchedule).toHaveLength(desired.length);
  });

  it('ändert nichts bei erneutem Öffnen am selben Tag', () => {
    const desired = buildDesiredNotifications(defaultSettings, [], now);
    const again = buildDesiredNotifications(defaultSettings, [], new Date(2026, 9, 24, 9, 0, 30));
    const { toCancel, toSchedule } = diffNotifications(asExisting(desired), again);
    expect(toCancel).toEqual([]);
    expect(toSchedule).toEqual([]);
  });

  it('ersetzt nur Geändertes und lässt fremde Benachrichtigungen in Ruhe', () => {
    const desired = buildDesiredNotifications(defaultSettings, [], now);
    const existing = [...asExisting(desired), { id: 'wbtb-2026-10-24', title: 'x', body: 'y', when: 't1' }];
    const changed = buildDesiredNotifications({ ...defaultSettings, wakeMinutes: 8 * 60 }, [], now);
    const { toCancel, toSchedule } = diffNotifications(existing, changed);
    expect(toCancel).not.toContain('wbtb-2026-10-24');
    expect(toCancel).toContain('morning');
    expect(toSchedule.some((n) => n.id === 'morning')).toBe(true);
  });

  it('räumt alles Verwaltete ab, wenn Erinnerungen deaktiviert werden', () => {
    const desired = buildDesiredNotifications(defaultSettings, [], now);
    const off = { ...defaultSettings, realityChecksEnabled: false, morningReminderEnabled: false };
    const { toCancel, toSchedule } = diffNotifications(asExisting(desired), buildDesiredNotifications(off, [], now));
    expect(toCancel).toHaveLength(desired.length);
    expect(toSchedule).toEqual([]);
  });

  it('erkennt verwaltete IDs', () => {
    expect(isManagedId('rc-2026-10-24-0')).toBe(true);
    expect(isManagedId('morning')).toBe(true);
    expect(isManagedId('refill')).toBe(true);
    expect(isManagedId('wbtb-1')).toBe(false);
  });
});
