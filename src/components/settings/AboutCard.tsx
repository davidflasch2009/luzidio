import Constants from 'expo-constants';

import { AppText } from '../ui/AppText';
import { Card } from '../ui/Card';

export function AboutCard() {
  const version = Constants.expoConfig?.version ?? '1.0.0';
  return (
    <Card>
      <AppText variant="heading">Über Luzidio</AppText>
      <AppText variant="body" color="textMuted">
        Version {version}. Luzidio speichert alle Daten ausschließlich auf deinem Gerät – kein Konto, kein Server, keine
        Tracker.
      </AppText>
      <AppText variant="body" color="textMuted">
        Luzidio ist eine Lern-App und kein Medizinprodukt. Sie ersetzt keine ärztliche oder psychotherapeutische Beratung.
        Wenn du unter Schlafstörungen, häufigen Albträumen oder belastender Schlafparalyse leidest, wende dich bitte an
        eine Ärztin oder einen Arzt.
      </AppText>
    </Card>
  );
}
