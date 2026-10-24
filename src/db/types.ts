/** Minimale Datenbank-Schnittstelle (erfüllt von expo-sqlite und dem Test-Adapter). */
export type SqlParam = string | number | null;

export type RunResult = { changes: number; lastInsertRowId: number };

export interface Db {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, params?: SqlParam[]): Promise<RunResult>;
  getAllAsync<T>(sql: string, params?: SqlParam[]): Promise<T[]>;
  getFirstAsync<T>(sql: string, params?: SqlParam[]): Promise<T | null>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
}

export type Mood = 1 | 2 | 3 | 4 | 5;

export type Entry = {
  id: string;
  dreamDate: string;
  title: string;
  body: string;
  audioFile: string | null;
  mood: Mood | null;
  clarity: number;
  isLucid: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
};

export type EntryInput = Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>;

export type TagStat = { name: string; count: number; watched: boolean };

export type ProgressRow = { day: number; completedOn: string };
