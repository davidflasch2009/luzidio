import { useState } from 'react';

import { AboutCard } from '../../components/settings/AboutCard';
import { DataSettings } from '../../components/settings/DataSettings';
import { PreferenceSettings } from '../../components/settings/PreferenceSettings';
import { ReminderSettings } from '../../components/settings/ReminderSettings';
import { SleepTimeSettings } from '../../components/settings/SleepTimeSettings';
import { AppText } from '../../components/ui/AppText';
import { Screen } from '../../components/ui/Screen';
import type { Settings } from '../../logic/settings';
import { useAppStore } from '../../store/appStore';

export default function SettingsScreen() {
  const settings = useAppStore((s) => s.settings);
  const [error, setError] = useState<string | null>(null);
  const change = (patch: Partial<Settings>) => {
    setError(null);
    useAppStore
      .getState()
      .updateSettings(patch)
      .catch(() => setError('Die Einstellung konnte nicht gespeichert werden.'));
  };
  return (
    <Screen>
      <AppText variant="display">Einstellungen</AppText>
      {error ? (
        <AppText variant="body" color="danger" accessibilityLiveRegion="assertive">
          {error}
        </AppText>
      ) : null}
      <SleepTimeSettings wakeMinutes={settings.wakeMinutes} bedMinutes={settings.bedMinutes} onChange={change} />
      <ReminderSettings settings={settings} onChange={change} />
      <PreferenceSettings settings={settings} onChange={change} />
      <DataSettings />
      <AboutCard />
    </Screen>
  );
}
