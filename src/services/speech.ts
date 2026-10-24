import * as Speech from 'expo-speech';

import type { Speaker } from '../logic/guidedSession';

/** Ruhige deutsche Sprachausgabe über die Systemstimme. */
export function createSpeaker(rate: number): Speaker {
  return {
    speak(text, { onDone, onError }) {
      try {
        Speech.speak(text, { language: 'de-DE', rate, pitch: 0.95, onDone, onError: () => onError() });
      } catch {
        onError();
      }
    },
    stop() {
      Speech.stop().catch(() => undefined);
    },
  };
}

/** true, wenn eine deutsche Stimme installiert ist; null, wenn das nicht ermittelt werden kann. */
export async function hasGermanVoice(): Promise<boolean | null> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    if (voices.length === 0) return null;
    return voices.some((v) => v.language.toLowerCase().startsWith('de'));
  } catch {
    return null;
  }
}

export function previewVoice(rate: number): void {
  Speech.stop()
    .catch(() => undefined)
    .finally(() => {
      Speech.speak('So klingt die Anleitung in diesem Tempo. Atme ruhig ein und aus.', { language: 'de-DE', rate, pitch: 0.95 });
    });
}

export function stopSpeaking(): void {
  Speech.stop().catch(() => undefined);
}
