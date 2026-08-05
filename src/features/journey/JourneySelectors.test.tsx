import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { coachTones } from '../../content/coachTones';
import { journeyLevels } from '../../content/journeyLevels';
import { CoachToneSelector } from './CoachToneSelector';
import { JourneyLevelSelector } from './JourneyLevelSelector';

describe('journey selectors', () => {
  it('shows all four levels and lets the learner change the recommended level', () => {
    const onSelect = vi.fn();
    render(<JourneyLevelSelector levels={journeyLevels} selectedId="start" onSelect={onSelect} onContinue={vi.fn()} />);
    expect(screen.getAllByText(/출발 단계/)).not.toHaveLength(0);
    expect(screen.getByText('처음부터 시작하기')).toBeInTheDocument();
    expect(screen.getByText('심화·시험 준비')).toBeInTheDocument();
    fireEvent.click(screen.getByText('활용 능력 넓히기'));
    expect(onSelect).toHaveBeenCalledWith('practice');
    fireEvent.click(screen.getByRole('button', { name: '다음 출발 단계' }));
    expect(onSelect).toHaveBeenCalledWith('foundation');
  });

  it('shows the three white coach cards and changes the selected coach', () => {
    const onSelect = vi.fn();
    render(<CoachToneSelector tones={coachTones} selectedId="mate" onSelect={onSelect} onContinue={vi.fn()} />);
    expect(screen.getByText('차분한 코치')).toBeInTheDocument();
    expect(screen.getByText('발랄한 메이트')).toBeInTheDocument();
    expect(screen.getByText('도전형 트레이너')).toBeInTheDocument();
    fireEvent.click(screen.getByText('도전형 트레이너'));
    expect(onSelect).toHaveBeenCalledWith('trainer');
  });
});
