// Static content and small pure helpers shared across the main-v3 scene —
// no React state here, just the data the scene renders and the storage
// keys/asset-path helpers several hooks and components need.

export const base = import.meta.env.BASE_URL;
export const asset = (path: string) => `${base}${path}`;
export const BGM_SOURCE = asset('audio/bgm/moonlit-voyager-village-loop-opt.mp3');
export const MAIN_V3_BGM_STORAGE_KEY = 'be-a-googler:main-v3-bgm';
export const MAIN_V3_SFX_STORAGE_KEY = 'be-a-googler:main-v3-sfx';
export const DEFAULT_VOLUME = 1;
export const DESKTOP_GUIDE_MESSAGE = '안녕 ?\n호기심이 아주 많은\n구글러구나 !\n나와 같이 구글을\n즐겁게 배워볼래 ?';

export const navigation = [
  { id: 'explore', label: '홈', mobileLabel: '홈', icon: 'home', mobileIcon: 'home' },
  { id: 'town', label: '퀘스트', mobileLabel: '퀘스트', icon: 'scroll', mobileIcon: 'scroll' },
  { id: 'missions', label: '플래너', mobileLabel: '플래너', icon: 'calendar', mobileIcon: 'calendar' },
  { id: 'guides', label: '도감', mobileLabel: '도감', icon: 'book', mobileIcon: 'book' },
  { id: 'archive', label: '커뮤니티', mobileLabel: '커뮤니티', icon: 'users', mobileIcon: 'users' },
] as const;

export const desktopScenes = {
  town: { name: 'quest', icon: 'scroll', eyebrow: '새로운 배움의 의뢰', detail: '탐험가를 위한 첫 퀘스트를 정성껏 준비하고 있어요.', asset: 'visual-reset/quest/be-a-googler-quest-2560x1440-scene-v10-opt.webp', mobileAsset: 'visual-reset/quest/be-a-googler-quest-1080x2340-mobile-v1-opt.webp' },
  missions: { name: 'planner', icon: 'calendar', eyebrow: '여정을 계획하는 지도', detail: '탐험가의 여정을 계획할 플래너를 준비하고 있어요.', asset: 'visual-reset/planner/be-a-googler-dakku-planner-2560x1440-scene-v7-opt.webp', mobileAsset: 'visual-reset/planner/be-a-googler-dakku-planner-1080x2340-mobile-v1-opt.webp' },
  guides: { name: 'encyclopedia', icon: 'book', eyebrow: '발견을 모아 보는 서가', detail: '호기심 가득한 이야기를 차곡차곡 모으고 있어요.', asset: 'visual-reset/encyclopedia/be-a-googler-encyclopedia-2560x1440-scene-v10-opt.webp', mobileAsset: 'visual-reset/encyclopedia/be-a-googler-encyclopedia-1080x2340-mobile-v1-opt.webp' },
  archive: { name: 'community', icon: 'users', eyebrow: '함께 만드는 광장', detail: '다른 탐험가와 영감을 나눌 공간이 생길거에요.', asset: 'visual-reset/community/be-a-googler-community-2560x1440-scene-v11-opt.webp', mobileAsset: 'visual-reset/community/be-a-googler-community-1080x2340-mobile-v1-opt.webp' },
} as const;

export const desktopBadges = [
  { asset: 'badge-blue-mobile-opt.webp', name: '데이터 항해', lore: '데이터 섬의 첫 지도를 완성했어요.' },
  { asset: 'badge-gold-mobile-opt.webp', name: '용기 있는 시작', lore: '새로운 여정을 힘차게 열었어요.' },
  { asset: 'badge-silver-mobile-opt.webp', name: '협업의 톱니', lore: '함께 배우는 힘을 발견했어요.' },
  { asset: 'badge-emerald.webp', name: '초록 나침반', lore: '호기심의 방향을 스스로 찾았어요.' },
  { asset: 'badge-violet.webp', name: '별빛 지도', lore: '배움의 별자리를 연결했어요.' },
  { asset: 'badge-coral.webp', name: '반짝이는 생각', lore: '새로운 아이디어를 세상에 밝혔어요.' },
] as const;
