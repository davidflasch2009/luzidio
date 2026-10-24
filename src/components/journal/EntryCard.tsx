import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Entry } from '../../db/types';
import { formatRelativeDay } from '../../logic/dates';
import { moodOptions } from '../../logic/entryDraft';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/typography';
import { AppText } from '../ui/AppText';
import { Card } from '../ui/Card';

type Props = { entry: Entry; today: string };

export const EntryCard = memo(function EntryCard({ entry, today }: Props) {
  const p = useTheme();
  const mood = moodOptions.find((m) => m.value === entry.mood);
  const date = formatRelativeDay(entry.dreamDate, today);
  const a11y = [
    entry.title,
    date,
    entry.isLucid ? 'Klartraum' : null,
    entry.audioFile ? 'mit Sprachmemo' : null,
    entry.tags.length ? `Traumzeichen: ${entry.tags.join(', ')}` : null,
  ]
    .filter(Boolean)
    .join(', ');
  return (
    <Card
      onPress={() => router.push({ pathname: '/entry/[id]', params: { id: entry.id } })}
      accessibilityLabel={a11y}
      accessibilityHint="Öffnet den Eintrag"
    >
      <View style={styles.top}>
        <AppText variant="caption" color="textMuted">
          {date}
        </AppText>
        <View style={styles.icons}>
          {entry.audioFile ? <Ionicons name="mic" size={16} color={p.textMuted} /> : null}
          {mood ? <AppText variant="caption">{mood.short}</AppText> : null}
          {entry.isLucid ? (
            <AppText variant="caption" color="accent">
              ✦ Klartraum
            </AppText>
          ) : null}
        </View>
      </View>
      <AppText variant="heading" numberOfLines={2}>
        {entry.title}
      </AppText>
      {entry.body ? (
        <AppText variant="body" color="textMuted" numberOfLines={2}>
          {entry.body}
        </AppText>
      ) : null}
      {entry.tags.length > 0 ? (
        <AppText variant="caption" color="primary" numberOfLines={1}>
          {entry.tags.map((t) => `#${t}`).join('  ')}
        </AppText>
      ) : null}
    </Card>
  );
});

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  icons: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
