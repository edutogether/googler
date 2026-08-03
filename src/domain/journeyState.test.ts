import { afterEach, describe, expect, it } from 'vitest';
import { clearJourneyState, createInitialJourneyState, journeyStateKey, loadJourneyState, moveJourneyBack, moveJourneyStep, saveJourneyState, type JourneyState } from './journeyState';

const completedProfile = { displayName: '반짝 여우', avatarId: '🦊', title: '새내기 구글러' };

describe('journey state', () => {
  afterEach(() => sessionStorage.clear());
  it('keeps each previous step and restores selections when moving back', () => {
    const identity = moveJourneyStep({ ...createInitialJourneyState(), publicProfile: completedProfile }, 'identity');
    const diagnostic = moveJourneyStep(identity, 'diagnostic');
    const selected: JourneyState = { ...diagnostic, diagnosticAnswers: [0, 2, 1, 0, 2, 1, 0], levelId: 'foundation', toneId: 'trainer' };
    const level = moveJourneyStep(selected, 'level');
    const tone = moveJourneyStep(level, 'tone');
    expect(moveJourneyBack(tone)).toMatchObject({ currentStep: 'level', diagnosticAnswers: [0, 2, 1, 0, 2, 1, 0], levelId: 'foundation', toneId: 'trainer' });
    expect(moveJourneyBack(moveJourneyBack(tone))).toMatchObject({ currentStep: 'diagnostic', diagnosticAnswers: [0, 2, 1, 0, 2, 1, 0] });
  });

  it('round-trips a valid session state and restores the last valid step', () => {
    const state: JourneyState = { ...createInitialJourneyState(), currentStep: 'planner', history: ['entry', 'identity', 'diagnostic', 'level', 'tone'], publicProfile: completedProfile, diagnosticAnswers: [0, 0, 0, 0, 0, 0, 0], levelId: 'foundation', toneId: 'mate', plannerStarted: true };
    saveJourneyState(state, sessionStorage);
    expect(loadJourneyState(sessionStorage)).toEqual(state);
  });

  it('safely resets malformed, obsolete, or incomplete session data', () => {
    for (const value of ['not json', JSON.stringify({ schemaVersion: 99 }), JSON.stringify({ ...createInitialJourneyState(), currentStep: 'missing' }), JSON.stringify({ ...createInitialJourneyState(), currentStep: 'planner' })]) {
      sessionStorage.setItem(journeyStateKey, value);
      expect(loadJourneyState(sessionStorage)).toEqual(createInitialJourneyState());
      expect(sessionStorage.getItem(journeyStateKey)).toBeNull();
    }
  });

  it('restores a completed legacy-learning state', () => {
    const completed: JourneyState = { ...createInitialJourneyState(), currentStep: 'legacy', history: ['entry', 'identity', 'diagnostic', 'level', 'tone', 'planner'], publicProfile: completedProfile, diagnosticAnswers: [0, 0, 0, 0, 0, 0, 0], levelId: 'practice', toneId: 'calm', plannerStarted: true, completed: true };
    saveJourneyState(completed, sessionStorage);
    expect(loadJourneyState(sessionStorage)).toEqual(completed);
  });

  it('clears only journey session progress for an explicit restart', () => {
    sessionStorage.setItem(journeyStateKey, JSON.stringify(createInitialJourneyState()));
    sessionStorage.setItem('journey-audio-settings', 'preserve');
    clearJourneyState(sessionStorage);
    expect(sessionStorage.getItem(journeyStateKey)).toBeNull();
    expect(sessionStorage.getItem('journey-audio-settings')).toBe('preserve');
  });
});
