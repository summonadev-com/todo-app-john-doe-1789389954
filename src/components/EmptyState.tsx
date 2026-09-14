import type { ReactNode } from 'react';

export type EmptyStateVariant = 'no-tasks' | 'nothing-today' | 'no-overdue' | 'no-completed' | 'no-upcoming';

const COPY: Record<EmptyStateVariant, { icon: string; headline: string; support: string }> = {
  'no-tasks': {
    icon: '🗒️',
    headline: 'No tasks yet',
    support: 'Add your first task and it will show up here.',
  },
  'nothing-today': {
    icon: '☀️',
    headline: 'Nothing due today',
    support: 'Enjoy the clear runway, or plan something ahead.',
  },
  'no-overdue': {
    icon: '✅',
    headline: 'Nothing overdue',
    support: 'You are fully caught up.',
  },
  'no-completed': {
    icon: '🎯',
    headline: 'Nothing completed yet',
    support: 'Finished tasks will collect here.',
  },
  'no-upcoming': {
    icon: '📅',
    headline: 'Nothing scheduled ahead',
    support: 'Give a task a due date to plan your week.',
  },
};

interface EmptyStateProps {
  variant: EmptyStateVariant;
  action?: ReactNode;
}

export function EmptyState({ variant, action }: EmptyStateProps) {
  const copy = COPY[variant];
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
      <span aria-hidden="true" className="text-2xl">
        {copy.icon}
      </span>
      <p className="text-sm font-medium text-slate-200">{copy.headline}</p>
      <p className="max-w-xs text-xs text-slate-500">{copy.support}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
