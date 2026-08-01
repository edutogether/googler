import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import VisualResetMain from './VisualResetMain';
import { selectVisualResetAsset, VISUAL_RESET_ASSETS } from './visualResetAssets';
import { VISUAL_RESET_HOTSPOTS } from './visualResetHotspots';

const originalMatchMedia = window.matchMedia;
const originalUrl = window.location.href;
const hotspot = (id: string) => VISUAL_RESET_HOTSPOTS.find((item) => item.id === id)!;

afterEach(() => {
  Object.defineProperty(window, 'matchMedia', { configurable: true, value: originalMatchMedia });
  window.localStorage.removeItem('googlerHotspotDebug');
  window.history.replaceState({}, '', originalUrl);
});

describe('VisualResetMain', () => {
  it('renders the untouched 4:3 fallback inside the image-sized hotspot frame', () => {
    render(<VisualResetMain />);
    const image = screen.getByRole('img', { name: 'BE A GOOGLER main prototype' });
    expect(image).toHaveAttribute('src', '/googler/visual-reset/main/be-a-googler-main.png');
    expect(image).toHaveClass('visual-reset-image');
    expect(image.parentElement).toHaveClass('visual-reset-image-frame');
    expect(image.nextElementSibling).toHaveClass('visual-reset-hotspot-layer');
  });

  it('creates exactly the 15 requested focusable hotspots without a logo or bottom-arrow target', () => {
    render(<VisualResetMain />);
    expect(VISUAL_RESET_HOTSPOTS).toHaveLength(15);
    expect(screen.getAllByRole('button')).toHaveLength(15);
    const startButton = screen.getByRole('button', { name: hotspot('new-journey').label });
    startButton.focus();
    expect(document.activeElement).toBe(startButton);
    const learningTown = screen.getByRole('button', { name: hotspot('learning-town').label });
    expect(learningTown).toHaveAttribute('data-hotspot-id', 'learning-town');
    expect(learningTown).toHaveStyle({ left: '31.1%', width: '8.1%' });
    expect(screen.queryByRole('button', { name: /Be a Googler/i })).not.toBeInTheDocument();
    expect(VISUAL_RESET_HOTSPOTS.map((item) => item.id)).not.toContain('bottom-arrow');
  });

  it('does not navigate when a transparent hotspot is clicked', () => {
    render(<VisualResetMain />);
    fireEvent.click(screen.getByRole('button', { name: hotspot('continue-journey').label }));
    expect(screen.getByRole('img', { name: 'BE A GOOGLER main prototype' })).toBeInTheDocument();
  });

  it('keeps reduced-motion behaviour without importing Firebase', () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
    });
    render(<VisualResetMain />);
    expect(screen.getByRole('img', { name: 'BE A GOOGLER main prototype' }).closest('.visual-reset-stage-shell')).toHaveClass('is-reduced-motion');
  });

  it('reveals image-box diagnostics, asset data, labels, and percentage coordinates in query debug mode', () => {
    window.history.pushState({}, '', '/googler/?hotspots=1');
    render(<VisualResetMain />);
    expect(screen.getByRole('img', { name: 'BE A GOOGLER main prototype' }).closest('.visual-reset-stage-shell')).toHaveClass('is-hotspot-debug');
    expect(screen.getByText('be-a-googler-main.png')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: hotspot('new-journey').label })).toHaveAttribute('data-hotspot-position', '12.1%, 49.1%');
  });

  it('also enables calibration with the persistent localStorage switch', () => {
    window.localStorage.setItem('googlerHotspotDebug', '1');
    render(<VisualResetMain />);
    expect(screen.getByRole('img', { name: 'BE A GOOGLER main prototype' }).closest('.visual-reset-stage-shell')).toHaveClass('is-hotspot-debug');
  });

  it('keeps future 16:9 and 9:16 slots optional while the 4:3 fallback is active', () => {
    expect(VISUAL_RESET_ASSETS.desktop.available).toBe(false);
    expect(VISUAL_RESET_ASSETS.mobile.available).toBe(false);
    expect(selectVisualResetAsset(16 / 9)).toBe(VISUAL_RESET_ASSETS.tablet);
    expect(selectVisualResetAsset(9 / 16)).toBe(VISUAL_RESET_ASSETS.tablet);
  });
});
