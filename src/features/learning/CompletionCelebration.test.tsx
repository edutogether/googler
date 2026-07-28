import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CompletionCelebration } from './CompletionCelebration';

describe('CompletionCelebration', () => {
  it('only renders after a completion condition requests it', () => {
    const { rerender } = render(<CompletionCelebration visible={false} />);
    expect(screen.queryByText('완벽하게 해냈어요!')).not.toBeInTheDocument();
    rerender(<CompletionCelebration visible />);
    expect(screen.getByText('완벽하게 해냈어요!')).toBeInTheDocument();
  });
});
