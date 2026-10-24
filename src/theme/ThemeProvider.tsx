import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { useAppStore } from '../store/appStore';
import { darkPalette, resolvePalette, type Palette } from './colors';

const ThemeContext = createContext<Palette>(darkPalette);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const mode = useAppStore((s) => s.settings.themeMode);
  const scheme = useColorScheme();
  const palette = useMemo(() => resolvePalette(mode, scheme), [mode, scheme]);
  return <ThemeContext.Provider value={palette}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Palette {
  return useContext(ThemeContext);
}
