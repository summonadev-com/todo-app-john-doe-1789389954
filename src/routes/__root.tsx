import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TasksProvider } from '@/components/TasksProvider';

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});

const navLinkClass =
  'rounded-lg px-3 py-1.5 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400';

function RootLayout() {
  return (
    <TasksProvider>
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-4">
          <Link to="/" className="text-base font-semibold tracking-tight text-slate-50">
            Tasks
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              to="/"
              className={navLinkClass}
              activeProps={{ className: 'rounded-lg px-3 py-1.5 text-sm font-medium bg-sky-500/15 text-sky-300' }}
              activeOptions={{ exact: true }}
            >
              Today
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-8">
        <Outlet />
      </main>
    </div>
    </TasksProvider>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-slate-300">
      <p className="text-lg">This page does not exist.</p>
      <Link to="/" className="text-sm underline underline-offset-4">
        Go to Today
      </Link>
    </div>
  );
}
