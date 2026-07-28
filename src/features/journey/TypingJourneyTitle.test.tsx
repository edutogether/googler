import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TypingJourneyTitle, journeyTitlePhrases } from './TypingJourneyTitle';

describe('TypingJourneyTitle', () => {
  afterEach(() => vi.useRealTimers());
  it('types and advances journey phrases', () => { vi.useFakeTimers(); render(<TypingJourneyTitle />); act(() => vi.advanceTimersByTime(90)); expect(screen.getByText(/반/)).toBeInTheDocument(); act(() => vi.advanceTimersByTime(3000)); expect(journeyTitlePhrases).toHaveLength(6); });
});
