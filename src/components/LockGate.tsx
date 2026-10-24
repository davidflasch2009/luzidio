import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authenticate } from '../services/auth';
import { useAppStore } from '../store/appStore';
import { useTheme } from '../theme/ThemeProvider';
import { spacing } from '../theme/typography';
import { AppText } from './ui/AppText';
import { Button } from './ui/Button';
import { Starfield } from './ui/Starfield';

/** Nach so langer Zeit im Hintergrund wird wieder gesperrt (Teilen-Dialoge u. Ä. sperren nicht sofort). */
export const LOCK_GRACE_MS = 30_000;

/**
 * Legt bei aktiver App-Sperre einen Sperrbildschirm über die App. Die App darunter
 * bleibt erhalten (Navigation, ungespeicherte Entwürfe), ist aber verdeckt und für
 * Screenreader ausgeblendet. Im App-Umschalter wird der Inhalt ebenfalls verdeckt.
 */
export function LockGate({ children }: { children: ReactNode }) {
  const p = useTheme();
  const lockEnabled = useAppStore((s) => s.settings.lockEnabled);
  const unlocked = useAppStore((s) => s.unlocked);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [covered, setCovered] = useState(false);
  const backgroundSince = useRef<number | null>(null);
  const autoTried = useRef(false);

  const unlock = useCallback(async () => {
    setBusy(true);
    setFailed(false);
    const ok = await authenticate();
    setBusy(false);
    if (ok) useAppStore.getState().setUnlocked(true);
    else setFailed(true);
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      setCovered(state !== 'active');
      if (state === 'background') backgroundSince.current = Date.now();
      if (state === 'active' && backgroundSince.current !== null) {
        const away = Date.now() - backgroundSince.current;
        backgroundSince.current = null;
        if (useAppStore.getState().settings.lockEnabled && away > LOCK_GRACE_MS) {
          useAppStore.getState().setUnlocked(false);
          autoTried.current = false;
        }
      }
    });
    return () => sub.remove();
  }, []);

  const locked = lockEnabled && !unlocked;
  useEffect(() => {
    if (locked && !autoTried.current) {
      autoTried.current = true;
      unlock();
    }
  }, [locked, unlock]);

  const hidden = lockEnabled && (locked || covered);
  return (
    <View style={styles.fill}>
      <View
        style={styles.fill}
        accessibilityElementsHidden={hidden}
        importantForAccessibility={hidden ? 'no-hide-descendants' : 'auto'}
      >
        {children}
      </View>
      {hidden ? (
        <SafeAreaView style={[StyleSheet.absoluteFill, { backgroundColor: p.background }]}>
          <Starfield />
          <View style={styles.center}>
            <AppText variant="display" center>
              Luzidio
            </AppText>
            {locked ? (
              <>
                <AppText variant="body" color="textMuted" center>
                  Dein Traumtagebuch ist geschützt.
                </AppText>
                {failed ? (
                  <AppText variant="body" color="danger" center accessibilityLiveRegion="assertive">
                    Entsperren hat nicht geklappt. Versuch es noch einmal.
                  </AppText>
                ) : null}
                <Button label="Entsperren" icon="lock-open" size="lg" onPress={unlock} loading={busy} />
              </>
            ) : null}
          </View>
        </SafeAreaView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.md },
});
