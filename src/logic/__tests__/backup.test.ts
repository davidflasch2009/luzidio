import { backupFileName, createBackup, mergeImportedSettings, parseBackup } from '../backup';
import { defaultSettings } from '../settings';

const entry = {
  id: 'abc-123',
  dreamDate: '2026-10-20',
  title: 'Flug',
  body: 'Ich flog.',
  audioFile: 'memo-1.m4a',
  mood: 4,
  clarity: 3,
  isLucid: true,
  createdAt: '2026-10-20T06:00:00.000Z',
  updatedAt: '2026-10-20T06:00:00.000Z',
  tags: ['Fliegen'],
};

describe('Backup', () => {
  it('übersteht einen Export-Import-Durchlauf unverändert', () => {
    const backup = createBackup(
      {
        settings: { ...defaultSettings, realityChecksPerDay: 9 },
        entries: [{ ...entry, mood: 4 }],
        tags: [{ name: 'Fliegen', watched: true }],
        progress: [{ day: 1, completedOn: '2026-10-20' }],
        audio: { 'memo-1.m4a': 'QUJD' },
      },
      new Date('2026-10-24T10:00:00Z'),
    );
    const parsed = parseBackup(JSON.stringify(backup));
    expect(parsed).toEqual({ ok: true, backup, skippedEntries: 0 });
  });

  it('lehnt fremde, kaputte und zu neue Dateien ab', () => {
    expect(parseBackup('{')).toEqual({ ok: false, error: 'Die Datei ist kein gültiges JSON.' });
    expect(parseBackup('[]')).toMatchObject({ ok: false });
    expect(parseBackup(JSON.stringify({ app: 'andere' }))).toMatchObject({ ok: false });
    expect(parseBackup(JSON.stringify({ app: 'luzidio', format: 99 }))).toMatchObject({ ok: false, error: expect.stringMatching(/neueren/) });
    expect(parseBackup(JSON.stringify({ app: 'luzidio' }))).toMatchObject({ ok: false });
  });

  it('überspringt ungültige Einträge und bereinigt Werte', () => {
    const raw = {
      app: 'luzidio',
      format: 1,
      entries: [
        entry,
        { ...entry }, // doppelte ID
        { ...entry, id: '../böse' },
        { ...entry, id: 'x1', dreamDate: '2026-02-30' },
        { ...entry, id: 'x2', body: '  ', audioFile: null },
        { ...entry, id: 'x3', audioFile: '../../etc/passwd', mood: 9, clarity: 12, tags: ['a', 'A', 3], createdAt: 'nie' },
        'unsinn',
      ],
      tags: [{ name: 'Fliegen', watched: true }, { name: '  ' }, 'x'],
      progress: [{ day: 1, completedOn: '2026-10-20' }, { day: 31, completedOn: '2026-10-20' }, { day: 2, completedOn: 'gestern' }],
      audio: { 'memo-1.m4a': 'QUJD', 'fremd.m4a': 'QUJD', 'memo-2.m4a': 123 },
      settings: { realityChecksPerDay: 99 },
    };
    const res = parseBackup(JSON.stringify(raw));
    if (!res.ok) throw new Error(res.error);
    expect(res.skippedEntries).toBe(5);
    expect(res.backup.entries.map((e) => e.id)).toEqual(['abc-123', 'x3']);
    const x3 = res.backup.entries[1];
    expect(x3).toMatchObject({ audioFile: null, mood: null, clarity: 5, tags: ['a'] });
    expect(Number.isNaN(Date.parse(x3?.createdAt ?? ''))).toBe(false);
    expect(res.backup.tags).toEqual([{ name: 'Fliegen', watched: true }]);
    expect(res.backup.progress).toEqual([{ day: 1, completedOn: '2026-10-20' }]);
    expect(Object.keys(res.backup.audio)).toEqual(['memo-1.m4a']);
    expect(res.backup.settings.realityChecksPerDay).toBe(15);
  });

  it('behält gerätespezifische Einstellungen beim Import', () => {
    const merged = mergeImportedSettings(
      { ...defaultSettings, lockEnabled: true, onboardingDone: true },
      { ...defaultSettings, lockEnabled: false, onboardingDone: false, wakeMinutes: 360 },
    );
    expect(merged).toMatchObject({ lockEnabled: true, onboardingDone: true, wakeMinutes: 360 });
  });

  it('erzeugt einen Dateinamen mit Datum', () => {
    expect(backupFileName(new Date(2026, 0, 5))).toBe('luzidio-backup-2026-01-05.json');
  });
});
