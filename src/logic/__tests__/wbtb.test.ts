import { minutesOfDay, toDateKey } from '../dates';
import { formatOffset, planWbtb, sleepDuration, wbtbId } from '../wbtb';

describe('planWbtb', () => {
  it('berechnet den Wecker aus Schlafenszeit + Abstand für heute Nacht', () => {
    const now = new Date(2026, 9, 20, 18, 0);
    const plan = planWbtb(now, 23 * 60, 7 * 60, 300);
    expect(plan.nightOf).toBe('2026-10-20');
    expect(toDateKey(plan.alarm)).toBe('2026-10-21');
    expect(minutesOfDay(plan.alarm)).toBe(4 * 60);
    expect(plan.warning).toBeNull();
  });

  it('nimmt mitten in der Nacht noch den aktuellen Wecker, danach die nächste Nacht', () => {
    const night = planWbtb(new Date(2026, 9, 21, 1, 0), 23 * 60, 7 * 60, 300);
    expect(night.nightOf).toBe('2026-10-20');
    const morning = planWbtb(new Date(2026, 9, 21, 9, 0), 23 * 60, 7 * 60, 300);
    expect(morning.nightOf).toBe('2026-10-21');
  });

  it('unterstützt Schlafenszeiten nach Mitternacht', () => {
    const plan = planWbtb(new Date(2026, 9, 20, 20, 0), 30, 8 * 60, 330);
    expect(plan.nightOf).toBe('2026-10-20');
    expect(toDateKey(plan.bedtime)).toBe('2026-10-21');
    expect(minutesOfDay(plan.alarm)).toBe(6 * 60);
  });

  it('bleibt in der Nacht der Zeitumstellung auf Wanduhrzeit', () => {
    // In der Nacht zum 25.10.2026 wird die Uhr zurückgestellt.
    const plan = planWbtb(new Date(2026, 9, 24, 20, 0), 23 * 60, 7 * 60, 300);
    expect(toDateKey(plan.alarm)).toBe('2026-10-25');
    expect(minutesOfDay(plan.alarm)).toBe(4 * 60);
  });

  it('warnt bei zu langem Abstand oder knapper Restschlafzeit', () => {
    expect(planWbtb(new Date(2026, 9, 20, 18), 1 * 60, 6 * 60, 360).warning).toMatch(/nach deiner Aufwachzeit/);
    expect(planWbtb(new Date(2026, 9, 20, 18), 0, 7 * 60, 360).warning).toMatch(/wenig Schlafzeit/);
  });

  it('begrenzt den Abstand auf 4,5 bis 6 Stunden', () => {
    const plan = planWbtb(new Date(2026, 9, 20, 18), 22 * 60, 7 * 60, 60);
    expect(minutesOfDay(plan.alarm)).toBe(2 * 60 + 30);
  });
});

describe('Hilfen', () => {
  it('rechnet Schlafdauer und formatiert', () => {
    expect(sleepDuration(23 * 60, 7 * 60)).toBe(480);
    expect(sleepDuration(60, 9 * 60)).toBe(480);
    expect(sleepDuration(420, 420)).toBe(1440);
    expect(formatOffset(300)).toBe('5 Std.');
    expect(formatOffset(270)).toBe('4,5 Std.');
    expect(wbtbId('2026-10-20')).toBe('wbtb-2026-10-20');
  });
});
