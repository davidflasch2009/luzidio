import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { EntryCard } from '../../components/journal/EntryCard';
import { JournalFilters } from '../../components/journal/JournalFilters';
import { AppText } from '../../components/ui/AppText';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Screen } from '../../components/ui/Screen';
import { listEntries } from '../../db/entries';
import { listTagStats } from '../../db/tags';
import { useDbQuery } from '../../hooks/useDbQuery';
import { useToday } from '../../hooks/useToday';
import { emptyFilter, filterEntries, isFilterActive, type EntryFilter } from '../../logic/entryFilter';
import { spacing } from '../../theme/typography';

export default function JournalScreen() {
  const today = useToday();
  const entries = useDbQuery(listEntries);
  const tagStats = useDbQuery(listTagStats);
  const [filter, setFilter] = useState<EntryFilter>(emptyFilter);
  const all = useMemo(() => entries.data ?? [], [entries.data]);
  const visible = useMemo(() => filterEntries(all, filter), [all, filter]);
  const tagNames = useMemo(
    () => (tagStats.data ?? []).filter((t) => t.count > 0).map((t) => t.name).slice(0, 25),
    [tagStats.data],
  );

  const header = (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <AppText variant="display">Tagebuch</AppText>
        <AppText variant="caption" color="textMuted">
          {all.length === 1 ? '1 Traum' : `${all.length} Träume`}
        </AppText>
      </View>
      <Button label="Traum notieren" icon="add" size="lg" onPress={() => router.push('/entry/new')} />
      {all.length > 0 ? <JournalFilters filter={filter} onChange={setFilter} tags={tagNames} /> : null}
    </View>
  );

  const empty = entries.loading ? undefined : entries.error ? (
    <EmptyState icon="warning-outline" title="Fehler" text={entries.error}>
      <Button label="Erneut versuchen" variant="secondary" onPress={entries.reload} />
    </EmptyState>
  ) : all.length === 0 ? (
    <EmptyState
      icon="book-outline"
      title="Noch keine Träume"
      text="Notiere morgen früh direkt nach dem Aufwachen, woran du dich erinnerst – auch Bruchstücke zählen."
    />
  ) : (
    <EmptyState icon="search-outline" title="Nichts gefunden" text="Kein Traum passt zu deiner Suche.">
      {isFilterActive(filter) ? (
        <Button label="Filter zurücksetzen" variant="secondary" onPress={() => setFilter(emptyFilter)} />
      ) : null}
    </EmptyState>
  );

  return (
    <Screen scroll={false} stars contentStyle={styles.noPad}>
      <FlatList
        data={visible}
        keyExtractor={(e) => e.id}
        renderItem={({ item }) => <EntryCard entry={item} today={today} />}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={Separator}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    </Screen>
  );
}

function Separator() {
  return <View style={styles.sep} />;
}

const styles = StyleSheet.create({
  noPad: { padding: 0, paddingBottom: 0 },
  list: { padding: spacing.md, paddingBottom: spacing.xxl },
  header: { gap: spacing.md, marginBottom: spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  sep: { height: spacing.sm },
});
