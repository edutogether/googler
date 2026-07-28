import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TypingJourneyTitle } from './TypingJourneyTitle';

describe('TypingJourneyTitle', () => {
  afterEach(() => vi.useRealTimers());
  it('types, pauses, deletes, and starts the next phrase using its real delays', () => { vi.useFakeTimers(); render(<TypingJourneyTitle />); const first = '반짝이는 구글러 💡'; act(() => vi.advanceTimersByTime(90)); expect(screen.getByText(/반/)).toBeInTheDocument(); act(() => vi.advanceTimersByTime((first.length - 1) * 90)); expect(screen.getByText(first)).toBeInTheDocument(); act(() => vi.advanceTimersByTime(1400)); act(() => vi.advanceTimersByTime(50)); expect(screen.queryByText(first)).not.toBeInTheDocument(); act(() => vi.advanceTimersByTime((first.length - 1) * 50 + 90)); expect(screen.getByText(/호/)).toBeInTheDocument(); });
});
