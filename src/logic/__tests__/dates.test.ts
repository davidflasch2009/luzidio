import {
  addDays,
  atMinutes,
  diffDays,
  formatDateLong,
  formatDateShort,
  formatDuration,
  formatRelativeDay,
  formatTime,
  isDateKey,
  minutesOfDay,
  parseDateKey,
  startOfWeek,
  toDateKey,
} from '../dates';

describe('dates', () => {
  it('wandelt zwischen Date und Schlüssel', () => {
    expect(toDateKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
    expect(parseDateKey('2026-01-05').getDate()).toBe(5);
    expect(() => parseDateKey('5.1.2026')).toThrow();
  });

  it('erkennt gültige Schlüssel', () => {
    expect(isDateKey('2026-02-28')).toBe(true);
    expect(isDateKey('2026-02-30')).toBe(false);
    expect(isDateKey('2026-2-3')).toBe(false);
    expect(isDateKey(12)).toBe(false);
  });

  it('addiert Tage über Monats-, Jahres- und Sommerzeitgrenzen', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-28', 1)).toBe('2026-03-29');
    expect(addDays('2026-03-29', 1)).toBe('2026-03-30');
    expect(addDays('2026-10-25', -1)).toBe('2026-10-24');
    expect(addDays('2026-10-24', 2)).toBe('2026-10-26');
  });

  it('zählt Tagesdifferenzen unabhängig von Sommerzeit', () => {
    expect(diffDays('2026-03-28', '2026-03-30')).toBe(2);
    expect(diffDays('2026-10-24', '2026-10-26')).toBe(2);
    expect(diffDays('2026-01-10', '2026-01-01')).toBe(-9);
  });

  it('baut lokale Uhrzeiten', () => {
    const d = atMinutes('2026-05-01', 7 * 60 + 30);
    expect(d.getHours()).toBe(7);
    expect(d.getMinutes()).toBe(30);
    expect(minutesOfDay(d)).toBe(450);
    const next = atMinutes('2026-05-01', 1440 + 60);
    expect(toDateKey(next)).toBe('2026-05-02');
    expect(next.getHours()).toBe(1);
  });

  it('findet den Wochenanfang (Montag)', () => {
    expect(startOfWeek('2026-10-24')).toBe('2026-10-19'); // Samstag
    expect(startOfWeek('2026-10-19')).toBe('2026-10-19'); // Montag
    expect(startOfWeek('2026-10-25')).toBe('2026-10-19'); // Sonntag
  });

  it('formatiert deutsch', () => {
    expect(formatDateShort('2026-10-24')).toBe('Sa., 24. Okt. 2026');
    expect(formatDateLong('2026-03-01')).toBe('Sonntag, 1. März');
    expect(formatRelativeDay('2026-10-24', '2026-10-24')).toBe('Heute');
    expect(formatRelativeDay('2026-10-23', '2026-10-24')).toBe('Gestern');
    expect(formatRelativeDay('2026-10-25', '2026-10-24')).toBe('Morgen');
    expect(formatRelativeDay('2026-10-01', '2026-10-24')).toBe('Do., 1. Okt. 2026');
    expect(formatTime(new Date(2026, 0, 1, 9, 5))).toBe('09:05');
    expect(formatDuration(65.7)).toBe('1:05');
    expect(formatDuration(-3)).toBe('0:00');
  });
});
