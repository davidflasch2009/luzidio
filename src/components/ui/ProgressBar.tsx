import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';

type Props = { value: number; max: number; label: string };

export function ProgressBar({ value, max, label }: Props) {
  const p = useTheme();
  const pct = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max, now: value }}
      style={[styles.track, { backgroundColor: p.surfaceRaised, borderColor: p.border }]}
    >
      <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: p.primary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 12, borderRadius: 6, overflow: 'hidden', borderWidth: 1 },
  fill: { height: '100%', borderRadius: 6 },
});
