// Frontend-only persistence layer for user preferences.
//
// Today: localStorage keyed by `<countryCode><digits>`. Persists across
// browser sessions on the same device.
//
// Swap target: replace the three functions below with calls to a real
// preferences API (GET/PUT/DELETE keyed by the same composite phone key).
// Call sites in App.tsx don't need to change.

const STORAGE_KEY_PREFIX = 'star-homes:prefs:';

export function phoneKey(countryCode: string, phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, '');
  const code = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
  return `${code}${digits}`;
}

export function loadPreferences(key: string): string[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === 'string')) {
      return parsed as string[];
    }
    return null;
  } catch {
    return null;
  }
}

export function savePreferences(key: string, preferences: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY_PREFIX + key,
      JSON.stringify(preferences),
    );
  } catch {
    // Quota exceeded or storage disabled — silently no-op so the UI doesn't break.
  }
}

export function clearPreferences(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY_PREFIX + key);
  } catch {
    // ignore
  }
}
