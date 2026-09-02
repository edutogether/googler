import { beforeEach, describe, expect, it, vi } from 'vitest';

const { signInAnonymously, onAuthStateChanged } = vi.hoisted(() => ({
  signInAnonymously: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));
const { getDoc, setDoc, onSnapshot, doc, collection, query, limit } = vi.hoisted(() => ({
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  onSnapshot: vi.fn(),
  doc: vi.fn((...segments: unknown[]) => ({ path: segments.join('/') })),
  collection: vi.fn((...segments: unknown[]) => ({ path: segments.join('/') })),
  query: vi.fn((base: unknown, ...constraints: unknown[]) => ({ base, constraints })),
  limit: vi.fn((n: number) => ({ type: 'limit', n })),
}));

vi.mock('firebase/app', () => ({ initializeApp: vi.fn(() => ({})) }));
vi.mock('firebase/auth', () => ({ getAuth: vi.fn(() => ({})), signInAnonymously, onAuthStateChanged }));
vi.mock('firebase/firestore', () => ({ getFirestore: vi.fn(() => ({})), doc, collection, getDoc, setDoc, onSnapshot, query, limit }));

import { createFirebaseServices } from './firebaseServices';

const config = { apiKey: 'a', authDomain: 'b', projectId: 'c', storageBucket: 'd', messagingSenderId: 'e', appId: 'f' };

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createFirebaseServices', () => {
  it('signs in anonymously and forwards the resolved uid', () => {
    signInAnonymously.mockResolvedValue(undefined);
    const services = createFirebaseServices(config);
    const onUser = vi.fn();

    services.subscribeToSession(onUser);

    expect(signInAnonymously).toHaveBeenCalled();
    const authCallback = onAuthStateChanged.mock.calls[0][1];
    authCallback({ uid: 'user-1' });
    expect(onUser).toHaveBeenCalledWith('user-1');
    authCallback(null);
    expect(onUser).toHaveBeenCalledWith(null);
  });

  it('does not let a rejected anonymous sign-in become an unhandled rejection', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    signInAnonymously.mockRejectedValue(new Error('network down'));
    const services = createFirebaseServices(config);

    services.subscribeToSession(vi.fn());
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(consoleError).toHaveBeenCalledWith('익명 로그인 실패:', expect.any(Error));
    consoleError.mockRestore();
  });

  it('returns null for a profile that does not exist', async () => {
    getDoc.mockResolvedValue({ exists: () => false });
    const services = createFirebaseServices(config);

    await expect(services.profiles.get('user-1')).resolves.toBeNull();
  });

  it('returns the stored profile data when it exists', async () => {
    const profile = { nickname: '테스터', emoji: '🦊' };
    getDoc.mockResolvedValue({ exists: () => true, data: () => profile });
    const services = createFirebaseServices(config);

    await expect(services.profiles.get('user-1')).resolves.toEqual(profile);
  });

  it('bounds the leaderboard subscription with a read limit', () => {
    onSnapshot.mockReturnValue(() => {});
    const services = createFirebaseServices(config);

    services.leaderboard.subscribe(vi.fn());

    expect(limit).toHaveBeenCalledWith(200);
    expect(query).toHaveBeenCalled();
  });

  it('saves a leaderboard entry with merge semantics', async () => {
    setDoc.mockResolvedValue(undefined);
    const services = createFirebaseServices(config);
    const entry = { uid: 'user-1', nickname: '테스터', emoji: '🦊' };

    await services.leaderboard.save(entry);

    expect(setDoc).toHaveBeenCalledWith(expect.anything(), entry, { merge: true });
  });
});
