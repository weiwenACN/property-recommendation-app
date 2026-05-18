// Phone-keyed localStorage scaffolding shared across Bookmarks, Recently
// Viewed, Workplace, and any future per-user state. Swap point if/when a
// backend lands: replace `read` / `write` with API calls; the rest of the
// codebase keeps the same store APIs.

const PREFIX = 'star-homes';

export function namespaced(phoneKey: string, slot: string): string {
  return `${PREFIX}:${slot}:${phoneKey}`;
}

export function read<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function write<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota / disabled — silent fail
  }
}

export function remove(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
