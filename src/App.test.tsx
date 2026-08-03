import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';
import LegacyGooglerApp from './legacy/LegacyGooglerApp';

describe('journey prototype', () => {
  it('shows the canonical entry choices and starts a new journey', () => {
    render(<App />);
    expect(screen.getByText('Be a Googler')).toBeInTheDocument();
    fireEvent.click(screen.getByText('모험 시작하기'));
    expect(screen.getByText('용사님의 이름')).toBeInTheDocument();
  });

  it('keeps the preserved learning space available after the planner', () => {
    render(<LegacyGooglerApp />);
    fireEvent.click(screen.getByRole('button', { name: /무엇을 배울까/ }));
    expect(screen.getAllByRole('checkbox')).toHaveLength(30);
  });
});
