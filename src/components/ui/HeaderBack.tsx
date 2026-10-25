import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, type ColorValue } from 'react-native';

import { isWeb } from '../../services/platform';
import { minTouch, spacing } from '../../theme/typography';
import { AppText } from './AppText';

type Props = { canGoBack?: boolean; tintColor?: ColorValue };

/**
 * Zurück-Knopf für alle Unterseiten. Gibt es keinen Verlauf (Seite direkt geöffnet,
 * neu geladen oder als Web-App vom Home-Bildschirm gestartet), führt er zu „Heute“ –
 * so kommt man nie auf einer Seite fest.
 */
export function HeaderBack({ canGoBack, tintColor }: Props) {
  const color = typeof tintColor === 'string' ? tintColor : undefined;
  const hasHistory = canGoBack ?? router.canGoBack();
  return (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      accessibilityRole="button"
      accessibilityLabel={hasHistory ? 'Zurück' : 'Zur Startseite'}
      hitSlop={8}
      style={styles.btn}
    >
      <Ionicons name={hasHistory ? 'chevron-back' : 'home-outline'} size={24} color={color} />
      <AppText variant="label" style={color ? { color } : undefined}>
        {hasHistory ? 'Zurück' : 'Heute'}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: minTouch,
    paddingRight: spacing.md,
    paddingLeft: isWeb ? spacing.md : 0,
  },
});
