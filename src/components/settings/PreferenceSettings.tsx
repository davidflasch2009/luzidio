import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SPEECH_RATE_MAX, SPEECH_RATE_MIN, type Settings } from '../../logic/settings';
import { authenticate, getBiometricStatus, type BiometricStatus } from '../../services/auth';
import { isWeb } from '../../services/platform';
import { previewVoice, stopSpeaking } from '../../services/speech';
import { useAppStore } from '../../store/appStore';
import type { ThemeMode } from '../../theme/colors';
import { spacing } from '../../theme/typography';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
import { Stepper } from '../ui/Stepper';
import { ToggleRow } from '../ui/ToggleRow';

type Props = { settings: Settings; onChange: (patch: Partial<Settings>) => void };

const themes: { mode: ThemeMode; label: string }[] = [
  { mode: 'dark', label: 'Dunkel' },
  { mode: 'light', label: 'Hell' },
  { mode: 'system', label: 'System' },
];

export function PreferenceSettings({ settings, onChange }: Props) {
  const [bio, setBio] = useState<BiometricStatus | null>(null);
  const [lockError, setLockError] = useState<string | null>(null);

  useEffect(() => {
    if (!isWeb) getBiometricStatus().then(setBio);
    return () => stopSpeaking();
  }, []);

  const toggleLock = async (value: boolean) => {
    setLockError(null);
    // Ein- und Ausschalten nur nach erfolgreicher Bestätigung.
    const ok = await authenticate(value ? 'App-Sperre aktivieren' : 'App-Sperre deaktivieren');
    if (!ok) {
      setLockError('Bestätigung fehlgeschlagen – die Einstellung wurde nicht geändert.');
      return;
    }
    if (value) useAppStore.getState().setUnlocked(true);
    onChange({ lockEnabled: value });
  };

  return (
    <>
      <Card>
        <AppText variant="heading">Vorlesen</AppText>
        <Stepper
          label="Sprechtempo"
          value={settings.speechRate}
          min={SPEECH_RATE_MIN}
          max={SPEECH_RATE_MAX}
          step={0.05}
          format={(v) => `${v.toFixed(2).replace('.', ',')}×`}
          onChange={(v) => onChange({ speechRate: Math.round(v * 100) / 100 })}
        />
        <Button label="Probe hören" icon="volume-medium-outline" variant="ghost" onPress={() => previewVoice(settings.speechRate)} />
      </Card>

      <Card>
        <AppText variant="heading">Darstellung</AppText>
        <View style={styles.chips}>
          {themes.map((t) => (
            <Chip key={t.mode} label={t.label} selected={settings.themeMode === t.mode} onPress={() => onChange({ themeMode: t.mode })} />
          ))}
        </View>
      </Card>

      {isWeb ? null : (
        <Card>
          <AppText variant="heading">Privatsphäre</AppText>
          <ToggleRow
            label="App-Sperre"
            description="Face ID, Fingerabdruck oder Gerätecode beim Öffnen"
            value={settings.lockEnabled}
            onChange={toggleLock}
            disabled={!bio?.available && !settings.lockEnabled}
          />
          {bio && !bio.available ? (
            <AppText variant="caption" color="textMuted">
              {bio.reason}
            </AppText>
          ) : null}
          {lockError ? (
            <AppText variant="caption" color="danger">
              {lockError}
            </AppText>
          ) : null}
        </Card>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
