// A fresh AudioContext per click used to pile up faster than the browser
// could close the previous ones (most browsers only allow a handful of
// concurrent contexts), throwing on a rapid double-click or key-repeat.
// One shared, lazily-created context reused for every click fixes that.
let sharedUiAudioContext: AudioContext | null = null;
function getUiAudioContext(): AudioContext | null {
  if (typeof window.AudioContext === 'undefined') return null;
  if (!sharedUiAudioContext || sharedUiAudioContext.state === 'closed') sharedUiAudioContext = new window.AudioContext();
  return sharedUiAudioContext;
}

export function playUiSound(kind: 'click' | 'chime', on: boolean) {
  if (!on) return;
  const context = getUiAudioContext();
  if (!context) return;
  if (context.state === 'suspended') void context.resume();
  const oscillator = context.createOscillator(); const gain = context.createGain(); const start = context.currentTime; const duration = kind === 'chime' ? .16 : .07;
  oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(kind === 'chime' ? 660 : 420, start); if (kind === 'chime') oscillator.frequency.exponentialRampToValueAtTime(880, start + .11);
  gain.gain.setValueAtTime(.0001, start); gain.gain.exponentialRampToValueAtTime(.035, start + .012); gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
  oscillator.connect(gain).connect(context.destination); oscillator.start(start); oscillator.stop(start + duration + .01);
}
