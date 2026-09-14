import type { Task } from '@/types/task';
import { DEFAULT_DUE_SOON_MINUTES, formatDueLabel, isDueSoon, isOverdue, isToday } from '@/lib/date';

type BadgeState = 'overdue' | 'soon' | 'today' | 'future';

function badgeState(task: Task, windowMinutes: number): BadgeState {
  if (isOverdue(task.dueAt)) return 'overdue';
  if (isDueSoon(task.dueAt, windowMinutes)) return 'soon';
  if (isToday(task.dueAt)) return 'today';
  return 'future';
}

const BADGE_CLASS: Record<BadgeState, string> = {
  overdue: 'border-red-500/30 bg-red-500/15 text-red-300',
  soon: 'border-amber-500/30 bg-amber-500/15 text-amber-300',
  today: 'border-sky-500/30 bg-sky-500/15 text-sky-300',
  future: 'border-white/10 bg-white/5 text-slate-400',
};

export interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  dueSoonMinutes?: number;
}

export function TaskItem({
  task,
  onToggle,
  onEdit,
  onDelete,
  dueSoonMinutes = DEFAULT_DUE_SOON_MINUTES,
}: TaskItemProps) {
  const state = badgeState(task, dueSoonMinutes);
  const label = task.dueAt ? formatDueLabel(task.dueAt) : '';

  return (
    <li className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-white/20">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        aria-label={`Mark "${task.title}" as ${task.completed ? 'not complete' : 'complete'}`}
        className="mt-1 size-4 shrink-0 cursor-pointer rounded border-white/20 bg-transparent accent-sky-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
      />

      <div className="min-w-0 flex-1">
        <p
          className={
            task.completed
              ? 'truncate text-sm text-slate-500 line-through'
              : 'truncate text-sm text-slate-100'
          }
        >
          {task.title}
        </p>
        {task.notes ? <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{task.notes}</p> : null}
        {task.dueAt && !task.completed ? (
          <span
            className={`mt-1.5 inline-block rounded-md border px-2 py-0.5 text-[11px] font-medium ${BADGE_CLASS[state]}`}
          >
            {label}
          </span>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {onEdit ? (
          <button
            type="button"
            onClick={() => onEdit(task)}
            aria-label={`Edit "${task.title}"`}
            className="rounded-lg px-2 py-1 text-xs text-slate-400 transition hover:bg-white/5 hover:text-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
          >
            Edit
          </button>
        ) : null}
        {onDelete ? (
          <button
            type="button"
            onClick={() => onDelete(task)}
            aria-label={`Delete "${task.title}"`}
            className="rounded-lg px-2 py-1 text-xs text-slate-400 transition hover:bg-red-500/10 hover:text-red-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300"
          >
            Delete
          </button>
        ) : null}
      </div>
    </li>
  );
}
