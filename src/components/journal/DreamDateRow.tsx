import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { addDays, diffDays, formatRelativeDay } from '../../logic/dates';
import { useTheme } from '../../theme/ThemeProvider';
import { minTouch, radius } from '../../theme/typography';
import { AppText } from '../ui/AppText';

type Props = { value: string; today: string; onChange: (value: string) => void; night?: boolean };

/** Datum der Traumnacht; Zukunft ist ausgeschlossen. */
export function DreamDateRow({ value, today, onChange, night }: Props) {
  const p = useTheme();
  const canForward = diffDays(value, today) > 0;
  const label = formatRelativeDay(value, today);
  const color = night ? p.textNight : p.text;
  return (
    <View
      style={[styles.row, { borderColor: p.border, backgroundColor: night ? p.surfaceNight : p.surfaceRaised }]}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel="Datum des Traums"
      accessibilityValue={{ text: label }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'decrement') onChange(addDays(value, -1));
        else if (canForward) onChange(addDays(value, 1));
      }}
    >
      <Pressable onPress={() => onChange(addDays(value, -1))} style={styles.btn} accessibilityLabel="Einen Tag früher">
        <Ionicons name="chevron-back" size={26} color={color} />
      </Pressable>
      <AppText variant="label" color={night ? 'textNight' : 'text'} style={styles.label}>
        Traum vom: {label}
      </AppText>
      <Pressable
        onPress={() => canForward && onChange(addDays(value, 1))}
        disabled={!canForward}
        style={[styles.btn, { opacity: canForward ? 1 : 0.3 }]}
        accessibilityLabel="Einen Tag später"
      >
        <Ionicons name="chevron-forward" size={26} color={color} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radius.md },
  btn: { width: minTouch + 4, height: minTouch + 4, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1, textAlign: 'center' },
});
