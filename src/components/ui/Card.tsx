import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing } from '../../theme/typography';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
};

export function Card({ children, style, onPress, accessibilityLabel, accessibilityHint, testID }: Props) {
  const p = useTheme();
  const base = [styles.card, { backgroundColor: p.surface, borderColor: p.border }, style];
  if (!onPress) {
    return (
      <View style={base} testID={testID}>
        {children}
      </View>
    );
  }
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [base, { opacity: pressed ? 0.85 : 1 }]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
});
