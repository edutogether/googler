import { useCallback, useEffect, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

// Desktop-only pointer-tilt parallax on the scene shell. requestAnimationFrame
// throttles the CSS custom-property writes to once per frame regardless of
// how fast pointermove fires.
export function useParallaxTilt() {
  const shellRef = useRef<HTMLElement | null>(null);
  const parallaxFrame = useRef<number | undefined>(undefined);
  useEffect(() => () => window.cancelAnimationFrame(parallaxFrame.current ?? 0), []);

  const setParallax = useCallback((x: number, y: number) => {
    window.cancelAnimationFrame(parallaxFrame.current ?? 0);
    parallaxFrame.current = window.requestAnimationFrame(() => { shellRef.current?.style.setProperty('--mw3-parallax-x', x.toFixed(3)); shellRef.current?.style.setProperty('--mw3-parallax-y', y.toFixed(3)); });
  }, []);

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (window.innerWidth < 1024 || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    setParallax(((event.clientX - bounds.left) / bounds.width - .5) * 2, ((event.clientY - bounds.top) / bounds.height - .5) * 2);
  }, [setParallax]);

  const handlePointerLeave = useCallback(() => setParallax(0, 0), [setParallax]);

  return { shellRef, handlePointerMove, handlePointerLeave };
}
