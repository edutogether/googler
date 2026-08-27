import { useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { desktopScenes, navigation } from './mainWorldContent';
import { playUiSound } from './uiSound';

type TransitionPhase = 'idle' | 'cover' | 'loading' | 'reveal';

// Owns which page is active, the cover/loading/reveal transition that plays
// between pages, and the "coming soon" construction card tied to whichever
// subpage scene is currently showing — these three are one concern because
// a nav click drives all three in sequence.
export function useSceneNavigation({
  isMobile,
  sfxOn,
  announce,
  preloadScene,
}: {
  isMobile: boolean;
  sfxOn: boolean;
  announce: (message?: string, chime?: boolean) => void;
  preloadScene: (id: keyof typeof desktopScenes) => void;
}) {
  const [activeNav, setActiveNav] = useState('explore');

  // Page-change transition: cover the screen, swap the page underneath
  // while hidden, hold on a loading beat, then clear — so a nav switch
  // reads as a deliberate scene change instead of content popping in.
  const [transitionPhase, setTransitionPhase] = useState<TransitionPhase>('idle');
  const transitionTimers = useRef<number[]>([]);
  useEffect(() => () => transitionTimers.current.forEach((id) => window.clearTimeout(id)), []);

  // The "coming soon" card no longer auto-covers the subpage art on arrival —
  // it stays hidden so the scene is fully visible, and only pops in once the
  // visitor clicks anywhere on the page.
  const [constructionVisible, setConstructionVisible] = useState(false);
  useEffect(() => { setConstructionVisible(false); }, [activeNav]);

  const desktopScene = desktopScenes[activeNav as keyof typeof desktopScenes] ?? null;
  const showsMainWorld = activeNav === 'explore';

  const revealConstruction = (event: ReactMouseEvent<HTMLElement>) => {
    // Clicks on the header and audio controls keep their own meaning (open
    // notifications, toggle BGM, switch pages) — only a click on the scene
    // itself summons the coming-soon card.
    if (event.target instanceof Element && event.target.closest('.mw3-header, .mw3-desktop-profile, .mw3-audio')) return;
    if (desktopScene && !constructionVisible) setConstructionVisible(true);
  };

  const activateNavigation = (item: (typeof navigation)[number]) => {
    if (item.id === activeNav) return;
    if (item.id in desktopScenes) preloadScene(item.id as keyof typeof desktopScenes);
    if (!isMobile) playUiSound('click', sfxOn);
    const switchPage = () => { setActiveNav(item.id); if (item.id === 'explore') announce('홈에서 새로운 모험을 이어가요.'); };
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { switchPage(); return; }
    transitionTimers.current.forEach((id) => window.clearTimeout(id));
    setTransitionPhase('cover');
    // Timings mirror the CSS: .mw3-transition-veil fades over 620ms and the
    // progress bar fills over 1300ms, so each wait is set slightly longer
    // than what it's waiting out, otherwise it gets cut off mid-motion.
    transitionTimers.current = [window.setTimeout(() => {
      switchPage();
      setTransitionPhase('loading');
      transitionTimers.current.push(window.setTimeout(() => {
        setTransitionPhase('reveal');
        transitionTimers.current.push(window.setTimeout(() => setTransitionPhase('idle'), 640));
      }, 1340));
    }, 640)];
  };

  return { activeNav, setActiveNav, transitionPhase, constructionVisible, setConstructionVisible, desktopScene, showsMainWorld, revealConstruction, activateNavigation };
}
