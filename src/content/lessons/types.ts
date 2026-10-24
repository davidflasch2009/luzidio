export type Lesson = {
  day: number;
  title: string;
  /** Ein Satz als Vorschau in der Programmübersicht. */
  summary: string;
  paragraphs: string[];
  task: {
    title: string;
    steps: string[];
  };
  /** Optionaler Verweis auf eine Funktion der App. */
  link?: { label: string; href: '/entry/new' | '/dreamsigns' | '/exercise/mild' | '/exercise/sleep' | '/wbtb' | '/settings' };
};

export function lessonText(l: Lesson): string {
  return [l.title, ...l.paragraphs, l.task.title, ...l.task.steps].join(' ');
}
