import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TasksProvider } from '@/components/TasksProvider';
import { SettingsProvider } from '@/components/SettingsProvider';
import { DueSoonBanner } from '@/components/DueSoonBanner';
import { useDueReminders } from '@/hooks/useDueReminders';

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});

const navLinkClass =
  'rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 sm:px-3';

const navLinkActiveClass =
  'rounded-lg px-2.5 py-1.5 text-sm font-medium bg-sky-500/15 text-sky-300 sm:px-3';

function RootLayout() {
  return (
    <SettingsProvider>
      <TasksProvider>
        <AppShell />
      </TasksProvider>
    </SettingsProvider>
  );
}

function AppShell() {
  useDueReminders();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4">
          <Link
            to="/"
            className="text-base font-semibold tracking-tight text-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
          >
            Tasks
          </Link>
          <nav aria-label="Main" className="flex items-center gap-0.5 sm:gap-1">
            <Link
              to="/"
              className={navLinkClass}
              activeProps={{ className: navLinkActiveClass }}
              activeOptions={{ exact: true }}
            >
              Today
            </Link>
            <Link
              to="/tasks"
              search={{ filter: 'all' as const }}
              className={navLinkClass}
              activeProps={{ className: navLinkActiveClass }}
              activeOptions={{ includeSearch: false }}
            >
              All tasks
            </Link>
            <Link
              to="/settings"
              className={navLinkClass}
              activeProps={{ className: navLinkActiveClass }}
            >
              Settings
            </Link>
          </nav>
        </div>
        <DueSoonBanner />
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-5 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-slate-300">
      <p className="text-lg">This page does not exist.</p>
      <Link
        to="/"
        className="text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
      >
        Go to Today
      </Link>
    </div>
  );
}
