export interface Task {
  id: string;
  title: string;
  notes?: string;
  /** ISO string, or null when the task has no due date. */
  dueAt: string | null;
  completed: boolean;
  completedAt?: string | null;
  createdAt: string;
  /** ISO string stamped once a reminder has fired, so it never repeats. */
  remindedAt?: string | null;
}

/** Shape used by create/edit forms. */
export interface TaskDraft {
  title: string;
  notes?: string;
  dueAt: string | null;
}

export type TaskFilter = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';

export const TASK_FILTERS: TaskFilter[] = ['all', 'today', 'upcoming', 'overdue', 'completed'];

export const TASK_FILTER_LABELS: Record<TaskFilter, string> = {
  all: 'All',
  today: 'Today',
  upcoming: 'Upcoming',
  overdue: 'Overdue',
  completed: 'Completed',
};
