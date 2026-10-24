import Ionicons from '@expo/vector-icons/Ionicons';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { formatDuration } from '../../logic/dates';
import { useTheme } from '../../theme/ThemeProvider';
import { minTouch, radius, spacing } from '../../theme/typography';
import { AppText } from '../ui/AppText';

type Props = { uri: string; night?: boolean; onRemove?: () => void };

export function AudioPlayback({ uri, night, onRemove }: Props) {
  const p = useTheme();
  const source = useMemo(() => ({ uri }), [uri]);
  const player = useAudioPlayer(source);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => undefined);
  }, []);

  const toggle = async () => {
    if (status.playing) {
      player.pause();
      return;
    }
    if (status.didJustFinish || (status.duration > 0 && status.currentTime >= status.duration - 0.1)) {
      await player.seekTo(0).catch(() => undefined);
    }
    player.play();
  };

  const bg = night ? p.surfaceNight : p.surfaceRaised;
  return (
    <View style={[styles.row, { backgroundColor: bg, borderColor: p.border }]}>
      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel={status.playing ? 'Sprachmemo pausieren' : 'Sprachmemo abspielen'}
        style={[styles.play, { backgroundColor: p.primary }]}
      >
        <Ionicons name={status.playing ? 'pause' : 'play'} size={26} color={p.onPrimary} />
      </Pressable>
      <View style={styles.info}>
        <AppText variant="label" color={night ? 'textNight' : 'text'}>
          Sprachmemo
        </AppText>
        <AppText variant="caption" color={night ? 'textNight' : 'textMuted'}>
          {status.isLoaded
            ? `${formatDuration(status.currentTime)} / ${formatDuration(status.duration)}`
            : 'Wird geladen …'}
        </AppText>
      </View>
      {onRemove ? (
        <Pressable
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel="Sprachmemo entfernen"
          style={styles.remove}
        >
          <Ionicons name="trash-outline" size={24} color={p.danger} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  play: { width: minTouch + 8, height: minTouch + 8, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  remove: { width: minTouch, height: minTouch, alignItems: 'center', justifyContent: 'center' },
});
