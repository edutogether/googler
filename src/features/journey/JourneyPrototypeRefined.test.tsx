import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
  beforeEach(() => sessionStorage.clear());
  afterEach(() => { audio.playSfx.mockClear(); audio.startBgm.mockClear(); audio.stopBgm.mockClear(); });

  it('plays journeyStart only after the learner starts a new journey', () => {
    render(<JourneyPrototypeRefined />);
    expect(document.querySelector('.journey-preview--entry')).toBeInTheDocument();
    expect(document.querySelector('.journey-entry')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '이전 단계' })).toBeNull();
    expect(audio.playSfx).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('모험 시작하기'));
    expect(document.querySelector('.journey-preview--identity')).toBeInTheDocument();
    expect(document.querySelector('.journey-identity__passport')).toBeInTheDocument();
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

  it('returns to identity while preserving the public profile', () => {
    render(<JourneyPrototypeRefined />);
    fireEvent.click(screen.getByText('모험 시작하기'));
    fireEvent.change(screen.getByRole('textbox', { name: '공개 여정 이름' }), { target: { value: '별빛 구글러' } });
    fireEvent.click(screen.getByText('이 모습으로 모험 시작하기'));
    expect(screen.getByText(/수준 진단 1 \/ 7/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '이전 단계' }));
    expect(screen.getByRole('textbox', { name: '공개 여정 이름' })).toHaveValue('별빛 구글러');
    expect(audio.playSfx).toHaveBeenLastCalledWith('select');
  });

  it('restores the latest valid journey screen after remounting', () => {
    const view = render(<JourneyPrototypeRefined />);
    fireEvent.click(screen.getByText('모험 시작하기'));
    fireEvent.change(screen.getByRole('textbox', { name: '공개 여정 이름' }), { target: { value: '복귀 구글러' } });
    fireEvent.click(screen.getByText('이 모습으로 모험 시작하기'));
    view.unmount();
    render(<JourneyPrototypeRefined />);
    expect(screen.getByText(/수준 진단 1 \/ 7/)).toBeInTheDocument();
  });

  it('starts again without clearing audio preferences', () => {
    localStorage.setItem('be-a-googler:audio-settings', JSON.stringify({ bgmEnabled: false, effectsEnabled: false, volume: 0.2 }));
    render(<JourneyPrototypeRefined />);
    fireEvent.click(screen.getByText('모험 시작하기'));
    fireEvent.click(screen.getByText('처음부터 다시 시작'));
    expect(screen.getByRole('heading', { name: 'Be a Googler' })).toBeInTheDocument();
    expect(sessionStorage.getItem('be-a-googler:journey-entry:v1')).toBeNull();
    expect(localStorage.getItem('be-a-googler:audio-settings')).not.toBeNull();
  });
});
