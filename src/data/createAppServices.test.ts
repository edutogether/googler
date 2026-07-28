import { describe, expect, it } from 'vitest';
import { getFirebaseConfig } from './firebase/config';
import { createPreviewServices } from './local/previewServices';

describe('service boundaries', () => {
  it('rejects missing or incomplete Firebase configuration', () => {
    expect(getFirebaseConfig({})).toBeNull();
    expect(getFirebaseConfig({ VITE_FIREBASE_API_KEY: 'only-one' })).toBeNull();
  });

  it('accepts a complete Firebase configuration without connecting', () => {
    expect(getFirebaseConfig({ VITE_FIREBASE_API_KEY: 'a', VITE_FIREBASE_AUTH_DOMAIN: 'b', VITE_FIREBASE_PROJECT_ID: 'c', VITE_FIREBASE_STORAGE_BUCKET: 'd', VITE_FIREBASE_MESSAGING_SENDER_ID: 'e', VITE_FIREBASE_APP_ID: 'f' })?.projectId).toBe('c');
  });

  it('keeps preview profile and progress in the current session only', async () => {
    const services = createPreviewServices();
    await services.profiles.save('preview-user', { nickname: '미리보기', emoji: '🦊' });
    await services.progress.save('preview-user', { mission: true });
    expect(await services.profiles.get('preview-user')).toMatchObject({ nickname: '미리보기' });
    let observed = {};
    const unsubscribe = services.progress.subscribe('preview-user', (progress) => { observed = progress; });
    expect(observed).toMatchObject({ mission: true });
    expect(() => unsubscribe()).not.toThrow();
  });
});
