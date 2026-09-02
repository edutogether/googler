import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

class MockGain {
  gain = { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() };
}
class MockOscillator {
  type = '';
  frequency = { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() };
  connect = vi.fn(() => this);
  start = vi.fn();
  stop = vi.fn();
}
class MockAudioContext {
  static instances: MockAudioContext[] = [];
  state: 'running' | 'suspended' | 'closed' = 'running';
  currentTime = 0;
  resume = vi.fn(async () => { this.state = 'running'; });
  createOscillator = vi.fn(() => new MockOscillator());
  createGain = vi.fn(() => new MockGain());
  constructor() { MockAudioContext.instances.push(this); }
}

// uiSound.ts keeps its shared AudioContext in module-level state, so each
// test needs a fresh module instance — otherwise a context created by an
// earlier test would leak into the next one's assertions.
async function freshPlayUiSound() {
  vi.resetModules();
  const module = await import('./uiSound');
  return module.playUiSound;
}

beforeEach(() => {
  MockAudioContext.instances = [];
  vi.stubGlobal('AudioContext', MockAudioContext);
});

afterEach(() => vi.unstubAllGlobals());

describe('playUiSound', () => {
  it('does nothing when sound is off', async () => {
    const playUiSound = await freshPlayUiSound();
    playUiSound('click', false);
    expect(MockAudioContext.instances).toHaveLength(0);
  });

  it('creates and plays an oscillator through a gain node when on', async () => {
    const playUiSound = await freshPlayUiSound();
    playUiSound('click', true);

    expect(MockAudioContext.instances).toHaveLength(1);
    const context = MockAudioContext.instances[0];
    expect(context.createOscillator).toHaveBeenCalledTimes(1);
    expect(context.createGain).toHaveBeenCalledTimes(1);
  });

  it('reuses the same AudioContext across repeated calls instead of creating a new one each time', async () => {
    const playUiSound = await freshPlayUiSound();
    playUiSound('click', true);
    playUiSound('chime', true);

    expect(MockAudioContext.instances).toHaveLength(1);
  });

  it('resumes a suspended context before playing', async () => {
    const playUiSound = await freshPlayUiSound();
    playUiSound('click', true);
    const context = MockAudioContext.instances[0];
    context.state = 'suspended';

    playUiSound('chime', true);

    expect(context.resume).toHaveBeenCalledTimes(1);
  });
});
