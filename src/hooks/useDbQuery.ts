import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getDb } from '../db/client';
import type { Db } from '../db/types';
import { useAppStore } from '../store/appStore';

type State<T> = { data: T | null; error: string | null; loading: boolean };

/**
 * Lädt Daten beim Fokussieren des Bildschirms und nach jeder Datenänderung
 * (Revision im Store). Veraltete Antworten werden verworfen.
 */
export function useDbQuery<T>(loader: (db: Db) => Promise<T>): State<T> & { reload: () => void } {
  const revision = useAppStore((s) => s.revision);
  const [state, setState] = useState<State<T>>({ data: null, error: null, loading: true });
  const requestId = useRef(0);
  const loaderRef = useRef(loader);
  useEffect(() => {
    loaderRef.current = loader;
  });

  const load = useCallback(() => {
    const id = ++requestId.current;
    setState((s) => ({ ...s, loading: true }));
    getDb()
      .then((db) => loaderRef.current(db))
      .then((data) => {
        if (id === requestId.current) setState({ data, error: null, loading: false });
      })
      .catch(() => {
        if (id === requestId.current) {
          setState((s) => ({ ...s, error: 'Daten konnten nicht geladen werden.', loading: false }));
        }
      });
  }, []);

  useFocusEffect(
    useCallback(() => {
      // revision wird gelesen, damit Änderungen an den Daten ein Neuladen auslösen.
      if (revision >= 0) load();
      return () => {
        requestId.current++;
      };
    }, [load, revision]),
  );

  return { ...state, reload: load };
}
