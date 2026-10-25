import { Alert, Platform } from 'react-native';

/** true in der Browser-Version (GitHub Pages). Dort fehlen Benachrichtigungen, Mikrofon-Speicher, Biometrie und Dateizugriff. */
export const isWeb = Platform.OS === 'web';

/** Hinweis für Funktionen, die nur in der Handy-App verfügbar sind. */
export const appOnlyHint = 'Diese Funktion gibt es nur in der Handy-App (Expo Go oder installierte App).';

/**
 * Bestätigungsdialog, der auch im Browser funktioniert
 * (React Native Alert zeigt im Web keine Schaltflächen an).
 */
export function confirmAction(title: string, message: string, confirmLabel: string, cancelLabel = 'Abbrechen'): Promise<boolean> {
  if (isWeb) {
    const confirmFn = (globalThis as { confirm?: (text: string) => boolean }).confirm;
    return Promise.resolve(confirmFn ? confirmFn(`${title}\n\n${message}`) : false);
  }
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: cancelLabel, style: 'cancel', onPress: () => resolve(false) },
        { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}
