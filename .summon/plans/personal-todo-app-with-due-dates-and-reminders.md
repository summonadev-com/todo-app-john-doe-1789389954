---
status: pending
title: Personal Todo App with Due Dates and Browser Reminders
---

Project is currently empty (only README.md), so this plan includes full scaffolding.

## Phase 1 — Project scaffold

1. Initialize a Vite React + TypeScript project in place at the repo root. Expected: `package.json`, `index.html`, `tsconfig.json`, `vite.config.ts`, and a `src/` directory exist; `npm run dev` starts.
2. Install runtime and dev dependencies: `@tanstack/react-router`, `@tanstack/router-plugin`, `tailwindcss`, `@tailwindcss/vite`. Expected: dependencies present in `package.json`, ESM only, npm lockfile updated.
3. Configure `vite.config.ts` to register the TanStack Router plugin (file-based routes, `src/routes` directory) and the Tailwind Vite plugin, plus an `@` alias resolving to `src/`. Expected: route tree generation and Tailwind both run during dev/build.
4. Add the matching `@/*` path mapping to `tsconfig.json` (and `tsconfig.app.json` if Vite generated one). Expected: `@/components/...` imports typecheck.
5. Create `src/styles/global.css` containing exactly the Tailwind v4 import line as its first line, then any custom theme tokens (accent color, overdue/due-soon color tokens). Expected: single stylesheet for the app.
6. Replace `src/main.tsx` so it imports `src/styles/global.css` once, creates the router from the generated `src/routeTree.gen.ts`, and renders `RouterProvider` into the root element. Delete Vite's default `App.tsx`/`App.css`/demo assets. Expected: blank but working routed app.
7. Create `src/routes/__root.tsx` as the app shell: page background, centered max-width container, a header with the app name and a nav linking Today and All Tasks, and an `<Outlet />`. Expected: shell renders on every route.

**Checkpoint A:** `npm run dev` serves an empty shell with working nav and Tailwind styles applied.

## Phase 2 — Data model and persistence

8. Create `src/types/task.ts` defining the `Task` shape: `id` (string), `title` (string), `notes` (optional string), `dueAt` (optional ISO string, null when no due date), `completed` (boolean), `completedAt` (optional ISO string), `createdAt` (ISO string), `remindedAt` (optional ISO string, used to avoid firing a reminder twice). Also export a `TaskDraft` type for create/edit forms and a `TaskFilter` union (`'all' | 'today' | 'upcoming' | 'overdue' | 'completed'`). Expected: single source of truth for task typing.
9. Create `src/lib/storage.ts` wrapping localStorage under a versioned key (e.g. `todo.v1.tasks`): read-all, write-all, and a safe parse that validates the shape and discards malformed entries. Wrap all access in try/catch so private-mode or quota failures degrade to in-memory only and surface a boolean `persistenceAvailable`. Expected: no crash when storage is unavailable.
10. Create `src/lib/date.ts` with date helpers used everywhere: `isToday`, `isOverdue`, `isDueSoon` (within a configurable window, default 60 minutes), `startOfDay`, relative labels ("Today 14:00", "Tomorrow", "3 days overdue"), and a formatter for `datetime-local` input values. Expected: consistent date logic, no duplicated formatting.
11. Create `src/hooks/useTasks.ts` — the single stateful entry point. It loads tasks from storage on mount, exposes `tasks`, `addTask`, `updateTask`, `toggleComplete`, `deleteTask`, and derived selectors (today, overdue, upcoming, completed), and writes back to storage on every mutation. Include an `undoLastDelete` buffer for the delete toast. Expected: components never touch localStorage directly.
12. Create `src/components/TasksProvider.tsx` exposing `useTasks` state via React context so the header, routes, and reminder hook share one instance; mount it inside `src/routes/__root.tsx`. Expected: single shared task store across routes.

**Checkpoint B:** tasks can be created and read back after a page refresh (verified via a temporary debug render or the Today route once built).

## Phase 3 — Components

13. Create `src/components/TaskForm.tsx` — controlled form for title, optional notes, and an optional due date/time (`datetime-local`) with quick-set buttons (Today 6pm, Tomorrow 9am, Next week, Clear). Used for both create and edit via an optional `initialTask` prop. Validates that title is non-empty and shows an inline error. Expected: reusable add/edit UI.
14. Create `src/components/TaskItem.tsx` — one row: completion checkbox, title (struck through when done), due-date badge, and edit/delete actions. Badge styling varies by state: overdue (red), due soon (amber), due today (accent), future (muted), none (hidden). Expected: at-a-glance urgency.
15. Create `src/components/TaskList.tsx` — renders a titled group of `TaskItem`s with a count, and renders an `EmptyState` when the group is empty. Expected: consistent grouping UI.
16. Create `src/components/EmptyState.tsx` — icon, headline, supporting line, and optional action slot. Distinct copy per context (no tasks yet, nothing due today, no overdue tasks, no completed tasks). Expected: never a blank screen.
17. Create `src/components/ConfirmDialog.tsx` and `src/components/Toast.tsx` — accessible delete confirmation and a transient toast used for "Task deleted — Undo" and notification-permission messages. Expected: reversible destructive actions.

## Phase 4 — Routes

18. Create `src/routes/index.tsx` (Today view, the default route): sections in order — Overdue, Due today, No due date (collapsed/secondary), plus a compact inline add-task field at the top that expands into `TaskForm`. Shows a small progress line ("3 of 7 done today"). Expected: opening the app answers "what do I do now".
19. Create `src/routes/tasks.tsx` (All Tasks): full list with filter tabs driven by `TaskFilter`, persisted in the URL via search params so a filtered view is linkable and survives refresh. Sort by due date ascending with undated tasks last. Expected: browsing and reviewing everything.
20. Create `src/routes/settings.tsx`: notification permission status and an enable button, a due-soon reminder window selector (15/30/60 minutes), a persistence-availability warning when localStorage failed, and a "Clear all tasks" destructive action behind `ConfirmDialog`. Persist settings under their own storage key via `src/lib/storage.ts`. Expected: user control over reminders and data.
21. Add a catch-all not-found handling in `src/routes/__root.tsx` with a link back to Today. Expected: no dead ends.

**Checkpoint C:** full CRUD works across both routes, data survives refresh, filters are shareable via URL.

## Phase 5 — Reminders

22. Create `src/hooks/useNotificationPermission.ts` — reports `'unsupported' | 'default' | 'granted' | 'denied'`, exposes a `request()` that may only be called from a user gesture, and never auto-prompts on load. Expected: no surprise permission popups.
23. Create `src/hooks/useDueReminders.ts` — runs an interval (e.g. every 30s) over tasks from context, finds incomplete tasks whose `dueAt` falls inside the reminder window and whose `remindedAt` is unset, fires a browser notification per task, then stamps `remindedAt` so it never repeats. Clicking a notification focuses the window. Skips silently when permission is not granted. Expected: reliable, non-duplicated reminders while a tab is open.
24. Add the in-app fallback: a due-soon banner in `src/routes/__root.tsx` (or a header badge) showing the count of overdue plus due-soon tasks, linking to Today. This is the primary signal when notifications are denied or unsupported. Expected: reminders still useful with permissions off.
25. Add a dismissible prompt on the Today route offering to enable notifications, shown only when permission is `'default'`; store the dismissal in settings. Expected: one gentle ask, never nagging.

**Checkpoint D:** with permission granted, a task due within the window triggers exactly one notification; with permission denied, the in-app banner still shows the count and nothing throws.

## Phase 6 — Polish

26. Accessibility pass: label all inputs, give the checkbox an accessible name including the task title, announce toasts via a polite live region, ensure visible focus rings and full keyboard operation of dialogs. Expected: keyboard-only usage works end to end.
27. Responsive and visual pass: comfortable single-column layout on mobile, wider container on desktop, consistent spacing scale, hover/active states, and reduced-motion-safe transitions. Expected: looks intentional at 375px and 1440px.
28. Final verification: run typecheck and build, confirm `src/routeTree.gen.ts` is generated and untouched by hand, and manually walk the flows — add, edit, complete, delete + undo, overdue highlighting, filter persistence, refresh persistence, reminder fire, storage-unavailable fallback. Expected: clean build, no console errors.
