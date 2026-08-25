import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App';
import './index.css';

// Only report from the real deployed build — not local dev or the test
// runner, which would otherwise spam a real Sentry project with noise.
// The DSN is a public, send-only address (Sentry's own docs say it's safe
// to ship in client code), so it doesn't need to be an env-var secret.
// Circuit breaker: without a cap, a bug that throws on every render (or
// every frame of an animation loop) could burn the whole monthly Sentry
// quota from a single visitor's session before anyone notices. Kept in
// localStorage (not a module-level counter) because an exhibition kiosk
// hitting the same render bug would otherwise reset the count on every
// refresh — a few hundred refreshes could still exhaust the quota.
const SENTRY_EVENT_CAP_KEY = 'be-a-googler:sentry-event-count';
const MAX_EVENTS_PER_DAY = 20;
function bumpDailySentryEventCount(): number {
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

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: 'https://bb25f9469e6a53b7fb3b8c4dbaac0965@o4511966927912960.ingest.us.sentry.io/4511966996267008',
    environment: 'production',
    release: import.meta.env.VITE_COMMIT_SHA ?? 'unknown',
    // Default-deny sending things like IP address or request cookies — this
    // is an anonymous exhibition shell, error reports don't need them.
    sendDefaultPii: false,
    // The SDK's default BrowserSession integration reports a "session"
    // beacon on every visit (on idle/hide, not just on error) for release
    // health stats — this app has no server-side release pipeline to make
    // use of that, and privacy.html promises nothing is sent during normal
    // (error-free) use, so drop it rather than leave the promise false.
    integrations: (defaults) => defaults.filter((integration) => integration.name !== 'BrowserSession'),
    beforeSend(event) {
      return bumpDailySentryEventCount() <= MAX_EVENTS_PER_DAY ? event : null;
    },
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<p style={{ padding: '40px', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>문제가 발생했어요. 페이지를 새로고침해 주세요.</p>}>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
);
