import { Text, type TextProps } from 'react-native';

import type { Palette } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeProvider';
import { typography, type TextVariant } from '../../theme/typography';

type ColorKey = 'text' | 'textMuted' | 'textNight' | 'primary' | 'accent' | 'danger' | 'success' | 'onPrimary';

type Props = TextProps & {
  variant?: TextVariant;
  color?: ColorKey;
  center?: boolean;
};

const headingVariants: TextVariant[] = ['display', 'title', 'heading'];

export function AppText({ variant = 'body', color = 'text', center, style, ...rest }: Props) {
  const p: Palette = useTheme();
  const isHeading = headingVariants.includes(variant);
  return (
    <Text
      accessibilityRole={isHeading ? 'header' : undefined}
      maxFontSizeMultiplier={1.8}
      {...rest}
      style={[typography[variant], { color: p[color] }, center ? { textAlign: 'center' } : null, style]}
    />
  );
}
