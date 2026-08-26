import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { bumpDailySentryEventCount, MAX_EVENTS_PER_DAY, SENTRY_EVENT_CAP_KEY } from './sentryEventCap';

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('bumpDailySentryEventCount', () => {
  it('counts up from 1 within the same day', () => {
    expect(bumpDailySentryEventCount()).toBe(1);
    expect(bumpDailySentryEventCount()).toBe(2);
    expect(bumpDailySentryEventCount()).toBe(3);
  });

  it('resets to 1 when the stored date is a different day', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-26T12:00:00Z'));
    bumpDailySentryEventCount();
    bumpDailySentryEventCount();
    expect(JSON.parse(window.localStorage.getItem(SENTRY_EVENT_CAP_KEY)!)).toEqual({ date: '2026-08-26', count: 2 });

    vi.setSystemTime(new Date('2026-08-27T00:00:01Z'));
    expect(bumpDailySentryEventCount()).toBe(1);
  });

  it('exceeds MAX_EVENTS_PER_DAY only after enough calls in one day to prove the cap has something to bite', () => {
    for (let i = 0; i < MAX_EVENTS_PER_DAY; i += 1) bumpDailySentryEventCount();
    expect(bumpDailySentryEventCount()).toBeGreaterThan(MAX_EVENTS_PER_DAY);
  });

  it('fails open (returns 1, does not throw) when localStorage.getItem throws', () => {
    const spy = vi.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(() => bumpDailySentryEventCount()).not.toThrow();
    expect(bumpDailySentryEventCount()).toBe(1);
    spy.mockRestore();
  });

  it('fails open when the stored value is corrupted JSON', () => {
    window.localStorage.setItem(SENTRY_EVENT_CAP_KEY, 'not-json{');
    expect(() => bumpDailySentryEventCount()).not.toThrow();
  });
});
