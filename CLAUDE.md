# Luzidio – Projektregeln

Klartraum-Lern-App (Expo SDK 58, TypeScript strict, expo-router). Alle Daten bleiben
lokal auf dem Gerät: kein Backend, kein Account, keine Tracker, keine Analytics.

## Befehle

```bash
npm start                 # Expo-Dev-Server (Expo Go / Development Build)
npm run typecheck         # tsc --noEmit
npm run lint              # ESLint, 0 Warnungen erlaubt
npm test                  # Jest
npm run test:coverage     # Jest + Abdeckung (Schwelle 80 % für src/logic und src/db)
npm run check             # alles zusammen – muss vor jedem Commit grün sein
EXPO_OFFLINE=1 npx expo install <pkg>   # Pakete SDK-kompatibel installieren
```

## Struktur

- `src/app/` – nur Routen (expo-router). Keine Logik, nur Zusammenstecken.
- `src/components/` – UI-Bausteine, nach Feature gruppiert (`ui/`, `journal/`, …).
- `src/logic/` – reine, getestete Funktionen ohne React/Expo-Imports
  (Planung der Erinnerungen, Streaks, Statistik, Freischaltung, Export-Validierung).
- `src/db/` – SQLite: `migrations.ts` (versioniert über `PRAGMA user_version`),
  Repositories, die nur das `Db`-Interface aus `src/db/types.ts` nutzen
  (in Tests mit `node:sqlite` ausgeführt).
- `src/services/` – dünne Wrapper um native Module (Notifications, Speech, Audio,
  Dateien, Biometrie). Fehler werden hier abgefangen und als Ergebnis zurückgegeben.
- `src/content/` – alle Texte: Lektionen, Realitätscheck-Texte, Übungen. Original
  geschrieben, nichts aus anderen Apps übernehmen.
- `src/store/` – Zustand-Stores (Einstellungen, Daten-Revision).
- `src/theme/` – Farben, Abstände, Typografie.

## Regeln

- Sprache der App: Deutsch, Anrede „du“. Keine medizinischen Versprechen.
- Keine Platzhalter, kein TODO. Jede Funktion ist fertig oder existiert nicht.
- Dateien bleiben unter ~300 Zeilen; Komponenten klein halten.
- Neue Datenbank-Änderungen IMMER als neue Migration anhängen – bestehende
  Migrationen nie ändern. Daten dürfen bei Updates nie verloren gehen.
- Audiodateien werden nur mit Dateinamen gespeichert (nicht mit absolutem Pfad),
  weil sich der App-Container-Pfad auf iOS bei Updates ändert.
- Uhrzeiten: Benachrichtigungen werden aus lokalen Wanduhr-Zeiten erzeugt
  (`new Date(y, m, d, h, min)`), nie durch Addieren von Millisekunden über Tage –
  so bleiben Sommerzeit- und Zeitzonenwechsel korrekt.
- Barrierefreiheit: jedes Touch-Ziel ≥ 48 dp, `accessibilityRole` + `accessibilityLabel`
  für alles Bedienbare, Kontrast ≥ 4.5:1 für Text.
- Animationen ruhig halten und `useReducedMotion` respektieren.
- Fehlerfälle immer behandeln: verweigerte Berechtigungen, leere Zustände,
  App im Hintergrund, Neustart, Zeitzonenwechsel.
- Nach jedem Meilenstein: `npm run check` ohne Fehler und Warnungen, dann committen.
- Expo-APIs ändern sich je SDK: bei Unsicherheit die Typdefinitionen in
  `node_modules/<paket>/build/*.d.ts` lesen, nicht aus dem Gedächtnis arbeiten.
