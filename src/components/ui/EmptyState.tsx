import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/typography';
import { AppText } from './AppText';
import type { IconName } from './Button';

type Props = { icon: IconName; title: string; text: string; children?: ReactNode };

export function EmptyState({ icon, title, text, children }: Props) {
  const p = useTheme();
  return (
    <View style={styles.wrap} accessible accessibilityLabel={`${title}. ${text}`}>
      <Ionicons name={icon} size={44} color={p.accent} />
      <AppText variant="heading" center>
        {title}
      </AppText>
      <AppText variant="body" color="textMuted" center>
        {text}
      </AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl, paddingHorizontal: spacing.md },
});
