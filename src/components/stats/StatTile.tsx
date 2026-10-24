import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing } from '../../theme/typography';
import { AppText } from '../ui/AppText';

type Props = { label: string; value: string; hint?: string };

export function StatTile({ label, value, hint }: Props) {
  const p = useTheme();
  return (
    <View
      style={[styles.tile, { backgroundColor: p.surface, borderColor: p.border }]}
      accessible
      accessibilityLabel={`${label}: ${value}${hint ? `, ${hint}` : ''}`}
    >
      <AppText variant="caption" color="textMuted">
        {label}
      </AppText>
      <AppText variant="title">{value}</AppText>
      {hint ? (
        <AppText variant="caption" color="textMuted">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { flexGrow: 1, flexBasis: '45%', borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, gap: 2 },
});
