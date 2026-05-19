/**
 * authApi.ts — authentication API surface.
 *
 * Currently a client-side mock (this app has no backend).
 * Replace the body of `signOut` with a real fetch() call when a backend lands:
 *
 *   // JWT: POST /api/auth/sign-out  →  server adds token to denylist
 *   // Session cookie: DELETE /api/auth/session  →  server destroys cookie
 *
 * Contract:
 *   - Resolves on success (any 2xx).
 *   - Rejects with an Error on network failure or non-2xx response.
 *   - Callers MUST handle rejection gracefully: sign-out should always
 *     succeed client-side even if the server call fails.
 */
export async function signOut(): Promise<void> {
  // ── Mock: simulate a short network round-trip ──────────────────────────
  await new Promise<void>((resolve) => setTimeout(resolve, 180));

  // ── Real implementation (uncomment when backend exists) ────────────────
  // const res = await fetch('/api/auth/sign-out', {
  //   method: 'POST',
  //   credentials: 'include',           // include session cookie
  //   headers: { 'Content-Type': 'application/json' },
  // });
  // if (!res.ok) throw new Error(`Sign-out failed: ${res.status}`);
}
