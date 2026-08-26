import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WorldIcon } from './WorldIcons';

describe('WorldIcon', () => {
  it('renders an svg with the shared icon class for every known name', () => {
    const names = ['archive', 'badge', 'bell', 'book', 'calendar', 'chevron', 'compass', 'home', 'map', 'menu', 'music', 'pause', 'play', 'route', 'scroll', 'speaker', 'users'] as const;

    for (const name of names) {
      const { container, unmount } = render(<WorldIcon name={name} />);
      const svg = container.querySelector('svg.mw3-icon');
      expect(svg, `missing svg for icon "${name}"`).toBeInTheDocument();
      expect(svg?.getAttribute('aria-hidden')).toBe('true');
      expect(svg?.children.length ?? 0, `icon "${name}" rendered no path/shape elements`).toBeGreaterThan(0);
      unmount();
    }
  });

  it('swaps the rendered shape when the icon name changes', () => {
    const { container, rerender } = render(<WorldIcon name="play" />);
    const playMarkup = container.querySelector('svg')?.innerHTML;

    rerender(<WorldIcon name="pause" />);
    const pauseMarkup = container.querySelector('svg')?.innerHTML;

    expect(pauseMarkup).not.toBe(playMarkup);
  });
});
