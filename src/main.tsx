import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App';
import './index.css';

// Only report from the real deployed build — not local dev or the test
// runner, which would otherwise spam a real Sentry project with noise.
// The DSN is a public, send-only address (Sentry's own docs say it's safe
// to ship in client code), so it doesn't need to be an env-var secret.
if (import.meta.env.PROD) {
  // Circuit breaker: without a cap, a bug that throws on every render (or
  // every frame of an animation loop) could burn the whole monthly Sentry
  // quota from a single visitor's session before anyone notices.
  const MAX_EVENTS_PER_SESSION = 20;
  let eventCount = 0;
  Sentry.init({
    dsn: 'https://bb25f9469e6a53b7fb3b8c4dbaac0965@o4511966927912960.ingest.us.sentry.io/4511966996267008',
    environment: 'production',
    release: import.meta.env.VITE_COMMIT_SHA ?? 'unknown',
    // Default-deny sending things like IP address or request cookies — this
    // is an anonymous exhibition shell, error reports don't need them.
    sendDefaultPii: false,
    beforeSend(event) {
      eventCount += 1;
      return eventCount <= MAX_EVENTS_PER_SESSION ? event : null;
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
