import { useCallback, useEffect, useRef } from 'react';
import { asset, desktopScenes } from './mainWorldContent';

export function useScenePreloader() {
  const preloadedScenesRef = useRef<Set<string>>(new Set());
  const preloadScene = useCallback((id: keyof typeof desktopScenes) => {
    if (preloadedScenesRef.current.has(id)) return;
    preloadedScenesRef.current.add(id);
    const preload = new Image();
    preload.src = asset(window.innerWidth < 1000 ? desktopScenes[id].mobileAsset : desktopScenes[id].asset);
  }, []);
  useEffect(() => {
    // The loading-transition backdrop is needed for every navigation
    // regardless of destination, so it's still warmed right away — it's a
    // single small image, not the 4 multi-hundred-KB subpage scenes below.
    const loadingBackdrop = new Image();
    loadingBackdrop.src = asset(window.innerWidth < 1000 ? 'visual-reset/main/be-a-googler-loading-mobile.webp' : 'visual-reset/main/be-a-googler-loading-desktop.webp');
  }, []);
  return { preloadScene };
}
