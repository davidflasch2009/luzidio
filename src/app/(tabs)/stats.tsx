import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { StatTile } from '../../components/stats/StatTile';
import { TopSignsChart } from '../../components/stats/TopSignsChart';
import { WeeklyBarChart } from '../../components/stats/WeeklyBarChart';
import { AppText } from '../../components/ui/AppText';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Screen } from '../../components/ui/Screen';
import { listEntries } from '../../db/entries';
import { listTagStats } from '../../db/tags';
import { useDbQuery } from '../../hooks/useDbQuery';
import { useToday } from '../../hooks/useToday';
import {
  currentStreak,
  entriesPerWeek,
  formatPercent,
  longestStreak,
  recallRate,
  summarize,
  topDreamSigns,
} from '../../logic/stats';
import { spacing } from '../../theme/typography';

export default function StatsScreen() {
  const today = useToday();
  const entries = useDbQuery(listEntries);
  const tags = useDbQuery(listTagStats);
  const list = useMemo(() => entries.data ?? [], [entries.data]);

  const stats = useMemo(
    () => ({
      weeks: entriesPerWeek(list, today, 8),
      streak: currentStreak(list, today),
      best: longestStreak(list),
      recall: recallRate(list, today, 30),
      summary: summarize(list),
    }),
    [list, today],
  );
  const top = useMemo(() => topDreamSigns(tags.data ?? [], 6), [tags.data]);

  if (!entries.loading && list.length === 0) {
    return (
      <Screen stars>
        <AppText variant="display">Statistik</AppText>
        <EmptyState
          icon="bar-chart-outline"
          title="Noch keine Daten"
          text="Sobald du Träume notierst, siehst du hier deine Entwicklung: Einträge pro Woche, Serien, Erinnerungsquote und häufigste Traumzeichen."
        >
          <Button label="Ersten Traum notieren" icon="moon" onPress={() => router.push('/entry/new')} />
        </EmptyState>
      </Screen>
    );
  }

  const { summary, recall } = stats;
  return (
    <Screen stars>
      <AppText variant="display">Statistik</AppText>
      <View style={styles.tiles}>
        <StatTile label="Klarträume gesamt" value={String(summary.lucid)} hint={`${formatPercent(summary.lucidShare)} aller Träume`} />
        <StatTile label="Träume notiert" value={String(summary.total)} hint={summary.withAudio ? `${summary.withAudio} mit Sprachmemo` : undefined} />
        <StatTile label="Aktuelle Serie" value={`${stats.streak} ${stats.streak === 1 ? 'Tag' : 'Tage'}`} hint={`Rekord: ${stats.best}`} />
        <StatTile
          label="Ø Klarheit"
          value={summary.averageClarity === null ? '–' : String(summary.averageClarity).replace('.', ',')}
          hint="von 5"
        />
      </View>

      {recall ? (
        <Card>
          <AppText variant="heading">Erinnerungsquote</AppText>
          <AppText variant="title">{formatPercent(recall.rate)}</AppText>
          <ProgressBar value={recall.daysWithDream} max={recall.days} label="Erinnerungsquote" />
          <AppText variant="caption" color="textMuted">
            An {recall.daysWithDream} von {recall.days} Tagen hast du einen Traum festgehalten
            {recall.days < 30 ? ' (seit deinem ersten Eintrag)' : ' (letzte 30 Tage)'}.
          </AppText>
        </Card>
      ) : null}

      <Card>
        <AppText variant="heading">Einträge pro Woche</AppText>
        <WeeklyBarChart weeks={stats.weeks} />
      </Card>

      <Card>
        <AppText variant="heading">Häufigste Traumzeichen</AppText>
        {top.length > 0 ? (
          <>
            <TopSignsChart signs={top} />
            <AppText variant="caption" color="textMuted">
              ✦ = für Realitätschecks markiert
            </AppText>
          </>
        ) : (
          <AppText variant="body" color="textMuted">
            Vergib Tags in deinen Einträgen, um deine Traumzeichen zu sehen.
          </AppText>
        )}
        <Button label="Traumzeichen verwalten" variant="ghost" onPress={() => router.push('/dreamsigns')} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
