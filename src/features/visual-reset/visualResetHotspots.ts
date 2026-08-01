export type HotspotTone = 'menu' | 'cta' | 'card' | 'control';

export type VisualResetHotspot = {
  id: string;
  label: string;
  tone: HotspotTone;
  left: number;
  top: number;
  width: number;
  height: number;
};

export const VISUAL_RESET_HOTSPOTS: VisualResetHotspot[] = [
  { id: 'logo', label: 'Be a Googler 홈', tone: 'menu', left: 3.3, top: 3.1, width: 15.3, height: 4.9 },
  { id: 'explore', label: '탐험 시작 보기', tone: 'menu', left: 21.2, top: 3.0, width: 8.1, height: 6.0 },
  { id: 'learning-town', label: '학습 마을 보기', tone: 'menu', left: 31.1, top: 3.0, width: 8.1, height: 6.0 },
  { id: 'missions', label: '미션 보기', tone: 'menu', left: 41.4, top: 3.0, width: 6.2, height: 6.0 },
  { id: 'guide', label: '길잡이 보기', tone: 'menu', left: 49.3, top: 3.0, width: 6.7, height: 6.0 },
  { id: 'storage', label: '보관함 보기', tone: 'menu', left: 58.0, top: 3.0, width: 6.8, height: 6.0 },
  { id: 'notifications', label: '알림 보기', tone: 'menu', left: 76.8, top: 2.8, width: 4.0, height: 6.2 },
  { id: 'profile', label: '사용자 프로필 보기', tone: 'menu', left: 81.0, top: 2.5, width: 17.0, height: 6.6 },
  { id: 'new-journey', label: '새로운 여정 시작하기', tone: 'cta', left: 12.1, top: 49.1, width: 17.6, height: 6.6 },
  { id: 'continue-journey', label: '이전 여정 이어하기', tone: 'cta', left: 31.0, top: 49.2, width: 10.0, height: 6.3 },
  { id: 'what-is-journey', label: '여정이란 알아보기', tone: 'control', left: 12.4, top: 57.2, width: 7.6, height: 3.0 },
  { id: 'my-journey', label: '나의 여정 카드 보기', tone: 'card', left: 4.8, top: 71.4, width: 29.9, height: 16.4 },
  { id: 'continue-card', label: '이어하기 카드 보기', tone: 'card', left: 35.4, top: 71.4, width: 28.8, height: 16.4 },
  { id: 'badges', label: '최근 획득 배지 보기', tone: 'card', left: 64.8, top: 71.4, width: 30.2, height: 16.4 },
  { id: 'bgm', label: '배경음악 재생', tone: 'control', left: 4.8, top: 90.5, width: 43.0, height: 6.0 },
  { id: 'sound-effects', label: '효과음 설정', tone: 'control', left: 75.5, top: 90.5, width: 19.5, height: 6.0 },
];
