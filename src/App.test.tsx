import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';
import LegacyGooglerApp from './legacy/LegacyGooglerApp';

describe('journey prototype', () => {
  it('shows the two game-like entry choices and starts a new journey', () => {
    render(<App />);
    expect(screen.getByText('Be a Googler')).toBeInTheDocument();
    fireEvent.click(screen.getByText('처음 여정을 시작해요'));
    expect(screen.getByText('여정에서 사용할 이름은 무엇인가요?')).toBeInTheDocument();
  });
  it('keeps the preserved learning space available after the planner', () => {
    render(<LegacyGooglerApp />);
    expect(screen.getByText('시험 준비, 차근차근 시작해요')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /무엇을 배울까/ }));
    expect(screen.getAllByRole('checkbox')).toHaveLength(30);
  });
});
