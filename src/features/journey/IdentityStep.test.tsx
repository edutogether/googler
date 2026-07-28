import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { IdentityStep } from './IdentityStep';

describe('IdentityStep', () => {
  it('keeps the operating name out of the public preview and supports avatar selection', () => {
    render(<IdentityStep onContinue={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('실명 또는 운영 확인 이름'), { target: { value: '운영 확인 이름' } });
    expect(screen.queryByText('운영 확인 이름')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '캐릭터 선택' }));
    fireEvent.click(screen.getByRole('button', { name: '🐱' }));
    expect(screen.getByRole('button', { name: '캐릭터 선택' })).toHaveTextContent('🐱');
  });
});
