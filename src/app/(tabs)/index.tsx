import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';

import { LessonCard } from '../../components/today/LessonCard';
import { RealityCheckCard } from '../../components/today/RealityCheckCard';
import { AppText } from '../../components/ui/AppText';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Screen } from '../../components/ui/Screen';
import { useNow } from '../../hooks/useNow';
import { useProgram } from '../../hooks/useProgram';
import { formatDateLong } from '../../logic/dates';
import { spacing } from '../../theme/typography';

function greeting(hour: number): string {
  if (hour < 5) return 'Gute Nacht';
  if (hour < 11) return 'Guten Morgen';
  if (hour < 18) return 'Hallo';
  return 'Guten Abend';
}

export default function TodayScreen() {
  const now = useNow();
  const { state, today } = useProgram();
  const reduceMotion = useReducedMotion();
  const enter = (i: number) => (reduceMotion ? undefined : FadeInDown.duration(500).delay(i * 80));
  return (
    <Screen stars>
      <View style={styles.header}>
        <AppText variant="caption" color="textMuted">
          {formatDateLong(today)}
        </AppText>
        <AppText variant="display">{greeting(now.getHours())}</AppText>
      </View>
      <Animated.View entering={enter(0)}>
        <Button
          label="Traum notieren"
          icon="moon"
          size="xl"
          onPress={() => router.push('/entry/new')}
          accessibilityHint="Öffnet die schnelle Erfassung im Nachtmodus"
        />
      </Animated.View>
      {state ? (
        <Animated.View entering={enter(1)}>
          <LessonCard state={state} today={today} />
        </Animated.View>
      ) : null}
      <Animated.View entering={enter(2)}>
        <RealityCheckCard now={now} />
      </Animated.View>
      <Animated.View entering={enter(3)}>
        <Card>
          <AppText variant="heading">Für heute Nacht</AppText>
          <AppText variant="body" color="textMuted">
            Geführte Übungen zum Einschlafen und für MILD – auf Wunsch vorgelesen.
          </AppText>
          <View style={styles.row}>
            <Button label="MILD" icon="sparkles-outline" variant="secondary" style={styles.flex} onPress={() => router.push('/exercise/mild')} />
            <Button label="Einschlafen" icon="bed-outline" variant="secondary" style={styles.flex} onPress={() => router.push('/exercise/sleep')} />
          </View>
          <Button label="WBTB-Wecker" icon="alarm-outline" variant="ghost" onPress={() => router.push('/wbtb')} />
        </Card>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs, marginBottom: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  flex: { flexGrow: 1 },
});
