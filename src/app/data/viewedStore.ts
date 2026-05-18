import { namespaced, read, write, remove } from './stores';

const SLOT = 'viewed';

// Treat repeated views of the same property within this window as one entry.
const DEDUP_WINDOW_MS = 30 * 60 * 1000;

export interface ViewedEntry {
  propertyId: string;
  timestamp: number;
}

export function loadViewed(phoneKey: string): ViewedEntry[] {
  return read<ViewedEntry[]>(namespaced(phoneKey, SLOT)) ?? [];
}

export function clearViewed(phoneKey: string): void {
  remove(namespaced(phoneKey, SLOT));
}

// Record a view, deduping consecutive opens of the same listing inside the
// 30-minute window. Returns the new list (most-recent first).
export function recordView(phoneKey: string, propertyId: string, now: number = Date.now()): ViewedEntry[] {
  const current = loadViewed(phoneKey);
  const last = current[0];
  const isDuplicate = last && last.propertyId === propertyId && now - last.timestamp < DEDUP_WINDOW_MS;

  let next: ViewedEntry[];
  if (isDuplicate) {
    // Refresh the timestamp so "viewed X min ago" updates, but keep one entry.
    next = [{ propertyId, timestamp: now }, ...current.slice(1)];
  } else {
    next = [{ propertyId, timestamp: now }, ...current.filter((v) => v.propertyId !== propertyId)];
  }

  write(namespaced(phoneKey, SLOT), next);
  return next;
}
