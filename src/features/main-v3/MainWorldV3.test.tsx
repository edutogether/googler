import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
  cleanup();
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
    expect(screen.getAllByRole('button', { name: /홈|퀘스트|플래너|도감|커뮤니티/ })).toHaveLength(5);
    expect(screen.getAllByText('호기심 많은 구글러')).toHaveLength(2);
    expect(screen.getAllByText('Lv. 7 탐험가')).toHaveLength(3);
    const hero = screen.getByRole('heading', { level: 1 });
    expect(hero).toHaveTextContent('Googler 의 여정을');
    expect(hero).toHaveTextContent('시작해볼까요 ?');
    expect(screen.getByRole('button', { name: /여정이란 \?/ })).toHaveTextContent('여정이란 ? ›');
    expect(document.querySelectorAll('.mw3-description-line')).toHaveLength(1);
    expect(document.querySelector('.mw3-description')).toHaveTextContent('호기심으로 배우고 성장하며, 세상에 긍정적인 변화를 만들어요.');
    expect(screen.getByLabelText('구글러 길잡이 안내')).toHaveTextContent('');
    expect(document.querySelector('.mw3-guide p')).toHaveAttribute('aria-label', '안녕 ?\n호기심이 아주 많은\n구글러구나 !\n나와 같이 구글을\n즐겁게 배워볼래 ?');
    expect(document.querySelectorAll('.mw3-summary > *')).toHaveLength(3);
    expect(document.querySelector('.mw3-card--continue .mw3-card-copy strong')).toHaveTextContent('데이터 섬의 비밀');
    const journeyTooltip = document.querySelector('.mw3-avatar-tooltip') as HTMLElement;
    expect(journeyTooltip).toHaveTextContent('호기심 많은 탐험가');
    expect(journeyTooltip.querySelector('.mw3-tooltip-thumbnail--avatar')).toHaveAttribute('src', expect.stringContaining('journey-avatar-medallion.png'));
    const journeyCard = document.querySelector('.mw3-card--journey') as HTMLElement;
    expect(journeyCard.tagName).toBe('ARTICLE');
    expect(within(journeyCard).getByRole('button', { name: '나의 여정 열기' })).toBeInTheDocument();
    const avatarTrigger = within(journeyCard).getByRole('button', { name: '탐험가 프로필 안내 보기' });
    expect(avatarTrigger).toContainElement(journeyTooltip);
    avatarTrigger.focus();
    expect(avatarTrigger).toHaveFocus();
    const islandTooltip = document.querySelector('.mw3-continue-tooltip') as HTMLElement;
    expect(islandTooltip).toHaveTextContent('데이터 섬의 비밀');
    expect(islandTooltip.querySelector('.mw3-tooltip-thumbnail--island')).toHaveAttribute('src', expect.stringContaining('data-island-thumbnail-v6.png'));
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
      'data-island-thumbnail-v6.png',
      'badge-blue-v5.png',
      'badge-gold-v5.png',
      'badge-silver-v5.png',
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
    const badgeLayout = document.querySelector('.mw3-badge-layout') as HTMLElement;
    expect(badgeLayout.querySelectorAll('.mw3-badge-row .mw3-badge-item')).toHaveLength(6);
    expect(Array.from(badgeLayout.querySelectorAll('.mw3-badge-trigger > small')).map((label) => label.textContent)).toEqual([
      '데이터 항해', '용기 있는 시작', '협업의 톱니', '초록 나침반', '별빛 지도', '반짝이는 생각',
    ]);
    expect(badgeLayout.querySelectorAll('.mw3-badge-info .mw3-tooltip-thumbnail--badge')).toHaveLength(6);
    expect(badgeLayout.querySelectorAll('.mw3-badge-info .mw3-tooltip-copy')).toHaveLength(6);
    expect(badgeLayout.querySelector('.mw3-badge-placeholder')).toBeNull();
    expect(badgeLayout.querySelector('.mw3-badge-more')).toBeNull();
    expect(badgeLayout.querySelector('.mw3-badge-item--last .mw3-badge-next')).toBeNull();
    expect(badgeLayout.querySelector('.mw3-badge-row > .mw3-badge-next')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '더 많은 배지 보기' }));
    expect(document.querySelector('.mw3-toast')).toHaveTextContent('새로운 여정을 이어가며 배지를 더 모아보세요!');
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
    expect(screen.getAllByRole('button', { name: /홈|퀘스트|플래너|도감|커뮤니티/ })).toHaveLength(5);
    expect(screen.getByRole('button', { name: '더 많은 배지 보기' })).toBeInTheDocument();
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
    expect(screen.getByText('호기심으로 배우고 성장하며,')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '새로운 여정' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '이어하기' })).toBeInTheDocument();
    expect(document.querySelector('.mw3-guide')).toBeNull();
    expect(document.querySelector('.mw3-audio')).toBeNull();
    expect(document.querySelectorAll('.mw3-summary > *')).toHaveLength(3);
    expect(document.querySelectorAll('.mw3-mobile-google-mark')).toHaveLength(2);
    expect(document.querySelector('.mw3-description')).toHaveTextContent('호기심으로 배우고 성장하며,세상에 긍정적인 변화를 만들어요.');
    expect(document.querySelectorAll('.mw3-title-line')).toHaveLength(2);
    expect(document.querySelectorAll('.mw3-description-line')).toHaveLength(2);
    expect(document.querySelector('.mw3-badge-layout')).toBeNull();

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalInnerWidth });
  });

  it('types the desktop guide message and keeps the full message when reduced motion is requested', () => {
    vi.useFakeTimers();
    try {
      render(<MainWorldV3 />);

      const guide = document.querySelector('.mw3-guide p') as HTMLElement;
      expect(guide).toHaveTextContent('');
      expect(document.querySelector('.mw3-guide')).toHaveClass('is-cycling-out');
      act(() => vi.advanceTimersByTime(406));
      expect(guide).toHaveTextContent('안녕');
      expect(document.querySelector('.mw3-guide')).not.toHaveClass('is-cycling-out');
      act(() => vi.advanceTimersByTime(100));
      expect(document.querySelector('.mw3-guide')).toHaveStyle('--mw3-guide-lines: 2');
      act(() => vi.advanceTimersByTime(8_000));
      expect(guide).toHaveTextContent('안녕 ? 호기심이 아주 많은 구글러구나 ! 나와 같이 구글을 즐겁게 배워볼래 ?');
    } finally {
      vi.useRealTimers();
    }

    vi.stubGlobal('matchMedia', vi.fn((query: string) => ({ matches: query.includes('min-width') || query.includes('prefers-reduced-motion') })));
    render(<MainWorldV3 />);
    expect(document.querySelectorAll('.mw3-guide p')[1]).toHaveTextContent('안녕 ? 호기심이 아주 많은 구글러구나 ! 나와 같이 구글을 즐겁게 배워볼래 ?');
  });

  it('uses one looping BGM instance and makes actions announce a toast', async () => {
    window.localStorage.setItem(MAIN_V3_BGM_STORAGE_KEY, JSON.stringify({ enabled: false, volume: .2 }));
    render(<MainWorldV3 />);
    const audio = MockAudio.instances[0];
    expect(MockAudio.instances).toHaveLength(1);
    expect(audio.src).toContain('/audio/bgm/moonlit-voyager-village-loop.mp3');
    expect(audio.loop).toBe(true);
    expect(audio.preload).toBe('auto');
    expect(audio.volume).toBe(1);
    expect(window.localStorage.getItem(MAIN_V3_BGM_STORAGE_KEY)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '퀘스트' }));
    expect(screen.getByRole('region', { name: '새로운 여정이 준비되고 있어요.' })).toHaveTextContent('퀘스트');
    expect(document.querySelector('.mw3-hero')).toBeNull();
    expect(document.querySelector('.mw3-summary')).toBeNull();
    expect(screen.getByRole('button', { name: '퀘스트' })).toHaveAttribute('aria-current', 'page');
    fireEvent.click(screen.getByRole('button', { name: '메인 월드로 돌아가기' }));
    expect(screen.getByRole('button', { name: '홈' })).toHaveAttribute('aria-current', 'page');
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
    expect(window.localStorage.getItem(MAIN_V3_BGM_STORAGE_KEY)).toBeNull();
  });

  it('keeps a manually disabled BGM off across in-page menus and resets it on a new document load', async () => {
    const firstDocument = render(<MainWorldV3 />);
    const firstAudio = MockAudio.instances[0];
    const firstCluster = document.querySelector('.mw3-desktop-profile') as HTMLElement;

    await waitFor(() => expect(firstAudio.play).toHaveBeenCalledTimes(1));
    fireEvent.click(within(firstCluster).getByRole('button', { name: 'BGM 끄기' }));
    expect(firstAudio.pause).toHaveBeenCalledTimes(1);
    expect(firstAudio.currentTime).toBe(0);

    for (const label of ['퀘스트', '플래너', '도감', '커뮤니티']) {
      fireEvent.click(screen.getByRole('button', { name: label }));
      expect(within(firstCluster).getByRole('button', { name: 'BGM 켜기' })).toBeInTheDocument();
      expect(firstAudio.play).toHaveBeenCalledTimes(1);
    }

    fireEvent.click(screen.getByRole('button', { name: '메인 월드로 돌아가기' }));
    expect(within(firstCluster).getByRole('button', { name: 'BGM 켜기' })).toBeInTheDocument();
    expect(firstAudio.play).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /새로운 여정 시작하기/ }));
    fireEvent.click(within(firstCluster).getByRole('button', { name: '호기심 많은 구글러 프로필 보기' }));
    fireEvent.pointerDown(document.body);
    expect(within(firstCluster).getByRole('button', { name: 'BGM 켜기' })).toBeInTheDocument();
    expect(firstAudio.play).toHaveBeenCalledTimes(1);

    firstDocument.unmount();
    render(<MainWorldV3 />);
    const reloadedAudio = MockAudio.instances[1];
    const reloadedCluster = document.querySelector('.mw3-desktop-profile') as HTMLElement;
    expect(reloadedAudio.volume).toBe(1);
    await waitFor(() => expect(reloadedAudio.play).toHaveBeenCalledTimes(1));
    expect(within(reloadedCluster).getByRole('button', { name: 'BGM 끄기' })).toBeInTheDocument();
  });

  it('opens each desktop-only menu as an in-main construction screen and restores home', () => {
    render(<MainWorldV3 />);

    const constructionDetails = {
      퀘스트: '탐험가를 위한 첫 퀘스트를 정성껏 준비하고 있어요.',
      플래너: '탐험가를 위한 첫 퀘스트를 정성껏 준비하고 있어요.',
      도감: '호기심 가득한 이야기를 차곡차곡 모으고 있어요.',
      커뮤니티: '다른 탐험가와 영감을 나눌 수 있는 공간이 생길거에요.',
    } as const;

    for (const label of Object.keys(constructionDetails) as Array<keyof typeof constructionDetails>) {
      fireEvent.click(screen.getByRole('button', { name: label }));
      const construction = screen.getByRole('region', { name: '새로운 여정이 준비되고 있어요.' });
      expect(construction).toHaveTextContent(constructionDetails[label]);
      expect(construction).toHaveTextContent(/구글러를 위한 새로운 모험을 열심히 만들고 있어요\.\s*조금만 기다려 주세요 !/);
      expect(document.querySelector('.mw3-hero')).toBeNull();
      expect(document.querySelector('.mw3-summary')).toBeNull();
      expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-current', 'page');
    }

    fireEvent.click(screen.getByRole('button', { name: '메인 월드로 돌아가기' }));
    expect(screen.getByRole('button', { name: '홈' })).toHaveAttribute('aria-current', 'page');
    expect(document.querySelector('.mw3-hero')).toBeInTheDocument();
  });

  it('retries blocked autoplay once on the first non-music pointer gesture', async () => {
    MockAudio.rejectNextPlay = true;
    render(<MainWorldV3 />);
    const audio = MockAudio.instances[0];
    await waitFor(() => expect(audio.play).toHaveBeenCalledTimes(1));
    await Promise.resolve();
    expect(document.querySelector('.mw3-desktop-profile .mw3-mini-bgm')).toHaveAttribute('aria-label', 'BGM 끄기');
    expect(document.querySelector('.mw3-desktop-profile .mw3-mini-equalizer')).not.toHaveClass('is-playing');
    fireEvent.pointerDown(document.body);
    await waitFor(() => expect(audio.play).toHaveBeenCalledTimes(2));
    expect(document.querySelector('.mw3-desktop-profile .mw3-mini-equalizer')).toHaveClass('is-playing');
  });

  it('uses the first CTA click to recover blocked autoplay without a second interaction', async () => {
    MockAudio.rejectNextPlay = true;
    render(<MainWorldV3 />);
    const audio = MockAudio.instances[0];
    await waitFor(() => expect(audio.play).toHaveBeenCalledTimes(1));
    await Promise.resolve();

    fireEvent.click(screen.getByRole('button', { name: /새로운 여정 시작하기/ }));

    await waitFor(() => expect(audio.play).toHaveBeenCalledTimes(2));
    expect(document.querySelector('.mw3-desktop-profile .mw3-mini-bgm')).toHaveAttribute('aria-label', 'BGM 끄기');
    expect(document.querySelector('.mw3-desktop-profile .mw3-mini-equalizer')).toHaveClass('is-playing');
  });
});
