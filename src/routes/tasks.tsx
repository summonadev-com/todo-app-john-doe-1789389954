import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useTasks, } from '@/components/TasksProvider';
import { useSettings } from '@/components/SettingsProvider';
import { sortTasks } from '@/hooks/useTasks';
import { TaskList } from '@/components/TaskList';
import { TaskForm } from '@/components/TaskForm';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Toast } from '@/components/Toast';
import { TASK_FILTERS, TASK_FILTER_LABELS, type Task, type TaskDraft, type TaskFilter } from '@/types/task';
import type { EmptyStateVariant } from '@/components/EmptyState';

interface TasksSearch {
  filter: TaskFilter;
}

export const Route = createFileRoute('/tasks')({
  validateSearch: (search: Record<string, unknown>): TasksSearch => {
    const raw = search.filter;
    const filter = TASK_FILTERS.includes(raw as TaskFilter) ? (raw as TaskFilter) : 'all';
    return { filter };
  },
  component: AllTasksPage,
});

const EMPTY_VARIANT: Record<TaskFilter, EmptyStateVariant> = {
  all: 'no-tasks',
  today: 'nothing-today',
  upcoming: 'no-upcoming',
  overdue: 'no-overdue',
  completed: 'no-completed',
};

function AllTasksPage() {
  const { filter } = Route.useSearch();
  const store = useTasks();
  const { settings } = useSettings();

  const [editing, setEditing] = useState<Task | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);

  const visible: Task[] =
    filter === 'all'
      ? [...store.tasks].sort(sortTasks)
      : filter === 'today'
        ? store.today
        : filter === 'upcoming'
          ? store.upcoming
          : filter === 'overdue'
            ? store.overdue
            : store.completed;

  function handleSubmit(draft: TaskDraft) {
    if (!editing) return;
    store.updateTask(editing.id, { title: draft.title, notes: draft.notes, dueAt: draft.dueAt });
    setEditing(null);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">All tasks</h1>
        <p className="text-sm text-slate-500">Sorted by due date, undated last.</p>
      </div>

      <nav aria-label="Filter tasks" className="flex flex-wrap gap-1.5">
        {TASK_FILTERS.map((value) => (
          <Link
            key={value}
            to="/tasks"
            search={{ filter: value }}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
            activeProps={{
              className:
                'rounded-lg border border-sky-500/40 bg-sky-500/15 px-3 py-1.5 text-sm font-medium text-sky-200',
            }}
            activeOptions={{ includeSearch: true, exact: true }}
          >
            {TASK_FILTER_LABELS[value]}
          </Link>
        ))}
      </nav>

      {editing ? (
        <TaskForm
          key={editing.id}
          initialTask={editing}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      ) : null}

      <TaskList
        title={TASK_FILTER_LABELS[filter]}
        tasks={visible}
        emptyVariant={EMPTY_VARIANT[filter]}
        onToggle={store.toggleComplete}
        onEdit={setEditing}
        onDelete={setPendingDelete}
        dueSoonMinutes={settings.reminderWindowMinutes}
        accent={filter === 'overdue' ? 'danger' : 'default'}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this task?"
        description={
          pendingDelete ? `"${pendingDelete.title}" will be removed. You can undo right after.` : undefined
        }
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) store.deleteTask(pendingDelete.id);
          if (editing && pendingDelete && editing.id === pendingDelete.id) setEditing(null);
          setPendingDelete(null);
        }}
      />

      {store.lastDeleted ? (
        <Toast
          message="Task deleted"
          actionLabel="Undo"
          onAction={store.undoLastDelete}
          onDismiss={store.clearLastDeleted}
        />
      ) : null}
    </div>
  );
}
