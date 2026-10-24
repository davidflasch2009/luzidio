import { setAudioModeAsync } from 'expo-audio';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import type { Exercise } from '../../content/exercises';
import { GuidedSession, type SessionState } from '../../logic/guidedSession';
import { createSpeaker } from '../../services/speech';

const KEEP_AWAKE_TAG = 'guided-exercise';

const initial: SessionState = { phase: 'idle', segment: -1, currentText: null, endsAt: null, finishReason: null };

/** React-Anbindung an GuidedSession inkl. Aufräumen und Hintergrund-Handling. */
export function useGuidedSession(exercise: Exercise, rate: number) {
  const [state, setState] = useState<SessionState>(initial);
  const session = useRef<GuidedSession | null>(null);

  const start = useCallback(
    (durationMinutes: number, voice: boolean) => {
      session.current?.dispose();
      const s = new GuidedSession(exercise, createSpeaker(rate), {
        durationMs: durationMinutes > 0 ? durationMinutes * 60_000 : null,
        voice,
        onChange: setState,
      });
      session.current = s;
      // Hörbar auch im Stumm-Modus (iOS) und ohne dass das Gerät während der Übung sperrt –
      // sonst pausiert die App und die Anleitung bricht ab.
      setAudioModeAsync({ playsInSilentMode: true }).catch(() => undefined);
      activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => undefined);
      s.start();
    },
    [exercise, rate],
  );

  const stop = useCallback(() => session.current?.stop(), []);

  const running = state.phase === 'guide' || state.phase === 'repeat';
  useEffect(() => {
    if (!running) deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => undefined);
  }, [running]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') session.current?.checkTimeout();
    });
    return () => {
      sub.remove();
      session.current?.dispose();
      session.current = null;
      deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => undefined);
    };
  }, []);

  return { state, start, stop };
}
