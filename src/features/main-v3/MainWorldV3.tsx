import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { WorldIcon } from './WorldIcons';
import './MainWorldV3.css';

const base = import.meta.env.BASE_URL;
const asset = (path: string) => `${base}${path}`;
const BGM_SOURCE = asset('audio/bgm/moonlit-voyager-village-loop.mp3');
export const MAIN_V3_BGM_STORAGE_KEY = 'be-a-googler:main-v3-bgm';
export const MAIN_V3_SFX_STORAGE_KEY = 'be-a-googler:main-v3-sfx';
const DEFAULT_VOLUME = 1;
const DESKTOP_GUIDE_MESSAGE = '안녕 ?\n호기심이 아주 많은\n구글러구나 !\n나와 같이 구글을\n즐겁게 배워볼래 ?';

const navigation = [
  { id: 'explore', label: '홈', mobileLabel: '홈', icon: 'home', mobileIcon: 'home' },
  { id: 'town', label: '퀘스트', mobileLabel: '퀘스트', icon: 'scroll', mobileIcon: 'scroll' },
  { id: 'missions', label: '플래너', mobileLabel: '플래너', icon: 'calendar', mobileIcon: 'calendar' },
  { id: 'guides', label: '도감', mobileLabel: '도감', icon: 'book', mobileIcon: 'book' },
  { id: 'archive', label: '커뮤니티', mobileLabel: '커뮤니티', icon: 'users', mobileIcon: 'users' },
] as const;

const desktopScenes = {
  town: { name: 'quest', icon: 'scroll', eyebrow: '새로운 배움의 의뢰', detail: '탐험가를 위한 첫 퀘스트를 정성껏 준비하고 있어요.', asset: 'visual-reset/quest/be-a-googler-quest-2560x1440-scene-v10.png', mobileAsset: 'visual-reset/quest/be-a-googler-quest-1080x2340-mobile-v1-opt.webp' },
  missions: { name: 'planner', icon: 'calendar', eyebrow: '여정을 계획하는 지도', detail: '탐험가의 여정을 계획할 플래너를 준비하고 있어요.', asset: 'visual-reset/planner/be-a-googler-dakku-planner-2560x1440-scene-v7.png', mobileAsset: 'visual-reset/planner/be-a-googler-dakku-planner-1080x2340-mobile-v1-opt.webp' },
  guides: { name: 'encyclopedia', icon: 'book', eyebrow: '발견을 모아 보는 서가', detail: '호기심 가득한 이야기를 차곡차곡 모으고 있어요.', asset: 'visual-reset/encyclopedia/be-a-googler-encyclopedia-2560x1440-scene-v10.png', mobileAsset: 'visual-reset/encyclopedia/be-a-googler-encyclopedia-1080x2340-mobile-v1-opt.webp' },
  archive: { name: 'community', icon: 'users', eyebrow: '함께 만드는 광장', detail: '다른 탐험가와 영감을 나눌 공간이 생길거에요.', asset: 'visual-reset/community/be-a-googler-community-2560x1440-scene-v11.png', mobileAsset: 'visual-reset/community/be-a-googler-community-1080x2340-mobile-v1-opt.webp' },
} as const;

const desktopBadges = [
  { asset: 'badge-blue-v5.png', name: '데이터 항해', lore: '데이터 섬의 첫 지도를 완성했어요.' },
  { asset: 'badge-gold-v5.png', name: '용기 있는 시작', lore: '새로운 여정을 힘차게 열었어요.' },
  { asset: 'badge-silver-v5.png', name: '협업의 톱니', lore: '함께 배우는 힘을 발견했어요.' },
  { asset: 'badge-emerald.png', name: '초록 나침반', lore: '호기심의 방향을 스스로 찾았어요.' },
  { asset: 'badge-violet.png', name: '별빛 지도', lore: '배움의 별자리를 연결했어요.' },
  { asset: 'badge-coral.png', name: '반짝이는 생각', lore: '새로운 아이디어를 세상에 밝혔어요.' },
] as const;

function getSfx() { try { return window.localStorage.getItem(MAIN_V3_SFX_STORAGE_KEY) !== 'false'; } catch { return true; } }
function saveSfx(enabled: boolean) { try { window.localStorage.setItem(MAIN_V3_SFX_STORAGE_KEY, String(enabled)); } catch { /* optional */ } }

function useWorldAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bgmEnabledRef = useRef(true);
  const [bgmEnabled, setBgmEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);
  const sync = useCallback(() => { const audio = audioRef.current; setIsPlaying(Boolean(audio && !audio.paused && !audio.muted && audio.volume > 0)); }, []);
  useEffect(() => {
    const audio = new Audio(BGM_SOURCE);
    // Automated visual QA opts in with ?qa-mute=1 to capture screenshots
    // without triggering autoplay audio; real users never set this.
    const qaMuted = new URLSearchParams(window.location.search).get('qa-mute') === '1';
    if (qaMuted) { audio.muted = true; audio.volume = 0; audioRef.current = audio; return () => { audio.pause(); audioRef.current = null; }; }
    audio.loop = true; audio.preload = 'auto'; audio.volume = DEFAULT_VOLUME; setVolumeState(DEFAULT_VOLUME);
    audioRef.current = audio;
    // BGM starts on by default — attempt to play immediately on mount. If
    // the browser silently blocks the autoplay, the button still shows
    // "enabled" and isPlaying just stays false until the visitor's first
    // tap on it starts it for real.
    bgmEnabledRef.current = true; setBgmEnabled(true);
    try { window.localStorage.removeItem(MAIN_V3_BGM_STORAGE_KEY); } catch { /* optional */ }
    const fail = () => { setIsPlaying(false); };
    const ended = () => { if (bgmEnabledRef.current) { audio.currentTime = 0; void audio.play().catch(fail); } };
    audio.addEventListener('play', sync); audio.addEventListener('playing', sync); audio.addEventListener('pause', sync); audio.addEventListener('error', fail); audio.addEventListener('ended', ended);
    void audio.play().then(sync).catch(fail);
    return () => { audio.pause(); audio.removeEventListener('play', sync); audio.removeEventListener('playing', sync); audio.removeEventListener('pause', sync); audio.removeEventListener('error', fail); audio.removeEventListener('ended', ended); audioRef.current = null; };
  }, [sync]);
  const toggle = useCallback(() => {
    const audio = audioRef.current; if (!audio) return;
    if (bgmEnabledRef.current) { bgmEnabledRef.current = false; setBgmEnabled(false); audio.pause(); audio.currentTime = 0; return; }
    audio.currentTime = 0; bgmEnabledRef.current = true; setBgmEnabled(true); void audio.play().then(sync).catch(() => setIsPlaying(false));
  }, [sync]);
  const setVolume = useCallback((nextVolume: number) => {
    const audio = audioRef.current; if (!audio) return;
    const clamped = Math.min(1, Math.max(0, nextVolume));
    audio.volume = clamped; setVolumeState(clamped); sync();
  }, [sync]);
  return { bgmEnabled, isPlaying, volume, toggle, setVolume };
}

function playUiSound(kind: 'click' | 'chime', on: boolean) {
  if (!on || typeof window.AudioContext === 'undefined') return;
  const context = new window.AudioContext(); const oscillator = context.createOscillator(); const gain = context.createGain(); const start = context.currentTime; const duration = kind === 'chime' ? .16 : .07;
  oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(kind === 'chime' ? 660 : 420, start); if (kind === 'chime') oscillator.frequency.exponentialRampToValueAtTime(880, start + .11);
  gain.gain.setValueAtTime(.0001, start); gain.gain.exponentialRampToValueAtTime(.035, start + .012); gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
  oscillator.connect(gain).connect(context.destination); oscillator.start(start); oscillator.stop(start + duration + .01); oscillator.addEventListener('ended', () => void context.close());
}

function DesktopProfileCluster({
  bgmEnabled,
  isPlaying,
  volume,
  onToggleBgm,
  onVolumeChange,
  onProfile,
}: {
  bgmEnabled: boolean;
  isPlaying: boolean;
  volume: number;
  onToggleBgm: () => void;
  onVolumeChange: (volume: number) => void;
  onProfile: () => void;
}) {
  const [volumeTrayDismissed, setVolumeTrayDismissed] = useState(false);
  const dismissVolumeTray = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape') return;
    event.preventDefault(); setVolumeTrayDismissed(true);
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  };
  return <section className="mw3-desktop-profile" aria-label="프로필과 오디오 컨트롤">
    <div className="mw3-mini-audio" aria-label="BGM 미니 컨트롤">
      <div className="mw3-mini-bgm-control" data-volume-tray-dismissed={volumeTrayDismissed} onMouseEnter={() => setVolumeTrayDismissed(false)} onMouseLeave={() => setVolumeTrayDismissed(true)} onFocusCapture={() => setVolumeTrayDismissed(false)} onKeyDown={dismissVolumeTray}>
        <button type="button" className={`mw3-mini-bgm ${bgmEnabled ? 'is-enabled' : ''} ${isPlaying ? 'is-playing' : ''}`} aria-label={bgmEnabled ? 'BGM 끄기' : 'BGM 켜기'} onClick={onToggleBgm}><WorldIcon name="music" /></button>
        <div className="mw3-mini-volume-panel" aria-label="BGM 볼륨"><input type="range" min="0" max="1" step="0.01" value={volume} aria-label="BGM 볼륨 조절" onChange={(event) => onVolumeChange(Number(event.target.value))} /></div>
      </div>
      <span className="mw3-mini-song" aria-label="Be a Googler - 달빛 항해자의 마을"><span className="mw3-mini-song-track" aria-hidden="true"><span>Be a Googler - 달빛 항해자의 마을</span><span>Be a Googler - 달빛 항해자의 마을</span></span></span>
      <span className={`mw3-mini-equalizer ${isPlaying ? 'is-playing' : ''}`} aria-label={isPlaying ? '움직이는 이퀄라이저' : '정지된 이퀄라이저'}>{Array.from({ length: 6 }, (_, index) => <i key={index} />)}</span>
    </div>
    <span className="mw3-divider" aria-hidden="true" />
    <button className="mw3-profile-button" type="button" aria-label="호기심 많은 구글러 프로필 보기" onClick={onProfile}><img src={asset('visual-reset/main/assets/profile-avatar.png')} alt="" /><span className="mw3-identity"><small>Lv. 7 탐험가</small><strong>호기심 많은 구글러</strong></span><WorldIcon name="chevron" /></button>
    <span className="mw3-divider" aria-hidden="true" />
    <div className="mw3-desktop-notification">
      <button className="mw3-notification" type="button" aria-label="알림 보기" aria-haspopup="dialog"><WorldIcon name="bell" /><span>3</span></button>
      <div className="mw3-notification-popover" role="dialog" aria-label="새 알림">
        <div className="mw3-notification-popover-heading"><strong>새 소식</strong><button type="button" aria-label="알림 더보기">•••</button></div>
        <ul><li><i>✦</i><span><b>오늘의 여정이 열렸어요</b><small>별빛 항로가 탐험가를 기다려요.</small></span></li><li><i>◈</i><span><b>데이터 섬 탐험이 이어집니다</b><small>다음 지도가 은은히 빛나고 있어요.</small></span></li><li><i>✧</i><span><b>새로운 배지를 확인해보세요</b><small>보관함에 작은 선물이 도착했어요.</small></span></li></ul>
        <button className="mw3-notification-more" type="button">전체 보기 <span>›</span></button>
      </div>
    </div>
  </section>;
}

export default function MainWorldV3() {
  return <MainWorldV3Scene />;
}

function MainWorldV3Scene() {
  const { bgmEnabled, isPlaying, volume, toggle, setVolume } = useWorldAudio();
  const [activeNav, setActiveNav] = useState('explore'); const [sfxOn, setSfxOn] = useState(getSfx); const [toast, setToast] = useState(''); const [guideText, setGuideText] = useState(''); const [guideVisible, setGuideVisible] = useState(false); const timer = useRef<number>(); const shell = useRef<HTMLElement | null>(null); const parallaxFrame = useRef<number>();
  // Page-change transition: cover the screen, swap the page underneath
  // while hidden, hold on a loading beat, then clear — so a nav switch
  // reads as a deliberate scene change instead of content popping in.
  const [transitionPhase, setTransitionPhase] = useState<'idle' | 'cover' | 'loading' | 'reveal'>('idle');
  const transitionTimers = useRef<number[]>([]);
  useEffect(() => () => transitionTimers.current.forEach((id) => window.clearTimeout(id)), []);
  // The "coming soon" card no longer auto-covers the subpage art on arrival —
  // it stays hidden so the scene is fully visible, and only pops in once the
  // visitor clicks anywhere on the page.
  const [constructionVisible, setConstructionVisible] = useState(false);
  // Tracks the live viewport width so the mobile/desktop layout keeps up
  // when the window is resized without a full reload (isMobile etc. below
  // were previously computed once per render, so resizing an open tab left
  // the CSS breakpoints and the JS-driven content — nav labels, subpage
  // scenes — out of sync).
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  useEffect(() => {
    // Warm the browser cache for every subpage scene right away, so the
    // shell's flat fallback color never shows through on a visitor's first
    // visit to a page — without this, the scene <img> only starts fetching
    // once its section actually renders, well after the shell paints.
    const isMobileAtLoad = window.innerWidth < 1000;
    Object.values(desktopScenes).forEach((scene) => {
      const preload = new Image();
      preload.src = asset(isMobileAtLoad ? scene.mobileAsset : scene.asset);
    });
    const loadingBackdrop = new Image();
    loadingBackdrop.src = asset(isMobileAtLoad ? 'visual-reset/main/be-a-googler-loading-mobile.webp' : 'visual-reset/main/be-a-googler-loading-desktop.webp');
  }, []);
  const announce = useCallback((message = '이 길은 아직 준비 중이에요 🌱', chime = false) => { window.clearTimeout(timer.current); setToast(message); playUiSound(chime ? 'chime' : 'click', sfxOn); timer.current = window.setTimeout(() => setToast(''), 1900); }, [sfxOn]);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => () => window.cancelAnimationFrame(parallaxFrame.current ?? 0), []);
  useEffect(() => {
    if (window.innerWidth < 768) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setGuideVisible(true);
      setGuideText(DESKTOP_GUIDE_MESSAGE);
      return undefined;
    }

    let timeout: number | undefined;
    let index = 0;
    const beginTyping = () => {
      index = 1;
      setGuideVisible(true);
      setGuideText(DESKTOP_GUIDE_MESSAGE.slice(0, index));
      timeout = window.setTimeout(typeNext, 46);
    };
    const hideBubble = () => {
      setGuideVisible(false);
      timeout = window.setTimeout(beginTyping, 620);
    };
    const typeNext = () => {
      index += 1;
      setGuideText(DESKTOP_GUIDE_MESSAGE.slice(0, index));
      timeout = window.setTimeout(index >= DESKTOP_GUIDE_MESSAGE.length ? hideBubble : typeNext, index >= DESKTOP_GUIDE_MESSAGE.length ? 9900 : 46);
    };
    timeout = window.setTimeout(beginTyping, 320);
    return () => window.clearTimeout(timeout);
  }, []);
  const setParallax = useCallback((x: number, y: number) => {
    window.cancelAnimationFrame(parallaxFrame.current ?? 0);
    parallaxFrame.current = window.requestAnimationFrame(() => { shell.current?.style.setProperty('--mw3-parallax-x', x.toFixed(3)); shell.current?.style.setProperty('--mw3-parallax-y', y.toFixed(3)); });
  }, []);
  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (window.innerWidth < 1024 || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = event.currentTarget.getBoundingClientRect(); setParallax(((event.clientX - bounds.left) / bounds.width - .5) * 2, ((event.clientY - bounds.top) / bounds.height - .5) * 2);
  }, [setParallax]);
  const handlePointerLeave = useCallback(() => setParallax(0, 0), [setParallax]);
  const toggleSfx = () => { const next = !sfxOn; if (sfxOn) playUiSound('click', true); setSfxOn(next); saveSfx(next); window.clearTimeout(timer.current); setToast(next ? '효과음을 켰어요.' : '효과음을 껐어요.'); timer.current = window.setTimeout(() => setToast(''), 1900); };
  const hasDesktopAmbient = viewportWidth >= 1024;
  // Matches the CSS desktop breakpoint (min-width: 1000px) below so there is
  // no unstyled gap between the mobile and desktop layouts — a portrait
  // tablet (768-999px) gets the mobile layout, a landscape one (1000px+)
  // gets the desktop layout, so neither needs bespoke tablet styling.
  const isMobile = viewportWidth < 1000;
  const hasDesktopControls = viewportWidth >= 1000;
  const hasDesktopGuide = viewportWidth >= 768;
  const desktopScene = desktopScenes[activeNav as keyof typeof desktopScenes] ?? null;
  const showsMainWorld = activeNav === 'explore';
  useEffect(() => { setConstructionVisible(false); }, [activeNav]);
  const revealConstruction = () => { if (desktopScene && !constructionVisible) setConstructionVisible(true); };
  const activateNavigation = (item: (typeof navigation)[number]) => {
    if (item.id === activeNav) return;
    if (!isMobile) playUiSound('click', sfxOn);
    const switchPage = () => { setActiveNav(item.id); if (item.id === 'explore') announce('홈에서 새로운 모험을 이어가요.'); };
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { switchPage(); return; }
    transitionTimers.current.forEach((id) => window.clearTimeout(id));
    setTransitionPhase('cover');
    // Timings mirror the CSS: .mw3-transition-veil fades over 620ms and the
    // progress bar fills over 1300ms, so each wait is set slightly longer
    // than what it's waiting out, otherwise it gets cut off mid-motion.
    transitionTimers.current = [window.setTimeout(() => {
      switchPage();
      setTransitionPhase('loading');
      transitionTimers.current.push(window.setTimeout(() => {
        setTransitionPhase('reveal');
        transitionTimers.current.push(window.setTimeout(() => setTransitionPhase('idle'), 640));
      }, 1340));
    }, 640)];
  };
  return <main className={`mw3-shell${desktopScene ? ` mw3-shell--${desktopScene.name}` : ''}${desktopScene && !constructionVisible ? ' mw3-shell--awaiting-tap' : ''}`} data-transition={transitionPhase} ref={shell} onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave} onClick={revealConstruction}>
    {transitionPhase !== 'idle' && <div className={`mw3-transition-veil mw3-transition-veil--${transitionPhase}`} aria-hidden="true"><img className="mw3-transition-backdrop" src={asset(isMobile ? 'visual-reset/main/be-a-googler-loading-mobile.webp' : 'visual-reset/main/be-a-googler-loading-desktop.webp')} alt="" /><div className="mw3-transition-loader"><div className="mw3-transition-dots"><i /><i /><i /></div><div className="mw3-transition-track"><i /></div><span>다음 여정으로 이동 중…</span></div><div className="mw3-transition-flash" /></div>}
    <img className="mw3-background" src={asset(isMobile ? 'visual-reset/main/be-a-googler-main-mobile-opt.webp' : 'visual-reset/main/be-a-googler-main-desktop-16x9.png')} alt="" aria-hidden="true" /><div className="mw3-light-field" aria-hidden="true" />
    {/* The backdrop layer is only ever visible on the desktop breakpoint
        (min-width: 1000px); rendering it on mobile still downloads the
        multi-MB desktop scene even though CSS hides it, so it is left out
        of the tree entirely there. */}
    {desktopScene && <>{!isMobile && <img className="mw3-scene-backdrop" src={asset(desktopScene.asset)} alt="" aria-hidden="true" />}<img className={`mw3-scene mw3-${desktopScene.name}-scene`} src={asset(isMobile ? desktopScene.mobileAsset : desktopScene.asset)} alt="" aria-hidden="true" /><div className="mw3-scene-veil" aria-hidden="true" /></>}
    {isMobile && <div className="mw3-mobile-google-marks" aria-hidden="true"><span className="mw3-mobile-google-mark mw3-mobile-google-mark--character"><img src={asset('visual-reset/main/be-a-googler-brand.png')} alt="" /></span><span className="mw3-mobile-google-mark mw3-mobile-google-mark--robot"><img src={asset('visual-reset/main/be-a-googler-brand.png')} alt="" /></span></div>}
    {hasDesktopAmbient && <div className={`mw3-ambient ${isPlaying ? 'is-playing' : ''}`} aria-hidden="true"><span className="mw3-ambient-dust dust-1" /><span className="mw3-ambient-dust dust-2" /><span className="mw3-ambient-dust dust-3" /><span className="mw3-ambient-dust dust-4" /><span className="mw3-ambient-dust dust-5" /><span className="mw3-ambient-dust dust-6" /><span className="mw3-ambient-dust dust-7" /><span className="mw3-ambient-leaf leaf-1" /><span className="mw3-ambient-leaf leaf-2" /><span className="mw3-ambient-leaf leaf-3" /></div>}
    <header className="mw3-header" aria-label="메인 내비게이션">
      <div className="mw3-navigation"><a className="mw3-brand" href={base} aria-label="Be a Googler 홈으로 이동"><img src={asset('visual-reset/main/be-a-googler-brand.png')} alt="Be a Googler" /></a><span className="mw3-divider" aria-hidden="true" /><nav aria-label="주요 메뉴">{navigation.map((item) => <button type="button" key={item.id} className={activeNav === item.id ? 'is-active' : ''} aria-current={activeNav === item.id ? 'page' : undefined} onClick={(event) => { activateNavigation(item); event.currentTarget.blur(); }}><WorldIcon name={isMobile ? item.mobileIcon : item.icon} /><span>{isMobile ? item.mobileLabel : item.label}</span></button>)}</nav></div>
      <section className="mw3-profile" aria-label="프로필"><button type="button" className={`mw3-mobile-bgm ${bgmEnabled ? 'is-enabled' : ''} ${isPlaying ? 'is-playing' : ''}`} aria-label={bgmEnabled ? 'BGM 끄기' : 'BGM 켜기'} onClick={() => { toggle(); playUiSound('click', sfxOn); }}><WorldIcon name="music" /></button><button className="mw3-notification" type="button" aria-label="알림 보기" onClick={() => announce('새로운 알림을 준비 중이에요.')}><WorldIcon name="bell" /><span>3</span></button><span className="mw3-divider" aria-hidden="true" /><button className="mw3-profile-button" type="button" aria-label="호기심 많은 구글러 프로필 보기" onClick={() => announce('프로필 탐험을 준비 중이에요.')}><img src={asset('visual-reset/main/assets/profile-avatar.png')} alt="" /><span className="mw3-identity"><strong>호기심 많은 구글러</strong><small>Lv. 7 탐험가</small></span><WorldIcon name="chevron" /></button></section>
      <button type="button" className="mw3-mobile-menu" aria-label="메뉴 준비 중" onClick={() => announce()}><WorldIcon name="menu" /></button>
    </header>
    {showsMainWorld && <section className="mw3-hero" aria-labelledby="mw3-title"><p className="mw3-eyebrow">배움이 모험이 되는 곳 <span>✨</span></p><h1 id="mw3-title"><span className="mw3-title-line mw3-title-line--first"><span className="mw3-word-googler"><b>G</b><b>o</b><b>o</b><b>g</b><b>l</b><b>e</b><b>r</b>{isMobile ? '의 여정을' : ' 의 여정을'}</span></span><span className="mw3-title-line mw3-title-line--second">{isMobile ? <><em>시작</em>해볼까요?</> : '시작해볼까요 ?'}</span></h1><p className="mw3-description">{isMobile ? <><span className="mw3-description-line">호기심으로 배우고 성장하며,</span><span className="mw3-description-line">세상에 긍정적인 변화를 만들어요.</span></> : <span className="mw3-description-line">호기심으로 배우고 성장하며, 세상에 긍정적인 변화를 만들어요.</span>}</p><div className="mw3-cta-row"><button type="button" className="mw3-primary-cta" onClick={() => announce('새로운 여정이 곧 열립니다.', true)}><WorldIcon name="compass" />{isMobile ? '새로운 여정' : '새로운 여정 시작하기'}</button><button type="button" className="mw3-secondary-cta" onClick={() => announce()}><WorldIcon name="play" />이어하기</button></div>{!isMobile && <button type="button" className="mw3-text-action" onClick={() => announce('여정 안내를 준비 중이에요.')}>여정이란 ? <span>›</span></button>}</section>}
    {desktopScene && constructionVisible && <section key={desktopScene.name} className="mw3-construction" aria-labelledby="mw3-construction-title"><span className="mw3-construction-icon" aria-hidden="true"><WorldIcon name={desktopScene.icon} /></span><p>{desktopScene.eyebrow}</p><h2 id="mw3-construction-title">새로운 여정이<br />준비되고 있어요.</h2><small>{desktopScene.detail}</small><span>구글러를 위한 새로운 모험을 열심히 만들고 있어요.<br />조금만 기다려 주세요 !</span><button type="button" onClick={(event) => { event.stopPropagation(); setActiveNav('explore'); playUiSound('click', sfxOn); }}>메인 월드로 돌아가기 <i aria-hidden="true">›</i></button></section>}
    {showsMainWorld && !isMobile && <aside className={`mw3-guide${guideVisible ? '' : ' is-cycling-out'}`} aria-label="구글러 길잡이 안내" style={{ '--mw3-guide-lines': Math.max(1, guideText.split('\n').length) } as CSSProperties}>{hasDesktopGuide ? <p aria-live="polite" aria-atomic="true" aria-label={DESKTOP_GUIDE_MESSAGE}><span>{guideText}</span></p> : <p>안녕, 탐험가!<br />나는 구글러 길잡이<br />루나야. 함께 놀며<br />배워보자!</p>}</aside>}
    {hasDesktopControls && <DesktopProfileCluster bgmEnabled={bgmEnabled} isPlaying={isPlaying} volume={volume} onToggleBgm={() => { toggle(); playUiSound('click', sfxOn); }} onVolumeChange={setVolume} onProfile={() => announce('프로필 탐험을 준비 중이에요.')} />}
    {showsMainWorld && <section className="mw3-summary" aria-label="여정 요약">
      {hasDesktopAmbient ? <article className="mw3-card mw3-card--journey">
        <button type="button" className="mw3-card-click-target" aria-label="나의 여정 열기" onClick={() => announce('나의 여정을 준비 중이에요.')} />
        <span className="mw3-card-title"><WorldIcon name="compass" />나의 여정</span>
        <span className="mw3-card-content">
          <button type="button" className="mw3-avatar-frame mw3-avatar-trigger" aria-label="탐험가 프로필 안내 보기" aria-describedby="mw3-avatar-tooltip" onClick={() => announce('나의 여정을 준비 중이에요.')}><img src={asset('visual-reset/main/assets/journey-avatar-medallion.png')} alt="여정 아바타" /><span id="mw3-avatar-tooltip" className="mw3-world-tooltip mw3-avatar-tooltip" role="tooltip"><img className="mw3-tooltip-thumbnail mw3-tooltip-thumbnail--avatar" src={asset('visual-reset/main/assets/journey-avatar-medallion.png')} alt="" /><span className="mw3-tooltip-copy"><b>호기심 많은 탐험가</b><small>새로운 여정을 차근차근 만들어가고 있어요.</small></span></span></button>
          <span className="mw3-card-copy"><strong>Lv. 7 탐험가</strong><small>320 / 560 XP</small><span className="mw3-progress mw3-progress--gold"><i /></span><small>다음 레벨까지 240 XP 남음</small></span>
        </span>
      </article> : <button type="button" className="mw3-card mw3-card--journey" onClick={() => announce('나의 여정을 준비 중이에요.')}>
        <span className="mw3-card-title"><WorldIcon name="compass" />나의 여정</span>
        <span className="mw3-card-content"><span className="mw3-avatar-frame"><img src={asset('visual-reset/main/assets/journey-avatar-medallion.png')} alt="여정 아바타" /></span><span className="mw3-card-copy"><strong>Lv. 7 탐험가</strong><small>320 / 560 XP</small><span className="mw3-progress mw3-progress--gold"><i /></span><small>다음 레벨까지 240 XP 남음</small></span></span>
      </button>}
      <article className="mw3-card mw3-card--continue"><h2 className="mw3-card-title"><WorldIcon name="play" />이어하기</h2><div className="mw3-card-content"><span className="mw3-island-frame"><img src={asset('visual-reset/main/assets/data-island-thumbnail-v6-opt.webp')} alt="데이터 섬" />{hasDesktopAmbient && <span className="mw3-world-tooltip mw3-continue-tooltip" role="tooltip"><img className="mw3-tooltip-thumbnail mw3-tooltip-thumbnail--island" src={asset('visual-reset/main/assets/data-island-thumbnail-v6-opt.webp')} alt="" /><span className="mw3-tooltip-copy"><b>데이터 섬의 비밀</b><small>다음 탐험 장면을 세심하게 다듬고 있어요.</small></span></span>}</span><span className="mw3-card-copy"><strong>{isMobile ? '데이터 섬' : '데이터 섬의 비밀'}</strong><small>3. 데이터를 시각화해요</small><span className="mw3-progress mw3-progress--blue"><i /></span><b className="mw3-percent">65%</b></span><button type="button" className="mw3-resume" onClick={() => announce('데이터 섬으로 떠날 준비 중이에요.')}>계속하기</button></div></article>
      {hasDesktopAmbient ? <article className="mw3-card mw3-card--badges" aria-label="획득 배지"><span className="mw3-card-title"><WorldIcon name="badge" />획득 배지</span><span className="mw3-badge-layout"><span className="mw3-badge-row">{desktopBadges.map((badge, index) => <span className={`mw3-badge-item${index === desktopBadges.length - 1 ? ' mw3-badge-item--last' : ''}`} key={badge.asset}><button type="button" className="mw3-badge-trigger" aria-label={`${badge.name}: ${badge.lore}`}><img src={asset(`visual-reset/main/assets/${badge.asset}`)} alt="" /><small>{badge.name}</small></button><span className="mw3-badge-info" role="tooltip"><img className="mw3-tooltip-thumbnail mw3-tooltip-thumbnail--badge" src={asset(`visual-reset/main/assets/${badge.asset}`)} alt="" /><span className="mw3-tooltip-copy"><b>{badge.name}</b><small>{badge.lore}</small></span></span></span>)}<button type="button" className="mw3-badge-next" aria-label="더 많은 배지 보기" onClick={() => announce('새로운 여정을 이어가며 배지를 더 모아보세요!')}><span aria-hidden="true">›</span></button></span></span></article> : <button type="button" className="mw3-card mw3-card--badges mw3-card--compact-badges" onClick={() => announce('새로운 배지를 준비 중이에요.')}><span className="mw3-card-title"><WorldIcon name="badge" />{isMobile ? '획득 배지' : '최근 획득 배지'}</span><span className="mw3-badge-row"><span><img src={asset('visual-reset/main/assets/badge-blue-mobile-opt.webp')} alt="파란 배지" /></span><span><img src={asset('visual-reset/main/assets/badge-gold-mobile-opt.webp')} alt="금색 배지" /></span><span><img src={asset('visual-reset/main/assets/badge-silver-mobile-opt.webp')} alt="은색 배지" /></span><b aria-label="더 많은 배지">…</b></span></button>}
    </section>}
    {!isMobile && <section className="mw3-audio" aria-label="BGM 컨트롤"><div className="mw3-track"><WorldIcon name="music" /><strong>BGM</strong><span className="mw3-song">달빛 항해자의 마을</span></div><button type="button" className="mw3-audio-play" aria-label={isPlaying ? 'BGM 일시정지' : 'BGM 재생'} onClick={() => { toggle(); playUiSound('click', sfxOn); }}><WorldIcon name={isPlaying ? 'pause' : 'play'} /></button><span className={`mw3-equalizer ${isPlaying ? 'is-playing' : ''}`} aria-label={isPlaying ? '움직이는 이퀄라이저' : '정지된 이퀄라이저'}><i /><i /><i /><i /></span><div className="mw3-sfx"><WorldIcon name="speaker" /><span>효과음 켜짐</span><button type="button" role="switch" aria-checked={sfxOn} aria-label="효과음 켜기 또는 끄기" className={sfxOn ? 'is-on' : ''} onClick={toggleSfx}><i /></button></div></section>}
    <div className={`mw3-toast ${toast ? 'is-visible' : ''}`} role="status" aria-live="polite">{toast}</div>
  </main>;
}
