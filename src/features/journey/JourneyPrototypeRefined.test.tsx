import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const audio = vi.hoisted(() => ({ playSfx: vi.fn(), startBgm: vi.fn(), stopBgm: vi.fn() }));

vi.mock('../audio/audioEngine', () => ({
  loadAudioSettings: () => ({ bgmEnabled: true, effectsEnabled: true, volume: 0.35, activated: false }),
  saveAudioSettings: (next: object) => ({ bgmEnabled: true, effectsEnabled: true, volume: 0.35, activated: false, ...next }),
  playJourneySfx: audio.playSfx,
  startJourneyBgm: audio.startBgm,
  stopJourneyBgm: audio.stopBgm,
  setJourneyVisibility: vi.fn(),
}));

import JourneyPrototypeRefined from './JourneyPrototypeRefined';

describe('JourneyPrototypeRefined sound effects', () => {
  afterEach(() => { audio.playSfx.mockClear(); audio.startBgm.mockClear(); audio.stopBgm.mockClear(); });

  it('plays journeyStart only after the learner starts a new journey', () => {
    render(<JourneyPrototypeRefined />);
    expect(audio.playSfx).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('모험 시작하기'));
    expect(audio.startBgm).toHaveBeenCalledOnce();
    expect(audio.playSfx).toHaveBeenCalledWith('journeyStart');
  });

  it('plays avatar selection and a settled profile reveal from actual identity interactions', () => {
    vi.useFakeTimers();
    render(<JourneyPrototypeRefined />);
    fireEvent.click(screen.getByText('모험 시작하기'));
    fireEvent.change(screen.getByRole('textbox', { name: '공개 여정 이름' }), { target: { value: '반짝 여우' } });
    vi.advanceTimersByTime(500);
    expect(audio.playSfx).toHaveBeenCalledWith('calendarReveal');
    fireEvent.click(screen.getByRole('button', { name: '캐릭터 선택' }));
    fireEvent.click(screen.getByRole('button', { name: '🐰 선택' }));
    expect(audio.playSfx).toHaveBeenCalledWith('avatarSelect');
    vi.useRealTimers();
  });

  it('plays select only when a level value actually changes', () => {
    render(<JourneyPrototypeRefined />);
    fireEvent.click(screen.getByText('모험 시작하기'));
    fireEvent.click(screen.getByText('이 모습으로 모험 시작하기'));
    for (let index = 0; index < 7; index += 1) fireEvent.click(screen.getByText('아직 익숙하지 않아요'));
    fireEvent.click(screen.getByText('기초를 탄탄하게'));
    expect(audio.playSfx).toHaveBeenCalledWith('select');
    const callsAfterChange = audio.playSfx.mock.calls.length;
    fireEvent.click(screen.getByText('기초를 탄탄하게'));
    expect(audio.playSfx).toHaveBeenCalledTimes(callsAfterChange);
  });
});
