import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { disposeJourneyAudio, loadAudioSettings, playJourneyEffect, saveAudioSettings, setJourneyVisibility, startJourneyBgm } from './audioEngine';

class MockGain {
  gain = {
    value: 0,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
    setTargetAtTime: vi.fn(),
    cancelScheduledValues: vi.fn(),
  };
  connect = vi.fn((node: unknown) => node);
  disconnect = vi.fn();
}

class MockSource {
  buffer: AudioBuffer | null = null;
  loop = false;
  onended: (() => void) | null = null;
  connect = vi.fn((node: unknown) => node);
  disconnect = vi.fn();
  start = vi.fn();
  stop = vi.fn(() => this.onended?.());
}

class MockAudioContext {
  static instances: MockAudioContext[] = [];
  currentTime = 1;
  destination = {} as AudioDestinationNode;
  gains: MockGain[] = [];
  sources: MockSource[] = [];
  resume = vi.fn(async () => undefined);
  suspend = vi.fn(async () => undefined);
  close = vi.fn(async () => undefined);
  decodeAudioData = vi.fn(async () => ({}) as AudioBuffer);
  constructor() { MockAudioContext.instances.push(this); }
  createGain() { const gain = new MockGain(); this.gains.push(gain); return gain as unknown as GainNode; }
  createBufferSource() { const source = new MockSource(); this.sources.push(source); return source as unknown as AudioBufferSourceNode; }
  createOscillator() { throw new Error('effects are not part of WAV BGM tests'); }
}

type AudioEngine = typeof import('./audioEngine');

const installWebAudio = (fetchImpl = vi.fn(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) }))) => {
  MockAudioContext.instances = [];
  vi.stubGlobal('AudioContext', MockAudioContext);
  vi.stubGlobal('fetch', fetchImpl);
  return fetchImpl;
};

const loadMockedEngine = async (): Promise<AudioEngine> => {
  vi.resetModules();
  return import('./audioEngine');
};

describe('journey audio engine', () => {
  beforeEach(() => { localStorage.clear(); disposeJourneyAudio(); });
  it('uses safe defaults for invalid stored settings', () => { localStorage.setItem('journey-audio-settings', 'bad json'); expect(loadAudioSettings()).toMatchObject({ bgmEnabled: true, effectsEnabled: true, volume: .35 }); });
  it('restores and persists independent BGM, effect, and volume settings', () => { localStorage.setItem('journey-audio-settings', JSON.stringify({ bgmEnabled: false, effectsEnabled: false, volume: .2 })); expect(loadAudioSettings()).toMatchObject({ bgmEnabled: false, effectsEnabled: false, volume: .2 }); expect(saveAudioSettings({ volume: 2 }).volume).toBe(1); });
  it('does not throw without Web Audio support before or after an interaction request', async () => { await expect(startJourneyBgm()).resolves.toBeUndefined(); expect(() => playJourneyEffect('select')).not.toThrow(); });
  it('does not create background audio while BGM is disabled', async () => { saveAudioSettings({ bgmEnabled: false }); await expect(startJourneyBgm()).resolves.toBeUndefined(); });
  it('handles visibility and cleanup without an audio context', () => { expect(() => setJourneyVisibility(true)).not.toThrow(); expect(() => setJourneyVisibility(false)).not.toThrow(); expect(() => disposeJourneyAudio()).not.toThrow(); });
});

describe('WAV BGM playback', () => {
  beforeEach(() => { vi.useFakeTimers(); localStorage.clear(); });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

  it('fetches, decodes, loops, fades in, and starts the WAV exactly once', async () => {
    const fetchMock = installWebAudio();
    const engine = await loadMockedEngine();
    await engine.startJourneyBgm();
    const audio = MockAudioContext.instances[0];
    const source = audio.sources[0];
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('audio/bgm/googler-wonder-adventure.wav'));
    expect(audio.decodeAudioData).toHaveBeenCalledOnce();
    expect(source.loop).toBe(true);
    expect(source.start).toHaveBeenCalledOnce();
    expect(audio.gains[1].connect).toHaveBeenCalledWith(audio.gains[0]);
    expect(audio.gains[1].gain.linearRampToValueAtTime).toHaveBeenCalledWith(.35, 1.5);
  });

  it('reuses the decoded cache after an off/on cycle while creating a fresh source', async () => {
    const fetchMock = installWebAudio();
    const engine = await loadMockedEngine();
    await engine.startJourneyBgm();
    const audio = MockAudioContext.instances[0];
    const firstSource = audio.sources[0];
    engine.stopJourneyBgm();
    vi.advanceTimersByTime(450);
    await engine.startJourneyBgm();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(audio.decodeAudioData).toHaveBeenCalledOnce();
    expect(firstSource.stop).toHaveBeenCalled();
    expect(audio.sources).toHaveLength(2);
    expect(audio.sources[1].start).toHaveBeenCalledOnce();
  });

  it('does not create a duplicate source when BGM is already playing', async () => {
    installWebAudio();
    const engine = await loadMockedEngine();
    await engine.startJourneyBgm();
    await engine.startJourneyBgm();
    expect(MockAudioContext.instances[0].sources).toHaveLength(1);
  });

  it('fades out and disconnects only the stopped playback session', async () => {
    installWebAudio();
    const engine = await loadMockedEngine();
    await engine.startJourneyBgm();
    const audio = MockAudioContext.instances[0];
    const firstSource = audio.sources[0];
    const firstGain = audio.gains[1];
    engine.stopJourneyBgm();
    expect(firstGain.gain.setTargetAtTime).toHaveBeenCalledWith(.0001, 1, .12);
    vi.advanceTimersByTime(450);
    expect(firstSource.stop).toHaveBeenCalledOnce();
    expect(firstSource.disconnect).toHaveBeenCalledOnce();
    expect(firstGain.disconnect).toHaveBeenCalledOnce();
  });

  it('keeps a newly started source alive when an older fade cleanup finishes', async () => {
    installWebAudio();
    const engine = await loadMockedEngine();
    await engine.startJourneyBgm();
    const audio = MockAudioContext.instances[0];
    const oldSource = audio.sources[0];
    const oldGain = audio.gains[1];
    engine.stopJourneyBgm();
    await engine.startJourneyBgm();
    const currentSource = audio.sources[1];
    const currentGain = audio.gains[2];
    vi.advanceTimersByTime(450);
    expect(oldSource.disconnect).toHaveBeenCalledOnce();
    expect(oldGain.disconnect).toHaveBeenCalledOnce();
    expect(currentSource.disconnect).not.toHaveBeenCalled();
    expect(currentGain.disconnect).not.toHaveBeenCalled();
    expect(currentSource.start).toHaveBeenCalledOnce();
  });

  it('retries a failed load and tolerates repeated stop and dispose cleanup', async () => {
    const fetchMock = installWebAudio(vi.fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) }));
    const engine = await loadMockedEngine();
    await expect(engine.startJourneyBgm()).resolves.toBeUndefined();
    await expect(engine.startJourneyBgm()).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(() => { engine.stopJourneyBgm(); engine.stopJourneyBgm(); engine.disposeJourneyAudio(); engine.disposeJourneyAudio(); }).not.toThrow();
  });
});

describe('WAV SFX playback', () => {
  beforeEach(() => { vi.useFakeTimers(); localStorage.clear(); });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

  it('fetches, decodes, and starts a non-looping one-shot SFX', async () => {
    const fetchMock = installWebAudio();
    const engine = await loadMockedEngine();
    await engine.playJourneySfx('journeyStart');
    const audio = MockAudioContext.instances[0];
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('audio/sfx/journey-start.wav'));
    expect(audio.decodeAudioData).toHaveBeenCalledOnce();
    expect(audio.sources[0].loop).toBe(false);
    expect(audio.sources[0].start).toHaveBeenCalledOnce();
  });

  it('caches each SFX independently and cleans up only its ended nodes', async () => {
    const fetchMock = installWebAudio();
    const engine = await loadMockedEngine();
    await engine.playJourneySfx('select');
    const audio = MockAudioContext.instances[0];
    const first = audio.sources[0];
    first.onended?.();
    expect(first.disconnect).toHaveBeenCalledOnce();
    vi.advanceTimersByTime(81);
    await engine.playJourneySfx('select');
    vi.advanceTimersByTime(81);
    await engine.playJourneySfx('avatarSelect');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(audio.decodeAudioData).toHaveBeenCalledTimes(2);
    expect(audio.sources).toHaveLength(3);
  });

  it('prevents an immediate duplicate but permits the same SFX after the guard interval', async () => {
    installWebAudio();
    const engine = await loadMockedEngine();
    await engine.playJourneySfx('next');
    await engine.playJourneySfx('next');
    expect(MockAudioContext.instances[0].sources).toHaveLength(1);
    vi.advanceTimersByTime(81);
    await engine.playJourneySfx('next');
    expect(MockAudioContext.instances[0].sources).toHaveLength(2);
  });

  it('recovers from a failed SFX fetch and keeps muted audio silent', async () => {
    const fetchMock = installWebAudio(vi.fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) }));
    const engine = await loadMockedEngine();
    await expect(engine.playJourneySfx('coachSelect')).resolves.toBeUndefined();
    await expect(engine.playJourneySfx('coachSelect')).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    engine.saveAudioSettings({ effectsEnabled: false });
    vi.advanceTimersByTime(81);
    await engine.playJourneySfx('plannerStart');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
