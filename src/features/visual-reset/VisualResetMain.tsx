import { useEffect, useState } from 'react';
import { VISUAL_RESET_HOTSPOTS } from './visualResetHotspots';

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mediaQuery) return;
    const update = () => setReducedMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener?.('change', update);
    return () => mediaQuery.removeEventListener?.('change', update);
  }, []);

  return reducedMotion;
}

function useHotspotDebug() {
  const [debugEnabled] = useState(() => {
    const queryEnabled = new URLSearchParams(window.location.search).get('hotspots') === '1';
    const storageEnabled = window.localStorage.getItem('googlerHotspotDebug') === '1';
    return queryEnabled || storageEnabled;
  });

  return debugEnabled;
}

export default function VisualResetMain() {
  const reducedMotion = useReducedMotion();
  const hotspotDebug = useHotspotDebug();

  return (
    <main className="visual-reset-page" aria-label="BE A GOOGLER 메인 시안 프로토타입">
      <div className={`visual-reset-stage${reducedMotion ? ' is-reduced-motion' : ''}${hotspotDebug ? ' is-hotspot-debug' : ''}`}>
        <img
          className="visual-reset-image"
          src="/googler/visual-reset/main/be-a-googler-main.png"
          alt="BE A GOOGLER 메인 시안"
        />
        <div className="visual-reset-hotspot-layer" aria-label="시안 상호작용 영역">
          {VISUAL_RESET_HOTSPOTS.map((hotspot) => (
            <button
              key={hotspot.id}
              type="button"
              aria-label={hotspot.label}
              className={`visual-reset-hotspot visual-reset-hotspot--${hotspot.tone} visual-reset-hotspot--${hotspot.id}`}
              data-hotspot-id={hotspot.id}
              data-hotspot-label={hotspot.label}
              style={{
                left: `${hotspot.left}%`,
                top: `${hotspot.top}%`,
                width: `${hotspot.width}%`,
                height: `${hotspot.height}%`,
              }}
              onClick={(event) => event.preventDefault()}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
