import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '../components/ui/AppText';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';
import { EmptyState } from '../components/ui/EmptyState';
import { Screen } from '../components/ui/Screen';
import { ToggleRow } from '../components/ui/ToggleRow';
import { getDb } from '../db/client';
import { listTagStats, setWatched } from '../db/tags';
import { useDbQuery } from '../hooks/useDbQuery';
import { normalizeTag } from '../logic/entryDraft';
import { useAppStore } from '../store/appStore';
import { useTheme } from '../theme/ThemeProvider';
import { minTouch, radius, spacing } from '../theme/typography';

export default function DreamSignsScreen() {
  const p = useTheme();
  const stats = useDbQuery(listTagStats);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const all = stats.data ?? [];
  const watched = all.filter((t) => t.watched);
  const used = all.filter((t) => t.count > 0).slice(0, 15);
  const maxCount = Math.max(1, ...used.map((t) => t.count));

  const toggle = async (name: string, value: boolean) => {
    setError(null);
    try {
      await setWatched(await getDb(), name, value);
      useAppStore.getState().bumpRevision();
    } catch {
      setError('Das hat nicht geklappt. Bitte versuch es noch einmal.');
    }
  };
  const add = async () => {
    const name = normalizeTag(input);
    if (!name) return;
    await toggle(name, true);
    setInput('');
  };

  return (
    <Screen edges={['bottom']} keyboard>
      <AppText variant="body" color="textMuted">
        Traumzeichen sind Dinge, die in deinen Träumen immer wieder auftauchen – Orte, Personen, Situationen oder
        Gefühle. Wenn du sie kennst, kannst du sie im Traum als Hinweis erkennen. Markierte Traumzeichen erscheinen in
        deinen Realitätscheck-Erinnerungen.
      </AppText>

      <Card>
        <AppText variant="heading">Eigenes Traumzeichen</AppText>
        <View style={styles.row}>
          <TextInput
            value={input}
            onChangeText={setInput}
            onSubmitEditing={add}
            placeholder="z. B. verpasster Zug"
            placeholderTextColor={p.textMuted}
            accessibilityLabel="Eigenes Traumzeichen"
            style={[styles.input, { color: p.text, borderColor: p.border, backgroundColor: p.surfaceRaised }]}
          />
          <Button label="Hinzufügen" onPress={add} disabled={!input.trim()} />
        </View>
        {watched.length > 0 ? (
          <View style={styles.chips}>
            {watched.map((t) => (
              <Chip key={t.name} label={t.name} selected onRemove={() => toggle(t.name, false)} />
            ))}
          </View>
        ) : (
          <AppText variant="caption" color="textMuted">
            Noch keine eigenen Traumzeichen festgelegt.
          </AppText>
        )}
      </Card>

      {error ? (
        <AppText variant="body" color="danger">
          {error}
        </AppText>
      ) : null}

      <AppText variant="heading">Häufigste Tags im Tagebuch</AppText>
      {used.length === 0 ? (
        <EmptyState
          icon="pricetags-outline"
          title="Noch keine Tags"
          text="Vergib beim Notieren deiner Träume Tags. Hier siehst du dann, was am häufigsten vorkommt."
        />
      ) : (
        used.map((t) => (
          <Card key={t.name}>
            <View style={styles.statRow}>
              <AppText variant="label" style={styles.flex}>
                {t.name}
              </AppText>
              <AppText variant="caption" color="textMuted">
                {t.count}×
              </AppText>
            </View>
            <View style={[styles.barTrack, { backgroundColor: p.surfaceRaised }]} accessibilityElementsHidden>
              <View style={[styles.bar, { width: `${(t.count / maxCount) * 100}%`, backgroundColor: p.primary }]} />
            </View>
            <ToggleRow label="Für Realitätschecks nutzen" value={t.watched} onChange={(v) => toggle(t.name, v)} />
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', flexWrap: 'wrap' },
  input: { flexGrow: 1, flexBasis: 160, minWidth: 0, minHeight: minTouch + 4, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, fontSize: 17 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statRow: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1 },
  barTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  bar: { height: 8, borderRadius: 4 },
});
