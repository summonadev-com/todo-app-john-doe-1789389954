import { Link } from '@tanstack/react-router';
import { useTasks } from '@/components/TasksProvider';
import { useSettings } from '@/components/SettingsProvider';
import { isDueSoon } from '@/lib/date';

/**
 * In-app fallback signal — the primary reminder when notifications are
 * denied or unsupported. Counts overdue plus due-soon tasks.
 */
export function DueSoonBanner() {
  const { overdue, today } = useTasks();
  const { settings } = useSettings();

  const dueSoon = today.filter((t) => isDueSoon(t.dueAt, settings.reminderWindowMinutes));
  const count = overdue.length + dueSoon.length;
  if (count === 0) return null;

  const parts: string[] = [];
  if (overdue.length > 0) parts.push(`${overdue.length} overdue`);
  if (dueSoon.length > 0) parts.push(`${dueSoon.length} due soon`);

  return (
    <div
      role="status"
      aria-live="polite"
      className="border-b border-amber-500/20 bg-amber-500/10"
    >
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-5 py-2.5">
        <p className="text-xs font-medium text-amber-200 sm:text-sm">
          {parts.join(' · ')} — needs attention
        </p>
        <Link
          to="/"
          className="rounded-lg px-2 py-1 text-xs font-semibold text-amber-100 underline underline-offset-4 transition hover:bg-amber-500/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
        >
          Review in Today
        </Link>
      </div>
    </div>
  );
}
