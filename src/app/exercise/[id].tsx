import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useGuidedSession } from '../../components/exercise/useGuidedSession';
import { AppText } from '../../components/ui/AppText';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { EmptyState } from '../../components/ui/EmptyState';
import { Screen } from '../../components/ui/Screen';
import { ToggleRow } from '../../components/ui/ToggleRow';
import { exercises, isExerciseId, timerOptions, type Exercise } from '../../content/exercises';
import { useNow } from '../../hooks/useNow';
import { formatDuration } from '../../logic/dates';
import type { FinishReason } from '../../logic/guidedSession';
import { hasGermanVoice } from '../../services/speech';
import { useAppStore } from '../../store/appStore';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing } from '../../theme/typography';

const finishText: Record<FinishReason, string> = {
  timer: 'Der Timer ist abgelaufen – die Anleitung wurde beendet. Schlaf gut.',
  user: 'Übung beendet.',
  completed: 'Die Anleitung ist zu Ende. Mach im eigenen Tempo weiter.',
  error: 'Die Sprachausgabe ist nicht verfügbar. Du kannst die Übung ohne Vorlesen nutzen.',
};

function ExerciseView({ exercise }: { exercise: Exercise }) {
  const p = useTheme();
  const rate = useAppStore((s) => s.settings.speechRate);
  const { state, start, stop } = useGuidedSession(exercise, rate);
  const [minutes, setMinutes] = useState<number>(15);
  const [voice, setVoice] = useState(true);
  const [german, setGerman] = useState<boolean | null>(true);
  const running = state.phase === 'guide' || state.phase === 'repeat';
  const now = useNow(1000);

  useEffect(() => {
    hasGermanVoice().then(setGerman);
  }, []);

  return (
    <Screen night edges={['bottom']}>
      <Stack.Screen options={{ title: exercise.title }} />
      <AppText variant="body" color="textNight">
        {exercise.intro}
      </AppText>
      {!running ? (
        <Card style={{ backgroundColor: p.surfaceNight }}>
          <ToggleRow label="Vorlesen" description="Anleitung mit ruhiger Stimme" value={voice} onChange={setVoice} night />
          {voice && german === false ? (
            <AppText variant="caption" color="danger">
              Auf deinem Gerät ist keine deutsche Stimme installiert. Du kannst sie in den Systemeinstellungen unter
              Bedienungshilfen bzw. Sprachausgabe hinzufügen.
            </AppText>
          ) : null}
          <AppText variant="caption" color="textNight">
            Während der Übung bleibt der Bildschirm an, damit die Anleitung nicht abbricht. Leg das Handy mit dem Display
            nach unten neben dich.
          </AppText>
          <AppText variant="label" color="textNight">
            Timer mit Auto-Stopp
          </AppText>
          <View style={styles.chips}>
            {timerOptions.map((m) => (
              <Chip key={m} label={m === 0 ? 'Aus' : `${m} Min.`} selected={minutes === m} onPress={() => setMinutes(m)} />
            ))}
          </View>
        </Card>
      ) : null}
      {state.endsAt && running ? (
        <AppText variant="heading" color="accent" center accessibilityLiveRegion="polite">
          Endet in {formatDuration((state.endsAt - now.getTime()) / 1000)}
        </AppText>
      ) : null}
      {state.phase === 'finished' && state.finishReason ? (
        <AppText variant="body" color={state.finishReason === 'error' ? 'danger' : 'textNight'} center>
          {finishText[state.finishReason]}
        </AppText>
      ) : null}
      <Button
        label={running ? 'Beenden' : 'Starten'}
        icon={running ? 'stop' : 'play'}
        size="xl"
        onPress={running ? stop : () => start(minutes, voice)}
      />
      {state.phase === 'repeat' && state.currentText ? (
        <AppText variant="bodyLarge" color="accent" center>
          {state.currentText}
        </AppText>
      ) : null}
      <View style={styles.list}>
        {exercise.segments.map((seg, i) => {
          const active = running && state.segment === i;
          return (
            <View
              key={i}
              style={[styles.segment, { borderColor: active ? p.primary : 'transparent', backgroundColor: active ? p.surfaceNight : 'transparent' }]}
            >
              <AppText variant="bodyLarge" color="textNight">
                {seg.text}
              </AppText>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

export default function ExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!isExerciseId(id)) {
    return (
      <Screen>
        <EmptyState icon="help-circle-outline" title="Übung nicht gefunden" text="Diese Übung gibt es nicht." />
      </Screen>
    );
  }
  return <ExerciseView exercise={exercises[id]} />;
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  list: { gap: spacing.xs },
  segment: { borderWidth: 1, borderRadius: radius.md, padding: spacing.sm },
});
