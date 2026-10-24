import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { minTouch, radius, spacing } from '../../theme/typography';
import { AppText } from './AppText';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  accessibilityHint?: string;
};

export function Chip({ label, selected = false, onPress, onRemove, accessibilityHint }: Props) {
  const p = useTheme();
  const handle = onPress ?? onRemove;
  return (
    <Pressable
      onPress={handle}
      disabled={!handle}
      accessibilityRole={onRemove ? 'button' : 'checkbox'}
      accessibilityLabel={onRemove ? `${label} entfernen` : label}
      accessibilityHint={accessibilityHint}
      accessibilityState={onRemove ? undefined : { checked: selected }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? p.primary : p.surfaceRaised,
          borderColor: selected ? p.primary : p.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <AppText variant="label" color={selected ? 'onPrimary' : 'text'}>
        {label}
      </AppText>
      {onRemove ? <Ionicons name="close" size={18} color={selected ? p.onPrimary : p.textMuted} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: minTouch,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
