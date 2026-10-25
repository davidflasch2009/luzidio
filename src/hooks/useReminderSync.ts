import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { getDb } from '../db/client';
import { listWatchedSigns } from '../db/tags';
import { getPermission, syncReminders } from '../services/notifications';
import { isWeb } from '../services/platform';
import { useAppStore } from '../store/appStore';

/** Plant Erinnerungen neu und aktualisiert den Berechtigungsstatus. */
export async function resyncReminders(): Promise<void> {
  const { settings, setNotificationPermission } = useAppStore.getState();
  setNotificationPermission(await getPermission());
  let signs: string[] = [];
  try {
    signs = await listWatchedSigns(await getDb());
  } catch {
    // ohne Traumzeichen planen
  }
  await syncReminders(settings, signs);
}

function routeFor(kind: unknown): '/entry/new' | '/exercise/mild' | '/' | null {
  if (kind === 'morning') return '/entry/new';
  // Nach dem WBTB-Wecker direkt zur MILD-Übung.
  if (kind === 'wbtb') return '/exercise/mild';
  if (kind === 'rc' || kind === 'refill') return '/';
  return null;
}

/**
 * Hält die Erinnerungen aktuell: beim Start, bei jeder Rückkehr in die App
 * (nachplanen, Zeitzone/Sommerzeit) und wenn sich relevante Einstellungen ändern.
 */
export function useReminderSync(): void {
  const ready = useAppStore((s) => s.ready);
  const onboardingDone = useAppStore((s) => s.settings.onboardingDone);
  const key = useAppStore((s) =>
    [
      s.settings.wakeMinutes,
      s.settings.bedMinutes,
      s.settings.realityChecksEnabled,
      s.settings.realityChecksPerDay,
      s.settings.morningReminderEnabled,
      s.revision,
    ].join('|'),
  );

  // Kurz verzögert, damit schnelles Tippen (z. B. Uhrzeit-Stepper) nur einmal neu plant.
  useEffect(() => {
    if (isWeb || !ready || !onboardingDone) return;
    const timer = setTimeout(() => {
      resyncReminders().catch(() => undefined);
    }, 600);
    return () => clearTimeout(timer);
  }, [ready, onboardingDone, key]);

  useEffect(() => {
    if (isWeb || !ready || !onboardingDone) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') resyncReminders().catch(() => undefined);
    });
    return () => sub.remove();
  }, [ready, onboardingDone]);

  // Tippen auf eine Benachrichtigung öffnet den passenden Bildschirm.
  useEffect(() => {
    if (isWeb || !ready) return;
    const handle = (response: Notifications.NotificationResponse | null) => {
      const target = routeFor(response?.notification.request.content.data?.kind);
      if (!target) return;
      Notifications.clearLastNotificationResponse();
      // Erst nach dem aktuellen Render navigieren, damit der Navigator sicher bereit ist.
      setTimeout(() => {
        try {
          if (target === '/') router.navigate('/');
          else router.push(target);
        } catch {
          // Navigation nicht möglich (z. B. während des Onboardings) – ignorieren.
        }
      }, 0);
    };
    try {
      handle(Notifications.getLastNotificationResponse());
    } catch {
      // nicht unterstützt
    }
    const sub = Notifications.addNotificationResponseReceivedListener(handle);
    return () => sub.remove();
  }, [ready]);
}
