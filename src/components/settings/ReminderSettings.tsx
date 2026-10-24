import { router } from 'expo-router';
import { Linking } from 'react-native';

import { resyncReminders } from '../../hooks/useReminderSync';
import { RC_MAX, RC_MIN, type Settings } from '../../logic/settings';
import { requestPermission } from '../../services/notifications';
import { useAppStore } from '../../store/appStore';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Stepper } from '../ui/Stepper';
import { ToggleRow } from '../ui/ToggleRow';

type Props = { settings: Settings; onChange: (patch: Partial<Settings>) => void };

export function ReminderSettings({ settings, onChange }: Props) {
  const permission = useAppStore((s) => s.notificationPermission);
  const ask = async () => {
    const result = await requestPermission();
    if (result === 'denied') Linking.openSettings().catch(() => undefined);
    await resyncReminders();
  };
  return (
    <Card>
      <AppText variant="heading">Erinnerungen</AppText>
      {permission !== 'granted' && permission !== null ? (
        <>
          <AppText variant="body" color="danger">
            {permission === 'denied'
              ? 'Benachrichtigungen sind blockiert. Erlaube sie in den Systemeinstellungen, damit Erinnerungen ankommen.'
              : 'Luzidio darf noch keine Benachrichtigungen senden.'}
          </AppText>
          <Button
            label={permission === 'denied' ? 'Systemeinstellungen öffnen' : 'Benachrichtigungen erlauben'}
            variant="secondary"
            onPress={ask}
          />
        </>
      ) : null}
      <ToggleRow
        label="Realitätschecks"
        description="Zufällig verteilte Erinnerungen zwischen Aufwachen und Schlafengehen"
        value={settings.realityChecksEnabled}
        onChange={(v) => onChange({ realityChecksEnabled: v })}
      />
      {settings.realityChecksEnabled ? (
        <Stepper
          testID="rc-count"
          label="Checks pro Tag"
          value={settings.realityChecksPerDay}
          min={RC_MIN}
          max={RC_MAX}
          onChange={(v) => onChange({ realityChecksPerDay: v })}
        />
      ) : null}
      <ToggleRow
        label="Traum-Erinnerung am Morgen"
        description="Zur Aufwachzeit: kurz liegen bleiben und den Traum notieren"
        value={settings.morningReminderEnabled}
        onChange={(v) => onChange({ morningReminderEnabled: v })}
      />
      <Button label="Traumzeichen verwalten" icon="pricetags-outline" variant="ghost" onPress={() => router.push('/dreamsigns')} />
    </Card>
  );
}
