import { useEffect, useState } from 'react';
import {
  journeyTitlePhrases,
  journeyTypingDeletingDelay,
  journeyTypingDelay,
  journeyTypingPauseDelay,
} from '../../domain/journeyTyping';

export function TypingJourneyTitle() {
  const [text, setText] = useState('');
  const [phrase, setPhrase] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const target = journeyTitlePhrases[phrase];
    const targetCharacters = Array.from(target);
    const textCharacters = Array.from(text);
    const delay = !deleting && textCharacters.length === targetCharacters.length
      ? journeyTypingPauseDelay
      : deleting
        ? journeyTypingDeletingDelay
        : journeyTypingDelay;
    const id = window.setTimeout(() => {
      if (!deleting && textCharacters.length < targetCharacters.length) setText(targetCharacters.slice(0, textCharacters.length + 1).join(''));
      else if (!deleting) setDeleting(true);
      else if (textCharacters.length) setText(textCharacters.slice(0, -1).join(''));
      else {
        setDeleting(false);
        setPhrase((current) => (current + 1) % journeyTitlePhrases.length);
      }
    }, delay);
    return () => window.clearTimeout(id);
  }, [text, phrase, deleting, reduced]);

  return (
    <p aria-live="off" className="mt-3 min-h-7 text-lg font-bold text-[#1a73e8]">
      {reduced ? journeyTitlePhrases[0] : text}
      <span aria-hidden="true" className="animate-pulse">▍</span>
    </p>
  );
}
