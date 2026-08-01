import { CSSProperties, RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { selectVisualResetAsset } from './visualResetAssets';
import { VISUAL_RESET_HOTSPOTS } from './visualResetHotspots';

type ImageBox = { x: number; y: number; width: number; height: number };

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

function useViewportRatio() {
  const getRatio = () => window.innerWidth / Math.max(window.innerHeight, 1);
  const [viewportRatio, setViewportRatio] = useState(getRatio);
  useEffect(() => {
    const update = () => setViewportRatio(getRatio());
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return viewportRatio;
}

function useHotspotDebug() {
  const [debugEnabled] = useState(() => (
    new URLSearchParams(window.location.search).get('hotspots') === '1'
    || window.localStorage.getItem('googlerHotspotDebug') === '1'
  ));
  return debugEnabled;
}

function useRenderedImageBox(imageRef: RefObject<HTMLImageElement | null>) {
  const [imageBox, setImageBox] = useState<ImageBox>({ x: 0, y: 0, width: 0, height: 0 });
  const refreshImageBox = useCallback(() => {
    const image = imageRef.current;
    if (!image) return;
    const { x, y, width, height } = image.getBoundingClientRect();
    setImageBox({ x, y, width, height });
  }, [imageRef]);

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;
    refreshImageBox();
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(refreshImageBox);
    observer?.observe(image);
    window.addEventListener('resize', refreshImageBox);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', refreshImageBox);
    };
  }, [imageRef, refreshImageBox]);

  return { imageBox, refreshImageBox };
}

export default function VisualResetMain() {
  const reducedMotion = useReducedMotion();
  const hotspotDebug = useHotspotDebug();
  const asset = selectVisualResetAsset(useViewportRatio());
  const imageRef = useRef<HTMLImageElement>(null);
  const { imageBox, refreshImageBox } = useRenderedImageBox(imageRef);
  const stageStyle = { '--visual-reset-asset-ratio': asset.aspectRatio } as CSSProperties;

  return (
    <main className="visual-reset-page" aria-label="BE A GOOGLER main prototype">
      <div className={`visual-reset-stage-shell${reducedMotion ? ' is-reduced-motion' : ''}${hotspotDebug ? ' is-hotspot-debug' : ''}`} style={stageStyle}>
        <div className="visual-reset-image-frame" data-asset-name={asset.name} data-asset-ratio={asset.aspectRatio}>
          <img ref={imageRef} className="visual-reset-image" src={asset.src} alt="BE A GOOGLER main prototype" onLoad={refreshImageBox} />
          <div className="visual-reset-hotspot-layer" aria-label="Prototype interactive areas">
            {VISUAL_RESET_HOTSPOTS.map((hotspot) => (
              <button
                key={hotspot.id}
                type="button"
                aria-label={hotspot.label}
                className={`visual-reset-hotspot visual-reset-hotspot--${hotspot.tone} visual-reset-hotspot--${hotspot.id}`}
                data-hotspot-id={hotspot.id}
                data-hotspot-label={hotspot.label}
                data-hotspot-position={`${hotspot.left}%, ${hotspot.top}%`}
                style={{ left: `${hotspot.left}%`, top: `${hotspot.top}%`, width: `${hotspot.width}%`, height: `${hotspot.height}%` }}
                onClick={(event) => event.preventDefault()}
              />
            ))}
          </div>
        </div>
        {hotspotDebug && (
          <output className="visual-reset-debug-meta" aria-live="polite">
            <strong>{asset.name}</strong>
            <span>asset ratio {asset.aspectRatio.toFixed(4)}</span>
            <span>image box {Math.round(imageBox.x)}, {Math.round(imageBox.y)} · {Math.round(imageBox.width)} × {Math.round(imageBox.height)}</span>
            <span>sky/cream area = letterbox</span>
          </output>
        )}
      </div>
    </main>
  );
}
