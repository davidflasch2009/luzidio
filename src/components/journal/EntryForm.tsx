import { useNavigation, usePreventRemove, type NavigationAction } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import type { EntryInput } from '../../db/types';
import { clarityOptions, moodOptions } from '../../logic/entryDraft';
import { appOnlyHint, confirmAction, isWeb } from '../../services/platform';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing } from '../../theme/typography';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { RatingPicker } from '../ui/RatingPicker';
import { ToggleRow } from '../ui/ToggleRow';
import { AudioPlayback } from './AudioPlayback';
import { DreamDateRow } from './DreamDateRow';
import { TagEditor } from './TagEditor';
import { useEntryEditor } from './useEntryEditor';
import { VoiceMemoRecorder } from './VoiceMemoRecorder';

type Props = {
  initial: EntryInput;
  today: string;
  tagSuggestions: string[];
  submitLabel: string;
  onSubmit: (input: EntryInput) => Promise<void>;
  /** Wird nach erfolgreichem Speichern aufgerufen (z. B. zurück navigieren). */
  onDone: () => void;
  night?: boolean;
  autoFocus?: boolean;
  detailsInitiallyOpen?: boolean;
};

export function EntryForm({
  initial,
  today,
  tagSuggestions,
  submitLabel,
  onSubmit,
  onDone,
  night = false,
  autoFocus = false,
  detailsInitiallyOpen = true,
}: Props) {
  const p = useTheme();
  const editor = useEntryEditor(initial, onSubmit);
  const { draft, update } = editor;
  const [showDetails, setShowDetails] = useState(detailsInitiallyOpen);

  // Ungespeicherte Änderungen nicht stillschweigend verlieren.
  const navigation = useNavigation();
  const [leaveAction, setLeaveAction] = useState<NavigationAction | null>(null);
  usePreventRemove(editor.dirty && !leaveAction, ({ data }) => {
    confirmAction('Änderungen verwerfen?', 'Dein Traum ist noch nicht gespeichert.', 'Verwerfen', 'Weiter bearbeiten').then(
      (discard) => {
        if (!discard) return;
        editor.discardPending();
        setLeaveAction(data.action);
      },
    );
  });
  useEffect(() => {
    if (leaveAction) navigation.dispatch(leaveAction);
  }, [leaveAction, navigation]);
  useEffect(() => {
    if (editor.saved) onDone();
  }, [editor.saved, onDone]);

  const textColor = night ? p.textNight : p.text;
  const fieldBg = night ? p.surfaceNight : p.surface;

  return (
    <View style={styles.wrap}>
      <DreamDateRow value={draft.dreamDate} today={today} onChange={(dreamDate) => update({ dreamDate })} night={night} />
      <TextInput
        testID="entry-body"
        value={draft.body}
        onChangeText={(body) => update({ body })}
        placeholder="Woran erinnerst du dich? Stichworte reichen."
        placeholderTextColor={p.textMuted}
        multiline
        autoFocus={autoFocus}
        textAlignVertical="top"
        accessibilityLabel="Traumbeschreibung"
        style={[styles.body, { color: textColor, borderColor: p.border, backgroundColor: fieldBg }]}
      />
      {editor.audioPreviewUri ? (
        <AudioPlayback uri={editor.audioPreviewUri} night={night} onRemove={editor.removeAudio} />
      ) : isWeb ? (
        <AppText variant="caption" color={night ? 'textNight' : 'textMuted'}>
          Sprachmemos: {appOnlyHint}
        </AppText>
      ) : (
        <VoiceMemoRecorder onRecorded={editor.setRecording} night={night} />
      )}
      <ToggleRow
        testID="entry-lucid"
        label="Das war ein Klartraum"
        description="Du wusstest im Traum, dass du träumst."
        value={draft.isLucid}
        onChange={(isLucid) => update({ isLucid })}
        night={night}
      />
      {showDetails ? (
        <View style={styles.details}>
          <View style={styles.field}>
            <AppText variant="label" color={night ? 'textNight' : 'textMuted'}>
              Titel (optional)
            </AppText>
            <TextInput
              testID="entry-title"
              value={draft.title}
              onChangeText={(title) => update({ title })}
              placeholder="Wird sonst aus dem Text erzeugt"
              placeholderTextColor={p.textMuted}
              accessibilityLabel="Titel"
              maxLength={120}
              style={[styles.input, { color: textColor, borderColor: p.border, backgroundColor: fieldBg }]}
            />
          </View>
          <RatingPicker
            label="Stimmung"
            options={moodOptions}
            value={draft.mood}
            onChange={(v) => update({ mood: v as EntryInput['mood'] })}
            allowClear
            night={night}
          />
          <RatingPicker
            label="Klarheit (0 = verschwommen, 5 = glasklar)"
            options={clarityOptions}
            value={draft.clarity}
            onChange={(v) => update({ clarity: v ?? 0 })}
            night={night}
          />
          <TagEditor tags={draft.tags} suggestions={tagSuggestions} onChange={(tags) => update({ tags })} night={night} />
        </View>
      ) : (
        <Button label="Details hinzufügen" icon="add-circle-outline" variant="ghost" onPress={() => setShowDetails(true)} />
      )}
      {editor.error ? (
        <AppText variant="body" color="danger" accessibilityLiveRegion="assertive">
          {editor.error}
        </AppText>
      ) : null}
      <Button testID="entry-save" label={submitLabel} icon="checkmark" size="xl" onPress={editor.save} loading={editor.saving} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  details: { gap: spacing.lg },
  field: { gap: spacing.sm },
  body: {
    minHeight: 180,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 20,
    lineHeight: 30,
  },
  input: { minHeight: 52, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, fontSize: 17 },
});
