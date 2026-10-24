import * as Notifications from 'expo-notifications';
import { AndroidImportance, IosAuthorizationStatus } from 'expo-notifications';
import { Platform } from 'react-native';

import {
  buildDesiredNotifications,
  diffNotifications,
  whenKey,
  type DesiredNotification,
  type ExistingNotification,
  type NotificationKind,
} from '../logic/notificationSchedule';
import type { Settings } from '../logic/settings';

export type PermissionState = 'granted' | 'denied' | 'undetermined';

const CHANNELS: Record<NotificationKind, string> = {
  rc: 'reality-checks',
  refill: 'reality-checks',
  morning: 'morning',
  wbtb: 'wbtb',
};

let configured = false;

/** Einmalig: Anzeige im Vordergrund und Android-Kanäle einrichten. */
export async function configureNotifications(): Promise<void> {
  if (configured) return;
  configured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS !== 'android') return;
  try {
    await Notifications.setNotificationChannelAsync('reality-checks', {
      name: 'Realitätschecks',
      description: 'Zufällige Erinnerungen über den Tag',
      importance: AndroidImportance.DEFAULT,
    });
    await Notifications.setNotificationChannelAsync('morning', {
      name: 'Traum-Erinnerung am Morgen',
      importance: AndroidImportance.DEFAULT,
    });
    await Notifications.setNotificationChannelAsync('wbtb', {
      name: 'WBTB-Wecker',
      description: 'Sanfter Wecker für „Wake Back To Bed“',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 400, 250],
    });
  } catch {
    // Kanäle sind optional – ohne sie nutzt Android den Standardkanal.
  }
}

function toState(p: Notifications.NotificationPermissionsStatus): PermissionState {
  const provisional = p.ios?.status === IosAuthorizationStatus.PROVISIONAL;
  if (p.granted || provisional) return 'granted';
  return p.canAskAgain ? 'undetermined' : 'denied';
}

export async function getPermission(): Promise<PermissionState> {
  try {
    return toState(await Notifications.getPermissionsAsync());
  } catch {
    return 'denied';
  }
}

export async function requestPermission(): Promise<PermissionState> {
  try {
    // Android 13+: Ohne vorhandenen Kanal erscheint der Berechtigungsdialog nicht.
    await configureNotifications();
    return toState(await Notifications.requestPermissionsAsync());
  } catch {
    return 'denied';
  }
}

async function listExisting(): Promise<ExistingNotification[]> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  return all.map((r) => ({
    id: r.identifier,
    title: r.content.title ?? '',
    body: r.content.body ?? '',
    when: typeof r.content.data?.when === 'string' ? r.content.data.when : '',
  }));
}

export async function scheduleOne(n: DesiredNotification): Promise<void> {
  const channelId = CHANNELS[n.kind];
  const trigger: Notifications.NotificationTriggerInput =
    'daily' in n
      ? { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: n.daily.hour, minute: n.daily.minute, channelId }
      : { type: Notifications.SchedulableTriggerInputTypes.DATE, date: n.at, channelId };
  await Notifications.scheduleNotificationAsync({
    identifier: n.id,
    content: {
      title: n.title,
      body: n.body,
      // Systemton; Lautstärke und Stil bestimmen die Mitteilungseinstellungen des Geräts.
      sound: n.kind === 'refill' ? undefined : 'default',
      data: { kind: n.kind, when: whenKey(n) },
    },
    trigger,
  });
}

export type SyncResult = { status: 'ok' | 'no-permission' | 'error'; scheduled: number };

let queue: Promise<unknown> = Promise.resolve();

/**
 * Gleicht geplante Erinnerungen mit den Einstellungen ab. Läuft beim Start,
 * bei jeder Rückkehr in die App und nach Änderungen – so werden Tage nachgeplant
 * und Zeitzonen- oder Sommerzeitwechsel korrigiert. Aufrufe laufen nacheinander.
 */
export function syncReminders(settings: Settings, signs: readonly string[], now: Date = new Date()): Promise<SyncResult> {
  const job = queue.then(() => doSync(settings, signs, now));
  queue = job;
  return job;
}

async function doSync(settings: Settings, signs: readonly string[], now: Date): Promise<SyncResult> {
  try {
    await configureNotifications();
    const permission = await getPermission();
    const desired = permission === 'granted' ? buildDesiredNotifications(settings, signs, now) : [];
    const { toCancel, toSchedule } = diffNotifications(await listExisting(), desired);
    for (const id of toCancel) await cancelById(id);
    let failed = 0;
    for (const n of toSchedule) {
      // Inzwischen vergangene Zeitpunkte überspringen; ein Fehler stoppt nicht die übrigen.
      if ('at' in n && n.at.getTime() <= Date.now() + 5000) continue;
      try {
        await scheduleOne(n);
      } catch {
        failed++;
      }
    }
    if (failed > 0) return { status: 'error', scheduled: desired.length - failed };
    return { status: permission === 'granted' ? 'ok' : 'no-permission', scheduled: desired.length };
  } catch {
    return { status: 'error', scheduled: 0 };
  }
}

export async function cancelById(id: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // existiert nicht mehr
  }
}

export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // ignorieren
  }
}

/** Liste der geplanten IDs mit Zeitschlüssel (z. B. für den WBTB-Status). */
export async function listScheduled(): Promise<ExistingNotification[]> {
  try {
    return await listExisting();
  } catch {
    return [];
  }
}
