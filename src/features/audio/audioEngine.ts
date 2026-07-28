export type AudioSettings = { bgmEnabled: boolean; effectsEnabled: boolean; volume: number; activated: boolean };
const storageKey = 'journey-audio-settings';
let context: AudioContext | null = null;
let master: GainNode | null = null;
let bgm: GainNode | null = null;
let interval: number | null = null;
let settings: AudioSettings = { bgmEnabled: true, effectsEnabled: true, volume: .35, activated: false };

export function loadAudioSettings(): AudioSettings {
  try { const saved = localStorage.getItem(storageKey); if (saved) { const parsed = JSON.parse(saved) as Partial<AudioSettings>; settings = { bgmEnabled: typeof parsed.bgmEnabled === 'boolean' ? parsed.bgmEnabled : true, effectsEnabled: typeof parsed.effectsEnabled === 'boolean' ? parsed.effectsEnabled : true, volume: typeof parsed.volume === 'number' && parsed.volume >= 0 && parsed.volume <= 1 ? parsed.volume : .35, activated: typeof parsed.activated === 'boolean' ? parsed.activated : false }; } } catch { settings = { bgmEnabled: true, effectsEnabled: true, volume: .35, activated: false }; }
  return settings;
}
export function saveAudioSettings(next: Partial<AudioSettings>) { settings = { ...settings, ...next, volume: typeof next.volume === 'number' ? Math.min(1, Math.max(0, next.volume)) : settings.volume }; if (master) master.gain.value = settings.volume; localStorage.setItem(storageKey, JSON.stringify(settings)); return settings; }
function ensureContext() { if (typeof AudioContext === 'undefined') return null; context ??= new AudioContext(); master ??= context.createGain(); master.connect(context.destination); master.gain.value = settings.volume; return context; }
function tone(frequency: number, duration: number, gain: number, type: OscillatorType = 'sine') { const audio = ensureContext(); if (!audio || !master) return; const oscillator = audio.createOscillator(); const envelope = audio.createGain(); oscillator.type = type; oscillator.frequency.value = frequency; envelope.gain.setValueAtTime(.0001, audio.currentTime); envelope.gain.exponentialRampToValueAtTime(gain, audio.currentTime + .025); envelope.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + duration); oscillator.connect(envelope).connect(master); oscillator.start(); oscillator.stop(audio.currentTime + duration + .02); }
export async function activateJourneyAudio() { const audio = ensureContext(); if (!audio) return false; await audio.resume(); saveAudioSettings({ activated: true }); return true; }
export async function startJourneyBgm(enabled = true) { if (!enabled || !settings.bgmEnabled || !await activateJourneyAudio()) return; if (interval || !context || !master) return; bgm = context.createGain(); bgm.gain.setValueAtTime(.0001, context.currentTime); bgm.gain.exponentialRampToValueAtTime(.05, context.currentTime + .5); bgm.connect(master); const notes = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 349.23]; let index = 0; const pulse = () => { if (!context || !bgm) return; const oscillator = context.createOscillator(); const envelope = context.createGain(); oscillator.type = 'triangle'; oscillator.frequency.value = notes[index++ % notes.length]; envelope.gain.setValueAtTime(.0001, context.currentTime); envelope.gain.exponentialRampToValueAtTime(.025, context.currentTime + .04); envelope.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .42); oscillator.connect(envelope).connect(bgm); oscillator.start(); oscillator.stop(context.currentTime + .45); };
  pulse(); interval = window.setInterval(pulse, 620);
}
export function stopJourneyBgm() { if (interval) window.clearInterval(interval); interval = null; if (context && bgm) { bgm.gain.cancelScheduledValues(context.currentTime); bgm.gain.setTargetAtTime(.0001, context.currentTime, .12); window.setTimeout(() => bgm?.disconnect(), 450); } bgm = null; }
export function playJourneyEffect(kind: 'select' | 'next' | 'confirm' | 'reveal') { if (!settings.effectsEnabled || !settings.activated) return; const sounds = { select: [520, .07], next: [660, .08], confirm: [784, .12], reveal: [392, .16] } as const; const [frequency, duration] = sounds[kind]; tone(frequency, duration, .055, 'square'); }
export function setJourneyVisibility(hidden: boolean) { if (!context) return; if (hidden) context.suspend(); else if (settings.activated && settings.bgmEnabled) void context.resume(); }
export function disposeJourneyAudio() { stopJourneyBgm(); if (context) void context.close(); context = null; master = null; }
