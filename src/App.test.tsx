import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('preserved product baseline', () => {
  it('renders the original learning journey and its primary navigation', () => {
    const { container } = render(<App />);

    expect(screen.getByText('시험 준비, 차근차근 시작해요')).toBeInTheDocument();
    const profileButton = container.querySelector('button.hidden.md\\:block');
    expect(profileButton).not.toBeNull();
    fireEvent.click(profileButton!);
    expect(screen.getByText(/환영합니다/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Level 1/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Level 2/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /무엇을 배울까/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /시험 응시/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /재도전/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /랭킹보기/ })).toBeInTheDocument();
  });

  it('retains ten days per level and sixty mission checkboxes', () => {
    render(<App />);

    fireEvent.click(screen.getAllByRole('button', { name: /무엇을 배울까/ })[0]);
    expect(screen.getAllByText(/Day \d+/)).toHaveLength(10);
    expect(screen.getAllByRole('checkbox')).toHaveLength(30);

    fireEvent.click(screen.getByRole('button', { name: /Level 2/ }));
    expect(screen.getAllByText(/Day \d+/)).toHaveLength(10);
    expect(screen.getAllByRole('checkbox')).toHaveLength(30);
  });

  it('edits a preview profile and opens the empty leaderboard without inventing rankings', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('button.hidden.md\\:block')!);
    fireEvent.change(screen.getByPlaceholderText('ex) 발랄한 다람쥐'), { target: { value: '테스트 토끼' } });
    fireEvent.click(screen.getByRole('button', { name: '🐱' }));
    expect(screen.getByText(/환영합니다!/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /랭킹보기/ }));
    expect(screen.getByText('Google Educator가 되기 위한 여정')).toBeInTheDocument();
    expect(screen.getByText('아직 레이스에 참여한 멤버가 없습니다! 🏃💨')).toBeInTheDocument();
  });
});
