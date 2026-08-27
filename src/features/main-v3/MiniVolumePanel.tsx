import { useEffect, useRef, useState } from 'react';

const VOLUME_TWEEN_MS = 260;
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/** The slider handle animates on mute/unmute only: off pulls it smoothly to the left
 *  end, on stretches it back out to whatever level it was at (not always 100%) — the
 *  stored `volume` never changes from this, only the on-screen position does. Dragging
 *  must track the pointer 1:1 with zero lag, so it updates the displayed value directly
 *  and never goes through the tween (keying the tween effect on `enabled` alone, not
 *  `volume`, keeps every drag tick from restarting a 260ms ease against a moving
 *  target — ported from the same fix in CLASSCADE's BgmControl). */
export function MiniVolumePanel({ enabled, volume, onVolumeChange }: { enabled: boolean; volume: number; onVolumeChange: (volume: number) => void }) {
  const [displayVolume, setDisplayVolume] = useState(enabled ? volume : 0);
  const rafRef = useRef<number | null>(null);
  const volumeRef = useRef(volume);
  volumeRef.current = volume;
  const displayVolumeRef = useRef(displayVolume);
  displayVolumeRef.current = displayVolume;
  useEffect(() => {
    const target = enabled ? volumeRef.current : 0;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    const start = displayVolumeRef.current;
    const delta = target - start;
    if (Math.abs(delta) < 0.001) { setDisplayVolume(target); return; }
    const startedAt = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - startedAt) / VOLUME_TWEEN_MS);
      const next = start + delta * easeOutCubic(t);
      displayVolumeRef.current = next;
      setDisplayVolume(next);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
      else rafRef.current = null;
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, [enabled]);
  function handleDrag(next: number) {
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    displayVolumeRef.current = next;
    setDisplayVolume(next);
    onVolumeChange(next);
  }
  return <div className="mw3-mini-volume-panel" aria-label="BGM 볼륨"><input type="range" min="0" max="1" step="0.01" value={displayVolume} disabled={!enabled} aria-label="BGM 볼륨 조절" onChange={(event) => handleDrag(Number(event.target.value))} /></div>;
}
