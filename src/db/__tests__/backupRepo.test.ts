import { createTestDb } from '../../test-utils/testDb';
import { deleteAllData, importData, readAllData } from '../backupRepo';
import { createEntry, listEntries } from '../entries';
import { migrate } from '../migrations';
import { completeDay } from '../progress';
import { saveSettings } from '../settingsRepo';
import { setWatched } from '../tags';
import { defaultSettings } from '../../logic/settings';

async function setup() {
  const db = createTestDb();
  await migrate(db);
  return db;
}

const input = {
  dreamDate: '2026-10-20',
  title: 'T',
  body: 'B',
  audioFile: null,
  mood: null,
  clarity: 1,
  isLucid: false,
  tags: ['Schule'],
};

describe('backupRepo', () => {
  it('exportiert alles und importiert es in eine leere Datenbank', async () => {
    const source = await setup();
    await createEntry(source, input);
    await setWatched(source, 'Fliegen', true);
    await completeDay(source, 1, '2026-10-20');
    await saveSettings(source, { ...defaultSettings, realityChecksPerDay: 4 });
    const data = await readAllData(source);
    expect(data.settings.realityChecksPerDay).toBe(4);
    expect(data.tags).toEqual(expect.arrayContaining([{ name: 'Fliegen', watched: true }, { name: 'Schule', watched: false }]));

    const target = await setup();
    const summary = await importData(target, data);
    expect(summary).toEqual({ entries: 1, signs: 1, days: 1 });
    expect(await readAllData(target)).toEqual({ ...data, settings: defaultSettings });
    // erneuter Import dupliziert nichts
    await importData(target, data);
    expect(await listEntries(target)).toHaveLength(1);
  });

  it('löscht alle Daten', async () => {
    const db = await setup();
    await createEntry(db, input);
    await completeDay(db, 1, '2026-10-20');
    await saveSettings(db, defaultSettings);
    await deleteAllData(db);
    const data = await readAllData(db);
    expect(data).toEqual({ entries: [], tags: [], progress: [], settings: defaultSettings });
  });
});
