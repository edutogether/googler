import { useCallback, useEffect, useRef, useState } from 'react';
import { BGM_SOURCE, DEFAULT_VOLUME, MAIN_V3_BGM_STORAGE_KEY } from './mainWorldContent';

export function useWorldAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bgmEnabledRef = useRef(true);
  const [bgmEnabled, setBgmEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);
  const volumeStateTimerRef = useRef<number | null>(null);
  const sync = useCallback(() => { const audio = audioRef.current; setIsPlaying(Boolean(audio && !audio.paused && !audio.muted && audio.volume > 0)); }, []);
  useEffect(() => {
    const audio = new Audio(BGM_SOURCE);
    // Automated visual QA opts in with ?qa-mute=1 to capture screenshots
    // without triggering autoplay audio; real users never set this.
    const qaMuted = new URLSearchParams(window.location.search).get('qa-mute') === '1';
    if (qaMuted) { audio.muted = true; audio.volume = 0; audioRef.current = audio; return () => { audio.pause(); audioRef.current = null; }; }
    audio.loop = true; audio.preload = 'metadata'; audio.volume = DEFAULT_VOLUME; setVolumeState(DEFAULT_VOLUME);
    audioRef.current = audio;
    // BGM starts on by default: the button shows "on" from the first paint
    // and an autoplay attempt fires immediately. Browsers block autoplay
    // until the visitor's first interaction, so when that attempt is
    // rejected, one-time capture listeners wait for the very first gesture
    // anywhere on the page (any click/tap/key) and start playback right
    // then — the visitor never has to find the BGM button itself.
    bgmEnabledRef.current = true; setBgmEnabled(true);
    try { window.localStorage.removeItem(MAIN_V3_BGM_STORAGE_KEY); } catch { /* optional */ }
    let cancelled = false;
    const gestureEvents = ['pointerdown', 'click', 'touchstart', 'keydown'] as const;
    let removeFirstGesture = () => {};
    let retryInFlight = false;
    const fail = () => { setIsPlaying(false); };
    const ended = () => { if (bgmEnabledRef.current) { audio.currentTime = 0; void audio.play().catch(fail); } };
    audio.addEventListener('play', sync); audio.addEventListener('playing', sync); audio.addEventListener('pause', sync); audio.addEventListener('error', fail); audio.addEventListener('ended', ended);
    const resumeAfterFirstGesture = (event: Event) => {
      // The BGM toggle buttons run their own toggle() handler — don't fight it.
      if (event.target instanceof Element && event.target.closest('.mw3-mini-bgm, .mw3-mobile-bgm, .mw3-audio-play')) return;
      if (!bgmEnabledRef.current || !audio.paused) { removeFirstGesture(); return; }
      if (retryInFlight) return;
      retryInFlight = true;
      void audio.play().then(() => { removeFirstGesture(); sync(); }).catch(fail).finally(() => { retryInFlight = false; });
    };
    const armFirstGestureFallback = () => {
      if (cancelled) return;
      gestureEvents.forEach((eventName) => window.addEventListener(eventName, resumeAfterFirstGesture, true));
      removeFirstGesture = () => gestureEvents.forEach((eventName) => window.removeEventListener(eventName, resumeAfterFirstGesture, true));
    };
    void audio.play().then(sync).catch(() => { fail(); armFirstGestureFallback(); });
    return () => { cancelled = true; removeFirstGesture(); audio.pause(); audio.removeEventListener('play', sync); audio.removeEventListener('playing', sync); audio.removeEventListener('pause', sync); audio.removeEventListener('error', fail); audio.removeEventListener('ended', ended); audioRef.current = null; };
  }, [sync]);
  const toggle = useCallback(() => {
    const audio = audioRef.current; if (!audio) return;
    if (bgmEnabledRef.current) { bgmEnabledRef.current = false; setBgmEnabled(false); audio.pause(); audio.currentTime = 0; return; }
    audio.currentTime = 0; bgmEnabledRef.current = true; setBgmEnabled(true); void audio.play().then(sync).catch(() => setIsPlaying(false));
  }, [sync]);
  const setVolume = useCallback((nextVolume: number) => {
    const audio = audioRef.current; if (!audio) return;
    const clamped = Math.min(1, Math.max(0, nextVolume));
    audio.volume = clamped; sync();
    // The slider drags and the mute/unmute tween both call this many times a second;
    // setVolumeState re-renders this whole scene (every background, badge, popover),
    // and doing that on EVERY tick was heavy enough on real hardware to make the
    // slider itself feel laggy even though the audible volume change is instant and
    // free. The actual sound already changed above — only the React-side sync (needed
    // for the initial value on mount and as the mute tween's target) is debounced.
    if (volumeStateTimerRef.current !== null) window.clearTimeout(volumeStateTimerRef.current);
    volumeStateTimerRef.current = window.setTimeout(() => { volumeStateTimerRef.current = null; setVolumeState(clamped); }, 80);
  }, [sync]);
  useEffect(() => () => { if (volumeStateTimerRef.current !== null) window.clearTimeout(volumeStateTimerRef.current); }, []);
  return { bgmEnabled, isPlaying, volume, toggle, setVolume };
}
