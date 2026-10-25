import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { EntryDetails } from '../../components/journal/EntryDetails';
import { EntryForm } from '../../components/journal/EntryForm';
import { AppText } from '../../components/ui/AppText';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Screen } from '../../components/ui/Screen';
import { getDb } from '../../db/client';
import { deleteEntry, getEntry, updateEntry } from '../../db/entries';
import { listTagStats } from '../../db/tags';
import type { Db, EntryInput } from '../../db/types';
import { useDbQuery } from '../../hooks/useDbQuery';
import { useToday } from '../../hooks/useToday';
import { deleteAudio } from '../../services/audioFiles';
import { confirmAction } from '../../services/platform';
import { useAppStore } from '../../store/appStore';
import { spacing } from '../../theme/typography';

export default function EntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const today = useToday();
  const [editing, setEditing] = useState(false);
  const loader = useCallback((db: Db) => getEntry(db, id ?? ''), [id]);
  const { data: entry, loading, error } = useDbQuery(loader);
  const tags = useDbQuery(listTagStats);
  const suggestions = useMemo(() => (tags.data ?? []).map((t) => t.name), [tags.data]);

  const initial = useMemo<EntryInput | null>(() => {
    if (!entry) return null;
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = entry;
    return rest;
  }, [entry]);

  const submit = useCallback(
    async (input: EntryInput) => {
      const db = await getDb();
      const ok = await updateEntry(db, id ?? '', input);
      if (!ok) throw new Error('Eintrag nicht gefunden');
      useAppStore.getState().bumpRevision();
    },
    [id],
  );
  const finishEdit = useCallback(() => setEditing(false), []);

  const [deleteError, setDeleteError] = useState<string | null>(null);
  const confirmDelete = async () => {
    const ok = await confirmAction(
      'Traum löschen?',
      'Der Eintrag und ein eventuelles Sprachmemo werden endgültig gelöscht.',
      'Löschen',
    );
    if (!ok) return;
    try {
      const db = await getDb();
      const audio = await deleteEntry(db, id ?? '');
      deleteAudio(audio);
      useAppStore.getState().bumpRevision();
      if (router.canGoBack()) router.back();
      else router.replace('/journal');
    } catch {
      setDeleteError('Löschen fehlgeschlagen. Bitte versuch es noch einmal.');
    }
  };

  if (!entry || !initial) {
    return (
      <Screen edges={['bottom']}>
        <Stack.Screen options={{ title: 'Traum' }} />
        {loading ? (
          <AppText variant="body" color="textMuted">
            Wird geladen …
          </AppText>
        ) : (
          <EmptyState
            icon="cloud-offline-outline"
            title="Eintrag nicht gefunden"
            text={error ?? 'Dieser Traum wurde vielleicht gelöscht.'}
          />
        )}
      </Screen>
    );
  }

  return (
    <Screen edges={['bottom']} keyboard={editing}>
      <Stack.Screen options={{ title: editing ? 'Traum bearbeiten' : 'Traum' }} />
      {editing ? (
        <EntryForm
          initial={initial}
          today={today}
          tagSuggestions={suggestions}
          submitLabel="Änderungen speichern"
          onSubmit={submit}
          onDone={finishEdit}
        />
      ) : (
        <>
          <EntryDetails entry={entry} />
          <View style={styles.actions}>
            <Button label="Bearbeiten" icon="create-outline" size="lg" onPress={() => setEditing(true)} />
            <Button label="Löschen" icon="trash-outline" variant="danger" onPress={confirmDelete} />
            {deleteError ? (
              <AppText variant="body" color="danger">
                {deleteError}
              </AppText>
            ) : null}
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { gap: spacing.sm, marginTop: spacing.md },
});
