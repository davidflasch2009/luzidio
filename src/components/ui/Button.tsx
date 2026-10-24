import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { minTouch, radius, spacing } from '../../theme/typography';
import { AppText } from './AppText';

export type IconName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'md' | 'lg' | 'xl';
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  accessibilityHint?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  disabled,
  loading,
  accessibilityHint,
  accessibilityLabel,
  style,
  testID,
}: Props) {
  const p = useTheme();
  const bg =
    variant === 'primary' ? p.primary : variant === 'secondary' ? p.surfaceRaised : variant === 'danger' ? p.surface : 'transparent';
  const fg = variant === 'primary' ? 'onPrimary' : variant === 'danger' ? 'danger' : variant === 'ghost' ? 'primary' : 'text';
  const fgColor = p[fg];
  const height = size === 'xl' ? 88 : size === 'lg' ? 64 : minTouch + 4;
  const inactive = disabled || loading;
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: height,
          backgroundColor: bg,
          borderColor: variant === 'danger' ? p.danger : variant === 'secondary' ? p.border : 'transparent',
          opacity: inactive ? 0.5 : pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator color={fgColor} />
        ) : icon ? (
          <Ionicons name={icon} size={size === 'xl' ? 30 : 22} color={fgColor} />
        ) : null}
        <AppText variant={size === 'xl' ? 'heading' : 'label'} color={fg} style={size === 'xl' ? styles.xlText : undefined}>
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  xlText: { fontSize: 22 },
});
