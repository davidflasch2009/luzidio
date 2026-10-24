import { useMemo } from 'react';

import { listProgress } from '../db/progress';
import { computeProgramState, type ProgramState } from '../logic/program';
import { useDbQuery } from './useDbQuery';
import { useToday } from './useToday';

export function useProgram(): { state: ProgramState | null; today: string; error: string | null } {
  const today = useToday();
  const progress = useDbQuery(listProgress);
  const state = useMemo(() => (progress.data ? computeProgramState(progress.data, today) : null), [progress.data, today]);
  return { state, today, error: progress.error };
}
