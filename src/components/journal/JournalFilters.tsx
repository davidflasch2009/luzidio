import Ionicons from '@expo/vector-icons/Ionicons';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import type { EntryFilter } from '../../logic/entryFilter';
import { useTheme } from '../../theme/ThemeProvider';
import { minTouch, radius, spacing } from '../../theme/typography';
import { Chip } from '../ui/Chip';

type Props = { filter: EntryFilter; onChange: (f: EntryFilter) => void; tags: string[] };

export function JournalFilters({ filter, onChange, tags }: Props) {
  const p = useTheme();
  const toggleTag = (t: string) =>
    onChange({ ...filter, tags: filter.tags.includes(t) ? filter.tags.filter((x) => x !== t) : [...filter.tags, t] });
  return (
    <View style={styles.wrap}>
      <View style={[styles.search, { backgroundColor: p.surfaceRaised, borderColor: p.border }]}>
        <Ionicons name="search" size={20} color={p.textMuted} />
        <TextInput
          value={filter.query}
          onChangeText={(query) => onChange({ ...filter, query })}
          placeholder="Träume durchsuchen"
          placeholderTextColor={p.textMuted}
          accessibilityLabel="Träume durchsuchen"
          returnKeyType="search"
          clearButtonMode="while-editing"
          style={[styles.input, { color: p.text }]}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip
          label="✦ Nur Klarträume"
          selected={filter.lucidOnly}
          onPress={() => onChange({ ...filter, lucidOnly: !filter.lucidOnly })}
        />
        {tags.map((t) => (
          <Chip key={t} label={`#${t}`} selected={filter.tags.includes(t)} onPress={() => toggleTag(t)} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  input: { flex: 1, minHeight: minTouch + 4, fontSize: 17 },
  chips: { gap: spacing.sm, paddingRight: spacing.md },
});
