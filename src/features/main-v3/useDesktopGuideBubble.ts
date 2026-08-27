import { useEffect, useState } from 'react';
import { DESKTOP_GUIDE_MESSAGE } from './mainWorldContent';

// Types the desktop guide's greeting out one character at a time, holds it,
// then cycles it away and back — a lightweight "someone's here" presence
// cue that respects prefers-reduced-motion by just showing the full text.
export function useDesktopGuideBubble() {
  const [guideText, setGuideText] = useState('');
  const [guideVisible, setGuideVisible] = useState(false);
  useEffect(() => {
    if (window.innerWidth < 768) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setGuideVisible(true);
      setGuideText(DESKTOP_GUIDE_MESSAGE);
      return undefined;
    }

    let timeout: number | undefined;
    let index = 0;
    const beginTyping = () => {
      index = 1;
      setGuideVisible(true);
      setGuideText(DESKTOP_GUIDE_MESSAGE.slice(0, index));
      timeout = window.setTimeout(typeNext, 46);
    };
    const hideBubble = () => {
      setGuideVisible(false);
      timeout = window.setTimeout(beginTyping, 620);
    };
    const typeNext = () => {
      index += 1;
      setGuideText(DESKTOP_GUIDE_MESSAGE.slice(0, index));
      timeout = window.setTimeout(index >= DESKTOP_GUIDE_MESSAGE.length ? hideBubble : typeNext, index >= DESKTOP_GUIDE_MESSAGE.length ? 9900 : 46);
    };
    timeout = window.setTimeout(beginTyping, 320);
    return () => window.clearTimeout(timeout);
  }, []);
  return { guideText, guideVisible };
}
