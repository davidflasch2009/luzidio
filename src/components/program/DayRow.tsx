import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Lesson } from '../../content/lessons';
import type { DayStatus } from '../../logic/program';
import { useTheme } from '../../theme/ThemeProvider';
import { minTouch, radius, spacing } from '../../theme/typography';
import { AppText } from '../ui/AppText';

const statusLabel: Record<DayStatus, string> = {
  completed: 'erledigt',
  available: 'verfügbar',
  locked: 'noch gesperrt',
};

export const DayRow = memo(function DayRow({ lesson, status }: { lesson: Lesson; status: DayStatus }) {
  const p = useTheme();
  const locked = status === 'locked';
  const icon = status === 'completed' ? 'checkmark-circle' : status === 'available' ? 'play-circle' : 'lock-closed';
  const iconColor = status === 'completed' ? p.success : status === 'available' ? p.primary : p.textMuted;
  return (
    <Pressable
      disabled={locked}
      onPress={() => router.push({ pathname: '/lesson/[day]', params: { day: String(lesson.day) } })}
      accessibilityRole="button"
      accessibilityLabel={`Tag ${lesson.day}: ${lesson.title}, ${statusLabel[status]}`}
      accessibilityState={{ disabled: locked }}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: status === 'available' ? p.surfaceRaised : p.surface,
          borderColor: status === 'available' ? p.primary : p.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={[styles.badge, { borderColor: iconColor }]}>
        <AppText variant="label" color={locked ? 'textMuted' : 'text'}>
          {lesson.day}
        </AppText>
      </View>
      <View style={styles.text}>
        <AppText variant="label" color={locked ? 'textMuted' : 'text'} numberOfLines={2}>
          {lesson.title}
        </AppText>
        {!locked ? (
          <AppText variant="caption" color="textMuted" numberOfLines={2}>
            {lesson.summary}
          </AppText>
        ) : null}
      </View>
      <Ionicons name={icon} size={26} color={iconColor} />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: minTouch + 16,
  },
  badge: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
});
