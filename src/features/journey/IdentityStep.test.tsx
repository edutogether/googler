import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { suggestedAvatar } from '../../domain/journeyProfile';
import { IdentityStep } from './IdentityStep';

const renderStep = () => render(<IdentityStep onContinue={vi.fn()} />);

describe('IdentityStep', () => {
  afterEach(() => vi.useRealTimers());

  it('keeps the operating name out of the public preview and identifies this as step 3 of 8', () => {
    renderStep();
    fireEvent.change(screen.getByPlaceholderText('실명 또는 운영 확인 이름'), { target: { value: '운영 확인 전용 이름' } });

    expect(screen.getByText('여정 준비 3 / 8')).toBeInTheDocument();
    expect(screen.getByText('이름과 캐릭터')).toBeInTheDocument();
    expect(screen.queryByText('운영 확인 전용 이름', { exact: true })).not.toBeInTheDocument();
    expect(screen.getByText('새내기 구글러')).toBeInTheDocument();
  });

  it('rotates before typing and settles on the stable nickname recommendation after 500ms', () => {
    vi.useFakeTimers();
    renderStep();
    const avatar = screen.getByRole('button', { name: '캐릭터 선택' });
    const initialAvatar = avatar.textContent;

    act(() => vi.advanceTimersByTime(320));
    expect(avatar).not.toHaveTextContent(initialAvatar ?? '');

    fireEvent.change(screen.getByRole('textbox', { name: '공개 여정 이름' }), { target: { value: '반짝 여우' } });
    act(() => vi.advanceTimersByTime(500));
    expect(avatar).toHaveTextContent(suggestedAvatar('반짝 여우'));
  });

  it('uses the same default avatar for the same nickname', () => {
    vi.useFakeTimers();
    const first = renderStep();
    fireEvent.change(screen.getByRole('textbox', { name: '공개 여정 이름' }), { target: { value: '같은 이름' } });
    act(() => vi.advanceTimersByTime(500));
    const firstAvatar = screen.getByRole('button', { name: '캐릭터 선택' }).textContent;
    first.unmount();
    renderStep();
    fireEvent.change(screen.getByRole('textbox', { name: '공개 여정 이름' }), { target: { value: '같은 이름' } });
    act(() => vi.advanceTimersByTime(500));

    expect(screen.getByRole('button', { name: '캐릭터 선택' })).toHaveTextContent(firstAvatar ?? '');
  });

  it('keeps a manually selected avatar until another character recommendation unlocks it', () => {
    vi.useFakeTimers();
    renderStep();
    const avatar = screen.getByRole('button', { name: '캐릭터 선택' });
    fireEvent.click(avatar);
    fireEvent.click(screen.getByRole('button', { name: '🐱 선택' }));
    fireEvent.change(screen.getByRole('textbox', { name: '공개 여정 이름' }), { target: { value: '변경한 이름' } });
    act(() => vi.advanceTimersByTime(500));
    expect(avatar).toHaveTextContent('🐱');

    fireEvent.click(screen.getByRole('button', { name: '새로운 동료 찾기' }));
    act(() => vi.advanceTimersByTime(500));
    expect(avatar).toHaveTextContent(suggestedAvatar('변경한 이름'));
  });

  it('closes the picker with its close button', () => {
    renderStep();
    fireEvent.click(screen.getByRole('button', { name: '캐릭터 선택' }));
    expect(screen.getByRole('dialog', { name: '캐릭터 선택기' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(screen.queryByRole('dialog', { name: '캐릭터 선택기' })).not.toBeInTheDocument();
  });
});
