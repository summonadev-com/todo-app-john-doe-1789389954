export const DEFAULT_DUE_SOON_MINUTES = 60;

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function toDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function isToday(iso: string | null | undefined, now: Date = new Date()): boolean {
  const d = toDate(iso);
  if (!d) return false;
  return startOfDay(d).getTime() === startOfDay(now).getTime();
}

export function isTomorrow(iso: string | null | undefined, now: Date = new Date()): boolean {
  const d = toDate(iso);
  if (!d) return false;
  return startOfDay(d).getTime() === startOfDay(addDays(now, 1)).getTime();
}

export function isOverdue(iso: string | null | undefined, now: Date = new Date()): boolean {
  const d = toDate(iso);
  if (!d) return false;
  return d.getTime() < now.getTime();
}

export function isDueSoon(
  iso: string | null | undefined,
  windowMinutes: number = DEFAULT_DUE_SOON_MINUTES,
  now: Date = new Date(),
): boolean {
  const d = toDate(iso);
  if (!d) return false;
  const diffMs = d.getTime() - now.getTime();
  return diffMs >= 0 && diffMs <= windowMinutes * 60_000;
}

/** Is the due date strictly after today (a future day)? */
export function isUpcoming(iso: string | null | undefined, now: Date = new Date()): boolean {
  const d = toDate(iso);
  if (!d) return false;
  return startOfDay(d).getTime() > startOfDay(now).getTime();
}

const timeFormatter = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' });
const dateFormatter = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });

export function formatTime(date: Date): string {
  return timeFormatter.format(date);
}

/** "Today 14:00", "Tomorrow 09:00", "3 days overdue", "Mar 4 18:00". */
export function formatDueLabel(iso: string | null | undefined, now: Date = new Date()): string {
  const d = toDate(iso);
  if (!d) return '';

  if (isToday(iso, now)) {
    if (d.getTime() < now.getTime()) {
      const minutes = Math.round((now.getTime() - d.getTime()) / 60_000);
      if (minutes < 60) return `${Math.max(minutes, 1)} min overdue`;
      const hours = Math.round(minutes / 60);
      return `${hours} hr${hours === 1 ? '' : 's'} overdue`;
    }
    return `Today ${formatTime(d)}`;
  }

  if (isTomorrow(iso, now)) return `Tomorrow ${formatTime(d)}`;

  const dayDiff = Math.round(
    (startOfDay(d).getTime() - startOfDay(now).getTime()) / (24 * 60 * 60_000),
  );

  if (dayDiff < 0) {
    const days = Math.abs(dayDiff);
    return days === 1 ? 'Yesterday — overdue' : `${days} days overdue`;
  }
  if (dayDiff <= 6) return `${dateFormatter.format(d)} ${formatTime(d)}`;
  return `${dateFormatter.format(d)} ${formatTime(d)}`;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Value for an <input type="datetime-local">, in local time. */
export function toDateTimeLocalValue(iso: string | null | undefined): string {
  const d = toDate(iso);
  if (!d) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Inverse of toDateTimeLocalValue — local input string back to an ISO string. */
export function fromDateTimeLocalValue(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Today at a given hour, as an ISO string. */
export function atHour(date: Date, hour: number, minute = 0): string {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}
