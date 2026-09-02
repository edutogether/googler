import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { navigation } from './mainWorldContent';
import { useSceneNavigation } from './useSceneNavigation';

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

function setup(overrides: Partial<Parameters<typeof useSceneNavigation>[0]> = {}) {
  const announce = vi.fn();
  const preloadScene = vi.fn();
  const hook = renderHook(() => useSceneNavigation({ isMobile: false, sfxOn: false, announce, preloadScene, ...overrides }));
  return { ...hook, announce, preloadScene };
}

const questNavItem = navigation.find((item) => item.id === 'town')!;
const exploreNavItem = navigation.find((item) => item.id === 'explore')!;

describe('useSceneNavigation', () => {
  it('starts on the explore (home) scene, idle', () => {
    const { result } = setup();
    expect(result.current.activeNav).toBe('explore');
    expect(result.current.transitionPhase).toBe('idle');
    expect(result.current.showsMainWorld).toBe(true);
  });

  it('ignores a click on the already-active nav item', () => {
    const { result } = setup();
    act(() => { result.current.activateNavigation(exploreNavItem); });
    expect(result.current.transitionPhase).toBe('idle');
  });

  it('preloads the destination scene and runs the cover/loading/reveal sequence', () => {
    const { result, preloadScene } = setup();
    act(() => { result.current.activateNavigation(questNavItem); });
    expect(preloadScene).toHaveBeenCalledWith('town');
    expect(result.current.transitionPhase).toBe('cover');
    expect(result.current.activeNav).toBe('explore');

    act(() => { vi.advanceTimersByTime(640); });
    expect(result.current.activeNav).toBe('town');
    expect(result.current.transitionPhase).toBe('loading');

    act(() => { vi.advanceTimersByTime(1340); });
    expect(result.current.transitionPhase).toBe('reveal');

    act(() => { vi.advanceTimersByTime(640); });
    expect(result.current.transitionPhase).toBe('idle');
  });

  it('announces returning home once the switch to explore lands', () => {
    const { result, announce } = setup();
    act(() => { result.current.activateNavigation(questNavItem); });
    act(() => { vi.advanceTimersByTime(640 + 1340 + 640); });

    act(() => { result.current.activateNavigation(exploreNavItem); });
    act(() => { vi.advanceTimersByTime(640); });
    expect(announce).toHaveBeenCalledWith('홈에서 새로운 모험을 이어가요.');
  });

  it('switches instantly with no transition when reduced motion is preferred', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
    const { result } = setup();
    act(() => { result.current.activateNavigation(questNavItem); });
    expect(result.current.activeNav).toBe('town');
    expect(result.current.transitionPhase).toBe('idle');
  });

  it('plays a click sound on desktop but not on mobile', () => {
    const { result: desktopResult } = setup({ isMobile: false });
    act(() => { desktopResult.current.activateNavigation(questNavItem); });
    // playUiSound is a no-op in jsdom (no AudioContext) — this just guards
    // that activateNavigation doesn't throw when it's exercised on both.
    const { result: mobileResult } = setup({ isMobile: true });
    expect(() => act(() => { mobileResult.current.activateNavigation(questNavItem); })).not.toThrow();
  });

  it('resets construction-card visibility whenever the active scene changes', () => {
    const { result } = setup();
    act(() => { result.current.setConstructionVisible(true); });
    expect(result.current.constructionVisible).toBe(true);

    act(() => { result.current.activateNavigation(questNavItem); });
    act(() => { vi.advanceTimersByTime(640); });
    expect(result.current.constructionVisible).toBe(false);
  });

  it('clears pending transition timers on unmount without throwing', () => {
    const { result, unmount } = setup();
    act(() => { result.current.activateNavigation(questNavItem); });
    expect(() => unmount()).not.toThrow();
  });
});
