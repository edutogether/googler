import { useEffect, useState } from 'react';

// Tracks the live viewport width so the mobile/desktop layout keeps up
// when the window is resized without a full reload (isMobile etc. were
// previously computed once per render, so resizing an open tab left the
// CSS breakpoints and the JS-driven content — nav labels, subpage
// scenes — out of sync).
export function useViewportBreakpoints() {
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    // A drag-resize can fire the resize event dozens of times a second;
    // coalescing to one state update per animation frame keeps that from
    // triggering a matching flood of re-renders.
    let frame = 0;
    const onResize = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => setViewportWidth(window.innerWidth));
    };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); window.cancelAnimationFrame(frame); };
  }, []);
  return {
    viewportWidth,
    hasDesktopAmbient: viewportWidth >= 1024,
    // Matches the CSS desktop breakpoint (min-width: 1000px) so there is no
    // unstyled gap between the mobile and desktop layouts — a portrait
    // tablet (768-999px) gets the mobile layout, a landscape one (1000px+)
    // gets the desktop layout, so neither needs bespoke tablet styling.
    isMobile: viewportWidth < 1000,
    hasDesktopControls: viewportWidth >= 1000,
  };
}
