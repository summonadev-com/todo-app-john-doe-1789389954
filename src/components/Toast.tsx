import { useEffect } from 'react';

export interface ToastProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
  /** Auto-dismiss delay in ms. Pass 0 to keep it until dismissed. */
  duration?: number;
}

export function Toast({ message, actionLabel, onAction, onDismiss, duration = 6000 }: ToastProps) {
  useEffect(() => {
    if (!duration) return;
    const id = window.setTimeout(onDismiss, duration);
    return () => window.clearTimeout(id);
  }, [duration, onDismiss, message]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-auto flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/95 px-4 py-3 text-sm text-slate-100 shadow-xl shadow-black/40 backdrop-blur"
      >
        <span>{message}</span>
        {actionLabel && onAction ? (
          <button
            type="button"
            onClick={() => {
              onAction();
              onDismiss();
            }}
            className="rounded-lg px-2 py-1 text-sm font-semibold text-sky-300 transition hover:bg-sky-500/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
          >
            {actionLabel}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="rounded-lg px-2 py-1 text-slate-500 transition hover:text-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
