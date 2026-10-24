import { darkPalette, lightPalette, resolvePalette } from '../../theme/colors';
import { contrastRatio, relativeLuminance } from '../contrast';

describe('contrast', () => {
  it('berechnet Extremwerte korrekt', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
    expect(contrastRatio('#777777', '#777777')).toBeCloseTo(1, 5);
  });

  it('lehnt ungültige Farben ab', () => {
    expect(() => relativeLuminance('blau')).toThrow();
  });

  it.each([
    ['dunkel', darkPalette],
    ['hell', lightPalette],
  ])('Palette %s erfüllt WCAG AA für Text', (_name, p) => {
    for (const bg of [p.background, p.surface, p.surfaceRaised]) {
      expect(contrastRatio(p.text, bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(p.textMuted, bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(p.primary, bg)).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(p.danger, bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(p.success, bg)).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrastRatio(p.onPrimary, p.primary)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.textNight, p.backgroundNight)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(p.textNight, p.surfaceNight)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(p.accent, p.background)).toBeGreaterThanOrEqual(4.5);
  });

  it('wählt die Palette nach Modus', () => {
    expect(resolvePalette('light', 'dark')).toBe(lightPalette);
    expect(resolvePalette('dark', 'light')).toBe(darkPalette);
    expect(resolvePalette('system', 'light')).toBe(lightPalette);
    expect(resolvePalette('system', 'dark')).toBe(darkPalette);
    expect(resolvePalette('system', null)).toBe(darkPalette);
  });
});
