import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  journeyTitlePhrases,
  journeyTypingDeletingDelay,
  journeyTypingDelay,
  journeyTypingPauseDelay,
} from '../../domain/journeyTyping';
import { TypingJourneyTitle } from './TypingJourneyTitle';

const titleText = () => screen.getByText((_, element) => element?.tagName === 'P')?.textContent;

describe('TypingJourneyTitle', () => {
  afterEach(() => vi.useRealTimers());

  it('types, pauses, deletes, and starts the next phrase using shared real delays', () => {
    vi.useFakeTimers();
    render(<TypingJourneyTitle />);
    const first = journeyTitlePhrases[0];
    const firstCharacters = Array.from(first);

    expect(titleText()).toBe('▍');
    act(() => vi.advanceTimersByTime(journeyTypingDelay - 1));
    expect(titleText()).toBe('▍');
    act(() => vi.advanceTimersByTime(1));
    expect(titleText()).toBe(`${firstCharacters.slice(0, 1).join('')}▍`);
    for (let index = 1; index < firstCharacters.length; index += 1) {
      act(() => vi.advanceTimersByTime(journeyTypingDelay));
    }
    expect(titleText()).toBe(`${first}▍`);
    act(() => vi.advanceTimersByTime(journeyTypingPauseDelay - 1));
    expect(titleText()).toBe(`${first}▍`);
    act(() => vi.advanceTimersByTime(1));
    expect(titleText()).toBe(`${first}▍`);
    act(() => vi.advanceTimersByTime(journeyTypingDeletingDelay));
    expect(titleText()).toBe(`${firstCharacters.slice(0, -1).join('')}▍`);
    for (let index = 1; index < firstCharacters.length; index += 1) {
      act(() => vi.advanceTimersByTime(journeyTypingDeletingDelay));
    }
    act(() => vi.advanceTimersByTime(journeyTypingDeletingDelay));
    act(() => vi.advanceTimersByTime(journeyTypingDelay));
    expect(titleText()).toBe(`${journeyTitlePhrases[1].slice(0, 1)}▍`);
  });
});
