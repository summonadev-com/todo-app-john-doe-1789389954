import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useTasks } from '@/components/TasksProvider';
import { TaskList } from '@/components/TaskList';
import { TaskForm } from '@/components/TaskForm';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Toast } from '@/components/Toast';
import type { Task, TaskDraft } from '@/types/task';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const {
    overdue,
    today,
    undated,
    toggleComplete,
    addTask,
    updateTask,
    deleteTask,
    undoLastDelete,
    lastDeleted,
    clearLastDeleted,
  } = useTasks();

  const [editing, setEditing] = useState<Task | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);

  function handleSubmit(draft: TaskDraft) {
    if (editing) {
      updateTask(editing.id, { title: draft.title, notes: draft.notes, dueAt: draft.dueAt });
      setEditing(null);
      return;
    }
    addTask(draft);
  }

  return (
    <div className="space-y-8">
      <TaskForm
        key={editing?.id ?? 'new'}
        initialTask={editing ?? undefined}
        onSubmit={handleSubmit}
        onCancel={editing ? () => setEditing(null) : undefined}
      />

      <TaskList
        title="Overdue"
        tasks={overdue}
        emptyVariant="no-overdue"
        onToggle={toggleComplete}
        onEdit={setEditing}
        onDelete={setPendingDelete}
        accent="danger"
      />
      <TaskList
        title="Due today"
        tasks={today}
        emptyVariant="nothing-today"
        onToggle={toggleComplete}
        onEdit={setEditing}
        onDelete={setPendingDelete}
      />
      <TaskList
        title="No due date"
        tasks={undated}
        emptyVariant="no-tasks"
        onToggle={toggleComplete}
        onEdit={setEditing}
        onDelete={setPendingDelete}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this task?"
        description={pendingDelete ? `"${pendingDelete.title}" will be removed. You can undo right after.` : undefined}
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
    </div>
  );
}
