import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useTasks } from '@/components/TasksProvider';
import { REMINDER_WINDOW_OPTIONS, useSettings } from '@/components/SettingsProvider';
import { useNotificationPermission } from '@/hooks/useNotificationPermission';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Toast } from '@/components/Toast';

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});

const STATUS_COPY: Record<string, { label: string; detail: string; tone: string }> = {
  granted: {
    label: 'Reminders on',
    detail: 'This browser will notify you before a task is due.',
    tone: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  },
  denied: {
    label: 'Notifications blocked',
    detail: 'Unblock notifications in your browser settings. The in-app banner still warns you.',
    tone: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  },
  default: {
    label: 'Reminders off',
    detail: 'Turn them on to get a nudge before something is due.',
    tone: 'border-white/10 bg-white/5 text-slate-300',
  },
  unsupported: {
    label: 'Not supported here',
    detail: 'This browser has no notification support — the in-app banner is used instead.',
    tone: 'border-white/10 bg-white/5 text-slate-300',
  },
};

function SettingsPage() {
  const { tasks, clearAllTasks } = useTasks();
  const { settings, setReminderWindow, persistenceAvailable } = useSettings();
  const { status, request } = useNotificationPermission();

  const [confirmClear, setConfirmClear] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const copy = STATUS_COPY[status] ?? STATUS_COPY.default;

  async function handleEnable() {
    const result = await request();
    if (result === 'granted') setMessage('Reminders are on for this browser.');
    else if (result === 'denied') setMessage('Notifications blocked in browser settings.');
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">Settings</h1>
        <p className="text-sm text-slate-500">Reminders and data, all stored on this device.</p>
      </div>

      {!persistenceAvailable ? (
        <p
          role="status"
          className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
        >
          Saving is unavailable in this browser (private mode or blocked storage). Tasks will be lost
          when you reload.
        </p>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-200">Notifications</h2>
        <div className={`space-y-3 rounded-xl border px-4 py-3 ${copy.tone}`}>
          <div>
            <p className="text-sm font-medium">{copy.label}</p>
            <p className="mt-0.5 text-xs opacity-80">{copy.detail}</p>
          </div>
          {status === 'default' ? (
            <button
              type="button"
              onClick={handleEnable}
              className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
            >
              Enable reminders
            </button>
          ) : null}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-200">Remind me before due</h2>
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Reminder window in minutes</legend>
          {REMINDER_WINDOW_OPTIONS.map((minutes) => {
            const active = settings.reminderWindowMinutes === minutes;
            return (
              <label
                key={minutes}
                className={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm transition focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-sky-400 ${
                  active
                    ? 'border-sky-500/40 bg-sky-500/15 text-sky-200'
                    : 'border-white/10 text-slate-300 hover:bg-white/5'
                }`}
              >
                <input
                  type="radio"
                  name="reminder-window"
                  value={minutes}
                  checked={active}
                  onChange={() => setReminderWindow(minutes)}
                  className="sr-only"
                />
                {minutes} minutes
              </label>
            );
          })}
        </fieldset>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-200">Data</h2>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="text-sm text-slate-400">
            {tasks.length} task{tasks.length === 1 ? '' : 's'} stored on this device.
          </p>
          <button
            type="button"
            disabled={tasks.length === 0}
            onClick={() => setConfirmClear(true)}
            className="rounded-lg border border-red-500/30 px-3 py-1.5 text-sm font-medium text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300"
          >
            Clear all tasks
          </button>
        </div>
      </section>

      <ConfirmDialog
        open={confirmClear}
        title="Clear all tasks?"
        description="Every task on this device will be permanently removed. This cannot be undone."
        confirmLabel="Clear everything"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          clearAllTasks();
          setConfirmClear(false);
          setMessage('All tasks cleared.');
        }}
      />

      {message ? <Toast message={message} onDismiss={() => setMessage(null)} /> : null}
    </div>
  );
}
