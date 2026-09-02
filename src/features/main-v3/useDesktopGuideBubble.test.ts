import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DESKTOP_GUIDE_MESSAGE } from './mainWorldContent';
import { useDesktopGuideBubble } from './useDesktopGuideBubble';

function setInnerWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true, writable: true });
}

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('useDesktopGuideBubble', () => {
  it('does nothing on narrow (mobile) viewports', () => {
    setInnerWidth(500);
    const { result } = renderHook(() => useDesktopGuideBubble());
    act(() => { vi.advanceTimersByTime(5000); });
    expect(result.current.guideVisible).toBe(false);
    expect(result.current.guideText).toBe('');
  });

  it('shows the full message immediately when reduced motion is preferred', () => {
    setInnerWidth(1200);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
    const { result } = renderHook(() => useDesktopGuideBubble());
    expect(result.current.guideVisible).toBe(true);
    expect(result.current.guideText).toBe(DESKTOP_GUIDE_MESSAGE);
  });

  it('types the message out one character at a time on desktop', () => {
    setInnerWidth(1200);
    const { result } = renderHook(() => useDesktopGuideBubble());
    expect(result.current.guideVisible).toBe(false);

    act(() => { vi.advanceTimersByTime(320); });
    expect(result.current.guideVisible).toBe(true);
    expect(result.current.guideText).toBe(DESKTOP_GUIDE_MESSAGE.slice(0, 1));

    act(() => { vi.advanceTimersByTime(46 * (DESKTOP_GUIDE_MESSAGE.length - 1)); });
    expect(result.current.guideText).toBe(DESKTOP_GUIDE_MESSAGE);
  });

  it('hides the bubble after the hold period and types it back in', () => {
    setInnerWidth(1200);
    const { result } = renderHook(() => useDesktopGuideBubble());
    act(() => { vi.advanceTimersByTime(320 + 46 * (DESKTOP_GUIDE_MESSAGE.length - 1) + 9900); });
    expect(result.current.guideVisible).toBe(false);

    act(() => { vi.advanceTimersByTime(620); });
    expect(result.current.guideVisible).toBe(true);
    expect(result.current.guideText).toBe(DESKTOP_GUIDE_MESSAGE.slice(0, 1));
  });
});
