import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { normalizeTags, splitTagInput } from '../../logic/entryDraft';
import { useTheme } from '../../theme/ThemeProvider';
import { minTouch, radius, spacing } from '../../theme/typography';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';

type Props = {
  tags: string[];
  suggestions: string[];
  onChange: (tags: string[]) => void;
  night?: boolean;
};

/** Eingabe für Traumzeichen-Tags mit Vorschlägen aus bisherigen Einträgen. */
export function TagEditor({ tags, suggestions, onChange, night }: Props) {
  const p = useTheme();
  const [input, setInput] = useState('');
  const add = () => {
    const parts = splitTagInput(input);
    if (parts.length === 0) return;
    onChange(normalizeTags([...tags, ...parts]));
    setInput('');
  };
  const lowerTags = new Set(tags.map((t) => t.toLocaleLowerCase('de')));
  const open = suggestions.filter((s) => !lowerTags.has(s.toLocaleLowerCase('de'))).slice(0, 8);
  const textColor = night ? p.textNight : p.text;
  return (
    <View style={styles.wrap}>
      <AppText variant="label" color={night ? 'textNight' : 'textMuted'}>
        Traumzeichen (Tags)
      </AppText>
      {tags.length > 0 ? (
        <View style={styles.chips}>
          {tags.map((t) => (
            <Chip key={t} label={t} selected onRemove={() => onChange(tags.filter((x) => x !== t))} />
          ))}
        </View>
      ) : null}
      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          onSubmitEditing={add}
          placeholder="z. B. Fliegen, Schule"
          placeholderTextColor={p.textMuted}
          accessibilityLabel="Neues Traumzeichen"
          accessibilityHint="Mehrere mit Komma trennen"
          returnKeyType="done"
          blurOnSubmit={false}
          style={[
            styles.input,
            { color: textColor, borderColor: p.border, backgroundColor: night ? p.surfaceNight : p.surfaceRaised },
          ]}
        />
        <Button label="Hinzufügen" variant="secondary" onPress={add} disabled={!input.trim()} />
      </View>
      {open.length > 0 ? (
        <View style={styles.chips}>
          {open.map((s) => (
            <Chip
              key={s}
              label={`+ ${s}`}
              onPress={() => onChange(normalizeTags([...tags, s]))}
              accessibilityHint="Fügt dieses Traumzeichen hinzu"
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  inputRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  input: {
    flex: 1,
    minHeight: minTouch + 4,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 17,
  },
});
