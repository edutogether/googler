import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { WorldIcon } from './WorldIcons';
import './MainWorldV3.css';

const base = import.meta.env.BASE_URL;
const asset = (path: string) => `${base}${path}`;
const BGM_SOURCE = asset('audio/bgm/moonlit-voyager-village-loop.mp3');
export const MAIN_V3_BGM_STORAGE_KEY = 'be-a-googler:main-v3-bgm';
export const MAIN_V3_SFX_STORAGE_KEY = 'be-a-googler:main-v3-sfx';
const DEFAULT_VOLUME = 0.28;

const navigation = [
  { id: 'explore', label: '탐험 시작', icon: 'compass' }, { id: 'town', label: '학습 마을', icon: 'map' },
  { id: 'missions', label: '미션', icon: 'scroll' }, { id: 'guides', label: '길잡이', icon: 'book' }, { id: 'archive', label: '보관함', icon: 'archive' },
] as const;

const desktopBadges = [
  { asset: 'badge-blue.png', name: '데이터 항해', lore: '데이터 섬의 첫 지도를 완성했어요.' },
  { asset: 'badge-gold.png', name: '용기 있는 시작', lore: '새로운 여정을 힘차게 열었어요.' },
  { asset: 'badge-silver.png', name: '협업의 톱니', lore: '함께 배우는 힘을 발견했어요.' },
  { asset: 'badge-emerald.png', name: '초록 나침반', lore: '호기심의 방향을 스스로 찾았어요.' },
  { asset: 'badge-violet.png', name: '별빛 지도', lore: '배움의 별자리를 연결했어요.' },
  { asset: 'badge-coral.png', name: '반짝이는 생각', lore: '새로운 아이디어를 세상에 밝혔어요.' },
] as const;

function getStoredBgm() {
  try {
    const value = JSON.parse(window.localStorage.getItem(MAIN_V3_BGM_STORAGE_KEY) ?? '{}') as { enabled?: boolean; volume?: number };
    return { enabled: value.enabled === true, volume: typeof value.volume === 'number' ? value.volume : DEFAULT_VOLUME };
  } catch { return { enabled: false, volume: DEFAULT_VOLUME }; }
}
function saveBgm(enabled: boolean, volume: number) { try { window.localStorage.setItem(MAIN_V3_BGM_STORAGE_KEY, JSON.stringify({ enabled, volume })); } catch { /* optional */ } }
function getSfx() { try { return window.localStorage.getItem(MAIN_V3_SFX_STORAGE_KEY) !== 'false'; } catch { return true; } }
function saveSfx(enabled: boolean) { try { window.localStorage.setItem(MAIN_V3_SFX_STORAGE_KEY, String(enabled)); } catch { /* optional */ } }

function useWorldAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const enabled = useRef(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);
  const sync = useCallback(() => { const audio = audioRef.current; setIsPlaying(Boolean(audio && !audio.paused && !audio.muted && audio.volume > 0)); }, []);
  useEffect(() => {
    const stored = getStoredBgm();
    const audio = new Audio(BGM_SOURCE);
    audio.loop = true; audio.preload = 'auto'; audio.volume = stored.volume; setVolumeState(stored.volume);
    audioRef.current = audio; enabled.current = true; saveBgm(true, stored.volume);
    const gestureEvents = ['pointerdown', 'click', 'touchstart', 'keydown'] as const;
    let removeFirstGesture = () => {};
    const fail = () => { removeFirstGesture(); enabled.current = false; saveBgm(false, audio.volume); setIsPlaying(false); };
    const ended = () => { if (enabled.current) { audio.currentTime = 0; void audio.play().catch(fail); } };
    audio.addEventListener('play', sync); audio.addEventListener('playing', sync); audio.addEventListener('pause', sync); audio.addEventListener('error', fail); audio.addEventListener('ended', ended);
    const resumeAfterFirstGesture = (event: Event) => {
      if (event.target instanceof Element && event.target.closest('.mw3-mini-bgm')) return;
      removeFirstGesture();
      if (enabled.current && audio.paused) void audio.play().then(sync).catch(() => setIsPlaying(false));
    };
    const armFirstGestureFallback = () => {
      gestureEvents.forEach((eventName) => window.addEventListener(eventName, resumeAfterFirstGesture, { capture: true, once: true }));
      removeFirstGesture = () => gestureEvents.forEach((eventName) => window.removeEventListener(eventName, resumeAfterFirstGesture, true));
    };
    armFirstGestureFallback();
    void audio.play().then(() => { removeFirstGesture(); sync(); }).catch(() => setIsPlaying(false));
    return () => { removeFirstGesture(); audio.pause(); audio.removeEventListener('play', sync); audio.removeEventListener('playing', sync); audio.removeEventListener('pause', sync); audio.removeEventListener('error', fail); audio.removeEventListener('ended', ended); audioRef.current = null; };
  }, [sync]);
  const resumeOnGesture = useCallback(() => { const audio = audioRef.current; if (audio && enabled.current && audio.paused) void audio.play().catch(() => { enabled.current = false; saveBgm(false, audio.volume); setIsPlaying(false); }); }, []);
  const toggle = useCallback(() => {
    const audio = audioRef.current; if (!audio) return;
    if (!audio.paused) { enabled.current = false; saveBgm(false, audio.volume); audio.pause(); audio.currentTime = 0; return; }
    audio.currentTime = 0; enabled.current = true; saveBgm(true, audio.volume); void audio.play().catch(() => { enabled.current = false; saveBgm(false, audio.volume); setIsPlaying(false); });
  }, []);
  const setVolume = useCallback((nextVolume: number) => {
    const audio = audioRef.current; if (!audio) return;
    const clamped = Math.min(1, Math.max(0, nextVolume));
    audio.volume = clamped; setVolumeState(clamped); saveBgm(enabled.current, clamped); sync();
  }, [sync]);
  return { isPlaying, volume, resumeOnGesture, toggle, setVolume };
}

function playUiSound(kind: 'click' | 'chime', on: boolean) {
  if (!on || typeof window.AudioContext === 'undefined') return;
  const context = new window.AudioContext(); const oscillator = context.createOscillator(); const gain = context.createGain(); const start = context.currentTime; const duration = kind === 'chime' ? .16 : .07;
  oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(kind === 'chime' ? 660 : 420, start); if (kind === 'chime') oscillator.frequency.exponentialRampToValueAtTime(880, start + .11);
  gain.gain.setValueAtTime(.0001, start); gain.gain.exponentialRampToValueAtTime(.035, start + .012); gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
  oscillator.connect(gain).connect(context.destination); oscillator.start(start); oscillator.stop(start + duration + .01); oscillator.addEventListener('ended', () => void context.close());
}

function DesktopProfileCluster({
  isPlaying,
  volume,
  onToggleBgm,
  onVolumeChange,
  onProfile,
}: {
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
      <div className="mw3-mini-bgm-control" data-volume-tray-dismissed={volumeTrayDismissed} onMouseEnter={() => setVolumeTrayDismissed(false)} onFocusCapture={() => setVolumeTrayDismissed(false)} onKeyDown={dismissVolumeTray}>
        <button type="button" className={`mw3-mini-bgm ${isPlaying ? 'is-playing' : ''}`} aria-label={isPlaying ? 'BGM 끄기' : 'BGM 켜기'} onClick={onToggleBgm}><WorldIcon name="music" /></button>
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
  const { isPlaying, volume, resumeOnGesture, toggle, setVolume } = useWorldAudio();
  const [activeNav, setActiveNav] = useState('explore'); const [sfxOn, setSfxOn] = useState(getSfx); const [toast, setToast] = useState(''); const timer = useRef<number>(); const shell = useRef<HTMLElement | null>(null); const parallaxFrame = useRef<number>();
  const announce = useCallback((message = '이 길은 아직 준비 중이에요 🌱', chime = false) => { resumeOnGesture(); window.clearTimeout(timer.current); setToast(message); playUiSound(chime ? 'chime' : 'click', sfxOn); timer.current = window.setTimeout(() => setToast(''), 1900); }, [resumeOnGesture, sfxOn]);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => () => window.cancelAnimationFrame(parallaxFrame.current ?? 0), []);
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
  const hasDesktopAmbient = window.innerWidth >= 1024;
  return <main className="mw3-shell" ref={shell} onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}>
    <img className="mw3-background" src={asset('visual-reset/main/be-a-googler-main-desktop-16x9.png')} alt="" aria-hidden="true" /><div className="mw3-light-field" aria-hidden="true" />
    {hasDesktopAmbient && <div className={`mw3-ambient ${isPlaying ? 'is-playing' : ''}`} aria-hidden="true"><span className="mw3-ambient-dust dust-1" /><span className="mw3-ambient-dust dust-2" /><span className="mw3-ambient-dust dust-3" /><span className="mw3-ambient-dust dust-4" /><span className="mw3-ambient-dust dust-5" /><span className="mw3-ambient-dust dust-6" /><span className="mw3-ambient-dust dust-7" /><span className="mw3-ambient-leaf leaf-1" /><span className="mw3-ambient-leaf leaf-2" /><span className="mw3-ambient-leaf leaf-3" /></div>}
    <header className="mw3-header" aria-label="메인 내비게이션">
      <div className="mw3-navigation"><a className="mw3-brand" href={base} aria-label="Be a Googler 홈으로 이동"><img src={asset('visual-reset/main/be-a-googler-brand.png')} alt="Be a Googler" /></a><span className="mw3-divider" aria-hidden="true" /><nav aria-label="주요 메뉴">{navigation.map((item) => <button type="button" key={item.id} className={activeNav === item.id ? 'is-active' : ''} aria-current={activeNav === item.id ? 'page' : undefined} onClick={() => { setActiveNav(item.id); announce(); }}><WorldIcon name={item.icon} /><span>{item.label}</span></button>)}</nav></div>
      <section className="mw3-profile" aria-label="프로필"><button className="mw3-notification" type="button" aria-label="알림 보기" onClick={() => announce('새로운 알림을 준비 중이에요.')}><WorldIcon name="bell" /><span>3</span></button><span className="mw3-divider" aria-hidden="true" /><button className="mw3-profile-button" type="button" aria-label="호기심 많은 구글러 프로필 보기" onClick={() => announce('프로필 탐험을 준비 중이에요.')}><img src={asset('visual-reset/main/assets/profile-avatar.png')} alt="" /><span className="mw3-identity"><strong>호기심 많은 구글러</strong><small>Lv. 7 탐험가</small></span><WorldIcon name="chevron" /></button></section>
      <button type="button" className="mw3-mobile-menu" aria-label="메뉴 준비 중" onClick={() => announce()}><WorldIcon name="menu" /></button>
    </header>
    <section className="mw3-hero" aria-labelledby="mw3-title"><p className="mw3-eyebrow">배움이 모험이 되는 곳 <span>✨</span></p><h1 id="mw3-title">{hasDesktopAmbient ? <span className="mw3-word-googler"><b>G</b><b>o</b><b>o</b><b>g</b><b>l</b><b>e</b><b>r</b>의 여정을</span> : <span><b>구</b><b>글</b><b>러</b>의 여정을</span>}<span><em>시작</em>해볼까요?</span></h1><p className="mw3-description">호기심을 가이드 삼아 배우고, 만들고, 성장하며<br />세상에 긍정적인 변화를 만들어요.</p><div className="mw3-cta-row"><button type="button" className="mw3-primary-cta" onClick={() => announce('새로운 여정이 곧 열립니다.', true)}><WorldIcon name="compass" />새로운 여정 시작하기</button><button type="button" className="mw3-secondary-cta" onClick={() => announce()}><WorldIcon name="play" />이어하기</button></div><button type="button" className="mw3-text-action" onClick={() => announce('여정 안내를 준비 중이에요.')}>여정이란? <span>›</span></button></section>
    <aside className="mw3-guide" aria-label="구글러 길잡이 안내"><p>안녕, 탐험가!<br />나는 구글러 길잡이<br />루나야. 함께 놀며<br />배워보자!</p></aside>
    {hasDesktopAmbient && <DesktopProfileCluster isPlaying={isPlaying} volume={volume} onToggleBgm={() => { toggle(); playUiSound('click', sfxOn); }} onVolumeChange={setVolume} onProfile={() => announce('프로필 탐험을 준비 중이에요.')} />}
    <section className="mw3-summary" aria-label="여정 요약">
      <button type="button" className="mw3-card mw3-card--journey" onClick={() => announce('나의 여정을 준비 중이에요.')}><span className="mw3-card-title"><WorldIcon name="route" />나의 여정</span><span className="mw3-card-content"><span className="mw3-avatar-frame"><img src={asset('visual-reset/main/assets/journey-avatar-medallion.png')} alt="여정 아바타" />{hasDesktopAmbient && <span className="mw3-world-tooltip mw3-avatar-tooltip" role="tooltip"><b>루나가 장비를 고르는 중</b><small>탐험가의 다음 모습이 곧 공개돼요.</small></span>}</span><span className="mw3-card-copy"><strong>Lv. 7 탐험가</strong><small>320 / 560 XP</small><span className="mw3-progress mw3-progress--gold"><i /></span><small>다음 레벨까지 240 XP 남음</small></span></span></button>
      <article className="mw3-card mw3-card--continue"><h2 className="mw3-card-title"><WorldIcon name="archive" />이어하기</h2><div className="mw3-card-content"><span className="mw3-island-frame"><img src={asset('visual-reset/main/assets/data-island-thumbnail.png')} alt="데이터 섬" /></span><span className="mw3-card-copy"><strong>데이터 섬의 비밀</strong><small>3. 데이터를 시각화해요</small><b className="mw3-percent">65%</b><span className="mw3-progress mw3-progress--blue"><i /></span></span><button type="button" className="mw3-resume" onClick={() => announce('데이터 섬으로 떠날 준비 중이에요.')}>계속하기</button></div>{hasDesktopAmbient && <span className="mw3-world-tooltip mw3-continue-tooltip" role="tooltip"><b>데이터 섬이 숨을 고르는 중</b><small>다음 탐험 장면을 세심하게 다듬고 있어요.</small></span>}</article>
      <button type="button" className="mw3-card mw3-card--badges" onClick={() => announce('새로운 배지를 준비 중이에요.')}><span className="mw3-card-title"><WorldIcon name="badge" />{hasDesktopAmbient ? '획득 배지' : '최근 획득 배지'}</span><span className="mw3-badge-row">{hasDesktopAmbient ? desktopBadges.map((badge) => <span className="mw3-badge-item" key={badge.asset}><img src={asset(`visual-reset/main/assets/${badge.asset}`)} alt={badge.name} /><small>{badge.name}</small><span className="mw3-world-tooltip" role="tooltip"><b>{badge.name}</b><small>{badge.lore}</small></span></span>) : <><span><img src={asset('visual-reset/main/assets/badge-blue.png')} alt="파란 배지" /></span><span><img src={asset('visual-reset/main/assets/badge-gold.png')} alt="금색 배지" /></span><span><img src={asset('visual-reset/main/assets/badge-silver.png')} alt="은색 배지" /></span></>}<b>{hasDesktopAmbient ? '+7' : '+12'}</b></span></button>
    </section>
    <section className="mw3-audio" aria-label="BGM 컨트롤"><div className="mw3-track"><WorldIcon name="music" /><strong>BGM</strong><span className="mw3-song">달빛 항해자의 마을</span></div><button type="button" className="mw3-audio-play" aria-label={isPlaying ? 'BGM 일시정지' : 'BGM 재생'} onClick={() => { toggle(); playUiSound('click', sfxOn); }}><WorldIcon name={isPlaying ? 'pause' : 'play'} /></button><span className={`mw3-equalizer ${isPlaying ? 'is-playing' : ''}`} aria-label={isPlaying ? '움직이는 이퀄라이저' : '정지된 이퀄라이저'}><i /><i /><i /><i /></span><div className="mw3-sfx"><WorldIcon name="speaker" /><span>효과음 켜짐</span><button type="button" role="switch" aria-checked={sfxOn} aria-label="효과음 켜기 또는 끄기" className={sfxOn ? 'is-on' : ''} onClick={toggleSfx}><i /></button></div></section>
    <div className={`mw3-toast ${toast ? 'is-visible' : ''}`} role="status" aria-live="polite">{toast}</div>
  </main>;
}
