import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';

import { DayRow } from '../../components/program/DayRow';
import { AppText } from '../../components/ui/AppText';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Screen } from '../../components/ui/Screen';
import { lessons } from '../../content/lessons';
import { useProgram } from '../../hooks/useProgram';
import { PROGRAM_DAYS, programStatusText, weekOfDay, weekTitles } from '../../logic/program';
import { spacing } from '../../theme/typography';

export default function ProgramScreen() {
  const { state, today, error } = useProgram();
  return (
    <Screen stars>
      <AppText variant="display">Programm</AppText>
      {error ? <EmptyState icon="warning-outline" title="Fehler" text={error} /> : null}
      {state ? (
        <>
          <Card>
            <AppText variant="heading">
              {state.completedCount} von {PROGRAM_DAYS} Tagen
            </AppText>
            <ProgressBar value={state.completedCount} max={PROGRAM_DAYS} label="Fortschritt im 30-Tage-Programm" />
            <AppText variant="caption" color="textMuted">
              {programStatusText(state, today)}
            </AppText>
          </Card>
          {lessons.map((l) => {
            const showWeek = l.day === 1 || weekOfDay(l.day) !== weekOfDay(l.day - 1);
            return (
              <Fragment key={l.day}>
                {showWeek ? (
                  <View style={styles.week}>
                    <AppText variant="heading">{weekTitles[weekOfDay(l.day)]}</AppText>
                  </View>
                ) : null}
                <DayRow lesson={l} status={state.statuses[l.day - 1] ?? 'locked'} />
              </Fragment>
            );
          })}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  week: { marginTop: spacing.md },
});
