import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MAIN_V3_BGM_STORAGE_KEY } from './mainWorldContent';
import { useWorldAudio } from './useWorldAudio';

class MockAudio extends EventTarget {
  static instances: MockAudio[] = [];
  static rejectNextPlay = false;
  currentTime = 0; loop = false; muted = false; paused = true; preload = ''; volume = 1;
  constructor(public src: string) { super(); MockAudio.instances.push(this); }
  play = vi.fn(() => {
    if (MockAudio.rejectNextPlay) { MockAudio.rejectNextPlay = false; return Promise.reject(new Error('Autoplay blocked')); }
    this.paused = false; this.dispatchEvent(new Event('play')); return Promise.resolve();
  });
  pause = vi.fn(() => { this.paused = true; this.dispatchEvent(new Event('pause')); });
}

beforeEach(() => {
  MockAudio.instances = [];
  MockAudio.rejectNextPlay = false;
  window.localStorage.clear();
  vi.stubGlobal('Audio', MockAudio);
});

afterEach(() => { vi.unstubAllGlobals(); });

describe('useWorldAudio', () => {
  it('creates one Audio element and starts it playing by default', async () => {
    renderHook(() => useWorldAudio());
    expect(MockAudio.instances).toHaveLength(1);
    await act(async () => { await Promise.resolve(); });
    expect(MockAudio.instances[0].paused).toBe(false);
  });

  it('always resets a previously stored bgm-off preference — the shared kiosk always starts with BGM on', async () => {
    window.localStorage.setItem(MAIN_V3_BGM_STORAGE_KEY, 'false');
    const { result } = renderHook(() => useWorldAudio());
    await act(async () => { await Promise.resolve(); });
    expect(window.localStorage.getItem(MAIN_V3_BGM_STORAGE_KEY)).toBeNull();
    expect(result.current.bgmEnabled).toBe(true);
  });

  it('mutes and skips autoplay entirely under the ?qa-mute=1 visual-QA flag', () => {
    window.history.replaceState({}, '', '/?qa-mute=1');
    renderHook(() => useWorldAudio());
    expect(MockAudio.instances[0].muted).toBe(true);
    expect(MockAudio.instances[0].volume).toBe(0);
    expect(MockAudio.instances[0].play).not.toHaveBeenCalled();
    window.history.replaceState({}, '', '/');
  });

  it('toggle() pauses and resets when playing, and restarts from zero when re-enabled', async () => {
    const { result } = renderHook(() => useWorldAudio());
    await act(async () => { await Promise.resolve(); });
    expect(result.current.bgmEnabled).toBe(true);

    act(() => { result.current.toggle(); });
    expect(result.current.bgmEnabled).toBe(false);
    expect(MockAudio.instances[0].pause).toHaveBeenCalled();

    await act(async () => { result.current.toggle(); await Promise.resolve(); });
    expect(result.current.bgmEnabled).toBe(true);
    expect(MockAudio.instances[0].currentTime).toBe(0);
  });

  it('loops playback from the start when the track ends and bgm is still enabled', async () => {
    renderHook(() => useWorldAudio());
    await act(async () => { await Promise.resolve(); });
    const audio = MockAudio.instances[0];
    audio.currentTime = 42;
    await act(async () => { audio.dispatchEvent(new Event('ended')); await Promise.resolve(); });
    expect(audio.currentTime).toBe(0);
    expect(audio.play).toHaveBeenCalled();
  });

  it('setVolume clamps to [0, 1] and applies to the audio element immediately', () => {
    const { result } = renderHook(() => useWorldAudio());
    act(() => { result.current.setVolume(1.5); });
    expect(MockAudio.instances[0].volume).toBe(1);
    act(() => { result.current.setVolume(-0.5); });
    expect(MockAudio.instances[0].volume).toBe(0);
  });

  it('cleans up listeners and pauses on unmount', async () => {
    const { unmount } = renderHook(() => useWorldAudio());
    await act(async () => { await Promise.resolve(); });
    const audio = MockAudio.instances[0];
    unmount();
    expect(audio.pause).toHaveBeenCalled();
  });
});
