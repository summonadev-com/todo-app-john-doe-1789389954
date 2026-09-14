import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  DEFAULT_SETTINGS,
  persistenceAvailable,
  readSettings,
  writeSettings,
  type AppSettings,
} from '@/lib/storage';

export interface SettingsStore {
  settings: AppSettings;
  persistenceAvailable: boolean;
  setReminderWindow: (minutes: number) => void;
  dismissNotificationPrompt: () => void;
}

const SettingsContext = createContext<SettingsStore | null>(null);

export const REMINDER_WINDOW_OPTIONS = [15, 30, 60] as const;

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const hydrated = useRef(false);

  useEffect(() => {
    setSettings(readSettings());
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    writeSettings(settings);
  }, [settings]);

  const setReminderWindow = useCallback((minutes: number) => {
    setSettings((prev) => ({ ...prev, reminderWindowMinutes: minutes }));
  }, []);

  const dismissNotificationPrompt = useCallback(() => {
    setSettings((prev) => ({ ...prev, notificationPromptDismissed: true }));
  }, []);

  return (
    <SettingsContext.Provider
      value={{ settings, persistenceAvailable, setReminderWindow, dismissNotificationPrompt }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

/** Shared app settings. Must be used inside <SettingsProvider>. */
export function useSettings(): SettingsStore {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
}
