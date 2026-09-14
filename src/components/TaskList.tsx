import type { ReactNode } from 'react';
import type { Task } from '@/types/task';
import { TaskItem } from '@/components/TaskItem';
import { EmptyState, type EmptyStateVariant } from '@/components/EmptyState';

export interface TaskListProps {
  title: string;
  tasks: Task[];
  emptyVariant: EmptyStateVariant;
  emptyAction?: ReactNode;
  onToggle: (id: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  dueSoonMinutes?: number;
  accent?: 'default' | 'danger';
}

export function TaskList({
  title,
  tasks,
  emptyVariant,
  emptyAction,
  onToggle,
  onEdit,
  onDelete,
  dueSoonMinutes,
  accent = 'default',
}: TaskListProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2
          className={`text-sm font-semibold ${accent === 'danger' ? 'text-red-300' : 'text-slate-200'}`}
        >
          {title}
        </h2>
        <span className="text-xs text-slate-500">{tasks.length}</span>
      </div>

      {tasks.length === 0 ? (
        <EmptyState variant={emptyVariant} action={emptyAction} />
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              dueSoonMinutes={dueSoonMinutes}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
