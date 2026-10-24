export type Palette = {
  /** Haupthintergrund */
  background: string;
  /** Extra dunkler Hintergrund für die nächtliche Schnellerfassung */
  backgroundNight: string;
  surface: string;
  /** Fläche im Nachtmodus */
  surfaceNight: string;
  surfaceRaised: string;
  border: string;
  text: string;
  textMuted: string;
  /** Text im Nachtmodus: gedimmt, aber gut lesbar */
  textNight: string;
  primary: string;
  onPrimary: string;
  accent: string;
  success: string;
  danger: string;
  star: string;
  isDark: boolean;
};

export const darkPalette: Palette = {
  background: '#0B1026',
  backgroundNight: '#05070F',
  surface: '#161C40',
  surfaceNight: '#11152B',
  surfaceRaised: '#20285A',
  border: '#343E7A',
  text: '#EEEBFF',
  textMuted: '#B6B3DD',
  textNight: '#C9C4EE',
  primary: '#A497FF',
  onPrimary: '#0B1026',
  accent: '#F2C879',
  success: '#7ADBB2',
  danger: '#FF9A9A',
  star: '#FFFFFF',
  isDark: true,
};

export const lightPalette: Palette = {
  background: '#F4F2FF',
  backgroundNight: '#05070F',
  surface: '#FFFFFF',
  surfaceNight: '#11152B',
  surfaceRaised: '#E9E5FF',
  border: '#CFC8F2',
  text: '#1A1840',
  textMuted: '#4A4672',
  textNight: '#C9C4EE',
  primary: '#5340D0',
  onPrimary: '#FFFFFF',
  accent: '#8A5800',
  success: '#1B6E4A',
  danger: '#A8231B',
  star: '#5340D0',
  isDark: false,
};

export type ThemeMode = 'dark' | 'light' | 'system';

export function resolvePalette(mode: ThemeMode, systemScheme: 'light' | 'dark' | null | undefined): Palette {
  if (mode === 'light') return lightPalette;
  if (mode === 'dark') return darkPalette;
  return systemScheme === 'light' ? lightPalette : darkPalette;
}
