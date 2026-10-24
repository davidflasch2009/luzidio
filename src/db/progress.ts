import type { Db, ProgressRow } from './types';

export async function listProgress(db: Db): Promise<ProgressRow[]> {
  const rows = await db.getAllAsync<{ day: number; completed_on: string }>(
    'SELECT day, completed_on FROM program_progress ORDER BY day',
  );
  return rows.map((r) => ({ day: r.day, completedOn: r.completed_on }));
}

/** Markiert einen Tag als erledigt; ein bereits erledigter Tag behält sein ursprüngliches Datum. */
export async function completeDay(db: Db, day: number, completedOn: string): Promise<void> {
  await db.runAsync('INSERT OR IGNORE INTO program_progress (day, completed_on) VALUES (?, ?)', [day, completedOn]);
}

export async function resetProgress(db: Db): Promise<void> {
  await db.runAsync('DELETE FROM program_progress');
}
