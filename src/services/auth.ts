import * as LocalAuthentication from 'expo-local-authentication';

export type BiometricStatus = { available: boolean; reason: string | null };

/** Prüft, ob eine Sperre per Face ID, Fingerabdruck oder Gerätecode möglich ist. */
export async function getBiometricStatus(): Promise<BiometricStatus> {
  try {
    const hardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    const level = await LocalAuthentication.getEnrolledLevelAsync();
    if (hardware && enrolled) return { available: true, reason: null };
    if (level !== LocalAuthentication.SecurityLevel.NONE) return { available: true, reason: null };
    return {
      available: false,
      reason: hardware
        ? 'Richte zuerst Face ID, einen Fingerabdruck oder eine Gerätesperre in den Systemeinstellungen ein.'
        : 'Dieses Gerät unterstützt keine biometrische Entsperrung und hat keine Gerätesperre.',
    };
  } catch {
    return { available: false, reason: 'Die Gerätesperre konnte nicht geprüft werden.' };
  }
}

export async function authenticate(reason = 'Luzidio entsperren'): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      cancelLabel: 'Abbrechen',
      disableDeviceFallback: false,
    });
    return result.success;
  } catch {
    return false;
  }
}
