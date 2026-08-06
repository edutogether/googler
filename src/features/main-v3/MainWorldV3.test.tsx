import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../App';
import MainWorldV3, { MAIN_V3_BGM_STORAGE_KEY, MAIN_V3_SFX_STORAGE_KEY } from './MainWorldV3';

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

beforeEach(() => { MockAudio.instances = []; MockAudio.rejectNextPlay = false; window.localStorage.clear(); vi.stubGlobal('Audio', MockAudio); });

afterEach(() => {
  window.history.replaceState({}, '', '/');
  vi.unstubAllGlobals();
});

describe('MainWorldV3 final preview', () => {
  it('renders the V3 preview through the query-gated application route', () => {
    window.history.replaceState({}, '', '/googler/?preview=main-v3');
    render(<App />);

    expect(document.querySelector('.mw3-shell')).toBeInTheDocument();
    expect(document.querySelector('.bgc-shell')).toBeNull();
  });

  it('keeps the complete structure, assets, and accessible interactions', () => {
    render(<MainWorldV3 />);

    const shell = document.querySelector('.mw3-shell');
    expect(shell).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /탐험 시작|학습 마을|미션|길잡이|보관함/ })).toHaveLength(5);
    expect(screen.getAllByText('호기심 많은 구글러')).toHaveLength(2);
    expect(screen.getAllByText('Lv. 7 탐험가')).toHaveLength(3);
    const hero = screen.getByRole('heading', { level: 1 });
    expect(hero).toHaveTextContent('Googler의 여정을');
    expect(hero).toHaveTextContent('시작해볼까요?');
    expect(screen.getByLabelText('구글러 길잡이 안내')).toHaveTextContent('');
    expect(document.querySelector('.mw3-guide p')).toHaveAttribute('aria-label', '안녕?\n호기심이 아주 많은\n구글러구나!\n나와 같이\n즐겁게 배워볼래?');
    expect(document.querySelectorAll('.mw3-summary > *')).toHaveLength(3);
    expect(screen.getByText('데이터 섬의 비밀')).toBeInTheDocument();
    expect(document.querySelectorAll('.mw3-audio')).toHaveLength(1);
    expect(document.querySelector('.mw3-desktop-profile .mw3-mini-audio')).toBeInTheDocument();
    const miniAudio = document.querySelector('.mw3-desktop-profile .mw3-mini-audio') as HTMLElement;
    expect(within(miniAudio).getByRole('slider', { name: 'BGM 볼륨 조절' })).toBeInTheDocument();
    expect(miniAudio.querySelectorAll('.mw3-mini-song-track > span')).toHaveLength(2);
    expect(miniAudio.querySelectorAll('.mw3-mini-equalizer i')).toHaveLength(6);
    expect(miniAudio.querySelector('.mw3-mini-volume-panel')?.children).toHaveLength(1);
    expect(document.querySelector('.mw3-desktop-profile .mw3-audio')).toBeNull();
    expect(document.querySelector('.mw3-toast')).toHaveAttribute('role', 'status');
    expect(document.querySelector('[class*="vr2"]')).toBeNull();

    const imageSources = Array.from(document.querySelectorAll('img')).map((image) => image.getAttribute('src'));
    for (const asset of [
      'profile-avatar.png',
      'journey-avatar-medallion.png',
      'data-island-thumbnail.png',
      'badge-blue.png',
      'badge-gold.png',
      'badge-silver.png',
      'badge-emerald.png',
      'badge-violet.png',
      'badge-coral.png',
    ]) {
      expect(imageSources.some((source) => source?.endsWith(asset))).toBe(true);
    }

    const home = screen.getByRole('link', { name: 'Be a Googler 홈으로 이동' });
    expect(home).toHaveAttribute('href', import.meta.env.BASE_URL);
    expect(within(shell as HTMLElement).getByRole('button', { name: /새로운 여정 시작하기/ })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '알림 보기' })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: '호기심 많은 구글러 프로필 보기' })).toHaveLength(2);
    const desktopProfile = document.querySelector('.mw3-desktop-profile') as HTMLElement;
    expect(Array.from(desktopProfile.children).map((element) => element.className)).toEqual([
      'mw3-mini-audio', 'mw3-divider', 'mw3-profile-button', 'mw3-divider', 'mw3-desktop-notification',
    ]);
    fireEvent.click(within(desktopProfile).getByRole('button', { name: '알림 보기' }));
    expect(screen.getByRole('dialog', { name: '새 알림' })).toHaveTextContent('오늘의 여정이 열렸어요');
    expect(screen.getByRole('button', { name: '알림 더보기' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '계속하기' })).toBeInTheDocument();
    expect(screen.getByText('획득 배지')).toBeInTheDocument();
    expect(document.querySelectorAll('.mw3-badge-item')).toHaveLength(6);
    expect(document.querySelector('.mw3-desktop-profile .mw3-mini-sfx')).toBeNull();
    expect(document.querySelector('.mw3-desktop-profile .mw3-mini-audio [role="switch"]')).toBeNull();
  });

  it('keeps the compact mobile header controls in the DOM while retaining desktop identity', () => {
    render(<MainWorldV3 />);

    const profile = document.querySelector('.mw3-profile');
    expect(profile).toBeInTheDocument();
    expect(profile).not.toHaveAttribute('hidden');
    expect(within(profile as HTMLElement).getByRole('button', { name: '알림 보기' })).toBeInTheDocument();
    expect(within(profile as HTMLElement).getByRole('button', { name: '호기심 많은 구글러 프로필 보기' })).toBeInTheDocument();
    expect(within(profile as HTMLElement).getByRole('button', { name: /BGM 켜기|BGM 끄기/ })).toBeInTheDocument();
    expect(profile?.querySelector('.mw3-profile-button img')).toBeInTheDocument();
    expect(screen.getAllByText('호기심 많은 구글러')).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /탐험 시작|학습 마을|미션|길잡이|보관함/ })).toHaveLength(5);
    expect(screen.getByLabelText('더 많은 배지')).toHaveTextContent('…');
  });

  it('keeps compact desktop controls and badge discovery available at the 1024 CSS breakpoint', () => {
    const originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1009 });
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
    render(<MainWorldV3 />);

    const cluster = document.querySelector('.mw3-desktop-profile') as HTMLElement;
    expect(within(cluster).getByRole('button', { name: /BGM 켜기|BGM 끄기/ })).toBeInTheDocument();
    expect(within(cluster).getByRole('button', { name: '호기심 많은 구글러 프로필 보기' })).toBeInTheDocument();
    expect(within(cluster).getByRole('button', { name: '알림 보기' })).toBeInTheDocument();
    expect(screen.getByLabelText('더 많은 배지')).toHaveTextContent('…');

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalInnerWidth });
  });

  it('uses the compact mobile composition without a guide bubble or bottom audio dock', () => {
    const originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
    vi.stubGlobal('matchMedia', vi.fn((query: string) => ({ matches: query.includes('max-width') })));
    render(<MainWorldV3 />);

    expect(screen.getAllByRole('button', { name: /탐험 시작|학습 마을|미션|길잡이|보관함/ })).toHaveLength(5);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Googler의 여정을');
    expect(screen.getByText('호기심으로 배우고, 만들고,', { exact: false })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '새로운 여정' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '이어하기' })).toBeInTheDocument();
    expect(document.querySelector('.mw3-guide')).toBeNull();
    expect(document.querySelector('.mw3-audio')).toBeNull();
    expect(document.querySelectorAll('.mw3-summary > *')).toHaveLength(3);
    expect(document.querySelectorAll('.mw3-mobile-google-mark')).toHaveLength(2);
    expect(document.querySelector('.mw3-description')).toHaveTextContent('호기심으로 배우고, 만들고, 성장하며세상에 긍정적인 변화를 만들어요.');
    expect(document.querySelectorAll('.mw3-title-line')).toHaveLength(2);
    expect(document.querySelectorAll('.mw3-description-line')).toHaveLength(2);

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalInnerWidth });
  });

  it('types the desktop guide message and keeps the full message when reduced motion is requested', () => {
    vi.useFakeTimers();
    try {
      render(<MainWorldV3 />);

      const guide = document.querySelector('.mw3-guide p') as HTMLElement;
      expect(guide).toHaveTextContent('');
      act(() => vi.advanceTimersByTime(406));
      expect(guide).toHaveTextContent('안');
    } finally {
      vi.useRealTimers();
    }

    vi.stubGlobal('matchMedia', vi.fn((query: string) => ({ matches: query.includes('min-width') || query.includes('prefers-reduced-motion') })));
    render(<MainWorldV3 />);
    expect(document.querySelectorAll('.mw3-guide p')[1]).toHaveTextContent('안녕? 호기심이 아주 많은 구글러구나! 나와 같이 즐겁게 배워볼래?');
  });

  it('uses one looping BGM instance and makes actions announce a toast', async () => {
    render(<MainWorldV3 />);
    const audio = MockAudio.instances[0];
    expect(MockAudio.instances).toHaveLength(1);
    expect(audio.src).toContain('/audio/bgm/moonlit-voyager-village-loop.mp3');
    expect(audio.loop).toBe(true);
    expect(audio.preload).toBe('auto');
    expect(audio.volume).toBe(.28);
    fireEvent.click(screen.getByRole('button', { name: '학습 마을' }));
    expect(document.querySelector('.mw3-toast')).toHaveTextContent('이 길은 아직 준비 중이에요');
    expect(screen.getByRole('button', { name: '학습 마을' })).toHaveAttribute('aria-current', 'page');
    fireEvent.click(screen.getByRole('button', { name: /새로운 여정 시작하기/ }));
    expect(document.querySelector('.mw3-toast')).toHaveTextContent('새로운 여정이 곧 열립니다.');
    await waitFor(() => expect(audio.play).toHaveBeenCalledTimes(1));
    const desktopCluster = document.querySelector('.mw3-desktop-profile') as HTMLElement;
    expect(within(desktopCluster).getByLabelText('움직이는 이퀄라이저')).toHaveClass('is-playing');
    fireEvent.click(within(desktopCluster).getByRole('button', { name: 'BGM 끄기' }));
    expect(audio.pause).toHaveBeenCalledTimes(1);
    expect(audio.currentTime).toBe(0);
    fireEvent.click(within(desktopCluster).getByRole('button', { name: 'BGM 켜기' }));
    await waitFor(() => expect(audio.play).toHaveBeenCalledTimes(2));
    const sfx = within(document.querySelector('.mw3-audio') as HTMLElement).getByRole('switch', { name: '효과음 켜기 또는 끄기' });
    fireEvent.click(sfx);
    expect(sfx).toHaveAttribute('aria-checked', 'false');
    expect(window.localStorage.getItem(MAIN_V3_SFX_STORAGE_KEY)).toBe('false');
    expect(JSON.parse(window.localStorage.getItem(MAIN_V3_BGM_STORAGE_KEY) ?? '{}')).toMatchObject({ enabled: true, volume: .28 });
  });

  it('retries blocked autoplay once on the first non-music pointer gesture', async () => {
    MockAudio.rejectNextPlay = true;
    render(<MainWorldV3 />);
    const audio = MockAudio.instances[0];
    await waitFor(() => expect(audio.play).toHaveBeenCalledTimes(1));
    await Promise.resolve();
    fireEvent.pointerDown(document.body);
    await waitFor(() => expect(audio.play).toHaveBeenCalledTimes(2));
    expect(document.querySelector('.mw3-desktop-profile .mw3-mini-equalizer')).toHaveClass('is-playing');
  });
});
