import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';

import { LessonCard } from '../../components/today/LessonCard';
import { QuickActions } from '../../components/today/QuickActions';
import { RealityCheckCard } from '../../components/today/RealityCheckCard';
import { AppText } from '../../components/ui/AppText';
import { Button } from '../../components/ui/Button';
import { Screen } from '../../components/ui/Screen';
import { useNow } from '../../hooks/useNow';
import { useProgram } from '../../hooks/useProgram';
import { formatDateLong } from '../../logic/dates';
import { isWeb } from '../../services/platform';
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
  // Im Browser ohne Einblend-Animation, damit Inhalte in jedem Browser sofort sichtbar sind.
  const enter = (i: number) => (reduceMotion || isWeb ? undefined : FadeInDown.duration(500).delay(i * 80));
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
      <Animated.View entering={enter(1)}>
        <QuickActions />
      </Animated.View>
      {state ? (
        <Animated.View entering={enter(2)}>
          <LessonCard state={state} today={today} />
        </Animated.View>
      ) : null}
      <Animated.View entering={enter(3)}>
        <RealityCheckCard now={now} />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs, marginBottom: spacing.sm },
});
