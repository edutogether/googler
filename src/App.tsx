import { useEffect } from 'react';
import MainWorldV3 from './features/main-v3/MainWorldV3';

// How long the boot splash stays up, measured from navigation start (which is
// also when it first paints, since index.html renders it before any JS runs).
const MIN_VISIBLE_MS = 1200;
// Safety valve: `load` waits on every image, so one stalled request would
// otherwise pin the splash there forever.
const MAX_VISIBLE_MS = 4000;
// Matches the splash's own `transition: opacity .4s` in index.html.
const FADE_MS = 450;

export default function App() {
  // The splash comes down only once BOTH the minimum on-screen time has passed
  // AND the page has finished loading — whichever lands later. Minimum alone
  // shows a half-painted scene on slow devices; load alone flashes past on fast
  // ones. Reduced-motion skips the hold entirely: an artificial wait is a
  // flourish, and the visual-regression run emulates reduced motion, so this
  // also keeps its screenshots free of splash frames.
  useEffect(() => {
    const splash = document.getElementById('boot-splash');
    if (!splash) return undefined;

    const holds = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timers: number[] = [];
    let hidden = false;

    const hide = () => {
      if (hidden) return;
      hidden = true;
      splash.style.opacity = '0';
      splash.style.pointerEvents = 'none';
      timers.push(window.setTimeout(() => splash.remove(), FADE_MS));
    };

    const hideOnceSeen = () => {
      const remaining = holds ? MIN_VISIBLE_MS - performance.now() : 0;
      if (remaining <= 0) hide();
      else timers.push(window.setTimeout(hide, remaining));
    };

    if (document.readyState === 'complete') hideOnceSeen();
    else window.addEventListener('load', hideOnceSeen, { once: true });
    timers.push(window.setTimeout(hide, holds ? Math.max(0, MAX_VISIBLE_MS - performance.now()) : 0));

    return () => {
      window.removeEventListener('load', hideOnceSeen);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);
  return <MainWorldV3 />;
}
