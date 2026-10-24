import type { Lesson } from './types';
import { week1 } from './week1';
import { week2 } from './week2';
import { week3 } from './week3';
import { week4 } from './week4';

export type { Lesson } from './types';
export { lessonText } from './types';

export const lessons: Lesson[] = [...week1, ...week2, ...week3, ...week4];

export function getLesson(day: number): Lesson | undefined {
  return lessons.find((l) => l.day === day);
}
