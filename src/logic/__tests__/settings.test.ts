import { awakeWindowMinutes, defaultSettings, formatMinutes, sanitizeSettings } from '../settings';

describe('sanitizeSettings', () => {
  it('liefert Standardwerte für Unsinn', () => {
    expect(sanitizeSettings(null)).toEqual(defaultSettings);
    expect(sanitizeSettings('x')).toEqual(defaultSettings);
    expect(sanitizeSettings({ wakeMinutes: -5, bedMinutes: 2000, themeMode: 'pink' })).toEqual(defaultSettings);
  });

  it('übernimmt gültige Werte und begrenzt Bereiche', () => {
    const s = sanitizeSettings({
      onboardingDone: true,
      wakeMinutes: 390,
      bedMinutes: 1380,
      realityChecksEnabled: false,
      realityChecksPerDay: 40,
      morningReminderEnabled: false,
      speechRate: 0.1,
      lockEnabled: true,
      themeMode: 'light',
      wbtbOffsetMinutes: 1000,
      programStartedOn: '2026-01-02',
    });
    expect(s).toEqual({
      onboardingDone: true,
      wakeMinutes: 390,
      bedMinutes: 1380,
      realityChecksEnabled: false,
      realityChecksPerDay: 15,
      morningReminderEnabled: false,
      speechRate: 0.5,
      lockEnabled: true,
      themeMode: 'light',
      wbtbOffsetMinutes: 360,
      programStartedOn: '2026-01-02',
    });
    expect(sanitizeSettings({ realityChecksPerDay: 1 }).realityChecksPerDay).toBe(3);
    expect(sanitizeSettings({ wbtbOffsetMinutes: 100 }).wbtbOffsetMinutes).toBe(270);
    expect(sanitizeSettings({ wbtbOffsetMinutes: 323 }).wbtbOffsetMinutes).toBe(330);
    expect(sanitizeSettings({ programStartedOn: 'gestern' }).programStartedOn).toBeNull();
    expect(sanitizeSettings({ speechRate: Number.NaN }).speechRate).toBe(defaultSettings.speechRate);
  });

  it('formatiert Minuten', () => {
    expect(formatMinutes(0)).toBe('00:00');
    expect(formatMinutes(7 * 60 + 5)).toBe('07:05');
    expect(formatMinutes(1440 + 61)).toBe('01:01');
    expect(formatMinutes(-30)).toBe('23:30');
  });

  it('berechnet die Wachphase auch über Mitternacht', () => {
    expect(awakeWindowMinutes(420, 1380)).toBe(960);
    expect(awakeWindowMinutes(14 * 60, 2 * 60)).toBe(12 * 60);
    expect(awakeWindowMinutes(420, 420)).toBe(1440);
  });
});
