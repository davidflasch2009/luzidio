import { router } from 'expo-router';

import { getLesson, lessonText } from '../../content/lessons';
import { PROGRAM_DAYS, programStatusText, readingMinutes, type ProgramState } from '../../logic/program';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

export function LessonCard({ state, today }: { state: ProgramState; today: string }) {
  const lesson = state.currentDay ? getLesson(state.currentDay) : undefined;
  return (
    <Card>
      <AppText variant="caption" color="textMuted">
        Tageslektion · {state.completedCount}/{PROGRAM_DAYS}
      </AppText>
      <ProgressBar value={state.completedCount} max={PROGRAM_DAYS} label="Fortschritt im Programm" />
      {lesson ? (
        <>
          <AppText variant="heading">
            Tag {lesson.day}: {lesson.title}
          </AppText>
          <AppText variant="body" color="textMuted">
            {lesson.summary} · ca. {readingMinutes(lessonText(lesson))} Min.
          </AppText>
          <Button
            label="Lektion öffnen"
            icon="book-outline"
            onPress={() => router.push({ pathname: '/lesson/[day]', params: { day: String(lesson.day) } })}
          />
        </>
      ) : (
        <>
          <AppText variant="body">{programStatusText(state, today)}</AppText>
          {!state.finished ? (
            <AppText variant="caption" color="textMuted">
              Bis dahin: Tagebuch führen, Realitätschecks machen und abends MILD üben.
            </AppText>
          ) : null}
          <Button label="Zur Übersicht" variant="ghost" onPress={() => router.navigate('/program')} />
        </>
      )}
    </Card>
  );
}
