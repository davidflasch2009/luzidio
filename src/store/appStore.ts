import { create } from 'zustand';

import { defaultSettings, sanitizeSettings, type Settings } from '../logic/settings';
import type { PermissionState } from '../services/notifications';

/** Speichert Einstellungen dauerhaft; wird beim App-Start (DB) gesetzt. */
export type SettingsPersister = (settings: Settings) => Promise<void>;

type AppState = {
  ready: boolean;
  settings: Settings;
  /** Steigt bei jeder Datenänderung, damit Bildschirme neu laden. */
  revision: number;
  /** Ist die App gerade entsperrt (nur relevant bei aktiver Sperre)? */
  unlocked: boolean;
  persister: SettingsPersister | null;
  notificationPermission: PermissionState | null;
  setNotificationPermission: (p: PermissionState) => void;
  hydrate: (settings: Settings, persister: SettingsPersister) => void;
  updateSettings: (patch: Partial<Settings>) => Promise<Settings>;
  bumpRevision: () => void;
  setUnlocked: (unlocked: boolean) => void;
};

export const useAppStore = create<AppState>((set, get) => ({
  ready: false,
  settings: defaultSettings,
  revision: 0,
  unlocked: false,
  persister: null,
  notificationPermission: null,
  setNotificationPermission: (notificationPermission) => set({ notificationPermission }),
  hydrate: (settings, persister) => set({ settings: sanitizeSettings(settings), persister, ready: true }),
  updateSettings: async (patch) => {
    const next = sanitizeSettings({ ...get().settings, ...patch });
    const persister = get().persister;
    if (persister) await persister(next);
    set({ settings: next });
    return next;
  },
  bumpRevision: () => set((s) => ({ revision: s.revision + 1 })),
  setUnlocked: (unlocked) => set({ unlocked }),
}));
