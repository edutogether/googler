import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LeaderboardPage } from './LeaderboardPage';
import type { LeaderboardEntry } from '../data/appServices';

const entry = (overrides: Partial<LeaderboardEntry> & { uid: string }): LeaderboardEntry => ({
  nickname: overrides.uid, emoji: '🐧', scoreL1: 0, scoreL2: 0, passedL1: false, passedL2: false, ...overrides,
});

describe('LeaderboardPage', () => {
  it('shows an empty-state message when there are no rankings', () => {
    render(<LeaderboardPage rankings={[]} />);
    expect(screen.getByText(/아직 레이스에 참여한 멤버가 없습니다/)).toBeInTheDocument();
  });

  it('sorts by total score, breaking ties by how many levels were passed', () => {
    const rankings = [
      entry({ uid: 'low', scoreL1: 5, scoreL2: 5 }),
      entry({ uid: 'high-unpassed', scoreL1: 20, scoreL2: 20 }),
      entry({ uid: 'high-passed', scoreL1: 20, scoreL2: 20, passedL1: true }),
    ];
    render(<LeaderboardPage rankings={rankings} />);

    const names = screen.getAllByText(/^(low|high-unpassed|high-passed)$/).map((el) => el.textContent);
    expect(names).toEqual(['high-passed', 'high-unpassed', 'low']);
  });

  it('marks the current user\'s row', () => {
    const rankings = [entry({ uid: 'me' }), entry({ uid: 'someone-else' })];
    render(<LeaderboardPage rankings={rankings} userId="me" />);

    const meLabel = screen.getByText('(나)');
    expect(meLabel.parentElement?.textContent).toContain('me');
  });

  it('renders each entrant\'s total score out of 60', () => {
    render(<LeaderboardPage rankings={[entry({ uid: 'solo', scoreL1: 10, scoreL2: 15 })]} />);
    expect(screen.getByText('25 / 60')).toBeInTheDocument();
  });
});
