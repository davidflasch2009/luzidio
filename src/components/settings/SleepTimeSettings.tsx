import { awakeWindowMinutes, formatMinutes, type Settings } from '../../logic/settings';
import { AppText } from '../ui/AppText';
import { Card } from '../ui/Card';
import { Stepper } from '../ui/Stepper';

type Props = {
  wakeMinutes: number;
  bedMinutes: number;
  onChange: (patch: Partial<Pick<Settings, 'wakeMinutes' | 'bedMinutes'>>) => void;
};

/** Aufwach- und Schlafenszeit in 15-Minuten-Schritten. */
export function SleepTimeSettings({ wakeMinutes, bedMinutes, onChange }: Props) {
  const awake = awakeWindowMinutes(wakeMinutes, bedMinutes);
  const tooShort = awake < 4 * 60;
  return (
    <Card>
      <AppText variant="heading">Deine Zeiten</AppText>
      <Stepper
        testID="wake-time"
        label="Aufwachen"
        value={wakeMinutes}
        min={0}
        max={1425}
        step={15}
        wrap
        format={formatMinutes}
        onChange={(v) => onChange({ wakeMinutes: v })}
      />
      <Stepper
        testID="bed-time"
        label="Schlafen gehen"
        value={bedMinutes}
        min={0}
        max={1425}
        step={15}
        wrap
        format={formatMinutes}
        onChange={(v) => onChange({ bedMinutes: v })}
      />
      <AppText variant="caption" color={tooShort ? 'danger' : 'textMuted'}>
        {tooShort
          ? 'Deine Wachzeit ist sehr kurz. Prüfe, ob die Zeiten stimmen.'
          : `Erinnerungen kommen nur in deiner Wachzeit (${Math.round((awake / 60) * 10) / 10} Stunden).`}
      </AppText>
    </Card>
  );
}
