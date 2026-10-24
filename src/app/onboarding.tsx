import { Redirect } from 'expo-router';
import { useCallback } from 'react';

import { OnboardingFlow, type OnboardingResult } from '../components/onboarding/OnboardingFlow';
import { Screen } from '../components/ui/Screen';
import { requestPermission } from '../services/notifications';
import { useAppStore } from '../store/appStore';

export default function OnboardingScreen() {
  const settings = useAppStore((s) => s.settings);
  const finish = useCallback(async (result: OnboardingResult) => {
    // Danach leitet die Weiche unten automatisch zum Heute-Bildschirm.
    await useAppStore.getState().updateSettings({ ...result, onboardingDone: true });
  }, []);
  const request = useCallback(async () => {
    const state = await requestPermission();
    useAppStore.getState().setNotificationPermission(state);
    return state;
  }, []);

  if (settings.onboardingDone) return <Redirect href="/" />;
  return (
    <Screen stars edges={['top', 'bottom']}>
      <OnboardingFlow
        initial={{
          wakeMinutes: settings.wakeMinutes,
          bedMinutes: settings.bedMinutes,
          realityChecksPerDay: settings.realityChecksPerDay,
        }}
        requestNotifications={request}
        onFinish={finish}
      />
    </Screen>
  );
}
