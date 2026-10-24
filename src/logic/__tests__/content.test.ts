import { getLesson, lessons, lessonText } from '../../content/lessons';
import { morningReminder, realityCheckTexts, refillReminder, signTemplates } from '../../content/realityChecks';
import { PROGRAM_DAYS, readingMinutes } from '../program';

describe('Lektionen', () => {
  it('gibt es für jeden der 30 Tage genau einmal, in Reihenfolge', () => {
    expect(lessons.map((l) => l.day)).toEqual(Array.from({ length: PROGRAM_DAYS }, (_, i) => i + 1));
    expect(getLesson(15)?.title).toMatch(/MILD/);
    expect(getLesson(31)).toBeUndefined();
  });

  it.each(lessons.map((l) => [l.day, l] as const))('Tag %i hat 2–3 Minuten Lesezeit und eine konkrete Aufgabe', (_day, l) => {
    const minutes = readingMinutes(lessonText(l));
    expect(minutes).toBeGreaterThanOrEqual(2);
    expect(minutes).toBeLessThanOrEqual(3);
    expect(l.task.steps.length).toBeGreaterThanOrEqual(2);
    expect(l.summary.length).toBeGreaterThan(10);
  });

  it('enthält keine Platzhalter', () => {
    const all = lessons.map(lessonText).join(' ');
    expect(all).not.toMatch(/TODO|Lorem|XXX|\{sign\}/i);
  });
});

describe('Erinnerungstexte', () => {
  it('reichen für 15 Checks pro Tag ohne Wiederholung', () => {
    expect(new Set(realityCheckTexts.map((t) => t.body)).size).toBeGreaterThanOrEqual(15);
  });

  it('Vorlagen enthalten den Platzhalter für Traumzeichen', () => {
    for (const t of signTemplates) expect(t.body).toContain('{sign}');
    expect(refillReminder.body.length).toBeGreaterThan(10);
    expect(morningReminder.title.length).toBeGreaterThan(5);
  });
});
