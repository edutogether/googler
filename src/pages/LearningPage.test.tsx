import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LearningPage } from './LearningPage';
import { coursesByLevel } from '../content/courses';
import { completedMissionIds, missionStorageKey } from '../domain/progress';
import { courses } from '../content/courses';

const noop = { onToggleCheck: vi.fn(), onShare: vi.fn() };

describe('LearningPage', () => {
  it('renders one card per day of the selected level, and switches content with the level', () => {
    const { rerender } = render(<LearningPage currentLevel="L1" completedIds={[]} progress={{}} {...noop} />);

    expect(screen.getAllByText(/^Day \d+$/)).toHaveLength(coursesByLevel.L1.days.length);
    expect(screen.getByText(coursesByLevel.L1.days[0].title)).toBeInTheDocument();
    expect(screen.queryByText(coursesByLevel.L2.days[0].title)).not.toBeInTheDocument();

    rerender(<LearningPage currentLevel="L2" completedIds={[]} progress={{}} {...noop} />);

    expect(screen.getByText(coursesByLevel.L2.days[0].title)).toBeInTheDocument();
    expect(screen.queryByText(coursesByLevel.L1.days[0].title)).not.toBeInTheDocument();
  });

  it('marks a day complete only once every mission in that day is checked', () => {
    const day = coursesByLevel.L1.days[0];
    const partial = { [missionStorageKey('L1', day, 0)]: true };
    const { rerender } = render(
      <LearningPage currentLevel="L1" completedIds={completedMissionIds(partial, courses)} progress={partial} {...noop} />,
    );

    expect(screen.queryByText('100% 완료')).not.toBeInTheDocument();

    const whole = Object.fromEntries(day.missions.map((_, index) => [missionStorageKey('L1', day, index), true]));
    rerender(
      <LearningPage currentLevel="L1" completedIds={completedMissionIds(whole, courses)} progress={whole} {...noop} />,
    );

    expect(screen.getAllByText('100% 완료')).toHaveLength(1);
  });

  it('keeps the share button disabled until its own day is complete', () => {
    const day = coursesByLevel.L1.days[0];
    const whole = Object.fromEntries(day.missions.map((_, index) => [missionStorageKey('L1', day, index), true]));
    render(<LearningPage currentLevel="L1" completedIds={completedMissionIds(whole, courses)} progress={whole} {...noop} />);

    expect(screen.getByRole('button', { name: /미션 완료! 단톡방에 링크 공유하기/ })).not.toBeDisabled();
    expect(screen.getAllByRole('button', { name: /위 미션을 먼저 완료해주세요/ })).toHaveLength(coursesByLevel.L1.days.length - 1);
  });

  // Uses the third day on purpose: asserting the callback index against day 0
  // would pass even if the page always sent 0.
  it('reports the day and mission a learner ticked, and the day they shared', () => {
    const onToggleCheck = vi.fn();
    const onShare = vi.fn();
    const dayIndex = 2;
    const day = coursesByLevel.L1.days[dayIndex];
    const whole = Object.fromEntries(day.missions.map((_, index) => [missionStorageKey('L1', day, index), true]));
    render(
      <LearningPage
        currentLevel="L1"
        completedIds={completedMissionIds(whole, courses)}
        progress={whole}
        onToggleCheck={onToggleCheck}
        onShare={onShare}
      />,
    );

    const card = screen.getByText(day.title).closest('div.bg-white') as HTMLElement;
    fireEvent.click(within(card).getAllByRole('checkbox')[1]);
    expect(onToggleCheck).toHaveBeenCalledWith(day.progressKey, 1);

    fireEvent.click(screen.getByRole('button', { name: /미션 완료! 단톡방에 링크 공유하기/ }));
    expect(onShare).toHaveBeenCalledWith(day, dayIndex);
  });
});
