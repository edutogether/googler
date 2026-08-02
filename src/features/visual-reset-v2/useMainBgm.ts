import { useCallback, useEffect, useRef, useState } from 'react';

export const MAIN_BGM_AUDIO_SRC = `${import.meta.env.BASE_URL}audio/bgm/moonlit-voyager-village-loop.mp3`;
export const MAIN_BGM_STORAGE_KEY = 'be-a-googler:main-bgm';
const DEFAULT_VOLUME = 0.28;

type StoredBgmSettings = {
  enabled: boolean;
  volume: number;
};

function readSettings(): StoredBgmSettings {
  try {
    const stored = window.localStorage.getItem(MAIN_BGM_STORAGE_KEY);
    if (!stored) return { enabled: false, volume: DEFAULT_VOLUME };
    const parsed = JSON.parse(stored) as Partial<StoredBgmSettings>;
    return {
      enabled: parsed.enabled === true,
      volume: typeof parsed.volume === 'number' && parsed.volume >= 0 && parsed.volume <= 1 ? parsed.volume : DEFAULT_VOLUME,
    };
  } catch {
    return { enabled: false, volume: DEFAULT_VOLUME };
  }
}

function writeSettings(enabled: boolean, volume: number) {
  try {
    window.localStorage.setItem(MAIN_BGM_STORAGE_KEY, JSON.stringify({ enabled, volume }));
  } catch {
    // Playback must remain available when storage is unavailable.
  }
}

export default function useMainBgm() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const enabledRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const syncPlaybackState = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setIsPlaying(!audio.paused && !audio.muted && audio.volume > 0);
  }, []);

  const playFromGesture = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !enabledRef.current || !audio.paused) return;

    void audio.play().catch(() => {
      enabledRef.current = false;
      writeSettings(false, audio.volume);
      setIsPlaying(false);
    });
  }, []);

  const registerUserGesture = useCallback(() => {
    playFromGesture();
  }, [playFromGesture]);

  const toggleBgm = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused && !audio.muted && audio.volume > 0) {
      enabledRef.current = false;
      writeSettings(false, audio.volume);
      audio.pause();
      return;
    }

    enabledRef.current = true;
    writeSettings(true, audio.volume);
    void audio.play().catch(() => {
      enabledRef.current = false;
      writeSettings(false, audio.volume);
      setIsPlaying(false);
    });
  }, []);

  useEffect(() => {
    const settings = readSettings();
    const audio = new Audio(MAIN_BGM_AUDIO_SRC);
    audioRef.current = audio;
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = settings.volume;
    enabledRef.current = settings.enabled;
    writeSettings(settings.enabled, settings.volume);

    const handleError = () => {
      enabledRef.current = false;
      writeSettings(false, audio.volume);
      setIsPlaying(false);
    };
    const handleEnded = () => {
      if (!enabledRef.current) return;
      audio.currentTime = 0;
      void audio.play().catch(handleError);
    };
    const handleVolumeChange = () => {
      writeSettings(enabledRef.current, audio.volume);
      syncPlaybackState();
    };

    audio.addEventListener('play', syncPlaybackState);
    audio.addEventListener('playing', syncPlaybackState);
    audio.addEventListener('pause', syncPlaybackState);
    audio.addEventListener('volumechange', handleVolumeChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', syncPlaybackState);
      audio.removeEventListener('playing', syncPlaybackState);
      audio.removeEventListener('pause', syncPlaybackState);
      audio.removeEventListener('volumechange', handleVolumeChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audioRef.current = null;
    };
  }, [syncPlaybackState]);

  return { isPlaying, registerUserGesture, toggleBgm };
}
