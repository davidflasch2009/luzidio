import { useCallback, useMemo, useRef, useState } from 'react';

import type { EntryInput } from '../../db/types';
import { draftErrorMessages, prepareDraft, validateDraft } from '../../logic/entryDraft';
import { audioUri, deleteAudio, deleteUri, persistRecording } from '../../services/audioFiles';

/**
 * Zustand eines Traum-Entwurfs inkl. Sprachmemo-Handling:
 * - neue Aufnahme liegt bis zum Speichern als temporäre Datei vor
 * - beim Speichern wird sie dauerhaft übernommen und eine ersetzte alte Datei gelöscht
 */
export function useEntryEditor(initial: EntryInput, onSubmit: (input: EntryInput) => Promise<void>) {
  const [draft, setDraft] = useState<EntryInput>(initial);
  const [pendingUri, setPendingUri] = useState<string | null>(null);
  const [removeExisting, setRemoveExisting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const pendingRef = useRef<string | null>(null);

  const existingAudio = initial.audioFile && !removeExisting ? initial.audioFile : null;
  const audioPreviewUri = pendingUri ?? (existingAudio ? audioUri(existingAudio) : null);

  const dirty = useMemo(
    () => pendingUri !== null || removeExisting || JSON.stringify(draft) !== JSON.stringify(initial),
    [draft, initial, pendingUri, removeExisting],
  );

  const update = useCallback((patch: Partial<EntryInput>) => {
    setError(null);
    setDraft((d) => ({ ...d, ...patch }));
  }, []);

  const setRecording = useCallback((uri: string) => {
    if (pendingRef.current) deleteUri(pendingRef.current);
    pendingRef.current = uri;
    setPendingUri(uri);
    setError(null);
  }, []);

  const removeAudio = useCallback(() => {
    if (pendingRef.current) {
      deleteUri(pendingRef.current);
      pendingRef.current = null;
      setPendingUri(null);
    } else {
      setRemoveExisting(true);
    }
  }, []);

  /** Verwirft eine nicht gespeicherte Aufnahme (z. B. beim Abbrechen). */
  const discardPending = useCallback(() => {
    if (pendingRef.current) deleteUri(pendingRef.current);
    pendingRef.current = null;
  }, []);

  const save = useCallback(async () => {
    const hasAudio = pendingUri !== null || existingAudio !== null;
    const check = validateDraft({ ...draft, audioFile: hasAudio ? 'x' : null });
    if (check) {
      setError(draftErrorMessages[check]);
      return;
    }
    setSaving(true);
    let newFile: string | null = null;
    try {
      let audioFile = existingAudio;
      if (pendingUri) {
        newFile = await persistRecording(pendingUri);
        audioFile = newFile;
      }
      await onSubmit(prepareDraft({ ...draft, audioFile }));
      if (pendingUri) deleteUri(pendingUri);
      pendingRef.current = null;
      if (initial.audioFile && initial.audioFile !== audioFile) deleteAudio(initial.audioFile);
      setSaved(true);
    } catch {
      // Kopie der Aufnahme verwerfen; die temporäre Datei bleibt für einen neuen Versuch erhalten.
      deleteAudio(newFile);
      setError('Speichern fehlgeschlagen. Bitte versuch es noch einmal.');
    } finally {
      setSaving(false);
    }
  }, [draft, existingAudio, initial.audioFile, onSubmit, pendingUri]);

  return {
    draft,
    update,
    error,
    saving,
    saved,
    dirty: dirty && !saved,
    audioPreviewUri,
    setRecording,
    removeAudio,
    discardPending,
    save,
  };
}
