// Circuit breaker: without a cap, a bug that throws on every render (or
// every frame of an animation loop) could burn the whole monthly Sentry
// quota from a single visitor's session before anyone notices. Kept in
// localStorage (not a module-level counter) because an exhibition kiosk
// hitting the same render bug would otherwise reset the count on every
// refresh — a few hundred refreshes could still exhaust the quota.
export const SENTRY_EVENT_CAP_KEY = 'be-a-googler:sentry-event-count';
export const MAX_EVENTS_PER_DAY = 20;

export function bumpDailySentryEventCount(): number {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const raw = window.localStorage.getItem(SENTRY_EVENT_CAP_KEY);
    const parsed = raw ? (JSON.parse(raw) as { date: string; count: number }) : null;
    const count = parsed && parsed.date === today ? parsed.count + 1 : 1;
    window.localStorage.setItem(SENTRY_EVENT_CAP_KEY, JSON.stringify({ date: today, count }));
    return count;
  } catch {
    // localStorage unavailable (private browsing, quota, etc.) — fall back
    // to always allowing rather than always blocking, since this is a rare
    // edge case and losing the cap is far less bad than losing all errors.
    return 1;
  }
}
