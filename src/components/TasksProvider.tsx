import { createContext, useContext, type ReactNode } from 'react';
import { useTasksStore, type TasksStore } from '@/hooks/useTasks';

const TasksContext = createContext<TasksStore | null>(null);

export function TasksProvider({ children }: { children: ReactNode }) {
  const store = useTasksStore();
  return <TasksContext.Provider value={store}>{children}</TasksContext.Provider>;
}

/** Shared task store. Must be used inside <TasksProvider>. */
export function useTasks(): TasksStore {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks must be used inside <TasksProvider>');
  return ctx;
}
