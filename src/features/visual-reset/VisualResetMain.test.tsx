import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import VisualResetMain from './VisualResetMain';
import { VISUAL_RESET_HOTSPOTS } from './visualResetHotspots';

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  Object.defineProperty(window, 'matchMedia', { configurable: true, value: originalMatchMedia });
});

describe('VisualResetMain', () => {
  it('renders the untouched source image at the expected public path', () => {
    render(<VisualResetMain />);
    const image = screen.getByRole('img', { name: 'BE A GOOGLER 메인 시안' });
    expect(image).toHaveAttribute('src', '/googler/visual-reset/main/be-a-googler-main.png');
  });

  it('creates transparent keyboard-focusable hotspots for every requested image area', () => {
    render(<VisualResetMain />);
    expect(screen.getAllByRole('button')).toHaveLength(VISUAL_RESET_HOTSPOTS.length);
    const startButton = screen.getByRole('button', { name: '새로운 여정 시작하기' });
    startButton.focus();
    expect(document.activeElement).toBe(startButton);
    expect(screen.getByRole('button', { name: '학습 마을 보기' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '최근 획득 배지 보기' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '배경음악 재생' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '효과음 설정' })).toBeInTheDocument();
  });

  it('does not navigate or render a separate UI when a hotspot is clicked', () => {
    render(<VisualResetMain />);
    fireEvent.click(screen.getByRole('button', { name: '이전 여정 이어하기' }));
    expect(screen.getByRole('img', { name: 'BE A GOOGLER 메인 시안' })).toBeInTheDocument();
    expect(screen.queryByText('새로운 여정 시작하기')).not.toBeInTheDocument();
  });

  it('marks the stage for reduced motion without importing Firebase', () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
    });
    render(<VisualResetMain />);
    expect(screen.getByRole('main')).toHaveClass('visual-reset-page');
    expect(screen.getByRole('img', { name: 'BE A GOOGLER 메인 시안' }).parentElement).toHaveClass('is-reduced-motion');
  });
});
