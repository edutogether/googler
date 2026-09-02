import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { asset, desktopScenes } from './mainWorldContent';
import { useScenePreloader } from './useScenePreloader';

function setInnerWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true, writable: true });
}

let createdImages: HTMLImageElement[] = [];

beforeEach(() => {
  createdImages = [];
  const RealImage = window.Image;
  vi.stubGlobal('Image', class extends RealImage {
    constructor() { super(); createdImages.push(this); }
  });
});

afterEach(() => { vi.unstubAllGlobals(); });

describe('useScenePreloader', () => {
  it('warms the shared loading backdrop image on mount', () => {
    setInnerWidth(1200);
    renderHook(() => useScenePreloader());
    expect(createdImages).toHaveLength(1);
    expect(createdImages[0].src).toContain(asset('visual-reset/main/be-a-googler-loading-desktop.webp'));
  });

  it('preloads the desktop asset for a scene on desktop viewports', () => {
    setInnerWidth(1200);
    const { result } = renderHook(() => useScenePreloader());
    act(() => { result.current.preloadScene('town'); });
    const townImage = createdImages.find((img) => img.src.includes('quest'));
    expect(townImage?.src).toContain(asset(desktopScenes.town.asset));
  });

  it('preloads the mobile asset for a scene on narrow viewports', () => {
    setInnerWidth(500);
    const { result } = renderHook(() => useScenePreloader());
    act(() => { result.current.preloadScene('town'); });
    const townImage = createdImages.find((img) => img.src.includes('quest'));
    expect(townImage?.src).toContain(asset(desktopScenes.town.mobileAsset));
  });

  it('does not re-fetch a scene that was already preloaded', () => {
    setInnerWidth(1200);
    const { result } = renderHook(() => useScenePreloader());
    act(() => { result.current.preloadScene('town'); });
    const countAfterFirst = createdImages.length;
    act(() => { result.current.preloadScene('town'); });
    expect(createdImages).toHaveLength(countAfterFirst);
  });
});
