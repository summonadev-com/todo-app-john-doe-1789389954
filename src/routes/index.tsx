import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useTasks } from '@/components/TasksProvider';
import { useSettings } from '@/components/SettingsProvider';
import { useNotificationPermission } from '@/hooks/useNotificationPermission';
import { TaskList } from '@/components/TaskList';
import { TaskForm } from '@/components/TaskForm';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Toast } from '@/components/Toast';
import type { Task, TaskDraft } from '@/types/task';

export const Route = createFileRoute('/')({
  component: TodayPage,
});

function TodayPage() {
  const {
    overdue,
    today,
    undated,
    completed,
    toggleComplete,
    addTask,
    updateTask,
    deleteTask,
    undoLastDelete,
    lastDeleted,
    clearLastDeleted,
  } = useTasks();
  const { settings, dismissNotificationPrompt } = useSettings();
  const { status, request } = useNotificationPermission();

  const [composerOpen, setComposerOpen] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [editing, setEditing] = useState<Task | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);
  const [showUndated, setShowUndated] = useState(false);
  const [permissionMessage, setPermissionMessage] = useState<string | null>(null);

  const dayTotal = overdue.length + today.length;
  const doneToday = completed.filter((t) => {
    if (!t.completedAt) return false;
    const done = new Date(t.completedAt);
    return done.toDateString() === new Date().toDateString();
  }).length;

  function handleSubmit(draft: TaskDraft) {
    if (editing) {
      updateTask(editing.id, { title: draft.title, notes: draft.notes, dueAt: draft.dueAt });
      setEditing(null);
      return;
    }
    addTask(draft);
    setComposerOpen(false);
    setQuickTitle('');
  }

  function handleQuickAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!quickTitle.trim()) {
      setComposerOpen(true);
      return;
    }
    addTask({ title: quickTitle.trim(), dueAt: null });
    setQuickTitle('');
  }

  async function handleEnableNotifications() {
    const result = await request();
    if (result === 'granted') setPermissionMessage('Reminders are on for this browser.');
    else if (result === 'denied')
      setPermissionMessage('Notifications blocked — the in-app banner will still warn you.');
    dismissNotificationPrompt();
  }

  const showPrompt = status === 'default' && !settings.notificationPromptDismissed;

  return (
    <div className="space-y-7">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">Today</h1>
        <p className="text-sm text-slate-500">
          {dayTotal === 0
            ? doneToday > 0
              ? `${doneToday} done today — nothing left on the clock.`
              : 'Nothing on the clock right now.'
            : `${doneToday} of ${doneToday + dayTotal} done today`}
        </p>
      </div>

      {showPrompt ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-500/20 bg-sky-500/10 px-4 py-3">
          <p className="text-sm text-sky-100">
            Want a nudge before something is due? Turn on browser reminders.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleEnableNotifications}
              className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
            >
              Enable
            </button>
            <button
              type="button"
              onClick={dismissNotificationPrompt}
              className="rounded-lg px-2.5 py-1.5 text-sm text-sky-200/80 transition hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
            >
              Not now
            </button>
          </div>
        </div>
      ) : null}

      {editing ? (
        <TaskForm
          key={editing.id}
          initialTask={editing}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      ) : composerOpen ? (
        <TaskForm
          key="composer"
          autoFocus
          onSubmit={handleSubmit}
          onCancel={() => setComposerOpen(false)}
        />
      ) : (
        <form onSubmit={handleQuickAdd} className="flex items-center gap-2">
          <label htmlFor="quick-add" className="sr-only">
            Add a task
          </label>
          <input
            id="quick-add"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder="Add a task…"
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-sky-500 px-3.5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setComposerOpen(true)}
            className="shrink-0 rounded-xl border border-white/10 px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
          >
            Details
          </button>
        </form>
      )}

      <TaskList
        title="Overdue"
        tasks={overdue}
        emptyVariant="no-overdue"
        onToggle={toggleComplete}
        onEdit={setEditing}
        onDelete={setPendingDelete}
        dueSoonMinutes={settings.reminderWindowMinutes}
        accent="danger"
      />
      <TaskList
        title="Due today"
        tasks={today}
        emptyVariant="nothing-today"
        onToggle={toggleComplete}
        onEdit={setEditing}
        onDelete={setPendingDelete}
        dueSoonMinutes={settings.reminderWindowMinutes}
      />

      <section className="space-y-3">
        <button
          type="button"
          onClick={() => setShowUndated((v) => !v)}
          aria-expanded={showUndated}
          className="flex w-full items-center justify-between rounded-lg px-1 py-1 text-left text-sm font-semibold text-slate-400 transition hover:text-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
        >
          <span>No due date</span>
          <span className="text-xs font-normal text-slate-500">
            {undated.length} {showUndated ? '▲' : '▼'}
          </span>
        </button>
        {showUndated ? (
          <TaskList
            title="Anytime"
            tasks={undated}
            emptyVariant="no-tasks"
            onToggle={toggleComplete}
            onEdit={setEditing}
            onDelete={setPendingDelete}
            dueSoonMinutes={settings.reminderWindowMinutes}
          />
        ) : null}
      </section>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this task?"
        description={
          pendingDelete ? `"${pendingDelete.title}" will be removed. You can undo right after.` : undefined
        }
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteTask(pendingDelete.id);
          if (editing && pendingDelete && editing.id === pendingDelete.id) setEditing(null);
          setPendingDelete(null);
        }}
      />

      {lastDeleted ? (
        <Toast
          message="Task deleted"
          actionLabel="Undo"
          onAction={undoLastDelete}
          onDismiss={clearLastDeleted}
        />
      ) : null}

      {!lastDeleted && permissionMessage ? (
        <Toast message={permissionMessage} onDismiss={() => setPermissionMessage(null)} />
      ) : null}
    </div>
  );
}
