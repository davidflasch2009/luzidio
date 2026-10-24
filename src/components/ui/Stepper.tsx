import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { minTouch, radius, spacing } from '../../theme/typography';
import { AppText } from './AppText';

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
  /** Wenn true, springt der Wert am Ende zum Anfang (z. B. Uhrzeiten). */
  wrap?: boolean;
  testID?: string;
};

/** Zahlenauswahl mit großen +/–-Schaltflächen; zugänglich als „adjustable“. */
export function Stepper({ label, value, min, max, step = 1, onChange, format = String, wrap = false, testID }: Props) {
  const p = useTheme();
  const change = (dir: 1 | -1) => {
    let next = value + dir * step;
    if (wrap) {
      const span = max - min + step;
      next = ((((next - min) % span) + span) % span) + min;
    } else {
      next = Math.min(max, Math.max(min, next));
    }
    if (next !== value) onChange(next);
  };
  const atMin = !wrap && value <= min;
  const atMax = !wrap && value >= max;
  const text = format(value);
  return (
    <View
      style={styles.row}
      accessible
      testID={testID}
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ text }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => change(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
    >
      <AppText variant="body" style={styles.label}>
        {label}
      </AppText>
      <View style={[styles.control, { borderColor: p.border, backgroundColor: p.surfaceRaised }]}>
        <Pressable
          onPress={() => change(-1)}
          disabled={atMin}
          accessibilityRole="button"
          accessibilityLabel={`${label} verringern`}
          style={[styles.btn, { opacity: atMin ? 0.35 : 1 }]}
        >
          <Ionicons name="remove" size={24} color={p.text} />
        </Pressable>
        <AppText variant="heading" style={styles.value}>
          {text}
        </AppText>
        <Pressable
          onPress={() => change(1)}
          disabled={atMax}
          accessibilityRole="button"
          accessibilityLabel={`${label} erhöhen`}
          style={[styles.btn, { opacity: atMax ? 0.35 : 1 }]}
        >
          <Ionicons name="add" size={24} color={p.text} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' },
  label: { flexShrink: 1 },
  control: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radius.md },
  btn: { width: minTouch + 4, height: minTouch + 4, alignItems: 'center', justifyContent: 'center' },
  value: { minWidth: 72, textAlign: 'center' },
});
