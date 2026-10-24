# Luzidio – Plan

## Ordnerstruktur

```
assets/                     App-Icon, Splash, Benachrichtigungs-Icon (aus scripts/ generiert)
scripts/                    Generator für Icons (SVG → PNG)
src/
  app/                      Routen (expo-router)
    _layout.tsx             Root: DB-Init, Theme, Sperre, Onboarding-Weiche
    onboarding.tsx
    (tabs)/_layout.tsx      Tabs: Heute | Tagebuch | Programm | Statistik | Einstellungen
    (tabs)/index.tsx        Heute
    (tabs)/journal.tsx
    (tabs)/program.tsx
    (tabs)/stats.tsx
    (tabs)/settings.tsx
    entry/new.tsx           Schnellerfassung (Nachtmodus)
    entry/[id].tsx          Ansehen / Bearbeiten
    lesson/[day].tsx        Lektion + Aufgabe
    exercise/[id].tsx       Geführte Übung (MILD, Einschlafen) mit Vorlesen + Timer
    wbtb.tsx                WBTB-Wecker
    dreamsigns.tsx          Traumzeichen verwalten
  components/               ui/, journal/, program/, stats/, settings/, onboarding/
  content/                  lessons/week1-4.ts, realityChecks.ts, exercises.ts
  db/                       client.ts, migrations.ts, types.ts, entries.ts, tags.ts,
                            progress.ts, settings.ts, backup.ts
  logic/                    dates.ts, random.ts, realityCheckPlanner.ts, streak.ts,
                            stats.ts, programUnlock.ts, wbtb.ts, exportFormat.ts, entryDraft.ts
  services/                 notifications.ts, speech.ts, audioFiles.ts, auth.ts, backupFiles.ts
  store/                    appStore.ts
  theme/                    colors.ts, ThemeProvider.tsx, typography.ts
```

## Datenmodell (SQLite, versioniert über `PRAGMA user_version`)

```sql
-- Migration 1
CREATE TABLE entries (
  id          TEXT PRIMARY KEY,            -- zufällige ID
  dream_date  TEXT NOT NULL,               -- 'YYYY-MM-DD' (lokales Datum der Nacht/des Morgens)
  title       TEXT NOT NULL DEFAULT '',
  body        TEXT NOT NULL DEFAULT '',
  audio_file  TEXT,                        -- nur Dateiname in <document>/audio/
  mood        INTEGER,                     -- 1..5 oder NULL
  clarity     INTEGER NOT NULL DEFAULT 0,  -- 0..5
  is_lucid    INTEGER NOT NULL DEFAULT 0,  -- 0/1
  created_at  TEXT NOT NULL,               -- ISO-Zeitstempel
  updated_at  TEXT NOT NULL
);
CREATE INDEX idx_entries_date ON entries(dream_date);

CREATE TABLE tags (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL UNIQUE COLLATE NOCASE,
  is_watched  INTEGER NOT NULL DEFAULT 0   -- 1 = eigenes Traumzeichen für Realitätschecks
);

CREATE TABLE entry_tags (
  entry_id TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  tag_id   INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (entry_id, tag_id)
);

CREATE TABLE program_progress (
  day          INTEGER PRIMARY KEY,        -- 1..30
  completed_on TEXT NOT NULL               -- 'YYYY-MM-DD'
);

CREATE TABLE settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL                      -- JSON
);
```

## Meilensteine

- (a) Grundgerüst, Navigation, Theme, Icons
- (b) Datenbank + Migrationen + Tagebuch (Text, Sprachmemo, Suche, Filter)
- (c) Traumzeichen + Realitätscheck-Erinnerungen (Planung, Texte, Neuplanung)
- (d) 30-Tage-Programm + 30 Lektionen
- (e) Geführte Übungen (Vorlesen, Timer) + WBTB-Wecker
- (f) Statistik mit Charts
- (g) Einstellungen, Export/Import, App-Sperre, alles löschen
- (h) Onboarding, Feinschliff, README, TESTING.md, Selbst-Review

Nach jedem Meilenstein: `npm run check`, dann Commit auf `main`.
