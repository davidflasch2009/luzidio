import { router, Stack } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { EntryForm } from '../../components/journal/EntryForm';
import { Screen } from '../../components/ui/Screen';
import { getDb } from '../../db/client';
import { createEntry } from '../../db/entries';
import { listTagStats } from '../../db/tags';
import type { EntryInput } from '../../db/types';
import { useDbQuery } from '../../hooks/useDbQuery';
import { useToday } from '../../hooks/useToday';
import { emptyDraft } from '../../logic/entryDraft';
import { useAppStore } from '../../store/appStore';
import { useTheme } from '../../theme/ThemeProvider';

/** Schnellerfassung – dunkel, große Schrift, Tastatur sofort offen. */
export default function NewEntryScreen() {
  const p = useTheme();
  const today = useToday();
  // Entwurf einmalig anlegen, damit ein Datumswechsel um Mitternacht nichts zurücksetzt.
  const [initial] = useState(() => emptyDraft(today));
  const tags = useDbQuery(listTagStats);
  const suggestions = useMemo(() => (tags.data ?? []).map((t) => t.name), [tags.data]);

  const submit = useCallback(async (input: EntryInput) => {
    const db = await getDb();
    await createEntry(db, input);
    useAppStore.getState().bumpRevision();
  }, []);
  const done = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/journal');
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Traum notieren',
          headerStyle: { backgroundColor: p.backgroundNight },
          headerTintColor: p.textNight,
          contentStyle: { backgroundColor: p.backgroundNight },
        }}
      />
      <Screen night edges={['bottom']} keyboard>
        <EntryForm
          initial={initial}
          today={today}
          tagSuggestions={suggestions}
          submitLabel="Traum speichern"
          onSubmit={submit}
          onDone={done}
          night
          autoFocus
          detailsInitiallyOpen={false}
        />
      </Screen>
    </>
  );
}
