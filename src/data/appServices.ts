export type Profile = { nickname: string; emoji: string };
export type Progress = Record<string, boolean>;
export type LeaderboardEntry = Profile & { uid: string; scoreL1?: number; scoreL2?: number; passedL1?: boolean; passedL2?: boolean };

export type AppServices = {
  mode: 'firebase' | 'preview';
  subscribeToSession: (onUser: (uid: string | null) => void) => () => void;
  profiles: { get: (uid: string) => Promise<Profile | null>; save: (uid: string, profile: Profile) => Promise<void> };
  progress: { subscribe: (uid: string, onProgress: (progress: Progress) => void) => () => void; save: (uid: string, progress: Progress) => Promise<void> };
  leaderboard: { subscribe: (onEntries: (entries: LeaderboardEntry[]) => void) => () => void; save: (entry: LeaderboardEntry) => Promise<void> };
};
