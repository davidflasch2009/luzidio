import { StyleSheet, View } from 'react-native';

import type { Entry } from '../../db/types';
import { formatDateShort } from '../../logic/dates';
import { moodOptions } from '../../logic/entryDraft';
import { audioExists, audioUri } from '../../services/audioFiles';
import { spacing } from '../../theme/typography';
import { AppText } from '../ui/AppText';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
import { AudioPlayback } from './AudioPlayback';

export function EntryDetails({ entry }: { entry: Entry }) {
  const mood = moodOptions.find((m) => m.value === entry.mood);
  const hasAudio = entry.audioFile ? audioExists(entry.audioFile) : false;
  return (
    <View style={styles.wrap}>
      <AppText variant="caption" color="textMuted">
        {formatDateShort(entry.dreamDate)}
      </AppText>
      <AppText variant="title">{entry.title}</AppText>
      {entry.isLucid ? (
        <AppText variant="label" color="accent">
          ✦ Klartraum
        </AppText>
      ) : null}
      {entry.audioFile ? (
        hasAudio ? (
          <AudioPlayback uri={audioUri(entry.audioFile)} />
        ) : (
          <AppText variant="caption" color="danger">
            Die Audiodatei dieses Eintrags wurde nicht gefunden.
          </AppText>
        )
      ) : null}
      {entry.body ? (
        <AppText variant="bodyLarge" selectable>
          {entry.body}
        </AppText>
      ) : null}
      <Card>
        <AppText variant="body">Stimmung: {mood ? `${mood.short} ${mood.label}` : 'nicht angegeben'}</AppText>
        <AppText variant="body">Klarheit: {entry.clarity} von 5</AppText>
      </Card>
      {entry.tags.length > 0 ? (
        <View style={styles.chips} accessibilityLabel={`Traumzeichen: ${entry.tags.join(', ')}`}>
          {entry.tags.map((t) => (
            <Chip key={t} label={t} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
