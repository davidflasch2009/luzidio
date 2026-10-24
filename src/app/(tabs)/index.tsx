import { router } from 'expo-router';

import { AppText } from '../../components/ui/AppText';
import { Button } from '../../components/ui/Button';
import { Screen } from '../../components/ui/Screen';
import { RealityCheckCard } from '../../components/today/RealityCheckCard';
import { useToday } from '../../hooks/useToday';
import { formatDateLong } from '../../logic/dates';

export default function TodayScreen() {
  const today = useToday();
  return (
    <Screen stars>
      <AppText variant="caption" color="textMuted">
        {formatDateLong(today)}
      </AppText>
      <AppText variant="display">Luzidio</AppText>
      <Button
        label="Traum notieren"
        icon="moon"
        size="xl"
        onPress={() => router.push('/entry/new')}
        accessibilityHint="Öffnet die schnelle Erfassung im Nachtmodus"
      />
      <RealityCheckCard now={new Date()} />
    </Screen>
  );
}
