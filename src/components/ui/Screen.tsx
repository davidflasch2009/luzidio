import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/typography';
import { ScreenStarfield } from './Starfield';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  stars?: boolean;
  night?: boolean;
  edges?: Edge[];
  contentStyle?: StyleProp<ViewStyle>;
  keyboard?: boolean;
};

export function Screen({ children, scroll = true, stars = false, night = false, edges = ['top'], contentStyle, keyboard }: Props) {
  const p = useTheme();
  const bg = night ? p.backgroundNight : p.background;
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, contentStyle]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, styles.fill, contentStyle]}>{children}</View>
  );
  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: bg }]} edges={edges}>
      {stars && p.isDark ? <ScreenStarfield /> : null}
      {keyboard ? (
        <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
});
