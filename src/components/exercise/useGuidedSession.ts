import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import type { Exercise } from '../../content/exercises';
import { GuidedSession, type SessionState } from '../../logic/guidedSession';
import { createSpeaker } from '../../services/speech';

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
      s.start();
    },
    [exercise, rate],
  );

  const stop = useCallback(() => session.current?.stop(), []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') session.current?.checkTimeout();
    });
    return () => {
      sub.remove();
      session.current?.dispose();
      session.current = null;
    };
  }, []);

  return { state, start, stop };
}
