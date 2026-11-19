import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App';
import { bumpDailySentryEventCount, MAX_EVENTS_PER_DAY } from './sentryEventCap';
import { installSplash } from './splash';
import './index.css';

// Only report from the real deployed build — not local dev or the test
// runner, which would otherwise spam a real Sentry project with noise.
// The DSN is a public, send-only address (Sentry's own docs say it's safe
// to ship in client code), so it doesn't need to be an env-var secret.
if (import.meta.env.PROD) {
  Sentry.init({
    dsn: 'https://bb25f9469e6a53b7fb3b8c4dbaac0965@o4511966927912960.ingest.us.sentry.io/4511966996267008',
    environment: 'production',
    release: import.meta.env.VITE_COMMIT_SHA ?? 'unknown',
    // Default-deny sending things like IP address or request cookies — this
    // is an anonymous exhibition shell, error reports don't need them. Sentry 11
    // replaced `sendDefaultPii` with `dataCollection` and made leaving it unset
    // permissive, so the restrictive v10 baseline is spelled out here.
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: {
        request: { deny: ['forwarded', '-ip', 'remote-', 'via', '-user'] },
        response: { deny: ['forwarded', '-ip', 'remote-', 'via', '-user'] },
      },
      httpBodies: [],
      urlQueryParams: { deny: ['forwarded', '-ip', 'remote-', 'via', '-user'] },
      genAI: { inputs: false, outputs: false },
      databaseQueryData: false,
      queues: false,
      graphQL: { document: false, variables: false },
    },
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

installSplash();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<p style={{ padding: '40px', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>문제가 발생했어요. 페이지를 새로고침해 주세요.</p>}>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
);
