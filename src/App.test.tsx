import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import LegacyGooglerApp from './legacy/LegacyGooglerApp';

function enterIdentityStep() {
  fireEvent.click(screen.getByRole('button', { name: /모험 시작하기/ }));
  fireEvent.click(screen.getByRole('button', { name: '내 모험 프로필 만들기' }));
}

function enterLevelStep() {
  enterIdentityStep();
  fireEvent.click(screen.getByRole('button', { name: '이 모습으로 출발하기' }));
  for (let index = 0; index < 7; index += 1) fireEvent.click(screen.getByText('조금 해봤어요'));
}

afterEach(() => vi.useRealTimers());

describe('Stage 1A journey experience', () => {
  it('shows the fixed two-line entry copy without a typing title', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Be a Googler' })).toBeInTheDocument();
    expect(screen.getByText('배우고, 직접 해보고, 함께 성장하는')).toBeInTheDocument();
    expect(screen.getByText('구글러의 작은 모험을 시작해보세요.')).toBeInTheDocument();
    expect(screen.queryByText('반짝이는 구글러 💡')).not.toBeInTheDocument();
  });

  it('uses eight connected stages and puts the adventure profile first in the identity DOM', () => {
    render(<App />);
    enterIdentityStep();
    expect(screen.getByText('여정 준비 3 / 8')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '나만의 구글러 만들기' })).toBeInTheDocument();
    const profile = screen.getByLabelText('모험 프로필 미리보기');
    const legalName = screen.getByLabelText('용사님의 이름');
    expect(profile.compareDocumentPosition(legalName) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('keeps legal and public names separate and validates the public nickname', () => {
    render(<App />);
    enterIdentityStep();
    fireEvent.change(screen.getByLabelText('용사님의 이름'), { target: { value: '홍길동' } });
    fireEvent.change(screen.getByLabelText('모험 닉네임'), { target: { value: ' ' } });
    expect(screen.getByRole('alert')).toHaveTextContent('2~16자');
    expect(screen.queryByText('홍길동')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '이 모습으로 출발하기' })).toBeDisabled();
  });

  it('cycles an avatar, settles it after a typed nickname, and keeps a manually locked companion', () => {
    vi.useFakeTimers();
    render(<App />);
    enterIdentityStep();
    const avatarButton = screen.getByRole('button', { name: '캐릭터 선택기 열기' });
    const initialAvatar = avatarButton.textContent;
    act(() => vi.advanceTimersByTime(320));
    expect(avatarButton.textContent).not.toBe(initialAvatar);
    fireEvent.change(screen.getByLabelText('모험 닉네임'), { target: { value: '다정한 별' } });
    act(() => vi.advanceTimersByTime(500));
    fireEvent.click(avatarButton);
    fireEvent.click(screen.getByRole('button', { name: '🐼 선택' }));
    fireEvent.change(screen.getByLabelText('모험 닉네임'), { target: { value: '용감한 별' } });
    act(() => vi.advanceTimersByTime(500));
    expect(avatarButton).toHaveTextContent('🐼');
  });

  it('opens and closes the avatar picker from its button and outside click', () => {
    render(<App />);
    enterIdentityStep();
    fireEvent.click(screen.getByRole('button', { name: '캐릭터 선택기 열기' }));
    expect(screen.getByRole('dialog', { name: '캐릭터 선택기' })).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('dialog', { name: '캐릭터 선택기' })).not.toBeInTheDocument();
  });

  it('renders all four selectable starting levels and supports carousel arrow keys', () => {
    render(<App />);
    enterLevelStep();
    expect(screen.getByText('처음부터 시작하기')).toBeInTheDocument();
    expect(screen.getByText('기초를 탄탄하게')).toBeInTheDocument();
    expect(screen.getByText('활용 능력 넓히기')).toBeInTheDocument();
    expect(screen.getByText('심화·시험 준비')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByLabelText('출발 단계 카드. 방향키로 이동'), { key: 'ArrowRight' });
    expect(screen.getAllByText('선택됨')).toHaveLength(1);
  });

  it('exposes accessible icon-only sound controls', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '배경음악 끄기' }));
    fireEvent.click(screen.getByRole('button', { name: '효과음 끄기' }));
    expect(screen.getByRole('button', { name: '배경음악 켜기' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '효과음 켜기' })).toBeInTheDocument();
    expect(screen.queryByText('BGM 켜짐')).not.toBeInTheDocument();
  });

  it('keeps the preserved learning space available with its existing mission count', () => {
    render(<LegacyGooglerApp />);
    expect(screen.getByText('시험 준비, 차근차근 시작해요')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /무엇을 배울까/ }));
    expect(screen.getAllByRole('checkbox')).toHaveLength(30);
  });
});
