import { describe, expect, it } from 'vitest';
import { asset, desktopBadges, desktopScenes, navigation } from './mainWorldContent';

describe('mainWorldContent', () => {
  it('prefixes asset paths with the configured base URL', () => {
    expect(asset('audio/bgm/loop.mp3')).toBe(`${import.meta.env.BASE_URL}audio/bgm/loop.mp3`);
  });

  it('gives every nav entry a matching desktop scene, except the home entry', () => {
    const nonHomeIds = navigation.map((entry) => entry.id).filter((id) => id !== 'explore');
    expect(nonHomeIds.sort()).toEqual(Object.keys(desktopScenes).sort());
  });

  it('defines at least one badge with a name and lore', () => {
    expect(desktopBadges.length).toBeGreaterThan(0);
    for (const badge of desktopBadges) {
      expect(badge.name.length).toBeGreaterThan(0);
      expect(badge.lore.length).toBeGreaterThan(0);
    }
  });
});
