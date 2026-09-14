import type { Task } from '@/types/task';

const TASKS_KEY = 'todo.v1.tasks';
const SETTINGS_KEY = 'todo.v1.settings';

export interface AppSettings {
  /** Minutes before a due time at which a task counts as "due soon". */
  reminderWindowMinutes: number;
  /** True once the user dismissed the "enable notifications" prompt. */
  notificationPromptDismissed: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  reminderWindowMinutes: 60,
  notificationPromptDismissed: false,
};

function probeStorage(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const probe = '__todo_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

/** False in private mode / when quota or access fails — app degrades to in-memory. */
export const persistenceAvailable: boolean = probeStorage();

function isIsoLike(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

/** Validates one parsed entry, discarding anything malformed. */
function parseTask(raw: unknown): Task | null {
  if (!raw || typeof raw !== 'object') return null;
  const t = raw as Record<string, unknown>;
  if (typeof t.id !== 'string' || t.id.length === 0) return null;
  if (typeof t.title !== 'string' || t.title.trim().length === 0) return null;

  const dueAt = isIsoLike(t.dueAt) ? (t.dueAt as string) : null;
  const createdAt = isIsoLike(t.createdAt) ? (t.createdAt as string) : new Date().toISOString();

  return {
    id: t.id,
    title: t.title,
    notes: typeof t.notes === 'string' ? t.notes : undefined,
    dueAt,
    completed: t.completed === true,
    completedAt: isIsoLike(t.completedAt) ? (t.completedAt as string) : null,
    createdAt,
    remindedAt: isIsoLike(t.remindedAt) ? (t.remindedAt as string) : null,
  };
}

export function readTasks(): Task[] {
  if (!persistenceAvailable) return [];
  try {
    const raw = window.localStorage.getItem(TASKS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(parseTask).filter((t): t is Task => t !== null);
  } catch {
    return [];
  }
}

export function writeTasks(tasks: Task[]): void {
  if (!persistenceAvailable) return;
  try {
    window.localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch {
    // Quota or access failure — stay in-memory, never crash the app.
  }
}

export function readSettings(): AppSettings {
  if (!persistenceAvailable) return { ...DEFAULT_SETTINGS };
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_SETTINGS };
    const s = parsed as Record<string, unknown>;
    const windowMinutes = s.reminderWindowMinutes;
    return {
      reminderWindowMinutes:
        windowMinutes === 15 || windowMinutes === 30 || windowMinutes === 60
          ? windowMinutes
          : DEFAULT_SETTINGS.reminderWindowMinutes,
      notificationPromptDismissed: s.notificationPromptDismissed === true,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function writeSettings(settings: AppSettings): void {
  if (!persistenceAvailable) return;
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function clearTasks(): void {
  if (!persistenceAvailable) return;
  try {
    window.localStorage.removeItem(TASKS_KEY);
  } catch {
    // ignore
  }
}
