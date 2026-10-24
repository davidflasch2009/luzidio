import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { toDateKey } from '../logic/dates';

/** Heutiges lokales Datum; aktualisiert sich beim Zurückkehren in die App und um Mitternacht. */
export function useToday(): string {
  const [today, setToday] = useState(() => toDateKey(new Date()));
  useEffect(() => {
    const refresh = () => setToday(toDateKey(new Date()));
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') refresh();
    });
    const now = new Date();
    const msToMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5).getTime() - now.getTime();
    const timer = setTimeout(refresh, Math.max(1000, msToMidnight));
    return () => {
      sub.remove();
      clearTimeout(timer);
    };
  }, [today]);
  return today;
}
