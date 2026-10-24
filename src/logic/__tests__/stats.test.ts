import {
  currentStreak,
  entriesPerWeek,
  formatPercent,
  longestStreak,
  recallRate,
  summarize,
  topDreamSigns,
} from '../stats';

const e = (dreamDate: string, isLucid = false, clarity = 0, audioFile: string | null = null) => ({
  dreamDate,
  isLucid,
  clarity,
  audioFile,
});

describe('entriesPerWeek', () => {
  it('zählt Einträge und Klarträume pro Woche', () => {
    const weeks = entriesPerWeek(
      [e('2026-10-24', true), e('2026-10-19'), e('2026-10-18'), e('2026-08-01'), e('2026-10-24')],
      '2026-10-24',
      3,
    );
    expect(weeks).toEqual([
      { weekStart: '2026-10-05', count: 0, lucid: 0 },
      { weekStart: '2026-10-12', count: 1, lucid: 0 },
      { weekStart: '2026-10-19', count: 3, lucid: 1 },
    ]);
  });
});

describe('Serien', () => {
  it('zählt die aktuelle Serie inkl. gestern', () => {
    const list = [e('2026-10-21'), e('2026-10-22'), e('2026-10-23'), e('2026-10-23')];
    expect(currentStreak(list, '2026-10-23')).toBe(3);
    expect(currentStreak(list, '2026-10-24')).toBe(3);
    expect(currentStreak(list, '2026-10-25')).toBe(0);
    expect(currentStreak([], '2026-10-25')).toBe(0);
  });

  it('funktioniert über die Zeitumstellung hinweg', () => {
    expect(currentStreak([e('2026-10-24'), e('2026-10-25'), e('2026-10-26')], '2026-10-26')).toBe(3);
    expect(currentStreak([e('2026-03-28'), e('2026-03-29'), e('2026-03-30')], '2026-03-30')).toBe(3);
  });

  it('findet die längste Serie', () => {
    expect(longestStreak([e('2026-10-01'), e('2026-10-02'), e('2026-10-05'), e('2026-10-06'), e('2026-10-07')])).toBe(3);
    expect(longestStreak([])).toBe(0);
  });
});

describe('recallRate', () => {
  it('rechnet ab dem ersten Eintrag', () => {
    const r = recallRate([e('2026-10-20'), e('2026-10-22'), e('2026-10-22')], '2026-10-24');
    expect(r).toEqual({ rate: 2 / 5, daysWithDream: 2, days: 5 });
  });

  it('begrenzt auf das Zeitfenster und ignoriert Zukunftsdaten', () => {
    const r = recallRate([e('2026-01-01'), e('2026-10-24'), e('2026-12-01')], '2026-10-24', 30);
    expect(r).toEqual({ rate: 1 / 30, daysWithDream: 1, days: 30 });
    expect(recallRate([], '2026-10-24')).toBeNull();
    expect(recallRate([e('2027-01-01')], '2026-10-24')).toBeNull();
  });
});

describe('summarize', () => {
  it('fasst zusammen', () => {
    expect(summarize([e('a', true, 4, 'x.m4a'), e('b', false, 1)])).toEqual({
      total: 2,
      lucid: 1,
      lucidShare: 0.5,
      averageClarity: 2.5,
      withAudio: 1,
    });
    expect(summarize([])).toEqual({ total: 0, lucid: 0, lucidShare: 0, averageClarity: null, withAudio: 0 });
  });

  it('liefert Top-Traumzeichen und Prozent', () => {
    const top = topDreamSigns(
      [
        { name: 'A', count: 3, watched: false },
        { name: 'B', count: 0, watched: true },
        { name: 'C', count: 1, watched: false },
      ],
      5,
    );
    expect(top.map((t) => t.name)).toEqual(['A', 'C']);
    expect(formatPercent(0.666)).toBe('67 %');
  });
});
