import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MissionChecklist } from './MissionChecklist';
import type { LearningDay } from '../../domain/course';

const day: LearningDay = {
  id: 'l1-day-01', progressKey: 'l1_1', day: '월요일', theme: 'blue',
  title: '크롬 & 구글 드라이브', description: '',
  resources: { help: { label: '', url: '' }, youtube: { label: '', url: '' }, education: { label: '', url: '' } },
  missions: [
    { id: 'm1', progressKey: '0', text: '공식 도움말 살펴보기 완료 ! 💡' },
    { id: 'm2', progressKey: '1', text: '유튜브 영상 콘텐츠 따라하기 완료 ! 📺' },
  ],
};

describe('MissionChecklist', () => {
  it('reflects the checked state from the progress map, keyed by level/day/index', () => {
    render(<MissionChecklist currentLevel="L1" dayItem={day} progress={{ L1_l1_1_0: true }} onToggleCheck={vi.fn()} />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
  });

  it('reports the day\'s progressKey and the mission index when a box is toggled', () => {
    const onToggleCheck = vi.fn();
    render(<MissionChecklist currentLevel="L2" dayItem={day} progress={{}} onToggleCheck={onToggleCheck} />);

    fireEvent.click(screen.getAllByRole('checkbox')[1]);
    expect(onToggleCheck).toHaveBeenCalledWith('l1_1', 1);
  });
});
