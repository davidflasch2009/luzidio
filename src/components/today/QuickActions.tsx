import { router, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../theme/typography';
import { Button, type IconName } from '../ui/Button';

const actions: { label: string; icon: IconName; href: Href; hint: string }[] = [
  { label: 'MILD', icon: 'sparkles-outline', href: '/exercise/mild', hint: 'Geführte Übung, um im Traum klar zu werden' },
  { label: 'Einschlafen', icon: 'bed-outline', href: '/exercise/sleep', hint: 'Ruhige Einschlaf-Anleitung' },
  { label: 'WBTB', icon: 'alarm-outline', href: '/wbtb', hint: 'Wecker für Wake Back To Bed' },
  { label: 'Traumzeichen', icon: 'pricetags-outline', href: '/dreamsigns', hint: 'Deine häufigsten Traumzeichen' },
];

/** Schnellzugriffe direkt unter „Traum notieren“, damit nichts erst durch Scrollen sichtbar wird. */
export function QuickActions() {
  return (
    <View style={styles.grid}>
      {actions.map((a) => (
        <Button
          key={a.label}
          label={a.label}
          icon={a.icon}
          variant="secondary"
          style={styles.item}
          accessibilityHint={a.hint}
          onPress={() => router.push(a.href)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  item: { flexGrow: 1, flexBasis: '45%', paddingHorizontal: spacing.sm },
});
