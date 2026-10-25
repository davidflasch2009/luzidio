import { Image, StyleSheet, View } from 'react-native';

import { formatMinutes, RC_MAX, RC_MIN } from '../../logic/settings';
import type { PermissionState } from '../../services/notifications';
import { appOnlyHint, isWeb } from '../../services/platform';
import { spacing } from '../../theme/typography';
import { AppText } from '../ui/AppText';
import { Card } from '../ui/Card';
import { Stepper } from '../ui/Stepper';

const logo = require('../../../assets/splash-icon.png');

export function WelcomeStep() {
  return (
    <View style={styles.step}>
      <Image source={logo} style={styles.logo} accessibilityIgnoresInvertColors accessible={false} />
      <AppText variant="display" center>
        Willkommen bei Luzidio
      </AppText>
      <AppText variant="bodyLarge" center>
        Ein Klartraum ist ein Traum, in dem du merkst, dass du träumst. Diese Fähigkeit lässt sich lernen – mit ein paar
        Minuten am Tag.
      </AppText>
      <AppText variant="body" color="textMuted" center>
        Alle deine Träume und Einstellungen bleiben auf deinem Gerät. Kein Konto, keine Cloud, keine Tracker.
      </AppText>
    </View>
  );
}

const weeks = [
  ['Woche 1', 'Träume erinnern mit dem Traumtagebuch'],
  ['Woche 2', 'Realitätschecks und deine Traumzeichen'],
  ['Woche 3', 'MILD – mit Absicht klar werden'],
  ['Woche 4', 'WBTB und den Klartraum stabil halten'],
] as const;

export function ProgramStep() {
  return (
    <View style={styles.step}>
      <AppText variant="title">So läuft dein Programm</AppText>
      <AppText variant="body">
        30 Tage, jeden Tag eine kurze Lektion von 2–3 Minuten und eine konkrete Aufgabe. Der nächste Tag wird am Folgetag
        frei – verpasst du einen Tag, machst du einfach weiter.
      </AppText>
      {weeks.map(([w, t]) => (
        <Card key={w}>
          <AppText variant="label" color="accent">
            {w}
          </AppText>
          <AppText variant="body">{t}</AppText>
        </Card>
      ))}
      <AppText variant="caption" color="textMuted">
        Luzidio ist kein Medizinprodukt. Bei Schlafstörungen, häufigen Albträumen oder belastender Schlafparalyse sprich
        bitte zuerst mit einer Ärztin oder einem Arzt.
      </AppText>
    </View>
  );
}

type TimesProps = {
  wakeMinutes: number;
  bedMinutes: number;
  perDay: number;
  onChange: (patch: { wakeMinutes?: number; bedMinutes?: number; realityChecksPerDay?: number }) => void;
};

export function TimesStep({ wakeMinutes, bedMinutes, perDay, onChange }: TimesProps) {
  return (
    <View style={styles.step}>
      <AppText variant="title">Deine Schlafzeiten</AppText>
      <AppText variant="body">
        Luzidio erinnert dich nur, während du wach bist, und berechnet daraus später den WBTB-Wecker.
      </AppText>
      <Card>
        <Stepper testID="onb-wake" label="Ich wache auf um" value={wakeMinutes} min={0} max={1425} step={15} wrap format={formatMinutes} onChange={(v) => onChange({ wakeMinutes: v })} />
        <Stepper testID="onb-bed" label="Ich gehe schlafen um" value={bedMinutes} min={0} max={1425} step={15} wrap format={formatMinutes} onChange={(v) => onChange({ bedMinutes: v })} />
      </Card>
      <Card>
        <Stepper testID="onb-rc" label="Realitätschecks pro Tag" value={perDay} min={RC_MIN} max={RC_MAX} onChange={(v) => onChange({ realityChecksPerDay: v })} />
        <AppText variant="caption" color="textMuted">
          Zufällig über den Tag verteilt. Fünf bis acht sind ein guter Start – du kannst das jederzeit ändern.
        </AppText>
      </Card>
    </View>
  );
}

export function NotificationStep({ permission }: { permission: PermissionState | null }) {
  if (isWeb) {
    return (
      <View style={styles.step}>
        <AppText variant="title">Du nutzt die Browser-Version</AppText>
        <AppText variant="body">
          Tagebuch, Lektionen, Übungen und Statistik funktionieren hier. Deine Daten bleiben nur in diesem Browser auf
          diesem Gerät.
        </AppText>
        <AppText variant="body" color="textMuted">
          Erinnerungen, WBTB-Wecker, Sprachmemos, App-Sperre sowie Export und Import: {appOnlyHint}
        </AppText>
      </View>
    );
  }
  return (
    <View style={styles.step}>
      <AppText variant="title">Erinnerungen erlauben</AppText>
      <AppText variant="body">
        Damit Realitätschecks, die Traum-Erinnerung am Morgen und der WBTB-Wecker funktionieren, braucht Luzidio deine
        Erlaubnis für Benachrichtigungen. Die Texte enthalten nie Inhalte aus deinem Tagebuch.
      </AppText>
      {permission === 'granted' ? (
        <AppText variant="label" color="success" accessibilityLiveRegion="polite">
          ✓ Benachrichtigungen sind erlaubt.
        </AppText>
      ) : permission === 'denied' ? (
        <AppText variant="body" color="danger" accessibilityLiveRegion="polite">
          Benachrichtigungen sind blockiert. Du kannst sie später in den Systemeinstellungen erlauben – Tagebuch, Lektionen
          und Übungen funktionieren auch ohne.
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  step: { gap: spacing.md },
  logo: { width: 140, height: 140, alignSelf: 'center' },
});
