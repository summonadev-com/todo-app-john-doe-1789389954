import { useId, useState } from 'react';
import type { Task, TaskDraft } from '@/types/task';
import { addDays, atHour, fromDateTimeLocalValue, toDateTimeLocalValue } from '@/lib/date';

export interface TaskFormProps {
  /** When provided the form edits this task instead of creating a new one. */
  initialTask?: Task;
  onSubmit: (draft: TaskDraft) => void;
  onCancel?: () => void;
  submitLabel?: string;
  autoFocus?: boolean;
}

const quickSets: { label: string; value: () => string | null }[] = [
  { label: 'Today 6pm', value: () => atHour(new Date(), 18) },
  { label: 'Tomorrow 9am', value: () => atHour(addDays(new Date(), 1), 9) },
  { label: 'Next week', value: () => atHour(addDays(new Date(), 7), 9) },
  { label: 'Clear', value: () => null },
];

const fieldClass =
  'w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400';

export function TaskForm({
  initialTask,
  onSubmit,
  onCancel,
  submitLabel,
  autoFocus = false,
}: TaskFormProps) {
  const uid = useId();
  const [title, setTitle] = useState(initialTask?.title ?? '');
  const [notes, setNotes] = useState(initialTask?.notes ?? '');
  const [dueAt, setDueAt] = useState<string | null>(initialTask?.dueAt ?? null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      setError('Give the task a title.');
      return;
    }
    setError(null);
    onSubmit({ title: title.trim(), notes: notes.trim() || undefined, dueAt });
    if (!initialTask) {
      setTitle('');
      setNotes('');
      setDueAt(null);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
    >
      <div className="space-y-1">
        <label htmlFor={`${uid}-title`} className="block text-xs font-medium text-slate-400">
          Task
        </label>
        <input
          id={`${uid}-title`}
          value={title}
          autoFocus={autoFocus}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError(null);
          }}
          placeholder="What needs doing?"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${uid}-error` : undefined}
          className={fieldClass}
        />
        {error ? (
          <p id={`${uid}-error`} role="alert" className="text-xs text-red-300">
            {error}
          </p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label htmlFor={`${uid}-notes`} className="block text-xs font-medium text-slate-400">
          Notes <span className="text-slate-600">(optional)</span>
        </label>
        <textarea
          id={`${uid}-notes`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Any detail worth remembering"
          className={`${fieldClass} resize-y`}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor={`${uid}-due`} className="block text-xs font-medium text-slate-400">
          Due date <span className="text-slate-600">(optional)</span>
        </label>
        <input
          id={`${uid}-due`}
          type="datetime-local"
          value={toDateTimeLocalValue(dueAt)}
          onChange={(e) => setDueAt(fromDateTimeLocalValue(e.target.value))}
          className={`${fieldClass} [color-scheme:dark]`}
        />
        <div className="flex flex-wrap gap-1.5">
          {quickSets.map((quick) => (
            <button
              key={quick.label}
              type="button"
              onClick={() => setDueAt(quick.value())}
              className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-slate-300 transition hover:bg-white/5 hover:text-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
            >
              {quick.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
          >
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          className="rounded-lg bg-sky-500 px-3.5 py-1.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
        >
          {submitLabel ?? (initialTask ? 'Save changes' : 'Add task')}
        </button>
      </div>
    </form>
  );
}
