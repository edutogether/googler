import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ShareButton } from './ShareButton';

describe('ShareButton', () => {
  it('keeps the supplied share action and disabled state', () => {
    const onClick = vi.fn();
    render(<ShareButton onClick={onClick} disabled className="share-class">공유하기</ShareButton>);
    const button = screen.getByRole('button', { name: '공유하기' });
    expect(button).toHaveClass('share-class');
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
