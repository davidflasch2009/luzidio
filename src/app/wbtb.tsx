import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { AppText } from '../components/ui/AppText';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';
import { Screen } from '../components/ui/Screen';
import { useNow } from '../hooks/useNow';
import { formatDateShort, formatTime, toDateKey } from '../logic/dates';
import { formatOffset, planWbtb, WBTB_ID_PREFIX, wbtbId, wbtbOffsets } from '../logic/wbtb';
import { cancelById, getPermission, listScheduled, requestPermission, scheduleOne } from '../services/notifications';
import { useAppStore } from '../store/appStore';
import { spacing } from '../theme/typography';

type Active = { id: string; at: Date };

function parseWhen(when: string): Date | null {
  const m = /^t(\d+)$/.exec(when);
  return m ? new Date(Number(m[1]) * 60000) : null;
}

export default function WbtbScreen() {
  const settings = useAppStore((s) => s.settings);
  const now = useNow();
  const [active, setActive] = useState<Active | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const plan = useMemo(
    () => planWbtb(now, settings.bedMinutes, settings.wakeMinutes, settings.wbtbOffsetMinutes),
    [now, settings.bedMinutes, settings.wakeMinutes, settings.wbtbOffsetMinutes],
  );

  const refresh = useCallback(async () => {
    const list = await listScheduled();
    const found = list.find((n) => n.id.startsWith(WBTB_ID_PREFIX));
    const at = found ? parseWhen(found.when) : null;
    setActive(found && at && at.getTime() > Date.now() ? { id: found.id, at } : null);
  }, []);
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const activate = async () => {
    setBusy(true);
    setMessage(null);
    try {
      let permission = await getPermission();
      if (permission !== 'granted') permission = await requestPermission();
      if (permission !== 'granted') {
        setMessage('Ohne Benachrichtigungen kann Luzidio dich nicht wecken. Erlaube sie in den Systemeinstellungen.');
        return;
      }
      if (active) await cancelById(active.id);
      await scheduleOne({
        id: wbtbId(plan.nightOf),
        kind: 'wbtb',
        title: 'Zeit für WBTB',
        body: 'Bleib ruhig, notiere deinen Traum und mach dann die MILD-Übung. Licht gedämpft lassen.',
        at: plan.alarm,
      });
      await refresh();
    } catch {
      setMessage('Der Wecker konnte nicht gestellt werden. Bitte versuch es noch einmal.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!active) return;
    await cancelById(active.id);
    await refresh();
  };

  return (
    <Screen edges={['bottom']}>
      <AppText variant="body" color="textMuted">
        WBTB („Wake Back To Bed“): Du wirst nach einigen Stunden Schlaf sanft geweckt, bleibst kurz wach und schläfst
        mit der MILD-Übung wieder ein. Dann stehen lange REM-Phasen an – gute Chancen für einen Klartraum.
      </AppText>
      <Card>
        <AppText variant="label" color="accent">
          Bitte nicht jede Nacht
        </AppText>
        <AppText variant="body">
          WBTB unterbricht deinen Schlaf. Nutze es höchstens ein- bis zweimal pro Woche, am besten vor freien Tagen. Wenn du
          tagsüber müde wirst, mach eine Pause.
        </AppText>
        <AppText variant="caption" color="textMuted">
          Tipp: Ist ein Fokus wie „Schlafen“ oder „Nicht stören“ aktiv, erlaube Luzidio darin Mitteilungen – sonst bleibt
          der Wecker stumm.
        </AppText>
      </Card>

      <Card>
        <AppText variant="heading">Abstand nach dem Einschlafen</AppText>
        <View style={styles.chips}>
          {wbtbOffsets.map((o) => (
            <Chip
              key={o}
              label={formatOffset(o)}
              selected={settings.wbtbOffsetMinutes === o}
              onPress={() => useAppStore.getState().updateSettings({ wbtbOffsetMinutes: o }).catch(() => undefined)}
            />
          ))}
        </View>
        <AppText variant="body">
          Schlafenszeit {formatTime(plan.bedtime)} → Wecker um{' '}
          <AppText variant="heading" color="accent">
            {formatTime(plan.alarm)}
          </AppText>
        </AppText>
        <AppText variant="caption" color="textMuted">
          Nacht vom {formatDateShort(plan.nightOf)}. Die Zeiten änderst du in den Einstellungen.
        </AppText>
        {plan.warning ? (
          <AppText variant="body" color="danger">
            {plan.warning}
          </AppText>
        ) : null}
      </Card>

      {active ? (
        <Card>
          <AppText variant="heading" color="success">
            Wecker aktiv
          </AppText>
          <AppText variant="body">
            {formatDateShort(toDateKey(active.at))} um {formatTime(active.at)}
          </AppText>
          <Button label="Wecker löschen" icon="trash-outline" variant="danger" onPress={remove} />
        </Card>
      ) : null}

      {message ? (
        <View style={styles.gap}>
          <AppText variant="body" color="danger">
            {message}
          </AppText>
          <Button label="Systemeinstellungen öffnen" variant="ghost" onPress={() => Linking.openSettings().catch(() => undefined)} />
        </View>
      ) : null}

      <Button
        label={active ? 'Für diese Nacht neu stellen' : 'Für diese Nacht aktivieren'}
        icon="alarm"
        size="lg"
        onPress={activate}
        loading={busy}
      />
      <Button label="MILD-Übung ansehen" variant="ghost" icon="sparkles-outline" onPress={() => router.push('/exercise/mild')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  gap: { gap: spacing.sm },
});
