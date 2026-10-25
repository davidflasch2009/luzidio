import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';

import type { Settings } from '../../logic/settings';
import type { PermissionState } from '../../services/notifications';
import { isWeb } from '../../services/platform';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/typography';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { NotificationStep, ProgramStep, TimesStep, WelcomeStep } from './OnboardingSteps';

export type OnboardingResult = Pick<Settings, 'wakeMinutes' | 'bedMinutes' | 'realityChecksPerDay'>;

type Props = {
  initial: OnboardingResult;
  requestNotifications: () => Promise<PermissionState>;
  onFinish: (result: OnboardingResult) => Promise<void>;
};

const STEPS = 4;

export function OnboardingFlow({ initial, requestNotifications, onFinish }: Props) {
  const p = useTheme();
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<OnboardingResult>(initial);
  const [permission, setPermission] = useState<PermissionState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = async () => {
    setBusy(true);
    setPermission(await requestNotifications());
    setBusy(false);
  };
  const finish = async () => {
    setBusy(true);
    setError(null);
    try {
      await onFinish(values);
    } catch {
      setError('Speichern fehlgeschlagen. Bitte versuch es noch einmal.');
      setBusy(false);
    }
  };

  const isLast = step === STEPS - 1;
  // Im Browser gibt es keine Benachrichtigungen – dort direkt starten.
  const asked = permission !== null || isWeb;
  return (
    <View style={styles.wrap}>
      <View style={styles.dots} accessible accessibilityLabel={`Schritt ${step + 1} von ${STEPS}`}>
        {Array.from({ length: STEPS }, (_, i) => (
          <View key={i} style={[styles.dot, { backgroundColor: i <= step ? p.primary : p.border }]} />
        ))}
      </View>
      <Animated.View key={step} entering={reduceMotion || isWeb ? undefined : FadeIn.duration(400)} style={styles.body}>
        {step === 0 ? <WelcomeStep /> : null}
        {step === 1 ? <ProgramStep /> : null}
        {step === 2 ? (
          <TimesStep
            wakeMinutes={values.wakeMinutes}
            bedMinutes={values.bedMinutes}
            perDay={values.realityChecksPerDay}
            onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
          />
        ) : null}
        {step === 3 ? <NotificationStep permission={permission} /> : null}
      </Animated.View>
      {error ? (
        <AppText variant="body" color="danger">
          {error}
        </AppText>
      ) : null}
      <View style={styles.actions}>
        {isLast && !asked ? (
          <Button label="Benachrichtigungen erlauben" icon="notifications-outline" size="lg" onPress={ask} loading={busy} />
        ) : null}
        {isLast ? (
          <Button
            label={asked ? "Los geht's" : 'Später'}
            variant={asked ? 'primary' : 'ghost'}
            size="lg"
            onPress={finish}
            disabled={busy}
          />
        ) : (
          <Button label="Weiter" icon="arrow-forward" size="lg" onPress={() => setStep((s) => s + 1)} />
        )}
        {step > 0 ? <Button label="Zurück" variant="ghost" onPress={() => setStep((s) => s - 1)} disabled={busy} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.lg },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  dot: { width: 28, height: 6, borderRadius: 3 },
  body: { gap: spacing.md },
  actions: { gap: spacing.sm },
});
