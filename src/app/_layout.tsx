import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAppStore } from '../store/appStore';
import { ThemeProvider, useTheme } from '../theme/ThemeProvider';
import { defaultSettings } from '../logic/settings';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function RootStack() {
  const p = useTheme();
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
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const ready = useAppStore((s) => s.ready);
  useEffect(() => {
    useAppStore.getState().hydrate(defaultSettings, async () => undefined);
  }, []);
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);
  return (
    <SafeAreaProvider>
      <ThemeProvider>{ready ? <RootStack /> : null}</ThemeProvider>
    </SafeAreaProvider>
  );
}
