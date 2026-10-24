import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '../../components/ui/AppText';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Screen } from '../../components/ui/Screen';
import { getLesson, lessonText } from '../../content/lessons';
import { getDb } from '../../db/client';
import { completeDay } from '../../db/progress';
import { useProgram } from '../../hooks/useProgram';
import { canComplete, programStatusText, readingMinutes, weekTitles, weekOfDay } from '../../logic/program';
import { useAppStore } from '../../store/appStore';
import { spacing } from '../../theme/typography';

export default function LessonScreen() {
  const { day: dayParam } = useLocalSearchParams<{ day: string }>();
  const day = Number(dayParam);
  const lesson = Number.isInteger(day) ? getLesson(day) : undefined;
  const { state, today } = useProgram();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const status = state?.statuses[day - 1];

  if (!lesson || (state && status === 'locked')) {
    return (
      <Screen edges={['bottom']}>
        <Stack.Screen options={{ title: 'Lektion' }} />
        <EmptyState
          icon="lock-closed-outline"
          title={lesson ? 'Noch gesperrt' : 'Lektion nicht gefunden'}
          text={state && lesson ? programStatusText(state, today) || 'Schließe zuerst die vorherigen Tage ab.' : 'Diese Lektion gibt es nicht.'}
        />
      </Screen>
    );
  }

  const complete = async () => {
    if (!state || !canComplete(state, day)) return;
    setSaving(true);
    setError(null);
    try {
      await completeDay(await getDb(), day, today);
      const { settings, updateSettings, bumpRevision } = useAppStore.getState();
      if (!settings.programStartedOn) await updateSettings({ programStartedOn: today });
      bumpRevision();
    } catch {
      setError('Speichern fehlgeschlagen. Bitte versuch es noch einmal.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: `Tag ${lesson.day}` }} />
      <AppText variant="caption" color="textMuted">
        {weekTitles[weekOfDay(lesson.day)]} · ca. {readingMinutes(lessonText(lesson))} Min. Lesezeit
      </AppText>
      <AppText variant="title">{lesson.title}</AppText>
      {lesson.paragraphs.map((para, i) => (
        <AppText key={i} variant="bodyLarge">
          {para}
        </AppText>
      ))}
      <Card>
        <AppText variant="heading" color="accent">
          {lesson.task.title}
        </AppText>
        {lesson.task.steps.map((step, i) => (
          <View key={i} style={styles.step}>
            <AppText variant="body" color="accent" accessibilityElementsHidden>
              {i + 1}.
            </AppText>
            <AppText variant="body" style={styles.stepText}>
              {step}
            </AppText>
          </View>
        ))}
        {lesson.link ? (
          <Button label={lesson.link.label} variant="ghost" icon="arrow-forward" onPress={() => lesson.link && router.push(lesson.link.href)} />
        ) : null}
      </Card>
      {error ? (
        <AppText variant="body" color="danger">
          {error}
        </AppText>
      ) : null}
      {status === 'completed' ? (
        <AppText variant="label" color="success" center>
          ✓ Diesen Tag hast du abgeschlossen.
        </AppText>
      ) : (
        <Button
          label="Aufgabe erledigt"
          icon="checkmark-done"
          size="lg"
          onPress={complete}
          loading={saving}
          disabled={!state}
          accessibilityHint="Markiert den Tag als erledigt. Der nächste Tag wird morgen freigeschaltet."
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  step: { flexDirection: 'row', gap: spacing.sm },
  stepText: { flex: 1 },
});
