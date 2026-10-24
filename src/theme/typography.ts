import type { TextStyle } from 'react-native';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
} as const;

/** Mindestgröße für Touch-Ziele (dp) */
export const minTouch = 48;

export type TextVariant = 'display' | 'title' | 'heading' | 'body' | 'bodyLarge' | 'caption' | 'label';

export const typography: Record<TextVariant, TextStyle> = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: '700', letterSpacing: 0.3 },
  title: { fontSize: 26, lineHeight: 34, fontWeight: '700' },
  heading: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
  bodyLarge: { fontSize: 20, lineHeight: 30, fontWeight: '400' },
  body: { fontSize: 17, lineHeight: 26, fontWeight: '400' },
  label: { fontSize: 15, lineHeight: 20, fontWeight: '600' },
  caption: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
};
