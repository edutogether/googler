import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { createAppServices } = vi.hoisted(() => ({ createAppServices: vi.fn() }));
vi.mock('../data/createAppServices', () => ({ createAppServices }));

import LegacyGooglerApp from './LegacyGooglerApp';

function buildServices(overrides: Partial<{
  profileOnLoad: { nickname: string; emoji: string } | null;
  profilesSave: ReturnType<typeof vi.fn>;
  leaderboardSave: ReturnType<typeof vi.fn>;
  progressSave: ReturnType<typeof vi.fn>;
}> = {}) {
  const profilesSave = overrides.profilesSave ?? vi.fn().mockResolvedValue(undefined);
  const leaderboardSave = overrides.leaderboardSave ?? vi.fn().mockResolvedValue(undefined);
  const progressSave = overrides.progressSave ?? vi.fn().mockResolvedValue(undefined);

  return {
    mode: 'firebase' as const,
    subscribeToSession: (onUser: (uid: string | null) => void) => { onUser('user-1'); return () => {}; },
    profiles: { get: vi.fn().mockResolvedValue(overrides.profileOnLoad ?? null), save: profilesSave },
    progress: { subscribe: (_uid: string, onProgress: (p: Record<string, boolean>) => void) => { onProgress({}); return () => {}; }, save: progressSave },
    leaderboard: { subscribe: (onEntries: (e: unknown[]) => void) => { onEntries([]); return () => {}; }, save: leaderboardSave },
    _spies: { profilesSave, leaderboardSave, progressSave },
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('LegacyGooglerApp profile setup', () => {
  it('prompts for a profile on first visit and saves it on success', async () => {
    const services = buildServices({ profileOnLoad: null });
    createAppServices.mockReturnValue(services);
    render(<LegacyGooglerApp />);

    expect(await screen.findByText('환영합니다! 👋')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('ex) 발랄한 다람쥐'), { target: { value: '테스터' } });
    fireEvent.click(screen.getByRole('button', { name: '이 프로필로 시작하기 🚀' }));

    await waitFor(() => expect(services._spies.profilesSave).toHaveBeenCalledWith('user-1', expect.objectContaining({ nickname: '테스터', emoji: '🐰' })));
    expect(services._spies.leaderboardSave).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByText('환영합니다! 👋')).not.toBeInTheDocument());
    expect(await screen.findByText('환영합니다!')).toBeInTheDocument();
  });

  it('keeps the setup dialog open and shows an error toast when saving fails', async () => {
    const profilesSave = vi.fn().mockRejectedValue(new Error('offline'));
    const services = buildServices({ profileOnLoad: null, profilesSave });
    createAppServices.mockReturnValue(services);
    render(<LegacyGooglerApp />);

    fireEvent.change(await screen.findByPlaceholderText('ex) 발랄한 다람쥐'), { target: { value: '테스터' } });
    fireEvent.click(screen.getByRole('button', { name: '이 프로필로 시작하기 🚀' }));

    expect(await screen.findByText(/저장에 실패했어요/)).toBeInTheDocument();
    expect(screen.getByText('환영합니다! 👋')).toBeInTheDocument();
  });
});

describe('LegacyGooglerApp mission progress', () => {
  it('checks a mission immediately and persists it after the debounce window', async () => {
    const services = buildServices({ profileOnLoad: { nickname: '테스터', emoji: '🦊' } });
    createAppServices.mockReturnValue(services);
    render(<LegacyGooglerApp />);

    fireEvent.click(await screen.findByRole('button', { name: '무엇을 배울까?' }));

    const firstDayHeading = await screen.findByText('크롬 & 구글 드라이브');
    const card = firstDayHeading.closest('div.bg-white') as HTMLElement;
    const firstCheckbox = within(card).getAllByRole('checkbox')[0];

    vi.useFakeTimers({ shouldAdvanceTime: true });
    fireEvent.click(firstCheckbox);
    expect(firstCheckbox).toBeChecked();
    expect(services._spies.progressSave).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(600);
    vi.useRealTimers();

    expect(services._spies.progressSave).toHaveBeenCalledWith('user-1', expect.objectContaining({ L1_l1_1_0: true }));
    expect(services._spies.leaderboardSave).toHaveBeenCalled();
  });

  it('shows an error toast when a debounced progress save fails', async () => {
    const progressSave = vi.fn().mockRejectedValue(new Error('offline'));
    const services = buildServices({ profileOnLoad: { nickname: '테스터', emoji: '🦊' }, progressSave });
    createAppServices.mockReturnValue(services);
    render(<LegacyGooglerApp />);

    fireEvent.click(await screen.findByRole('button', { name: '무엇을 배울까?' }));
    const firstDayHeading = await screen.findByText('크롬 & 구글 드라이브');
    const card = firstDayHeading.closest('div.bg-white') as HTMLElement;
    vi.useFakeTimers({ shouldAdvanceTime: true });
    fireEvent.click(within(card).getAllByRole('checkbox')[0]);

    await vi.advanceTimersByTimeAsync(600);
    vi.useRealTimers();

    expect(await screen.findByText(/저장에 실패했어요/)).toBeInTheDocument();
  });
});
