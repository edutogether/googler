import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProfileEditor } from './ProfileEditor';

describe('ProfileEditor', () => {
  it('edits nickname and emoji before applying the preview profile', () => {
    const onSave = vi.fn();
    render(<ProfileEditor initialNickname="" initialEmoji="🐰" onSave={onSave} onCancel={vi.fn()} canCancel={false} />);
    fireEvent.change(screen.getByPlaceholderText('ex) 발랄한 다람쥐'), { target: { value: '테스트 토끼' } });
    fireEvent.click(screen.getByRole('button', { name: '🐱' }));
    fireEvent.click(screen.getByRole('button', { name: /이 프로필로 시작하기/ }));
    expect(onSave).toHaveBeenCalledWith('🐱', '테스트 토끼');
  });
});
