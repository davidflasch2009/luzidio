import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { realityCheckTexts } from '../../content/realityChecks';
import { resyncReminders } from '../../hooks/useReminderSync';
import { formatTime } from '../../logic/dates';
import { buildDesiredNotifications } from '../../logic/notificationSchedule';
import { requestPermission } from '../../services/notifications';
import { isWeb } from '../../services/platform';
import { useAppStore } from '../../store/appStore';
import { spacing } from '../../theme/typography';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

/** Zeigt den nächsten Realitätscheck und erlaubt einen Check „jetzt sofort“. */
export function RealityCheckCard({ now }: { now: Date }) {
  const settings = useAppStore((s) => s.settings);
  const permission = useAppStore((s) => s.notificationPermission);
  const [practice, setPractice] = useState<number | null>(null);

  const next = useMemo(() => {
    if (!settings.realityChecksEnabled) return null;
    const rc = buildDesiredNotifications({ ...settings, morningReminderEnabled: false }, [], now).filter(
      (n) => n.kind === 'rc' && 'at' in n,
    );
    const times = rc.map((n) => ('at' in n ? n.at.getTime() : Infinity));
    const min = Math.min(...times);
    return Number.isFinite(min) ? new Date(min) : null;
  }, [settings, now]);

  const ask = async () => {
    await requestPermission();
    await resyncReminders();
  };
  const text = practice === null ? null : realityCheckTexts[practice % realityCheckTexts.length];

  return (
    <Card>
      <AppText variant="heading">Realitätschecks</AppText>
      {isWeb ? (
        <AppText variant="body" color="textMuted">
          Automatische Erinnerungen gibt es nur in der Handy-App. Einen Check kannst du jederzeit hier machen.
        </AppText>
      ) : !settings.realityChecksEnabled ? (
        <>
          <AppText variant="body" color="textMuted">
            Die Erinnerungen sind ausgeschaltet.
          </AppText>
          <Button label="In den Einstellungen aktivieren" variant="ghost" onPress={() => router.navigate('/settings')} />
        </>
      ) : permission === 'denied' ? (
        <>
          <AppText variant="body" color="danger">
            Benachrichtigungen sind für Luzidio blockiert. Ohne sie kommen keine Erinnerungen – du kannst trotzdem
            jederzeit selbst einen Check machen.
          </AppText>
          <Button label="Systemeinstellungen öffnen" variant="ghost" onPress={() => Linking.openSettings().catch(() => undefined)} />
        </>
      ) : permission === 'undetermined' ? (
        <>
          <AppText variant="body" color="textMuted">
            Erlaube Benachrichtigungen, damit Luzidio dich über den Tag verteilt erinnert.
          </AppText>
          <Button label="Benachrichtigungen erlauben" variant="secondary" onPress={ask} />
        </>
      ) : (
        <AppText variant="body" color="textMuted">
          {next
            ? `Nächste Erinnerung gegen ${formatTime(next)} Uhr · ${settings.realityChecksPerDay}× täglich`
            : 'Für heute sind keine Erinnerungen mehr geplant.'}
        </AppText>
      )}
      {text ? (
        <View style={styles.practice} accessibilityLiveRegion="polite">
          <AppText variant="label" color="accent">
            {text.title}
          </AppText>
          <AppText variant="body">{text.body}</AppText>
        </View>
      ) : null}
      <Button
        label={text ? 'Anderen Check zeigen' : 'Jetzt einen Check machen'}
        icon="hand-left-outline"
        variant="secondary"
        onPress={() => setPractice((v) => (v === null ? Math.floor(Math.random() * realityCheckTexts.length) : v + 1))}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  practice: { gap: spacing.xs, paddingVertical: spacing.sm },
});
