import type { ReactNode } from 'react';

type IconName = 'archive' | 'badge' | 'bell' | 'book' | 'calendar' | 'chevron' | 'compass' | 'home' | 'map' | 'menu' | 'music' | 'pause' | 'play' | 'route' | 'scroll' | 'speaker' | 'users';

const paths: Record<IconName, ReactNode> = {
  archive: <><rect x="4" y="6" width="16" height="14" rx="2" /><path d="M3 6h18M9 10h6" /></>,
  badge: <><circle cx="12" cy="12" r="8" /><path d="m9.2 12 1.8 1.8 3.8-4M8 19l-1 3 5-2 5 2-1-3" /></>,
  bell: <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 22h4" />,
  book: <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H11v17H5.5A2.5 2.5 0 0 0 3 22zM21 5.5A2.5 2.5 0 0 0 18.5 3H13v17h5.5A2.5 2.5 0 0 1 21 22z" />,
  calendar: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16M8 14h3M14 14h2M8 17h3" /></>,
  chevron: <path d="m8 10 4 4 4-4" />,
  compass: <><circle cx="12" cy="12" r="9" /><path d="m15.6 8.4-2.2 4.9-4.8 2.3 2.2-4.9z" /></>,
  home: <><path d="m3 11 9-7 9 7v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" /><path d="M9 21v-6h6v6" /></>,
  map: <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  music: <><path d="M9 18V5l10-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="16" cy="16" r="3" /></>,
  pause: <><path d="M8 6v12M16 6v12" /></>,
  play: <path d="m8 5 11 7-11 7z" />,
  route: <><circle cx="6" cy="18" r="2" /><circle cx="18" cy="6" r="2" /><path d="M8 18c6 0 2-8 8-8M8 6c5 0 1 6 8 6" /></>,
  scroll: <><path d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a3 3 0 0 1 0-6h10" /><path d="M10 7h5M10 11h5" /></>,
  speaker: <><path d="M4 10v4h4l5 4V6L8 10z" /><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7 7 0 0 1 0 11" /></>,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5.5a3 3 0 0 1 0 5.8M17 14.5a4.5 4.5 0 0 1 3.5 4.4" /></>,
};

export function WorldIcon({ name }: { name: IconName }) {
  return <svg className="mw3-icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}
