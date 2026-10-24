import { StyleSheet, Switch, View } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { minTouch, spacing } from '../../theme/typography';
import { AppText } from './AppText';

type Props = {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  night?: boolean;
  testID?: string;
};

export function ToggleRow({ label, description, value, onChange, disabled, night, testID }: Props) {
  const p = useTheme();
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <AppText variant="body" color={night ? 'textNight' : 'text'}>
          {label}
        </AppText>
        {description ? (
          <AppText variant="caption" color={night ? 'textNight' : 'textMuted'}>
            {description}
          </AppText>
        ) : null}
      </View>
      <Switch
        testID={testID}
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        accessibilityLabel={label}
        accessibilityHint={description}
        trackColor={{ true: p.primary, false: p.border }}
        thumbColor={value ? p.onPrimary : p.textMuted}
        ios_backgroundColor={p.border}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: minTouch },
  text: { flex: 1, gap: 2 },
});
