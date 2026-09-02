import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MiniVolumePanel } from './MiniVolumePanel';

beforeEach(() => {
  // The mute/unmute tween drives itself via requestAnimationFrame; running
  // it for real would need real frames, so collapse it to "jump straight to
  // the target" — this test only cares about the slider's public behavior,
  // not the animation curve.
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => { cb(1000); return 1; });
  vi.stubGlobal('cancelAnimationFrame', () => {});
});

afterEach(() => vi.unstubAllGlobals());

describe('MiniVolumePanel', () => {
  it('reflects the current volume when enabled', () => {
    render(<MiniVolumePanel enabled volume={0.6} onVolumeChange={vi.fn()} />);
    expect(screen.getByRole('slider')).toHaveValue('0.6');
    expect(screen.getByRole('slider')).not.toBeDisabled();
  });

  it('shows zero and disables the slider when muted', () => {
    render(<MiniVolumePanel enabled={false} volume={0.6} onVolumeChange={vi.fn()} />);
    expect(screen.getByRole('slider')).toHaveValue('0');
    expect(screen.getByRole('slider')).toBeDisabled();
  });

  it('reports every drag tick immediately, with no tween lag', () => {
    const onVolumeChange = vi.fn();
    render(<MiniVolumePanel enabled volume={0.6} onVolumeChange={onVolumeChange} />);

    fireEvent.change(screen.getByRole('slider'), { target: { value: '0.2' } });

    expect(onVolumeChange).toHaveBeenCalledWith(0.2);
    expect(screen.getByRole('slider')).toHaveValue('0.2');
  });
});
