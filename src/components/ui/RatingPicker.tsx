import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { minTouch, radius, spacing } from '../../theme/typography';
import { AppText } from './AppText';

export type RatingOption = { value: number; label: string; short: string };

type Props = {
  label: string;
  options: RatingOption[];
  value: number | null;
  onChange: (value: number | null) => void;
  /** Erneutes Tippen auf die Auswahl hebt sie auf. */
  allowClear?: boolean;
  night?: boolean;
};

export function RatingPicker({ label, options, value, onChange, allowClear = false, night = false }: Props) {
  const p = useTheme();
  return (
    <View style={styles.wrap} accessibilityRole="radiogroup" accessibilityLabel={label}>
      <AppText variant="label" color={night ? 'textNight' : 'textMuted'}>
        {label}
      </AppText>
      <View style={styles.row}>
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <Pressable
              key={o.value}
              onPress={() => onChange(selected && allowClear ? null : o.value)}
              accessibilityRole="radio"
              accessibilityLabel={o.label}
              accessibilityState={{ selected, checked: selected }}
              style={({ pressed }) => [
                styles.item,
                {
                  backgroundColor: selected ? p.primary : night ? p.surfaceNight : p.surfaceRaised,
                  borderColor: selected ? p.primary : p.border,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <AppText variant="heading" color={selected ? 'onPrimary' : night ? 'textNight' : 'text'}>
                {o.short}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.xs },
  item: {
    flex: 1,
    minHeight: minTouch + 4,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
