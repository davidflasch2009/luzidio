import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { parseDateKey } from '../../logic/dates';
import type { WeekBucket } from '../../logic/stats';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing } from '../../theme/typography';
import { AppText } from '../ui/AppText';

const CHART_HEIGHT = 140;

function shortDate(key: string): string {
  const d = parseDateKey(key);
  return `${d.getDate()}.${d.getMonth() + 1}.`;
}

/** Einträge pro Woche als Säulen. Antippen zeigt die Werte der Woche. */
export function WeeklyBarChart({ weeks }: { weeks: WeekBucket[] }) {
  const p = useTheme();
  const [selected, setSelected] = useState<number>(weeks.length - 1);
  const max = Math.max(1, ...weeks.map((w) => w.count));
  const sel = weeks[selected];
  return (
    <View style={styles.wrap}>
      <AppText variant="body" accessibilityLiveRegion="polite">
        {sel
          ? `Woche ab ${shortDate(sel.weekStart)}: ${sel.count} ${sel.count === 1 ? 'Eintrag' : 'Einträge'}, davon ${sel.lucid} ${sel.lucid === 1 ? 'Klartraum' : 'Klarträume'}`
          : ''}
      </AppText>
      <View style={[styles.chart, { borderBottomColor: p.border }]}>
        {weeks.map((w, i) => {
          const h = (w.count / max) * CHART_HEIGHT;
          const active = i === selected;
          return (
            <Pressable
              key={w.weekStart}
              onPress={() => setSelected(i)}
              style={styles.col}
              accessibilityRole="button"
              accessibilityLabel={`Woche ab ${shortDate(w.weekStart)}: ${w.count} Einträge, ${w.lucid} Klarträume`}
              accessibilityState={{ selected: active }}
            >
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max(w.count > 0 ? 4 : 0, h),
                    backgroundColor: p.primary,
                    opacity: active ? 1 : 0.55,
                  },
                ]}
              />
            </Pressable>
          );
        })}
      </View>
      <View style={styles.labels} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {weeks.map((w, i) => (
          <AppText key={w.weekStart} variant="caption" color="textMuted" style={styles.label}>
            {i % 2 === weeks.length % 2 ? '' : shortDate(w.weekStart)}
          </AppText>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  chart: {
    height: CHART_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    gap: 2,
  },
  col: { flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center' },
  bar: { width: '70%', borderTopLeftRadius: radius.sm / 2, borderTopRightRadius: radius.sm / 2 },
  labels: { flexDirection: 'row' },
  label: { flex: 1, textAlign: 'center', fontSize: 12 },
});
