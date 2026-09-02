import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ExamPage } from './ExamPage';

describe('ExamPage', () => {
  it('renders the pass-party schedule and invokes the share callback on click', () => {
    const onPassShare = vi.fn();
    render(<ExamPage onPassShare={onPassShare} />);

    expect(screen.getByText('D-Day: 다 함께 따는 날!')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /시험 끝! 단톡방에 합격 인증하기/ }));
    expect(onPassShare).toHaveBeenCalledTimes(1);
  });
});
