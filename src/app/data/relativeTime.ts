// Shared "X minutes ago" formatter used by Notifications, Recently Viewed,
// and anywhere else we surface a recent timestamp.

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

function plural(n: number, unit: string): string {
  return `${n} ${unit}${n === 1 ? '' : 's'} ago`;
}

export function relativeTime(timestamp: number, now: number = Date.now()): string {
  const diff = Math.max(0, now - timestamp);
  if (diff < MINUTE) return 'just now';
  if (diff < HOUR) return plural(Math.floor(diff / MINUTE), 'min');
  if (diff < DAY) return plural(Math.floor(diff / HOUR), 'hour');
  if (diff < 2 * DAY) return 'yesterday';
  if (diff < WEEK) return plural(Math.floor(diff / DAY), 'day');
  if (diff < MONTH) return plural(Math.floor(diff / WEEK), 'week');
  if (diff < YEAR) return plural(Math.floor(diff / MONTH), 'month');
  return plural(Math.floor(diff / YEAR), 'year');
}

export function viewedAtLabel(timestamp: number, now: number = Date.now()): string {
  return `Viewed ${relativeTime(timestamp, now)}`;
}

export function formatFullDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
