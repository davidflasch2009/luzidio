import { StyleSheet, View } from 'react-native';

import type { TagStat } from '../../db/types';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/typography';
import { AppText } from '../ui/AppText';

/** Horizontale Balken für die häufigsten Traumzeichen; Zahl steht als Text daneben. */
export function TopSignsChart({ signs }: { signs: TagStat[] }) {
  const p = useTheme();
  const max = Math.max(1, ...signs.map((s) => s.count));
  return (
    <View style={styles.wrap}>
      {signs.map((s) => (
        <View key={s.name} style={styles.row} accessible accessibilityLabel={`${s.name}: ${s.count}-mal`}>
          <View style={styles.head}>
            <AppText variant="label" style={styles.name} numberOfLines={1}>
              {s.name}
              {s.watched ? ' ✦' : ''}
            </AppText>
            <AppText variant="label" color="textMuted">
              {s.count}
            </AppText>
          </View>
          <View style={[styles.track, { backgroundColor: p.surfaceRaised }]}>
            <View style={[styles.bar, { width: `${(s.count / max) * 100}%`, backgroundColor: p.primary }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  row: { gap: spacing.xs },
  head: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  name: { flex: 1 },
  track: { height: 10, borderRadius: 5, overflow: 'hidden' },
  bar: { height: 10, borderRadius: 5 },
});
