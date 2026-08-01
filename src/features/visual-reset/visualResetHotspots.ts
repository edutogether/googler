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
  { id: 'logo', label: 'Be a Googler 홈', tone: 'menu', left: 2.4, top: 2.1, width: 17.5, height: 7 },
  { id: 'explore', label: '탐험 시작 보기', tone: 'menu', left: 20.5, top: 2.1, width: 9.2, height: 7 },
  { id: 'learning-town', label: '학습 마을 보기', tone: 'menu', left: 30.8, top: 2.1, width: 9.6, height: 7 },
  { id: 'missions', label: '미션 보기', tone: 'menu', left: 41.2, top: 2.1, width: 7.3, height: 7 },
  { id: 'guide', label: '길잡이 보기', tone: 'menu', left: 49.6, top: 2.1, width: 8.3, height: 7 },
  { id: 'storage', label: '보관함 보기', tone: 'menu', left: 58.2, top: 2.1, width: 8.4, height: 7 },
  { id: 'notifications', label: '알림 보기', tone: 'menu', left: 75.2, top: 2.1, width: 5.2, height: 7 },
  { id: 'profile', label: '사용자 프로필 보기', tone: 'menu', left: 81.2, top: 2.1, width: 16.8, height: 7 },
  { id: 'new-journey', label: '새로운 여정 시작하기', tone: 'cta', left: 12.1, top: 49.1, width: 17.7, height: 6.8 },
  { id: 'continue-journey', label: '이전 여정 이어하기', tone: 'cta', left: 30.8, top: 49.1, width: 10.8, height: 6.8 },
  { id: 'what-is-journey', label: '여정이란 알아보기', tone: 'control', left: 12.4, top: 57.1, width: 7.8, height: 3.5 },
  { id: 'my-journey', label: '나의 여정 카드 보기', tone: 'card', left: 4.8, top: 71.4, width: 30, height: 17.2 },
  { id: 'continue-card', label: '이어하기 카드 보기', tone: 'card', left: 35.3, top: 71.4, width: 29.4, height: 17.2 },
  { id: 'badges', label: '최근 획득 배지 보기', tone: 'card', left: 65.2, top: 71.4, width: 29.6, height: 17.2 },
  { id: 'bgm', label: '배경음악 재생', tone: 'control', left: 4.8, top: 90.4, width: 29.6, height: 6.1 },
  { id: 'sound-effects', label: '효과음 설정', tone: 'control', left: 68.8, top: 90.4, width: 26.2, height: 6.1 },
];
