import { canComplete, computeProgramState, PROGRAM_DAYS, programStatusText, readingMinutes, weekOfDay } from '../program';

describe('computeProgramState', () => {
  it('startet mit Tag 1 frei und allem anderen gesperrt', () => {
    const s = computeProgramState([], '2026-10-24');
    expect(s.statuses).toHaveLength(PROGRAM_DAYS);
    expect(s.statuses[0]).toBe('available');
    expect(s.statuses.slice(1).every((x) => x === 'locked')).toBe(true);
    expect(s.currentDay).toBe(1);
    expect(s.nextUnlock).toBeNull();
    expect(s.completedCount).toBe(0);
  });

  it('schaltet den nächsten Tag erst am Folgetag frei', () => {
    const progress = [{ day: 1, completedOn: '2026-10-24' }];
    const same = computeProgramState(progress, '2026-10-24');
    expect(same.statuses[0]).toBe('completed');
    expect(same.statuses[1]).toBe('locked');
    expect(same.currentDay).toBeNull();
    expect(same.nextUnlock).toEqual({ day: 2, on: '2026-10-25' });
    const next = computeProgramState(progress, '2026-10-25');
    expect(next.statuses[1]).toBe('available');
    expect(next.currentDay).toBe(2);
  });

  it('lässt nach einer Pause einfach weitermachen, ohne Tage zu überspringen', () => {
    const progress = [
      { day: 1, completedOn: '2026-10-01' },
      { day: 2, completedOn: '2026-10-02' },
    ];
    const s = computeProgramState(progress, '2026-10-20');
    expect(s.currentDay).toBe(3);
    expect(s.statuses[3]).toBe('locked');
    expect(s.nextUnlock).toBeNull();
  });

  it('behandelt eine zurückgestellte Uhr robust', () => {
    const s = computeProgramState([{ day: 1, completedOn: '2026-10-25' }], '2026-10-23');
    expect(s.statuses[1]).toBe('locked');
    expect(s.nextUnlock).toEqual({ day: 2, on: '2026-10-26' });
  });

  it('ignoriert ungültige Tage und erkennt das Ende', () => {
    const all = Array.from({ length: PROGRAM_DAYS }, (_, i) => ({ day: i + 1, completedOn: '2026-10-01' }));
    const s = computeProgramState([...all, { day: 99, completedOn: '2026-10-01' }], '2026-11-30');
    expect(s.finished).toBe(true);
    expect(s.currentDay).toBeNull();
    expect(s.completedCount).toBe(PROGRAM_DAYS);
  });

  it('erlaubt Abschließen nur für freie Tage', () => {
    const s = computeProgramState([{ day: 1, completedOn: '2026-10-24' }], '2026-10-24');
    expect(canComplete(s, 1)).toBe(false);
    expect(canComplete(s, 2)).toBe(false);
    expect(canComplete(computeProgramState([], '2026-10-24'), 1)).toBe(true);
  });
});

describe('Hilfen', () => {
  it('ordnet Wochen zu', () => {
    expect(weekOfDay(1)).toBe(1);
    expect(weekOfDay(7)).toBe(1);
    expect(weekOfDay(8)).toBe(2);
    expect(weekOfDay(21)).toBe(3);
    expect(weekOfDay(22)).toBe(4);
    expect(weekOfDay(30)).toBe(4);
  });

  it('schätzt Lesezeit', () => {
    expect(readingMinutes('')).toBe(1);
    expect(readingMinutes('wort '.repeat(300))).toBe(2);
    expect(readingMinutes('wort '.repeat(450))).toBe(3);
  });
});

describe('programStatusText', () => {
  it('beschreibt alle Zustände', () => {
    expect(programStatusText(computeProgramState([], '2026-10-24'), '2026-10-24')).toBe('Heute dran: Tag 1');
    const waiting = computeProgramState([{ day: 1, completedOn: '2026-10-24' }], '2026-10-24');
    expect(programStatusText(waiting, '2026-10-24')).toBe('Tag 2 wird morgen freigeschaltet.');
    const clockBack = computeProgramState([{ day: 1, completedOn: '2026-10-26' }], '2026-10-24');
    expect(programStatusText(clockBack, '2026-10-24')).toBe('Tag 2 wird am Di., 27. Okt. 2026 freigeschaltet.');
    const all = Array.from({ length: PROGRAM_DAYS }, (_, i) => ({ day: i + 1, completedOn: '2026-10-01' }));
    expect(programStatusText(computeProgramState(all, '2026-11-30'), '2026-11-30')).toMatch(/abgeschlossen/);
    const gap = { ...computeProgramState([], '2026-10-24'), currentDay: null, nextUnlock: null };
    expect(programStatusText(gap, '2026-10-24')).toBe('');
  });
});
