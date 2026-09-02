import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DesktopProfileCluster } from './DesktopProfileCluster';

describe('DesktopProfileCluster', () => {
  it('invokes onToggleBgm and onProfile from their respective buttons', () => {
    const onToggleBgm = vi.fn();
    const onProfile = vi.fn();
    render(<DesktopProfileCluster bgmEnabled isPlaying volume={0.5} onToggleBgm={onToggleBgm} onVolumeChange={vi.fn()} onProfile={onProfile} />);

    fireEvent.click(screen.getByRole('button', { name: 'BGM 끄기' }));
    expect(onToggleBgm).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: '호기심 많은 구글러 프로필 보기' }));
    expect(onProfile).toHaveBeenCalledTimes(1);
  });

  it('labels the BGM toggle as "켜기" when BGM is off', () => {
    render(<DesktopProfileCluster bgmEnabled={false} isPlaying={false} volume={0} onToggleBgm={vi.fn()} onVolumeChange={vi.fn()} onProfile={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'BGM 켜기' })).toBeInTheDocument();
  });

  it('dismisses the volume tray on Escape without calling any callback', () => {
    render(<DesktopProfileCluster bgmEnabled isPlaying volume={0.5} onToggleBgm={vi.fn()} onVolumeChange={vi.fn()} onProfile={vi.fn()} />);
    const control = screen.getByRole('button', { name: 'BGM 끄기' }).closest('[data-volume-tray-dismissed]') as HTMLElement;
    expect(control.getAttribute('data-volume-tray-dismissed')).toBe('false');

    fireEvent.keyDown(control, { key: 'Escape' });
    expect(control.getAttribute('data-volume-tray-dismissed')).toBe('true');
  });
});
