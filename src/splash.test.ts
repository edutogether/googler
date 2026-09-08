import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { installSplash } from './splash';

function mountSplash() {
  document.body.innerHTML = '<div id="splash"><img class="logo" /><div class="stagline"></div><span class="sbar"><i></i></span></div>';
  return document.getElementById('splash') as HTMLElement;
}

function setReadyState(value: DocumentReadyState) {
  Object.defineProperty(document, 'readyState', { configurable: true, get: () => value });
}

// jsdom has no AnimationEvent constructor, so carry animationName on a plain
// Event — that is the only field the code under test reads.
function animationEnd(name: string) {
  return Object.assign(new Event('animationend'), { animationName: name });
}

function endSplashOut(splash: HTMLElement) {
  splash.dispatchEvent(animationEnd('splashOut'));
}

const realReadyState = Object.getOwnPropertyDescriptor(Document.prototype, 'readyState');

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  if (realReadyState) Object.defineProperty(document, 'readyState', realReadyState);
  document.body.innerHTML = '';
});

describe('installSplash', () => {
  it('removes the splash when its own animation ends and the page is already loaded', () => {
    setReadyState('complete');
    const splash = mountSplash();
    installSplash();

    expect(document.getElementById('splash')).not.toBeNull();
    endSplashOut(splash);

    expect(document.getElementById('splash')).toBeNull();
  });

  it('ignores animations other than splashOut', () => {
    setReadyState('complete');
    const splash = mountSplash();
    installSplash();

    splash.dispatchEvent(animationEnd('splashBar'));

    expect(document.getElementById('splash')).not.toBeNull();
  });

  // The load gate: CSS decides the timing, this only asks "has load finished?".
  it('holds the splash past its animation until the page finishes loading', () => {
    setReadyState('loading');
    const splash = mountSplash();
    installSplash();

    endSplashOut(splash);

    expect(splash.classList.contains('is-held')).toBe(true);
    expect(document.getElementById('splash')).not.toBeNull();

    window.dispatchEvent(new Event('load'));

    expect(splash.classList.contains('is-held')).toBe(false);
    expect(splash.classList.contains('is-leaving')).toBe(true);
    expect(document.getElementById('splash')).not.toBeNull();

    splash.dispatchEvent(animationEnd('splashFade'));
    expect(document.getElementById('splash')).toBeNull();
  });

  it('lets go on the safety cap even if load never fires', () => {
    setReadyState('loading');
    const splash = mountSplash();
    installSplash();
    endSplashOut(splash);

    expect(splash.classList.contains('is-held')).toBe(true);

    vi.advanceTimersByTime(4000);

    expect(splash.classList.contains('is-leaving')).toBe(true);
  });

  it('does not treat an empty animation list as "already finished"', () => {
    setReadyState('complete');
    const splash = mountSplash();
    // jsdom has no getAnimations(); an app whose splash stylesheet failed to
    // load would report an empty list too. Neither means the hold is over —
    // reading it as "finished" would drop the splash on the first frame.
    splash.getAnimations = () => [];

    installSplash();

    expect(document.getElementById('splash')).not.toBeNull();
  });

  it('cleans up immediately when the bundle runs after the animation already finished', () => {
    setReadyState('complete');
    const splash = mountSplash();
    splash.getAnimations = () => [{ playState: 'finished' } as Animation];

    installSplash();

    expect(document.getElementById('splash')).toBeNull();
  });

  // A late bundle must not resurrect a splash that already faded out: holding
  // it would set opacity back to 1, flashing the splash a second time.
  it('never re-shows an already-finished splash, even if the page is still loading', () => {
    setReadyState('loading');
    const splash = mountSplash();
    splash.getAnimations = () => [{ playState: 'finished' } as Animation];

    installSplash();

    expect(splash.classList.contains('is-held')).toBe(false);
    expect(document.getElementById('splash')).toBeNull();
  });

  it('does nothing when the page has no splash', () => {
    document.body.innerHTML = '<div id="root"></div>';
    expect(() => installSplash()).not.toThrow();
  });
});
