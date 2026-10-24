import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppText } from '../components/ui/AppText';
import { Button } from '../components/ui/Button';
import { getDb } from '../db/client';
import { useReminderSync } from '../hooks/useReminderSync';
import { listAudioFiles } from '../db/entries';
import { loadSettings, saveSettings } from '../db/settingsRepo';
import { removeUnreferencedAudio } from '../services/audioFiles';
import { useAppStore } from '../store/appStore';
import { darkPalette } from '../theme/colors';
import { ThemeProvider, useTheme } from '../theme/ThemeProvider';
import { spacing } from '../theme/typography';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function RootStack() {
  const p = useTheme();
  useReminderSync();
  return (
    <>
      <StatusBar style={p.isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: p.surface },
          headerTintColor: p.text,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: p.background },
          headerBackTitle: 'Zurück',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="entry/new" options={{ presentation: 'fullScreenModal', title: 'Traum notieren' }} />
        <Stack.Screen name="entry/[id]" options={{ title: 'Traum' }} />
        <Stack.Screen name="dreamsigns" options={{ title: 'Traumzeichen' }} />
        <Stack.Screen name="lesson/[day]" options={{ title: 'Lektion' }} />
        <Stack.Screen
          name="exercise/[id]"
          options={{
            title: 'Übung',
            headerStyle: { backgroundColor: p.backgroundNight },
            headerTintColor: p.textNight,
            contentStyle: { backgroundColor: p.backgroundNight },
          }}
        />
        <Stack.Screen name="wbtb" options={{ title: 'WBTB-Wecker' }} />
      </Stack>
    </>
  );
}

async function bootstrap(): Promise<void> {
  const db = await getDb();
  const settings = await loadSettings(db);
  useAppStore.getState().hydrate(settings, (s) => saveSettings(db, s));
  // Verwaiste Sprachmemos (z. B. nach Abstürzen) aufräumen – Fehler sind hier unkritisch.
  listAudioFiles(db)
    .then((files) => removeUnreferencedAudio(files))
    .catch(() => undefined);
}

export default function RootLayout() {
  const ready = useAppStore((s) => s.ready);
  const [failed, setFailed] = useState(false);

  const run = useCallback(() => {
    bootstrap().catch(() => {
      setFailed(true);
      SplashScreen.hideAsync().catch(() => undefined);
    });
  }, []);
  const retry = () => {
    setFailed(false);
    run();
  };

  useEffect(run, [run]);
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        {ready ? (
          <RootStack />
        ) : failed ? (
          <View style={styles.error}>
            <AppText variant="heading" center>
              Luzidio konnte deine Daten nicht öffnen.
            </AppText>
            <AppText variant="body" color="textMuted" center>
              Starte die App neu oder versuche es noch einmal. Deine Einträge bleiben erhalten.
            </AppText>
            <Button label="Erneut versuchen" onPress={retry} />
          </View>
        ) : null}
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  error: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: darkPalette.background,
  },
});
