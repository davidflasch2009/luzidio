import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/** Aktuelle Zeit, minütlich und beim Zurückkehren in die App aktualisiert. */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') setNow(new Date());
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [intervalMs]);
  return now;
}
