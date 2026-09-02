import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LearningDayCard } from './LearningDayCard';
import type { LearningDay } from '../../domain/course';

const day: LearningDay = {
  id: 'l1-day-01', progressKey: 'l1_1', day: '월요일', theme: 'blue',
  title: '크롬 & 구글 드라이브', description: '크롬 동기화, 파일 업로드 및 폴더 공유하기',
  resources: {
    help: { label: 'official-help', url: 'https://support.google.com/drive' },
    youtube: { label: 'video-content', url: 'https://youtube.com/results' },
    education: { label: 'official-guide', url: 'https://skillshop.exceedlms.com' },
  },
  missions: [{ id: 'm1', progressKey: '0', text: '공식 도움말 살펴보기 완료 ! 💡' }],
};
const theme = { bg: 'bg-blue-50', highlight: 'bg-blue-100', text: 'text-blue-700' };

describe('LearningDayCard', () => {
  it('shows the completion badge and an enabled share button once the day is complete', () => {
    render(<LearningDayCard currentLevel="L1" dayItem={day} index={0} isDayComplete progress={{}} theme={theme} onToggleCheck={vi.fn()} onShare={vi.fn()} />);

    expect(screen.getByText('100% 완료')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /미션 완료! 단톡방에 링크 공유하기/ })).not.toBeDisabled();
  });

  it('disables the share button until the day is complete', () => {
    render(<LearningDayCard currentLevel="L1" dayItem={day} index={0} isDayComplete={false} progress={{}} theme={theme} onToggleCheck={vi.fn()} onShare={vi.fn()} />);

    expect(screen.queryByText('100% 완료')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /위 미션을 먼저 완료해주세요/ })).toBeDisabled();
  });

  it('calls onShare with the day and its index when the share button is clicked', () => {
    const onShare = vi.fn();
    render(<LearningDayCard currentLevel="L1" dayItem={day} index={2} isDayComplete progress={{}} theme={theme} onToggleCheck={vi.fn()} onShare={onShare} />);

    fireEvent.click(screen.getByRole('button', { name: /미션 완료! 단톡방에 링크 공유하기/ }));
    expect(onShare).toHaveBeenCalledWith(day, 2);
  });
});
