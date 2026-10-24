import { exercises, isExerciseId, type Exercise } from '../../content/exercises';
import { GuidedSession, type SessionState, type Speaker } from '../guidedSession';

const tiny: Exercise = {
  id: 'mild',
  title: 'Test',
  intro: '',
  segments: [
    { text: 'eins', pauseMs: 1000 },
    { text: 'zwei', pauseMs: 1000 },
  ],
  repeat: { phrases: ['wieder'], everyMs: 10000 },
};

/** Fake-Stimme: „spricht“ jeden Text in 500 ms. */
function fakeSpeaker(fail = false) {
  const spoken: string[] = [];
  let pending: ReturnType<typeof setTimeout> | null = null;
  const speaker: Speaker & { spoken: string[]; stops: number } = {
    spoken,
    stops: 0,
    speak(text, cb) {
      spoken.push(text);
      pending = setTimeout(() => (fail ? cb.onError() : cb.onDone()), 500);
    },
    stop() {
      speaker.stops++;
      if (pending) clearTimeout(pending);
    },
  };
  return speaker;
}

describe('GuidedSession', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('liest die Anleitung einmal und endet ohne Timer', () => {
    const speaker = fakeSpeaker();
    const states: SessionState[] = [];
    const s = new GuidedSession(tiny, speaker, { durationMs: null, voice: true, onChange: (x) => states.push(x) });
    s.start();
    expect(s.getState()).toMatchObject({ phase: 'guide', segment: 0, currentText: 'eins' });
    jest.advanceTimersByTime(1500);
    expect(s.getState().segment).toBe(1);
    jest.advanceTimersByTime(1500);
    expect(s.getState()).toMatchObject({ phase: 'finished', finishReason: 'completed' });
    expect(speaker.spoken).toEqual(['eins', 'zwei']);
    expect(states.length).toBeGreaterThan(2);
  });

  it('wiederholt nach der Anleitung und stoppt automatisch beim Timer-Ende', () => {
    let clock = 0;
    const speaker = fakeSpeaker();
    const s = new GuidedSession(tiny, speaker, { durationMs: 30000, voice: true, onChange: () => undefined, now: () => clock });
    s.start();
    expect(s.getState().endsAt).toBe(30000);
    jest.advanceTimersByTime(3000);
    expect(s.getState().phase).toBe('repeat');
    jest.advanceTimersByTime(5000);
    expect(speaker.spoken).toContain('wieder');
    clock = 30000;
    jest.advanceTimersByTime(22000);
    expect(s.getState()).toMatchObject({ phase: 'finished', finishReason: 'timer' });
    expect(speaker.stops).toBeGreaterThan(0);
    const count = speaker.spoken.length;
    jest.advanceTimersByTime(60000);
    expect(speaker.spoken).toHaveLength(count);
  });

  it('lässt sich vom Nutzer stoppen und neu starten', () => {
    const speaker = fakeSpeaker();
    const s = new GuidedSession(tiny, speaker, { durationMs: null, voice: true, onChange: () => undefined });
    s.start();
    s.start(); // doppelter Start wird ignoriert
    s.stop();
    expect(s.getState()).toMatchObject({ phase: 'finished', finishReason: 'user' });
    s.stop();
    s.start();
    expect(s.getState().phase).toBe('guide');
    s.dispose();
    expect(speaker.stops).toBeGreaterThanOrEqual(2);
  });

  it('beendet bei Sprachfehlern mit Grund', () => {
    const s = new GuidedSession(tiny, fakeSpeaker(true), { durationMs: null, voice: true, onChange: () => undefined });
    s.start();
    jest.advanceTimersByTime(600);
    expect(s.getState()).toMatchObject({ phase: 'finished', finishReason: 'error' });
  });

  it('funktioniert auch ohne Stimme (nur Text)', () => {
    const speaker = fakeSpeaker();
    const s = new GuidedSession(tiny, speaker, { durationMs: null, voice: false, onChange: () => undefined });
    s.start();
    jest.advanceTimersByTime(10000);
    expect(s.getState().phase).toBe('finished');
    expect(speaker.spoken).toEqual([]);
  });

  it('beendet abgelaufene Sitzungen nach Rückkehr aus dem Hintergrund', () => {
    let clock = 0;
    const s = new GuidedSession(tiny, fakeSpeaker(), { durationMs: 5000, voice: true, onChange: () => undefined, now: () => clock });
    s.start();
    s.checkTimeout();
    expect(s.getState().phase).toBe('guide');
    clock = 6000;
    s.checkTimeout();
    expect(s.getState().finishReason).toBe('timer');
  });

  it('hat vollständige Übungsinhalte', () => {
    for (const ex of Object.values(exercises)) {
      expect(ex.segments.length).toBeGreaterThan(5);
      expect(ex.repeat.phrases.length).toBeGreaterThan(0);
    }
    expect(isExerciseId('mild')).toBe(true);
    expect(isExerciseId('x')).toBe(false);
  });
});
