import { useCallback, useEffect, useRef, useState } from 'react';
import { MAIN_V3_SFX_STORAGE_KEY } from './mainWorldContent';
import { playUiSound } from './uiSound';

function getSfx() { try { return window.localStorage.getItem(MAIN_V3_SFX_STORAGE_KEY) !== 'false'; } catch { return true; } }
function saveSfx(enabled: boolean) { try { window.localStorage.setItem(MAIN_V3_SFX_STORAGE_KEY, String(enabled)); } catch { /* optional */ } }

// Owns the sound-effects toggle and the toast banner it (and every other
// "coming soon" interaction) shares one dismiss timer with.
export function useAnnouncements() {
  const [sfxOn, setSfxOn] = useState(getSfx);
  const [toast, setToast] = useState('');
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const announce = useCallback((message = '이 길은 아직 준비 중이에요 🌱', chime = false) => {
    window.clearTimeout(timer.current);
    setToast(message);
    playUiSound(chime ? 'chime' : 'click', sfxOn);
    timer.current = window.setTimeout(() => setToast(''), 1900);
  }, [sfxOn]);

  const toggleSfx = useCallback(() => {
    const next = !sfxOn;
    if (sfxOn) playUiSound('click', true);
    setSfxOn(next);
    saveSfx(next);
    window.clearTimeout(timer.current);
    setToast(next ? '효과음을 켰어요.' : '효과음을 껐어요.');
    timer.current = window.setTimeout(() => setToast(''), 1900);
  }, [sfxOn]);

  return { sfxOn, toast, announce, toggleSfx };
}
