import { useEffect } from 'react';
import MainWorldV3 from './features/main-v3/MainWorldV3';

export default function App() {
  // The boot splash in index.html is painted before any JS runs; once the
  // first app frame has committed, fade it out and drop it from the DOM.
  // The 450ms removal waits out its 400ms opacity transition.
  useEffect(() => {
    const splash = document.getElementById('boot-splash');
    if (!splash) return undefined;
    splash.style.opacity = '0';
    splash.style.pointerEvents = 'none';
    const timer = window.setTimeout(() => splash.remove(), 450);
    return () => window.clearTimeout(timer);
  }, []);
  return <MainWorldV3 />;
}
