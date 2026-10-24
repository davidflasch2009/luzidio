import { createTestDb } from '../../test-utils/testDb';
import { createEntry, deleteEntry, getEntry, listAudioFiles, listEntries, updateEntry, upsertEntry } from '../entries';
import { getSchemaVersion, LATEST_VERSION, migrate } from '../migrations';
import { loadSettings, saveSettings } from '../settingsRepo';
import { listTagStats, listWatchedSigns, setWatched } from '../tags';
import type { EntryInput } from '../types';
import { defaultSettings } from '../../logic/settings';

const base: EntryInput = {
  dreamDate: '2026-10-20',
  title: 'Flug über die Stadt',
  body: 'Ich bin über Dächer geflogen.',
  audioFile: null,
  mood: 4,
  clarity: 3,
  isLucid: false,
  tags: ['Fliegen', 'Stadt'],
};

async function setup() {
  const db = createTestDb();
  await migrate(db);
  return db;
}

describe('Migrationen', () => {
  it('legt das Schema an und ist idempotent', async () => {
    const db = createTestDb();
    expect(await getSchemaVersion(db)).toBe(0);
    await migrate(db);
    expect(await getSchemaVersion(db)).toBe(LATEST_VERSION);
    await createEntry(db, base);
    await migrate(db);
    expect(await listEntries(db)).toHaveLength(1);
  });

  it('verweigert Datenbanken aus neueren Versionen', async () => {
    const db = createTestDb();
    await db.execAsync(`PRAGMA user_version = ${LATEST_VERSION + 1}`);
    await expect(migrate(db)).rejects.toThrow(/neueren App-Version/);
  });
});

describe('Einträge', () => {
  it('legt an, liest und listet sortiert', async () => {
    const db = await setup();
    const id1 = await createEntry(db, base, new Date('2026-10-20T06:00:00Z'));
    const id2 = await createEntry(db, { ...base, dreamDate: '2026-10-22', tags: ['stadt', 'Prüfung'] });
    const e = await getEntry(db, id1);
    expect(e).toMatchObject({ id: id1, title: base.title, mood: 4, clarity: 3, isLucid: false, tags: ['Fliegen', 'Stadt'] });
    expect(e?.createdAt).toBe('2026-10-20T06:00:00.000Z');
    const all = await listEntries(db);
    expect(all.map((x) => x.id)).toEqual([id2, id1]);
    // „stadt“ wird dem bestehenden Tag „Stadt“ zugeordnet
    expect(all[0]?.tags).toEqual(['Prüfung', 'Stadt']);
    expect(await getEntry(db, 'gibt-es-nicht')).toBeNull();
  });

  it('aktualisiert Felder und Tags, räumt verwaiste Tags auf', async () => {
    const db = await setup();
    const id = await createEntry(db, base);
    const ok = await updateEntry(db, id, { ...base, isLucid: true, mood: null, tags: ['Wasser'] });
    expect(ok).toBe(true);
    const e = await getEntry(db, id);
    expect(e).toMatchObject({ isLucid: true, mood: null, tags: ['Wasser'] });
    expect((await listTagStats(db)).map((t) => t.name)).toEqual(['Wasser']);
    expect(await updateEntry(db, 'fehlt', base)).toBe(false);
  });

  it('löscht Einträge samt Tags und meldet die Audiodatei', async () => {
    const db = await setup();
    const id = await createEntry(db, { ...base, audioFile: 'memo-1.m4a' });
    expect(await listAudioFiles(db)).toEqual(['memo-1.m4a']);
    expect(await deleteEntry(db, id)).toBe('memo-1.m4a');
    expect(await listEntries(db)).toEqual([]);
    expect(await listTagStats(db)).toEqual([]);
    expect(await deleteEntry(db, id)).toBeNull();
  });

  it('upsert überschreibt vorhandene Einträge', async () => {
    const db = await setup();
    const id = await createEntry(db, base);
    const e = await getEntry(db, id);
    if (!e) throw new Error('fehlt');
    await upsertEntry(db, { ...e, title: 'Neu', tags: ['A'] });
    await upsertEntry(db, { ...e, id: 'neu', tags: [] });
    const all = await listEntries(db);
    expect(all).toHaveLength(2);
    expect((await getEntry(db, id))?.title).toBe('Neu');
  });
});

describe('Traumzeichen', () => {
  it('zählt Tags und verwaltet eigene Traumzeichen', async () => {
    const db = await setup();
    await createEntry(db, base);
    await createEntry(db, { ...base, tags: ['Fliegen'] });
    await setWatched(db, 'Fliegen', true);
    await setWatched(db, '  Zähne  fallen aus ', true);
    await setWatched(db, '   ', true);
    expect(await listWatchedSigns(db)).toEqual(['Fliegen', 'Zähne fallen aus']);
    const stats = await listTagStats(db);
    expect(stats[0]).toEqual({ name: 'Fliegen', count: 2, watched: true });
    expect(stats.find((s) => s.name === 'Zähne fallen aus')).toEqual({ name: 'Zähne fallen aus', count: 0, watched: true });
    await setWatched(db, 'Zähne fallen aus', false);
    await setWatched(db, 'Fliegen', false);
    expect(await listWatchedSigns(db)).toEqual([]);
    expect((await listTagStats(db)).map((t) => t.name)).toEqual(['Fliegen', 'Stadt']);
  });
});

describe('Einstellungen', () => {
  it('speichert und lädt', async () => {
    const db = await setup();
    expect(await loadSettings(db)).toEqual(defaultSettings);
    await saveSettings(db, { ...defaultSettings, realityChecksPerDay: 9 });
    await saveSettings(db, { ...defaultSettings, realityChecksPerDay: 10 });
    expect((await loadSettings(db)).realityChecksPerDay).toBe(10);
    await db.runAsync("UPDATE settings SET value = '{kaputt' WHERE key = 'app'");
    expect(await loadSettings(db)).toEqual(defaultSettings);
  });
});
