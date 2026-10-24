import type { Exercise } from '../content/exercises';

/** Sprachausgabe-Schnittstelle (in der App expo-speech, in Tests ein Fake). */
export interface Speaker {
  speak(text: string, callbacks: { onDone: () => void; onError: () => void }): void;
  stop(): void;
}

export type SessionPhase = 'idle' | 'guide' | 'repeat' | 'finished';
export type FinishReason = 'timer' | 'user' | 'completed' | 'error';

export type SessionState = {
  phase: SessionPhase;
  /** Index des aktuellen Abschnitts in der Anleitung (−1 = keiner). */
  segment: number;
  /** Text, der gerade gesprochen bzw. angezeigt wird. */
  currentText: string | null;
  endsAt: number | null;
  finishReason: FinishReason | null;
};

type Options = {
  /** Dauer bis zum automatischen Stopp; null = Anleitung einmal durchlaufen und enden. */
  durationMs: number | null;
  /** false = nur Text anzeigen, nicht vorlesen. */
  voice: boolean;
  onChange: (state: SessionState) => void;
  now?: () => number;
};

/** Ablauf einer geführten Übung: Anleitung, danach ruhige Wiederholungen bis zum Timer-Ende. */
export class GuidedSession {
  private state: SessionState = { phase: 'idle', segment: -1, currentText: null, endsAt: null, finishReason: null };
  private timers = new Set<ReturnType<typeof setTimeout>>();
  private repeatIndex = 0;
  private readonly now: () => number;

  constructor(
    private readonly exercise: Exercise,
    private readonly speaker: Speaker,
    private readonly options: Options,
  ) {
    this.now = options.now ?? Date.now;
  }

  getState(): SessionState {
    return this.state;
  }

  start(): void {
    if (this.state.phase === 'guide' || this.state.phase === 'repeat') return;
    this.clearTimers();
    this.repeatIndex = 0;
    const endsAt = this.options.durationMs ? this.now() + this.options.durationMs : null;
    this.update({ phase: 'guide', segment: -1, currentText: null, endsAt, finishReason: null });
    if (this.options.durationMs) this.later(() => this.finish('timer'), this.options.durationMs);
    this.playSegment(0);
  }

  stop(): void {
    if (this.state.phase === 'guide' || this.state.phase === 'repeat') this.finish('user');
  }

  /** Nach Rückkehr aus dem Hintergrund: abgelaufene Sitzungen sofort beenden. */
  checkTimeout(): void {
    const { endsAt, phase } = this.state;
    if (endsAt !== null && (phase === 'guide' || phase === 'repeat') && this.now() >= endsAt) this.finish('timer');
  }

  dispose(): void {
    this.clearTimers();
    if (this.state.phase === 'guide' || this.state.phase === 'repeat') this.speaker.stop();
  }

  private playSegment(index: number): void {
    const seg = this.exercise.segments[index];
    if (!seg) {
      this.enterRepeat();
      return;
    }
    this.update({ ...this.state, phase: 'guide', segment: index, currentText: seg.text });
    this.say(seg.text, () => this.later(() => this.playSegment(index + 1), seg.pauseMs));
  }

  private enterRepeat(): void {
    if (!this.options.durationMs) {
      this.finish('completed');
      return;
    }
    this.update({ ...this.state, phase: 'repeat', segment: -1, currentText: null });
    this.later(() => this.repeatNext(), this.exercise.repeat.everyMs / 2);
  }

  private repeatNext(): void {
    if (this.state.phase !== 'repeat') return;
    const phrases = this.exercise.repeat.phrases;
    const text = phrases[this.repeatIndex % phrases.length] as string;
    this.repeatIndex++;
    this.update({ ...this.state, currentText: text });
    this.say(text, () => this.later(() => this.repeatNext(), this.exercise.repeat.everyMs));
  }

  private say(text: string, next: () => void): void {
    if (!this.options.voice) {
      // Ohne Stimme: Lesezeit grob schätzen (ca. 2,5 Wörter pro Sekunde).
      const words = text.split(/\s+/).length;
      this.later(next, Math.max(2000, (words / 2.5) * 1000));
      return;
    }
    let settled = false;
    this.speaker.speak(text, {
      onDone: () => {
        if (settled || !this.isActive()) return;
        settled = true;
        next();
      },
      onError: () => {
        if (settled || !this.isActive()) return;
        settled = true;
        this.finish('error');
      },
    });
  }

  private isActive(): boolean {
    return this.state.phase === 'guide' || this.state.phase === 'repeat';
  }

  private finish(reason: FinishReason): void {
    if (!this.isActive()) return;
    this.clearTimers();
    this.speaker.stop();
    this.update({ ...this.state, phase: 'finished', currentText: null, finishReason: reason });
  }

  private later(fn: () => void, ms: number): void {
    const t = setTimeout(() => {
      this.timers.delete(t);
      fn();
    }, ms);
    this.timers.add(t);
  }

  private clearTimers(): void {
    for (const t of this.timers) clearTimeout(t);
    this.timers.clear();
  }

  private update(next: SessionState): void {
    this.state = next;
    this.options.onChange(next);
  }
}
