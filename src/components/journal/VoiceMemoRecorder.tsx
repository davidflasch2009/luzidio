import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
  type RecordingOptions,
} from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking, StyleSheet, View } from 'react-native';

import { formatDuration } from '../../logic/dates';
import { spacing } from '../../theme/typography';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';

/** Sprachaufnahme: Mono, 64 kbit/s AAC – reicht für Sprache und spart Speicher. */
const VOICE_PRESET: RecordingOptions = { ...RecordingPresets.HIGH_QUALITY, numberOfChannels: 1, bitRate: 64000 };
export const MAX_RECORDING_SECONDS = 10 * 60;

type Props = {
  onRecorded: (uri: string) => void;
  night?: boolean;
  label?: string;
};

export function VoiceMemoRecorder({ onRecorded, night, label = 'Sprachmemo aufnehmen' }: Props) {
  const recorder = useAudioRecorder(VOICE_PRESET);
  const state = useAudioRecorderState(recorder, 500);
  const [denied, setDenied] = useState<'ask' | 'settings' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const recordingRef = useRef(false);
  const limitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(async () => {
    if (!recordingRef.current) return;
    recordingRef.current = false;
    if (limitTimer.current) clearTimeout(limitTimer.current);
    limitTimer.current = null;
    setRecording(false);
    setBusy(true);
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (uri) onRecorded(uri);
      else setError('Die Aufnahme konnte nicht gespeichert werden.');
    } catch {
      setError('Die Aufnahme konnte nicht beendet werden.');
    } finally {
      setBusy(false);
      setAudioModeAsync({ allowsRecording: false }).catch(() => undefined);
    }
  }, [onRecorded, recorder]);

  const stopRef = useRef(stop);
  useEffect(() => {
    stopRef.current = stop;
  }, [stop]);

  const start = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const perm = await requestRecordingPermissionsAsync();
      if (!perm.granted) {
        setDenied(perm.canAskAgain ? 'ask' : 'settings');
        return;
      }
      setDenied(null);
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      recordingRef.current = true;
      setRecording(true);
      // Höchstdauer: danach automatisch beenden und speichern.
      limitTimer.current = setTimeout(() => stopRef.current(), MAX_RECORDING_SECONDS * 1000);
    } catch {
      setError('Das Mikrofon konnte nicht gestartet werden. Ist es von einer anderen App belegt?');
    } finally {
      setBusy(false);
    }
  }, [recorder]);

  // Geht die App in den Hintergrund, wird die Aufnahme beendet und gespeichert.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'background') stop();
    });
    return () => sub.remove();
  }, [stop]);
  useEffect(
    () => () => {
      if (limitTimer.current) clearTimeout(limitTimer.current);
      if (recordingRef.current) {
        recordingRef.current = false;
        recorder.stop().catch(() => undefined);
      }
    },
    [recorder],
  );

  return (
    <View style={styles.wrap}>
      {recording ? (
        <>
          <AppText variant="heading" color={night ? 'textNight' : 'accent'} accessibilityLiveRegion="polite">
            ● Aufnahme {formatDuration(state.durationMillis / 1000)}
          </AppText>
          <Button label="Aufnahme beenden" icon="stop-circle" size="lg" onPress={stop} loading={busy} />
        </>
      ) : (
        <Button label={label} icon="mic" size="lg" variant="secondary" onPress={start} loading={busy} />
      )}
      {denied ? (
        <View style={styles.wrap}>
          <AppText variant="caption" color="danger">
            Ohne Mikrofon-Erlaubnis kann Luzidio keine Sprachmemos aufnehmen. Du kannst deinen Traum stattdessen als Text notieren.
          </AppText>
          {denied === 'settings' ? (
            <Button label="Einstellungen öffnen" variant="ghost" onPress={() => Linking.openSettings().catch(() => undefined)} />
          ) : null}
        </View>
      ) : null}
      {error ? (
        <AppText variant="caption" color="danger" accessibilityLiveRegion="assertive">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
});
