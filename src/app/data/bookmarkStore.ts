import { namespaced, read, write } from './stores';

const SLOT = 'bookmarks';

export function loadBookmarks(phoneKey: string): string[] {
  return read<string[]>(namespaced(phoneKey, SLOT)) ?? [];
}

export function saveBookmarks(phoneKey: string, ids: string[]): void {
  write(namespaced(phoneKey, SLOT), ids);
}

export function addBookmark(phoneKey: string, id: string): string[] {
  const current = loadBookmarks(phoneKey);
  if (current.includes(id)) return current;
  const next = [...current, id];
  saveBookmarks(phoneKey, next);
  return next;
}

export function removeBookmark(phoneKey: string, id: string): string[] {
  const current = loadBookmarks(phoneKey);
  const next = current.filter((existing) => existing !== id);
  saveBookmarks(phoneKey, next);
  return next;
}

export function isBookmarked(ids: string[], id: string): boolean {
  return ids.includes(id);
}
