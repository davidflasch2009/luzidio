import { useState } from 'react';
import { Alert } from 'react-native';

import { defaultSettings } from '../../logic/settings';
import { exportAll, importFromFile, wipeEverything } from '../../services/backupFiles';
import { useAppStore } from '../../store/appStore';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export function DataSettings() {
  const [busy, setBusy] = useState<'export' | 'import' | 'delete' | null>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  const doExport = async () => {
    setBusy('export');
    setMessage(null);
    const res = await exportAll();
    setBusy(null);
    setMessage(res.ok ? { text: `Sicherung mit ${res.entries} Einträgen erstellt.`, error: false } : { text: res.error, error: true });
  };

  const doImport = async () => {
    setBusy('import');
    setMessage(null);
    const store = useAppStore.getState();
    const res = await importFromFile(store.settings);
    if (res.ok) {
      await store.updateSettings(res.settings).catch(() => undefined);
      store.bumpRevision();
      const skipped = res.skipped > 0 ? ` ${res.skipped} ungültige Einträge wurden übersprungen.` : '';
      setMessage({
        text: `Import abgeschlossen: ${res.summary.entries} Einträge, ${res.summary.signs} Traumzeichen, ${res.summary.days} Programmtage.${skipped}`,
        error: false,
      });
    } else if (!res.canceled) {
      setMessage({ text: res.error, error: true });
    }
    setBusy(null);
  };

  const wipe = async () => {
    setBusy('delete');
    try {
      await wipeEverything();
      const store = useAppStore.getState();
      await store.updateSettings({ ...defaultSettings });
      store.setUnlocked(false);
      store.bumpRevision();
    } catch {
      setMessage({ text: 'Löschen fehlgeschlagen. Bitte starte die App neu und versuche es erneut.', error: true });
    } finally {
      setBusy(null);
    }
  };

  const confirmWipe = () => {
    Alert.alert(
      'Wirklich alles löschen?',
      'Alle Träume, Sprachmemos, Traumzeichen, dein Programmfortschritt und alle Einstellungen werden endgültig gelöscht. Erstelle vorher eine Sicherung, wenn du die Daten behalten willst.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Weiter',
          style: 'destructive',
          onPress: () =>
            Alert.alert('Letzte Bestätigung', 'Das kann nicht rückgängig gemacht werden.', [
              { text: 'Abbrechen', style: 'cancel' },
              { text: 'Endgültig löschen', style: 'destructive', onPress: wipe },
            ]),
        },
      ],
    );
  };

  return (
    <Card>
      <AppText variant="heading">Deine Daten</AppText>
      <AppText variant="caption" color="textMuted">
        Alles bleibt auf deinem Gerät. Eine Sicherung ist eine JSON-Datei mit allen Einträgen, Sprachmemos, Traumzeichen,
        Fortschritt und Einstellungen. Beim Import werden Daten zusammengeführt, nichts wird überschrieben außer Einträgen
        mit gleicher ID.
      </AppText>
      <Button label="Daten exportieren" icon="share-outline" variant="secondary" onPress={doExport} loading={busy === 'export'} disabled={busy !== null} />
      <Button label="Daten importieren" icon="download-outline" variant="secondary" onPress={doImport} loading={busy === 'import'} disabled={busy !== null} />
      {message ? (
        <AppText variant="body" color={message.error ? 'danger' : 'success'} accessibilityLiveRegion="polite">
          {message.text}
        </AppText>
      ) : null}
      <Button label="Alles löschen" icon="trash-outline" variant="danger" onPress={confirmWipe} loading={busy === 'delete'} disabled={busy !== null} />
    </Card>
  );
}
