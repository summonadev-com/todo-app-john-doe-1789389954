import { useEffect, useRef } from 'react';
import { useTasks } from '@/components/TasksProvider';
import { useSettings } from '@/components/SettingsProvider';
import { formatDueLabel, toDate } from '@/lib/date';

const CHECK_INTERVAL_MS = 30_000;

/**
 * Fires one browser notification per incomplete task entering the reminder
 * window, then stamps remindedAt so it never repeats. Silently does nothing
 * when notifications are unsupported or not granted.
 */
export function useDueReminders(): void {
  const { tasks, markReminded } = useTasks();
  const { settings } = useSettings();

  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;
  const windowRef = useRef(settings.reminderWindowMinutes);
  windowRef.current = settings.reminderWindowMinutes;
  const markRef = useRef(markReminded);
  markRef.current = markReminded;

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    function check() {
      if (Notification.permission !== 'granted') return;
      const now = Date.now();
      const windowMs = windowRef.current * 60_000;

      for (const task of tasksRef.current) {
        if (task.completed || task.remindedAt || !task.dueAt) continue;
        const due = toDate(task.dueAt);
        if (!due) continue;
        const diff = due.getTime() - now;
        // Due within the window, or already past due but not yet reminded.
        if (diff > windowMs) continue;

        try {
          const notification = new Notification(task.title, {
            body: formatDueLabel(task.dueAt),
            tag: `task-${task.id}`,
          });
          notification.onclick = () => {
            window.focus();
            notification.close();
          };
        } catch {
          // Notification construction can fail (e.g. mobile Chrome) — skip quietly.
        }
        markRef.current(task.id);
      }
    }

    check();
    const id = window.setInterval(check, CHECK_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);
}
