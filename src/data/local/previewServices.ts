import type { AppServices, Profile, Progress } from '../appServices';

export function createPreviewServices(): AppServices {
  let profile: Profile | null = null;
  let progress: Progress = {};
  const previewUid = 'preview-user';

  return {
    mode: 'preview',
    subscribeToSession: (onUser) => { onUser(previewUid); return () => {}; },
    profiles: { get: async () => profile, save: async (_uid, next) => { profile = next; } },
    progress: { subscribe: (_uid, onProgress) => { onProgress(progress); return () => {}; }, save: async (_uid, next) => { progress = next; } },
    leaderboard: { subscribe: (onEntries) => { onEntries([]); return () => {}; }, save: async () => {} }
  };
}
