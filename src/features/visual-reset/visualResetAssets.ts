export type VisualResetAssetKey = 'desktop' | 'tablet' | 'mobile';

export type VisualResetAsset = {
  key: VisualResetAssetKey;
  name: string;
  src: string;
  aspectRatio: number;
  available: boolean;
};

/** Future masters remain opt-in until their supplied files exist. */
export const VISUAL_RESET_ASSETS: Record<VisualResetAssetKey, VisualResetAsset> = {
  desktop: {
    key: 'desktop',
    name: 'be-a-googler-main-desktop-16x9.png',
    src: '/googler/visual-reset/main/be-a-googler-main-desktop-16x9.png',
    aspectRatio: 16 / 9,
    available: false,
  },
  tablet: {
    key: 'tablet',
    name: 'be-a-googler-main.png',
    src: '/googler/visual-reset/main/be-a-googler-main.png',
    aspectRatio: 4 / 3,
    available: true,
  },
  mobile: {
    key: 'mobile',
    name: 'be-a-googler-main-mobile-9x16.png',
    src: '/googler/visual-reset/main/be-a-googler-main-mobile-9x16.png',
    aspectRatio: 9 / 16,
    available: false,
  },
};

export function selectVisualResetAsset(viewportRatio: number): VisualResetAsset {
  const preferredKey: VisualResetAssetKey = viewportRatio >= 1.55
    ? 'desktop'
    : viewportRatio <= 0.82
      ? 'mobile'
      : 'tablet';
  const preferred = VISUAL_RESET_ASSETS[preferredKey];

  return preferred.available ? preferred : VISUAL_RESET_ASSETS.tablet;
}
