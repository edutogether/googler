import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

class MockAudio extends EventTarget {
  static instances: MockAudio[] = [];
  currentTime = 0; loop = false; muted = false; paused = true; preload = ''; volume = 1;
  constructor(public src: string) { super(); MockAudio.instances.push(this); }
  play = vi.fn(() => { this.paused = false; this.dispatchEvent(new Event('play')); return Promise.resolve(); });
  pause = vi.fn(() => { this.paused = true; this.dispatchEvent(new Event('pause')); });
}

beforeEach(() => {
  MockAudio.instances = [];
  window.localStorage.clear();
  vi.stubGlobal('Audio', MockAudio);
});

afterEach(() => {
  window.history.replaceState({}, '', '/googler/');
  vi.unstubAllGlobals();
});

describe('public MainWorldV3 route', () => {
  it('renders MainWorldV3 as the default /googler/ screen', () => {
    render(<App />);

    expect(document.querySelector('.mw3-shell')).toBeInTheDocument();
    expect(document.querySelector('.vr2-shell')).toBeNull();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Googler의 여정을');
    expect(screen.getByText('획득 배지')).toBeInTheDocument();
    expect(MockAudio.instances).toHaveLength(1);
  });

  it('keeps the preview query compatible with the same MainWorldV3 screen', () => {
    window.history.replaceState({}, '', '/googler/?preview=main-v3');
    render(<App />);

    expect(document.querySelector('.mw3-shell')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '프로필과 오디오 컨트롤' })).toBeInTheDocument();
  });

  it('renders the single Journey implementation only through the local preview query', () => {
    window.history.replaceState({}, '', '/googler/?preview=journey');
    render(<App />);

    expect(document.querySelector('.journey-preview')).toBeInTheDocument();
    expect(document.querySelector('.mw3-shell')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Be a Googler' })).toBeInTheDocument();
    expect(screen.getByText('모험 시작하기')).toBeInTheDocument();
  });
});
