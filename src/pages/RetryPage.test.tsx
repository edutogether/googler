import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RetryPage } from './RetryPage';

describe('RetryPage', () => {
  it('renders the retry guidance and invokes the share callback on click', () => {
    const onPassShare = vi.fn();
    render(<RetryPage onPassShare={onPassShare} />);

    expect(screen.getByText('여유로운 재도전 (보안관 주간) 🛡️')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /재도전 성공! 단톡방에 합격 자랑하기/ }));
    expect(onPassShare).toHaveBeenCalledTimes(1);
  });
});
