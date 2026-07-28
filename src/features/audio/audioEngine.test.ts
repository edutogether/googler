import { beforeEach, describe, expect, it } from 'vitest';
import { disposeJourneyAudio, loadAudioSettings, playJourneyEffect, saveAudioSettings, setJourneyVisibility, startJourneyBgm } from './audioEngine';

describe('journey audio engine', () => {
  beforeEach(() => { localStorage.clear(); disposeJourneyAudio(); });
  it('uses safe defaults for invalid stored settings', () => { localStorage.setItem('journey-audio-settings', 'bad json'); expect(loadAudioSettings()).toMatchObject({ bgmEnabled: true, effectsEnabled: true, volume: .35 }); });
  it('restores and persists independent BGM, effect, and volume settings', () => { localStorage.setItem('journey-audio-settings', JSON.stringify({ bgmEnabled: false, effectsEnabled: false, volume: .2 })); expect(loadAudioSettings()).toMatchObject({ bgmEnabled: false, effectsEnabled: false, volume: .2 }); expect(saveAudioSettings({ volume: 2 }).volume).toBe(1); });
  it('does not throw without Web Audio support before or after an interaction request', async () => { await expect(startJourneyBgm()).resolves.toBeUndefined(); expect(() => playJourneyEffect('select')).not.toThrow(); });
  it('does not create background audio while BGM is disabled', async () => { saveAudioSettings({ bgmEnabled: false }); await expect(startJourneyBgm()).resolves.toBeUndefined(); });
  it('handles visibility and cleanup without an audio context', () => { expect(() => setJourneyVisibility(true)).not.toThrow(); expect(() => setJourneyVisibility(false)).not.toThrow(); expect(() => disposeJourneyAudio()).not.toThrow(); });
});
