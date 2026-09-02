import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useParallaxTilt } from './useParallaxTilt';

function setInnerWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true, writable: true });
}

let rafCallback: FrameRequestCallback | undefined;

beforeEach(() => {
  rafCallback = undefined;
  vi.stubGlobal('requestAnimationFrame', vi.fn((cb: FrameRequestCallback) => { rafCallback = cb; return 1; }));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});

afterEach(() => { vi.unstubAllGlobals(); });

function makePointerEvent(clientX: number, clientY: number, bounds: DOMRect) {
  return {
    clientX,
    clientY,
    currentTarget: { getBoundingClientRect: () => bounds },
  } as unknown as React.PointerEvent<HTMLElement>;
}

describe('useParallaxTilt', () => {
  it('writes normalized parallax coordinates as CSS custom properties, deferred to the next frame', () => {
    setInnerWidth(1200);
    const { result } = renderHook(() => useParallaxTilt());
    const shell = document.createElement('div');
    (result.current.shellRef as { current: HTMLElement | null }).current = shell;
    const setSpy = vi.spyOn(shell.style, 'setProperty');

    const bounds = { left: 0, top: 0, width: 200, height: 100 } as DOMRect;
    act(() => { result.current.handlePointerMove(makePointerEvent(200, 100, bounds)); });
    expect(setSpy).not.toHaveBeenCalled();

    act(() => { rafCallback?.(0); });
    expect(setSpy).toHaveBeenCalledWith('--mw3-parallax-x', '1.000');
    expect(setSpy).toHaveBeenCalledWith('--mw3-parallax-y', '1.000');
  });

  it('ignores pointer movement below the 1024px desktop breakpoint', () => {
    setInnerWidth(800);
    const { result } = renderHook(() => useParallaxTilt());
    const shell = document.createElement('div');
    (result.current.shellRef as { current: HTMLElement | null }).current = shell;
    const setSpy = vi.spyOn(shell.style, 'setProperty');

    const bounds = { left: 0, top: 0, width: 200, height: 100 } as DOMRect;
    act(() => { result.current.handlePointerMove(makePointerEvent(200, 100, bounds)); });
    act(() => { rafCallback?.(0); });
    expect(setSpy).not.toHaveBeenCalled();
  });

  it('resets parallax to the neutral origin on pointer leave', () => {
    setInnerWidth(1200);
    const { result } = renderHook(() => useParallaxTilt());
    const shell = document.createElement('div');
    (result.current.shellRef as { current: HTMLElement | null }).current = shell;
    const setSpy = vi.spyOn(shell.style, 'setProperty');

    act(() => { result.current.handlePointerLeave(); });
    act(() => { rafCallback?.(0); });
    expect(setSpy).toHaveBeenCalledWith('--mw3-parallax-x', '0.000');
    expect(setSpy).toHaveBeenCalledWith('--mw3-parallax-y', '0.000');
  });
});
