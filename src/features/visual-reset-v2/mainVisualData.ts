import { Archive, BookOpen, Compass, MapPinned, ScrollText } from 'lucide-react';

export const DESKTOP_BACKGROUND_PATH = '/googler/visual-reset/main/be-a-googler-main-desktop-16x9.png';

export const MAIN_NAV_ITEMS = [
  { id: 'explore', label: '탐험 시작', icon: Compass },
  { id: 'learning-town', label: '학습 마을', icon: MapPinned },
  { id: 'missions', label: '미션', icon: ScrollText },
  { id: 'guide', label: '길잡이', icon: BookOpen },
  { id: 'storage', label: '보관함', icon: Archive },
] as const;

export type MainNavId = (typeof MAIN_NAV_ITEMS)[number]['id'];
