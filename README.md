# Luzidio

Luzidio ist eine deutschsprachige App, mit der Einsteiger in 30 Tagen lernen können, Klarträume zu haben. Sie
nutzt die am besten untersuchten Methoden: Traumtagebuch, Realitätschecks, MILD und WBTB.

Alle Daten bleiben auf dem Gerät. Es gibt kein Backend, kein Konto und keine Tracker.

## Funktionen

- **Onboarding**: Was Klarträume sind, wie das Programm abläuft, Schlafzeiten und die Erlaubnis für Benachrichtigungen.
- **Traumtagebuch**: Ein Traum lässt sich in unter 10 Sekunden notieren. Die Erfassung ist dunkel, hat große Schrift
  und öffnet direkt die Tastatur. Möglich sind Text oder Sprachmemo, Datum, Titel, Stimmung, Klarheit (0–5), ein
  Häkchen „Klartraum“ und Traumzeichen-Tags. Dazu kommen Suche, Filter nach Tags und Klarträumen, Bearbeiten und
  Löschen.
- **Traumzeichen**: Die App zeigt die häufigsten Tags. Eigene Traumzeichen erscheinen in den Erinnerungen.
- **Realitätscheck-Erinnerungen**: 3–15 pro Tag, zufällig, aber gleichmäßig über die Wachzeit verteilt, ohne
  Duplikate. 24 eigene Texte plus Vorlagen mit deinen Traumzeichen. Die App plant bei jedem Öffnen nach. Dabei
  korrigiert sie Wechsel von Zeitzone und Sommerzeit.
- **30-Tage-Programm**: 30 selbst geschriebene Lektionen (je 2–3 Minuten) mit einer Aufgabe pro Tag. Woche 1 behandelt
  die Traumerinnerung, Woche 2 Realitätschecks und Traumzeichen, Woche 3 MILD, Woche 4 WBTB und das Stabilisieren. Der
  nächste Tag wird am Folgetag frei, sobald der Vortag erledigt ist.
- **Geführte Übungen**: MILD und eine Einschlaf-Anleitung. Die App liest sie in ruhigem Tempo vor (expo-speech). Ein
  Timer stoppt automatisch und der Bildschirm bleibt während der Übung an.
- **WBTB-Wecker**: Die Weckzeit ist Schlafenszeit plus 4,5–6 Stunden. Der Wecker gilt immer nur für eine Nacht und
  weckt mit einer sanften Benachrichtigung. Die App weist darauf hin, WBTB nicht jede Nacht zu nutzen.
- **Statistik**: Einträge pro Woche, Klarträume, Serie und Rekord, Erinnerungsquote, durchschnittliche Klarheit und die
  häufigsten Traumzeichen.
- **Einstellungen**: Zeiten, Anzahl der Checks, Morgen-Erinnerung, Sprechtempo mit Hörprobe, Darstellung
  (dunkel/hell/System) und App-Sperre per Face ID, Fingerabdruck oder Gerätecode. Dazu Export und Import aller Daten
  als JSON (inklusive Sprachmemos) und „Alles löschen“.

## Im Browser ausprobieren

**https://davidflasch2009.github.io/luzidio/**

Die Browser-Version wird bei jedem Push auf `main` automatisch gebaut und veröffentlicht
(`.github/workflows/pages.yml`). Dort funktionieren Tagebuch (Text), Suche und Filter, Traumzeichen, das
30-Tage-Programm, die Übungen mit Vorlesen und die Statistik. Die Daten liegen nur in diesem Browser auf diesem Gerät.

Nur in der Handy-App gibt es: Erinnerungen und WBTB-Wecker, Sprachmemos, App-Sperre sowie Export und Import.

Lokal bauen: `npm run build:web` (Ausgabe in `dist/`). Weil die Browser-Datenbank `SharedArrayBuffer` braucht und
GitHub Pages die nötigen Header nicht setzen kann, ergänzt ein kleiner Service Worker (`web/coi-sw.js`) sie. Beim
allerersten Aufruf lädt die Seite deshalb einmal kurz neu.

## Starten (Handy-App)

Voraussetzungen: Node.js 20 oder neuer, ein Smartphone mit **Expo Go** (SDK 58) aus dem App Store oder Play Store.

```bash
npm install
npx expo start
```

Scanne danach den QR-Code. Auf dem iPhone nutzt du dafür die Kamera-App, auf Android die Expo-Go-App. Handy und
Computer müssen im selben WLAN sein. Klappt das nicht, hilft `npx expo start --tunnel`.

Alle Funktionen laufen auch in einem Development Build. Für den Alltag mit Erinnerungen ist er die zuverlässigere
Wahl:

```bash
npx expo run:ios       # bzw. npx expo run:android  (lokal mit Xcode/Android Studio)
# oder in der Cloud: npx eas-cli@latest build --profile development
```

## Entwicklung

```bash
npm run typecheck      # tsc --noEmit (strict)
npm run lint           # ESLint, 0 Warnungen erlaubt
npm test               # Jest
npm run test:coverage  # mit Abdeckung (Schwelle 80 % für src/logic und src/db)
npm run check          # alles zusammen
```

- Die Logik in `src/logic` (Planung der Erinnerungen, Serien, Statistik, Freischaltung, Export und Import, WBTB,
  Übungsablauf) ist rein funktional und vollständig getestet.
- Die Datenbank-Repositories in `src/db` laufen in den Tests gegen eine echte SQLite (`node:sqlite`), einschließlich
  der Migrationen.
- Komponententests mit React Native Testing Library gibt es für die Tagebuch-Erfassung und das Onboarding.
- Die Struktur und die Projektregeln stehen in [`CLAUDE.md`](CLAUDE.md), der ursprüngliche Plan mit dem
  Datenmodell in [`docs/PLAN.md`](docs/PLAN.md).
- Datenbankänderungen kommen immer als neue Migration in `src/db/migrations.ts` dazu. Die Version steht in
  `PRAGMA user_version`. Updates löschen so keine Daten.
- App-Icon und Splash erzeugt `node scripts/generate-icons.mjs` (benötigt Playwright).

Manuell testen: siehe [`TESTING.md`](TESTING.md).

## Bekannte Einschränkungen

- **Erinnerungen werden im Voraus geplant**: 3 bis 7 Tage, je nach Anzahl pro Tag, weil iOS höchstens
  64 geplante Benachrichtigungen erlaubt. Öffnest du die App länger nicht, enden die Realitätschecks. Am Morgen danach
  erinnert eine Benachrichtigung daran, die App kurz zu öffnen. Ohne Server gibt es keine Planung im Hintergrund.
- **Der WBTB-Wecker ist eine Benachrichtigung, kein echter Wecker.** Er klingelt nicht dauerhaft. Ein aktiver Fokus
  wie „Schlafen“ oder „Nicht stören“ und die Akku-Optimierung von Android können ihn stummschalten oder etwas verzögern.
- **Vorlesen** nutzt die Systemstimme. Ist keine deutsche Stimme installiert, weist die App darauf hin. Während einer
  Übung bleibt der Bildschirm an, weil die App im gesperrten Zustand pausiert.
- **Sprachaufnahmen** enden, wenn die App in den Hintergrund geht. Das bis dahin Aufgenommene bleibt erhalten. Eine
  Aufnahme ist höchstens 10 Minuten lang.
- **Expo Go**: Face ID zeigt den Erlaubnistext von Expo Go, nicht den von Luzidio. Lokale Benachrichtigungen
  funktionieren in Expo Go. Für den täglichen Gebrauch wird trotzdem ein Development Build empfohlen.
- **Keine Synchronisation** zwischen Geräten. Zum Umziehen dienen Export und Import. Exportdateien sind
  unverschlüsselt, bewahre sie sicher auf.
- **Die App-Sperre** schützt die Oberfläche. Die Datenbank selbst ist nicht zusätzlich verschlüsselt (Schutz durch die
  Geräteverschlüsselung des Betriebssystems).
- **Die Browser-Version ist eingeschränkt** (siehe oben) und benötigt einen aktuellen Browser mit Service-Worker-Unterstützung. Im privaten Modus von Firefox funktionieren Service Worker nicht.

## Ideen für Version 2

- Widget für den Sperr- und Homebildschirm („Traum notieren“ mit einem Tipp).
- Realitätschecks per Vibration auf Apple Watch oder Wear OS.
- Lokale Spracherkennung, die Sprachmemos auf dem Gerät in Text umwandelt.
- Automatische Vorschläge für Traumzeichen aus wiederkehrenden Wörtern im Tagebuch.
- Verschlüsselte Datenbank (SQLCipher) und verschlüsselte Exporte mit Passwort.
- Optional eine Ende-zu-Ende-verschlüsselte Synchronisation über iCloud oder einen eigenen Speicher.
- Weitere Techniken (SSILD, FILD) und weitere geführte Übungen mit eigenen Audioaufnahmen.
- Kalender-Heatmap der Traumerinnerung und Auswertungen nach Wochentag.
- Anbindung an Apple Health oder Health Connect, um Schlafdaten neben die Träume zu legen.
- Weitere Sprachen (Englisch zuerst).

## Hinweis

Luzidio ist eine Lern-App und kein Medizinprodukt. Bei Schlafstörungen, häufigen Albträumen oder belastender
Schlafparalyse wende dich bitte an eine Ärztin oder einen Arzt.
