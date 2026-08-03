export type AudioSettings = { bgmEnabled: boolean; effectsEnabled: boolean; volume: number; activated: boolean };

type PlaybackSession = {
  source: AudioBufferSourceNode;
  gain: GainNode;
  cleanupTimer: ReturnType<typeof setTimeout> | null;
  finished: boolean;
};

const storageKey = 'journey-audio-settings';
const bgmUrl = `${import.meta.env.BASE_URL}audio/bgm/googler-wonder-adventure.wav`;
const fadeInSeconds = 0.5;
const fadeOutMilliseconds = 450;
const silentGain = 0.0001;

let context: AudioContext | null = null;
let master: GainNode | null = null;
let playback: PlaybackSession | null = null;
const fadingPlaybacks = new Set<PlaybackSession>();
let bgmBuffer: AudioBuffer | null = null;
let bgmLoading: Promise<AudioBuffer | null> | null = null;
let settings: AudioSettings = { bgmEnabled: true, effectsEnabled: true, volume: 0.35, activated: false };

const defaults = (): AudioSettings => ({ bgmEnabled: true, effectsEnabled: true, volume: 0.35, activated: false });

export function loadAudioSettings(): AudioSettings {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<AudioSettings>;
      settings = {
        bgmEnabled: typeof parsed.bgmEnabled === 'boolean' ? parsed.bgmEnabled : true,
        effectsEnabled: typeof parsed.effectsEnabled === 'boolean' ? parsed.effectsEnabled : true,
        volume: typeof parsed.volume === 'number' && parsed.volume >= 0 && parsed.volume <= 1 ? parsed.volume : 0.35,
        activated: typeof parsed.activated === 'boolean' ? parsed.activated : false,
      };
    }
  } catch {
    settings = defaults();
  }
  return settings;
}

export function saveAudioSettings(next: Partial<AudioSettings>) {
  settings = {
    ...settings,
    ...next,
    volume: typeof next.volume === 'number' ? Math.min(1, Math.max(0, next.volume)) : settings.volume,
  };
  if (master) master.gain.value = settings.volume;
  localStorage.setItem(storageKey, JSON.stringify(settings));
  return settings;
}

function ensureContext() {
  if (typeof AudioContext === 'undefined') return null;
  context ??= new AudioContext();
  master ??= context.createGain();
  master.connect(context.destination);
  master.gain.value = settings.volume;
  return context;
}

function safely(action: () => void) {
  try {
    action();
  } catch {
    // Web Audio nodes may already be stopped or disconnected during repeated cleanup.
  }
}

function finishPlayback(session: PlaybackSession) {
  if (session.finished) return;
  session.finished = true;
  if (session.cleanupTimer) clearTimeout(session.cleanupTimer);
  session.cleanupTimer = null;
  safely(() => session.source.stop());
  safely(() => session.source.disconnect());
  safely(() => session.gain.disconnect());
  fadingPlaybacks.delete(session);
}

function stopPlayback(session: PlaybackSession) {
  if (session.finished || session.cleanupTimer) return;
  const audio = context;
  if (!audio) {
    finishPlayback(session);
    return;
  }
  safely(() => session.gain.gain.cancelScheduledValues(audio.currentTime));
  safely(() => session.gain.gain.setTargetAtTime(silentGain, audio.currentTime, 0.12));
  fadingPlaybacks.add(session);
  session.cleanupTimer = setTimeout(() => finishPlayback(session), fadeOutMilliseconds);
}

function tone(frequency: number, duration: number, gain: number, type: OscillatorType = 'sine') {
  const audio = ensureContext();
  if (!audio || !master) return;
  const oscillator = audio.createOscillator();
  const envelope = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  envelope.gain.setValueAtTime(silentGain, audio.currentTime);
  envelope.gain.exponentialRampToValueAtTime(gain, audio.currentTime + 0.025);
  envelope.gain.exponentialRampToValueAtTime(silentGain, audio.currentTime + duration);
  oscillator.connect(envelope).connect(master);
  oscillator.start();
  oscillator.stop(audio.currentTime + duration + 0.02);
}

export async function activateJourneyAudio() {
  const audio = ensureContext();
  if (!audio) return false;
  try {
    await audio.resume();
    saveAudioSettings({ activated: true });
    return true;
  } catch {
    return false;
  }
}

async function loadBgm(audio: AudioContext) {
  if (bgmBuffer) return bgmBuffer;
  if (!bgmLoading) {
    bgmLoading = fetch(bgmUrl)
      .then((response) => response.ok ? response.arrayBuffer() : Promise.reject(new Error('Unable to load journey BGM')))
      .then((data) => audio.decodeAudioData(data))
      .then((buffer) => {
        bgmBuffer = buffer;
        return buffer;
      })
      .catch(() => null)
      .finally(() => { bgmLoading = null; });
  }
  return bgmLoading;
}

export async function startJourneyBgm(enabled = true) {
  if (!enabled || !settings.bgmEnabled || playback || !await activateJourneyAudio()) return;
  const audio = context;
  const output = master;
  if (!audio || !output || playback) return;
  const buffer = await loadBgm(audio);
  if (!buffer || playback || context !== audio || master !== output) return;

  const gain = audio.createGain();
  gain.gain.setValueAtTime(silentGain, audio.currentTime);
  gain.gain.linearRampToValueAtTime(0.35, audio.currentTime + fadeInSeconds);
  gain.connect(output);
  const source = audio.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.connect(gain);
  const session: PlaybackSession = { source, gain, cleanupTimer: null, finished: false };
  source.onended = () => finishPlayback(session);
  playback = session;
  source.start();
}

export function stopJourneyBgm() {
  const session = playback;
  playback = null;
  if (session) stopPlayback(session);
}

export function playJourneyEffect(kind: 'select' | 'next' | 'confirm' | 'reveal') {
  if (!settings.effectsEnabled || !settings.activated) return;
  const sounds = { select: [520, 0.07], next: [660, 0.08], confirm: [784, 0.12], reveal: [392, 0.16] } as const;
  const [frequency, duration] = sounds[kind];
  tone(frequency, duration, 0.055, 'square');
}

export function setJourneyVisibility(hidden: boolean) {
  if (!context) return;
  if (hidden) void context.suspend();
  else if (settings.activated && settings.bgmEnabled) void context.resume();
}

export function disposeJourneyAudio() {
  stopJourneyBgm();
  for (const session of fadingPlaybacks) finishPlayback(session);
  if (context) void context.close();
  context = null;
  master = null;
}
