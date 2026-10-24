# Luzidio – manuelle Testcheckliste (Expo Go)

Vorbereitung: `npm install`, `npx expo start`, QR-Code mit dem Handy scannen. Wenn nötig, Luzidio vorher löschen bzw.
in den Einstellungen „Alles löschen“ ausführen, damit du beim Onboarding startest. Hake jeden Punkt ab. Wo nichts
anderes steht, auf iOS **und** Android prüfen.

## 1. Start, Icon, Splash

- [ ] Beim Start erscheint der Splash (Mondsichel mit Stern auf Nachtblau) und verschwindet von selbst.
- [ ] Ohne Daten öffnet sich das Onboarding statt der Tabs.

## 2. Onboarding

- [ ] Schritt 1 erklärt Klarträume. Die Punkte oben zeigen „1 von 4“.
- [ ] Schritt 2 zeigt die vier Wochen und den Gesundheitshinweis.
- [ ] Schritt 3: Mit +/– ändern sich Aufwachen und Schlafen in 15-Minuten-Schritten. Nach 23:45 kommt 00:00.
      Die Zahl der Checks bleibt zwischen 3 und 15.
- [ ] „Zurück“ geht einen Schritt zurück, die Werte bleiben erhalten.
- [ ] Schritt 4: „Benachrichtigungen erlauben“ zeigt den Systemdialog. Erlauben führt zu „✓ erlaubt“.
- [ ] Mit „Los geht's“ landest du auf „Heute“. Die Zeiten stehen in den Einstellungen.
- [ ] Gegenprobe (frisch installiert): Erlaubnis verweigern. Es erscheint ein Hinweis, die App startet trotzdem.
- [ ] Gegenprobe: „Später“ auf Schritt 4 startet die App ohne Dialog.

## 3. Heute

- [ ] Datum, Begrüßung passend zur Tageszeit, großer Button „Traum notieren“.
- [ ] Die Tageslektion zeigt „Tag 1“ mit Kurztext und Lesezeit.
- [ ] Die Karte „Realitätschecks“ zeigt die nächste Erinnerung („gegen HH:MM Uhr“). Ohne Erlaubnis erscheint
      stattdessen ein roter Hinweis mit „Systemeinstellungen öffnen“.
- [ ] „Jetzt einen Check machen“ zeigt einen Check-Text, ein weiteres Tippen zeigt einen anderen.
- [ ] Die Buttons MILD, Einschlafen und WBTB-Wecker öffnen die jeweiligen Bildschirme.
- [ ] Die Karten blenden ruhig ein. Mit „Bewegung reduzieren“ in den Bedienungshilfen gibt es keine Animation.

## 4. Traumtagebuch – Schnellerfassung

- [ ] „Traum notieren“ öffnet einen sehr dunklen Bildschirm. Die Tastatur ist sofort offen, die Schrift ist groß.
- [ ] Zeitprobe: App öffnen → Traum notieren → zwei Wörter tippen → „Traum speichern“. Das dauert unter 10 Sekunden.
- [ ] Ohne Text und ohne Memo erscheint beim Speichern der Hinweis „Schreib ein paar Worte …“.
- [ ] Datum: Der Pfeil links springt auf „Gestern“. Der Pfeil rechts lässt sich nicht über „Heute“ hinaus drücken.
- [ ] „Details hinzufügen“ zeigt Titel, Stimmung (Emojis), Klarheit 0–5 und Traumzeichen.
- [ ] Tags: „Fliegen, Schule“ und „Hinzufügen“ ergibt zwei Chips. Ein × entfernt einen Chip. Vorschläge
      („+ Name“) übernehmen bekannte Tags.
- [ ] Mit Text eingegeben und „Zurück“ gewischt oder getippt: Es kommt die Frage „Änderungen verwerfen?“. Mit
      „Weiter bearbeiten“ bleibt der Text erhalten.

### Sprachmemo

- [ ] „Sprachmemo aufnehmen“ fragt beim ersten Mal nach dem Mikrofon. Nach dem Erlauben läuft die Aufnahme mit
      Zeitanzeige.
- [ ] „Aufnahme beenden“ zeigt den Player. Abspielen und Pause funktionieren, auch im Stumm-Modus (iOS).
- [ ] Mit dem Mülleimer ist das Memo wieder weg. Ein nur mit Memo gespeicherter Eintrag heißt „Sprachmemo“.
- [ ] Mikrofon in den Systemeinstellungen verweigern und erneut aufnehmen: Ein Hinweis erscheint, dazu
      „Einstellungen öffnen“. Text-Einträge funktionieren weiter.
- [ ] Während der Aufnahme die App in den Hintergrund schicken und zurückkehren: Die Aufnahme ist beendet, der
      Player zeigt das Aufgenommene.

## 5. Tagebuch-Liste, Suche, Filter, Bearbeiten, Löschen

- [ ] Mindestens drei Einträge anlegen (einer davon als Klartraum, verschiedene Tags). Die Liste ist neueste zuerst
      und zeigt Datum, Titel, Auszug, #Tags, ✦ Klartraum, Mikrofon-Symbol und Emoji.
- [ ] Die Suche findet Wörter aus Titel, Text und Tags, ohne auf Groß- und Kleinschreibung zu achten
      (auch „über“ und „ÜBER“).
- [ ] „✦ Nur Klarträume“ und Tag-Chips filtern. Bei keinem Treffer erscheint „Nichts gefunden“ mit „Filter
      zurücksetzen“.
- [ ] Ein Eintrag öffnet die Detailansicht. „Bearbeiten“ ändert Felder, „Änderungen speichern“ übernimmt sie in Liste
      und Detail.
- [ ] Beim Bearbeiten das Memo durch ein neues ersetzen: Das neue spielt ab.
- [ ] „Löschen“ fragt nach. Nach dem Bestätigen ist der Eintrag weg, ebenso nicht mehr verwendete Tags.
- [ ] Ohne Einträge zeigt das Tagebuch den leeren Zustand „Noch keine Träume“.

## 6. Traumzeichen

- [ ] Einstellungen → „Traumzeichen verwalten“ (oder Statistik) zeigt die häufigsten Tags mit Zähler und Balken.
- [ ] Der Schalter „Für Realitätschecks nutzen“ markiert einen Tag. Er erscheint dann oben als Chip.
- [ ] Ein eigenes Traumzeichen (z. B. „verpasster Zug“) lässt sich hinzufügen und mit × wieder entfernen.

## 7. Realitätscheck-Erinnerungen

- [ ] Einstellungen: Checks pro Tag auf 15 stellen. Unter „Heute“ ändert sich die nächste Zeit, sie liegt in der
      Wachzeit.
- [ ] Test im Kurzformat: Aufwachen auf die aktuelle Zeit minus 30 Minuten stellen, Schlafen auf plus 2 Stunden, 15
      Checks. Innerhalb der nächsten Stunde kommen mehrere Erinnerungen mit wechselnden Texten.
- [ ] Mit markierten Traumzeichen erwähnt etwa jede dritte Erinnerung das Traumzeichen.
- [ ] Eine Erinnerung antippen öffnet die App auf „Heute“.
- [ ] Bei offener App erscheint die Erinnerung als Banner.
- [ ] Realitätschecks ausschalten: Es kommen keine Erinnerungen mehr. Unter „Heute“ steht „ausgeschaltet“.
- [ ] Erlaubnis in den Systemeinstellungen entziehen, App öffnen: Unter „Heute“ und in den Einstellungen steht der
      Hinweis. Erneut erlauben und zurück in die App: Die Erinnerungen sind wieder geplant.
- [ ] Gerät neu starten (ohne App zu öffnen): Die Erinnerungen kommen weiterhin.
- [ ] Zeitzone in den Systemeinstellungen ändern (automatisch aus) und App öffnen: Die nächste Erinnerung liegt
      wieder in der Wachzeit nach lokaler Uhrzeit.
- [ ] Morgen-Erinnerung: Zur Aufwachzeit kommt „Guten Morgen – woran erinnerst du dich?“. Antippen öffnet die
      Schnellerfassung.

## 8. 30-Tage-Programm

- [ ] Der Tab „Programm“ zeigt 0/30, vier Wochenüberschriften und Tag 1 als verfügbar. Alle anderen Tage haben ein
      Schloss und lassen sich nicht antippen.
- [ ] Tag 1 öffnen: Text lesen, die Aufgabe ist nummeriert, der Link (z. B. „So sieht die Schnellerfassung aus“)
      funktioniert.
- [ ] „Aufgabe erledigt“ führt zu „✓ abgeschlossen“. Tag 2 bleibt gesperrt mit „wird morgen freigeschaltet“ (Heute,
      Programm).
- [ ] Am nächsten Tag (oder Gerätedatum +1 Tag): Tag 2 ist verfügbar.
- [ ] Einige Tage nicht öffnen: Danach ist genau der nächste Tag verfügbar, keiner wurde übersprungen.
- [ ] Erledigte Lektionen lassen sich jederzeit wieder öffnen.

## 9. Geführte Übungen

- [ ] MILD öffnen: dunkler Bildschirm mit Intro, „Vorlesen“, Timer-Chips (Aus/5–30 Min.) und dem Hinweis, dass
      der Bildschirm anbleibt.
- [ ] „Starten“ mit Vorlesen: Eine ruhige deutsche Stimme liest, der aktuelle Abschnitt ist hervorgehoben, die
      Restzeit zählt herunter.
- [ ] Das Tempo passt zu „Sprechtempo“ in den Einstellungen („Probe hören“ prüft es vorab).
- [ ] Mit Timer 5 Min.: Nach der Anleitung kommen ruhige Wiederholungssätze. Nach 5 Minuten stoppt alles von selbst
      („Der Timer ist abgelaufen …“).
- [ ] Der Bildschirm sperrt sich während der Übung nicht automatisch.
- [ ] „Beenden“ stoppt die Stimme sofort. Den Bildschirm verlassen stoppt sie ebenfalls.
- [ ] „Vorlesen“ aus: Die Abschnitte werden nur hervorgehoben, es gibt keinen Ton.
- [ ] Gleiches für die Einschlaf-Anleitung.
- [ ] Ohne deutsche Systemstimme erscheint der Hinweis.

## 10. WBTB-Wecker

- [ ] Die Weckzeit ist Schlafenszeit plus Abstand (z. B. 23:00 + 5 Std. = 04:00). Die Chips 4,5/5/5,5/6 Std.
      ändern sie.
- [ ] Der Hinweis „Bitte nicht jede Nacht“ und der Fokus-Tipp sind sichtbar.
- [ ] Schlafenszeit 01:00, Aufwachen 06:00, 6 Std.: Es erscheint eine rote Warnung „nach deiner Aufwachzeit“.
- [ ] Test: Schlafenszeit auf jetzt minus 4 h 25 min stellen, 4,5 Std. wählen, „Für diese Nacht aktivieren“. Etwa
      5 Minuten später kommt „Zeit für WBTB“ mit Ton. Antippen öffnet die MILD-Übung.
- [ ] Nach dem Aktivieren steht „Wecker aktiv“ mit Datum und Uhrzeit. „Wecker löschen“ entfernt ihn.
- [ ] Der Wecker gilt nur für eine Nacht. In der folgenden Nacht kommt kein weiterer.

## 11. Statistik

- [ ] Ohne Einträge erscheint der leere Zustand mit „Ersten Traum notieren“.
- [ ] Mit Einträgen: Die Kacheln zeigen Klarträume gesamt (mit %), Träume notiert, aktuelle Serie und Rekord sowie
      Ø Klarheit.
- [ ] Die Serie zählt nur aufeinanderfolgende Tage. Sie gilt noch, wenn heute nichts notiert ist, gestern aber schon.
- [ ] Erinnerungsquote: „An X von Y Tagen …“ ab dem ersten Eintrag, höchstens 30 Tage.
- [ ] Einträge pro Woche: 8 Säulen. Antippen einer Säule zeigt Anzahl und Klarträume der Woche.
- [ ] Die häufigsten Traumzeichen erscheinen als Balken, markierte mit ✦.

## 12. Einstellungen

- [ ] Zeiten ändern: Bei sehr kurzer Wachzeit (< 4 h) erscheint ein roter Hinweis.
- [ ] Darstellung „Hell“ schaltet sofort um, alle Bildschirme sind gut lesbar. „System“ folgt dem Gerätemodus.
- [ ] Sprechtempo: „Probe hören“ liest einen Satz im gewählten Tempo.

### App-Sperre

- [ ] Einschalten verlangt Face ID oder Fingerabdruck. Abbrechen lässt die Sperre aus und zeigt eine Meldung.
- [ ] App schließen (aus dem App-Umschalter) und neu öffnen: Der Sperrbildschirm erscheint und fragt automatisch nach
      Face ID oder Fingerabdruck.
- [ ] Im App-Umschalter ist der Inhalt verdeckt.
- [ ] Unter 30 Sekunden in einer anderen App (z. B. Teilen-Dialog) wird nicht erneut gesperrt. Nach über 30 Sekunden
      wird gesperrt.
- [ ] Einen halb geschriebenen Traum offen lassen, über 30 s weg, entsperren: Der Text ist noch da.
- [ ] Gerät ohne eingerichtete Biometrie oder Gerätecode: Der Schalter ist deaktiviert, mit Erklärung.

### Export, Import, Alles löschen

- [ ] „Daten exportieren“ öffnet den Teilen-Dialog mit `luzidio-backup-JJJJ-MM-TT.json`. In „Dateien“ speichern.
- [ ] „Alles löschen“ fragt zweimal nach. Danach startet das Onboarding, Tagebuch und Statistik sind leer und es
      kommen keine Erinnerungen mehr.
- [ ] Onboarding durchlaufen, dann „Daten importieren“ und die gespeicherte Datei wählen. Die Meldung zeigt die
      Anzahl der Einträge, Traumzeichen und Programmtage. Einträge (inklusive Sprachmemos), Fortschritt und
      Traumzeichen sind zurück.
- [ ] Dieselbe Datei noch einmal importieren: keine doppelten Einträge.
- [ ] Eine beliebige andere Datei (z. B. ein Foto oder eine fremde JSON-Datei) importieren: verständliche
      Fehlermeldung, nichts geht kaputt.
- [ ] Den Import-Dialog abbrechen: keine Meldung.

## 13. Barrierefreiheit

- [ ] VoiceOver (iOS) bzw. TalkBack (Android) an: Tabs, Buttons, Schalter, Bewertungen, Stepper und Diagrammsäulen
      werden verständlich vorgelesen. Stepper lassen sich mit Wischen nach oben und unten verstellen.
- [ ] Systemschrift auf sehr groß: Texte sind lesbar, nichts überlappt auf Kernbildschirmen.
- [ ] Alle Touch-Ziele lassen sich bequem treffen (mindestens etwa Fingerkuppen-Größe).

## 14. Robustheit

- [ ] App während eines Eintrags komplett beenden und neu starten: Die App startet normal, gespeicherte Einträge sind
      vorhanden.
- [ ] Flugmodus: Alle Funktionen gehen weiter (kein Netz nötig).
- [ ] Nach Mitternacht die App aus dem Hintergrund holen: „Heute“ zeigt das neue Datum, eine freigeschaltete Lektion
      erscheint.
- [ ] App-Update simulieren: Einträge anlegen, `git pull` bzw. neue Version laden, neu starten. Die Einträge sind
      noch da.
