import { realityCheckTexts, signTemplates } from '../../content/realityChecks';
import { atMinutes, minutesOfDay, toDateKey } from '../dates';
import {
  daysAhead,
  nextReminder,
  pickTexts,
  planDayMinutes,
  planningStartDay,
  planRealityChecks,
  type PlanInput,
} from '../realityCheckPlanner';

const base: PlanInput = {
  startDay: '2026-10-24',
  days: 1,
  wakeMinutes: 7 * 60,
  bedMinutes: 23 * 60,
  perDay: 8,
  now: new Date(2026, 9, 24, 0, 0),
  texts: realityCheckTexts,
  signTemplates,
  signs: [],
};

describe('planDayMinutes', () => {
  it.each([3, 6, 10, 15])('verteilt %i Checks ohne Duplikate im Wachfenster', (n) => {
    const m = planDayMinutes('2026-10-24', 420, 1380, n);
    expect(m).toHaveLength(n);
    expect(new Set(m).size).toBe(n);
    for (let i = 1; i < m.length; i++) expect((m[i] as number) - (m[i - 1] as number)).toBeGreaterThanOrEqual(10);
    expect(m[0]).toBeGreaterThanOrEqual(420 + 30);
    expect(m[m.length - 1]).toBeLessThanOrEqual(1380 - 30);
  });

  it('ist pro Tag stabil, aber von Tag zu Tag verschieden', () => {
    expect(planDayMinutes('2026-10-24', 420, 1380, 6)).toEqual(planDayMinutes('2026-10-24', 420, 1380, 6));
    expect(planDayMinutes('2026-10-24', 420, 1380, 6)).not.toEqual(planDayMinutes('2026-10-25', 420, 1380, 6));
  });

  it('unterstützt Schlafenszeiten nach Mitternacht', () => {
    const m = planDayMinutes('2026-10-24', 14 * 60, 2 * 60, 5);
    expect(m).toHaveLength(5);
    expect(m[0]).toBeGreaterThanOrEqual(14 * 60 + 30);
    expect(m[4]).toBeLessThanOrEqual(1440 + 2 * 60 - 30);
  });

  it('kommt mit sehr kurzen Wachfenstern zurecht', () => {
    const m = planDayMinutes('2026-10-24', 600, 606, 15);
    expect(m.length).toBeGreaterThan(0);
    expect(new Set(m).size).toBe(m.length);
  });
});

describe('pickTexts', () => {
  it('wiederholt keine Texte innerhalb eines Tages', () => {
    const texts = pickTexts('2026-10-24', 15, realityCheckTexts, signTemplates, []);
    expect(new Set(texts.map((t) => t.body)).size).toBe(15);
  });

  it('nutzt eigene Traumzeichen in etwa jeder dritten Erinnerung', () => {
    const texts = pickTexts('2026-10-24', 9, realityCheckTexts, signTemplates, ['Fliegen', 'Schule']);
    const withSign = texts.filter((t) => t.body.includes('Fliegen') || t.body.includes('Schule'));
    expect(withSign).toHaveLength(3);
    expect(texts.every((t) => !t.body.includes('{sign}') && !t.title.includes('{sign}'))).toBe(true);
  });

  it('wirft ohne Texte', () => {
    expect(() => pickTexts('2026-10-24', 1, [], [], [])).toThrow();
  });
});

describe('planRealityChecks', () => {
  it('plant mehrere Tage mit eindeutigen IDs und nur in der Zukunft', () => {
    const now = new Date(2026, 9, 24, 15, 0);
    const plan = planRealityChecks({ ...base, days: 3, now });
    expect(new Set(plan.map((p) => p.id)).size).toBe(plan.length);
    expect(plan.every((p) => p.date.getTime() > now.getTime())).toBe(true);
    expect(plan.filter((p) => p.dayKey === '2026-10-25')).toHaveLength(8);
    expect(plan.filter((p) => p.dayKey === '2026-10-24').length).toBeLessThan(8);
  });

  it('bleibt bei Zeitumstellung auf lokaler Wanduhrzeit (Ende Sommerzeit)', () => {
    // 25.10.2026: Uhren werden in Europa/Berlin von 3:00 auf 2:00 zurückgestellt.
    const plan = planRealityChecks({ ...base, startDay: '2026-10-25', days: 1, now: new Date(2026, 9, 24, 12) });
    const expected = planDayMinutes('2026-10-25', 420, 1380, 8);
    expect(plan.map((p) => minutesOfDay(p.date))).toEqual(expected);
    expect(plan.every((p) => toDateKey(p.date) === '2026-10-25')).toBe(true);
  });

  it('bleibt bei Beginn der Sommerzeit korrekt', () => {
    const plan = planRealityChecks({ ...base, startDay: '2026-03-29', days: 1, now: new Date(2026, 2, 28, 12) });
    expect(plan.map((p) => minutesOfDay(p.date))).toEqual(planDayMinutes('2026-03-29', 420, 1380, 8));
  });

  it('findet die nächste Erinnerung', () => {
    const plan = planRealityChecks({ ...base, days: 2 });
    const first = nextReminder(plan, base.now);
    expect(first?.date.getTime()).toBe(Math.min(...plan.map((p) => p.date.getTime())));
    expect(nextReminder(plan, new Date(2030, 0, 1))).toBeNull();
  });

  it('verwirft doppelte Minuten', () => {
    const plan = planRealityChecks({ ...base, startDay: '2026-10-24', days: 1, perDay: 3, wakeMinutes: 0, bedMinutes: 0 });
    const keys = plan.map((p) => Math.floor(p.date.getTime() / 60000));
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('Hilfsfunktionen', () => {
  it('begrenzt die Tage im Voraus auf das iOS-Limit', () => {
    expect(daysAhead(15)).toBe(3);
    expect(daysAhead(6)).toBe(7);
    expect(daysAhead(3)).toBe(7);
    expect(daysAhead(0)).toBe(7);
    expect(daysAhead(48)).toBe(1);
    expect(daysAhead(100)).toBe(1);
  });

  it('ordnet die Zeit nach Mitternacht dem Vortag zu, wenn spät schlafen gegangen wird', () => {
    expect(planningStartDay(atMinutes('2026-10-25', 60), 14 * 60, 2 * 60, '2026-10-25')).toBe('2026-10-24');
    expect(planningStartDay(atMinutes('2026-10-25', 3 * 60), 14 * 60, 2 * 60, '2026-10-25')).toBe('2026-10-25');
    expect(planningStartDay(atMinutes('2026-10-25', 60), 7 * 60, 23 * 60, '2026-10-25')).toBe('2026-10-25');
  });
});
