import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MAIN_V3_SFX_STORAGE_KEY } from './mainWorldContent';
import { useAnnouncements } from './useAnnouncements';

beforeEach(() => { window.localStorage.clear(); vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); });

describe('useAnnouncements', () => {
  it('starts with sound effects on when nothing is stored', () => {
    const { result } = renderHook(() => useAnnouncements());
    expect(result.current.sfxOn).toBe(true);
  });

  it('reads a previously saved sfx-off preference from localStorage', () => {
    window.localStorage.setItem(MAIN_V3_SFX_STORAGE_KEY, 'false');
    const { result } = renderHook(() => useAnnouncements());
    expect(result.current.sfxOn).toBe(false);
  });

  it('shows a toast and auto-dismisses it after ~1.9s', () => {
    const { result } = renderHook(() => useAnnouncements());
    act(() => { result.current.announce('테스트 메시지'); });
    expect(result.current.toast).toBe('테스트 메시지');
    act(() => { vi.advanceTimersByTime(1900); });
    expect(result.current.toast).toBe('');
  });

  it('restarts the dismiss timer when a second announcement arrives before the first clears', () => {
    const { result } = renderHook(() => useAnnouncements());
    act(() => { result.current.announce('첫 메시지'); });
    act(() => { vi.advanceTimersByTime(1000); });
    act(() => { result.current.announce('두번째 메시지'); });
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.toast).toBe('두번째 메시지');
    act(() => { vi.advanceTimersByTime(900); });
    expect(result.current.toast).toBe('');
  });

  it('toggles and persists the sfx preference', () => {
    const { result } = renderHook(() => useAnnouncements());
    act(() => { result.current.toggleSfx(); });
    expect(result.current.sfxOn).toBe(false);
    expect(window.localStorage.getItem(MAIN_V3_SFX_STORAGE_KEY)).toBe('false');

    act(() => { result.current.toggleSfx(); });
    expect(result.current.sfxOn).toBe(true);
    expect(window.localStorage.getItem(MAIN_V3_SFX_STORAGE_KEY)).toBe('true');
  });

  it('clears the pending dismiss timer on unmount without throwing', () => {
    const { result, unmount } = renderHook(() => useAnnouncements());
    act(() => { result.current.announce(); });
    expect(() => unmount()).not.toThrow();
  });
});
