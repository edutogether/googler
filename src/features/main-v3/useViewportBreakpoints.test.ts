import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useViewportBreakpoints } from './useViewportBreakpoints';

function setInnerWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true, writable: true });
}

afterEach(() => { vi.unstubAllGlobals(); });

describe('useViewportBreakpoints', () => {
  it('derives desktop breakpoint flags from the initial viewport width', () => {
    setInnerWidth(1200);
    const { result } = renderHook(() => useViewportBreakpoints());
    expect(result.current.viewportWidth).toBe(1200);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.hasDesktopAmbient).toBe(true);
    expect(result.current.hasDesktopControls).toBe(true);
  });

  it('flags widths below the 1000px breakpoint as mobile', () => {
    setInnerWidth(500);
    const { result } = renderHook(() => useViewportBreakpoints());
    expect(result.current.isMobile).toBe(true);
    expect(result.current.hasDesktopAmbient).toBe(false);
    expect(result.current.hasDesktopControls).toBe(false);
  });

  it('splits desktop-ambient (1024px) from the narrower desktop-controls (1000px) breakpoint', () => {
    setInnerWidth(1010);
    const { result } = renderHook(() => useViewportBreakpoints());
    expect(result.current.isMobile).toBe(false);
    expect(result.current.hasDesktopControls).toBe(true);
    expect(result.current.hasDesktopAmbient).toBe(false);
  });

  it('updates state on resize only once the coalesced animation frame fires', () => {
    setInnerWidth(1200);
    let rafCallback: FrameRequestCallback | undefined;
    vi.stubGlobal('requestAnimationFrame', vi.fn((cb: FrameRequestCallback) => { rafCallback = cb; return 1; }));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    const { result } = renderHook(() => useViewportBreakpoints());

    act(() => {
      setInnerWidth(600);
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current.viewportWidth).toBe(1200);

    act(() => { rafCallback?.(0); });
    expect(result.current.viewportWidth).toBe(600);
    expect(result.current.isMobile).toBe(true);
  });

  it('removes the resize listener on unmount', () => {
    setInnerWidth(1200);
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useViewportBreakpoints());
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});
