import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Task, TaskDraft } from '@/types/task';
import { persistenceAvailable, readTasks, writeTasks, clearTasks } from '@/lib/storage';
import { isOverdue, isToday, isUpcoming } from '@/lib/date';

export interface DeletedTaskBuffer {
  task: Task;
  index: number;
}

export interface TasksStore {
  tasks: Task[];
  loaded: boolean;
  persistenceAvailable: boolean;
  addTask: (draft: TaskDraft) => Task;
  updateTask: (id: string, patch: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  toggleComplete: (id: string) => void;
  deleteTask: (id: string) => void;
  undoLastDelete: () => void;
  lastDeleted: DeletedTaskBuffer | null;
  clearLastDeleted: () => void;
  clearAllTasks: () => void;
  markReminded: (id: string) => void;
  today: Task[];
  overdue: Task[];
  upcoming: Task[];
  undated: Task[];
  completed: Task[];
}

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Due date ascending, undated last, then newest-created first. */
export function sortTasks(a: Task, b: Task): number {
  if (a.dueAt && b.dueAt) return Date.parse(a.dueAt) - Date.parse(b.dueAt);
  if (a.dueAt) return -1;
  if (b.dueAt) return 1;
  return Date.parse(b.createdAt) - Date.parse(a.createdAt);
}

/**
 * The single stateful entry point for tasks. Mounted once by TasksProvider —
 * components consume it through context, never by calling this directly.
 */
export function useTasksStore(): TasksStore {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [lastDeleted, setLastDeleted] = useState<DeletedTaskBuffer | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    setTasks(readTasks());
    setLoaded(true);
    hydrated.current = true;
  }, []);

  // Persist after every mutation, but never before the initial read completes.
  useEffect(() => {
    if (!hydrated.current) return;
    writeTasks(tasks);
  }, [tasks]);

  const addTask = useCallback((draft: TaskDraft): Task => {
    const task: Task = {
      id: createId(),
      title: draft.title.trim(),
      notes: draft.notes?.trim() ? draft.notes.trim() : undefined,
      dueAt: draft.dueAt ?? null,
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      remindedAt: null,
    };
    setTasks((prev) => [...prev, task]);
    return task;
  }, []);

  const updateTask = useCallback((id: string, patch: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next = { ...t, ...patch };
        // Changing the due date makes any earlier reminder stale.
        if (patch.dueAt !== undefined && patch.dueAt !== t.dueAt) next.remindedAt = null;
        return next;
      }),
    );
  }, []);

  const toggleComplete = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : null }
          : t,
      ),
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => {
      const index = prev.findIndex((t) => t.id === id);
      if (index === -1) return prev;
      setLastDeleted({ task: prev[index], index });
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  const undoLastDelete = useCallback(() => {
    setLastDeleted((buffer) => {
      if (!buffer) return null;
      setTasks((prev) => {
        const next = [...prev];
        next.splice(Math.min(buffer.index, next.length), 0, buffer.task);
        return next;
      });
      return null;
    });
  }, []);

  const clearLastDeleted = useCallback(() => setLastDeleted(null), []);

  const clearAllTasks = useCallback(() => {
    setTasks([]);
    setLastDeleted(null);
    clearTasks();
  }, []);

  const markReminded = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, remindedAt: new Date().toISOString() } : t)),
    );
  }, []);

  const selectors = useMemo(() => {
    const active = tasks.filter((t) => !t.completed);
    return {
      today: active.filter((t) => isToday(t.dueAt) && !isOverdue(t.dueAt)).sort(sortTasks),
      overdue: active.filter((t) => isOverdue(t.dueAt)).sort(sortTasks),
      upcoming: active.filter((t) => isUpcoming(t.dueAt)).sort(sortTasks),
      undated: active.filter((t) => !t.dueAt).sort(sortTasks),
      completed: tasks.filter((t) => t.completed).sort(sortTasks),
    };
  }, [tasks]);

  return {
    tasks,
    loaded,
    persistenceAvailable,
    addTask,
    updateTask,
    toggleComplete,
    deleteTask,
    undoLastDelete,
    lastDeleted,
    clearLastDeleted,
    clearAllTasks,
    markReminded,
    ...selectors,
  };
}
