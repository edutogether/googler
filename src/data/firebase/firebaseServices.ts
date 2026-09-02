import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { collection, doc, getDoc, getFirestore, limit, onSnapshot, query, setDoc } from 'firebase/firestore';
import type { AppServices, LeaderboardEntry, Profile } from '../appServices';
import type { FirebaseConfig } from './config';

// Namespaces every Firestore path (artifacts/{appId}/...) — configurable so
// forks/environments don't have to share one Firestore project's data, but
// this repo has only ever run one tenant, hence the fallback.
const appId = import.meta.env.VITE_FIRESTORE_NAMESPACE ?? 'gpass-custom-app-id';

// Bounds the leaderboard read/listener fan-out: without a cap, every client
// streams the entire rankings collection and re-streams it to everyone else
// on every write (see COMMON_STANDARDS.md-driven audit, 확장성 finding).
// This is a plain limit(), not an orderBy()+limit() — the leaderboard's real
// sort (scoreL1+scoreL2 with a passed-both tiebreak, computed client-side in
// LeaderboardPage.tsx) has no single indexable field yet, and scoreL1/scoreL2
// are optional per firestore.rules, so an orderBy on either would silently
// drop every entrant who hasn't completed a mission yet from the query
// results entirely. A real server-side ranked+capped query needs a stored
// total-score field, which belongs with the XP/level domain redesign the
// rewiring round already has to do (see CLAUDE.md) — this limit only bounds
// read volume in the meantime.
const LEADERBOARD_READ_LIMIT = 200;

export function createFirebaseServices(config: FirebaseConfig): AppServices {
  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);
  return {
    mode: 'firebase',
    subscribeToSession: (onUser) => {
      void signInAnonymously(auth);
      return onAuthStateChanged(auth, (user) => onUser(user?.uid ?? null));
    },
    profiles: {
      get: async (uid) => { const snapshot = await getDoc(doc(db, 'artifacts', appId, 'users', uid, 'profile', 'info')); return snapshot.exists() ? snapshot.data() as Profile : null; },
      save: async (uid, profile) => { await setDoc(doc(db, 'artifacts', appId, 'users', uid, 'profile', 'info'), profile); }
    },
    progress: {
      subscribe: (uid, onProgress) => onSnapshot(doc(db, 'artifacts', appId, 'users', uid, 'user_progress', 'gpass_data'), (snapshot) => onProgress(snapshot.exists() ? (snapshot.data().progress || {}) : {})),
      save: async (uid, progress) => { await setDoc(doc(db, 'artifacts', appId, 'users', uid, 'user_progress', 'gpass_data'), { progress }, { merge: true }); }
    },
    leaderboard: {
      subscribe: (onEntries) => onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'rankings'), limit(LEADERBOARD_READ_LIMIT)), (snapshot) => onEntries(snapshot.docs.map((entry) => entry.data() as LeaderboardEntry))),
      save: async (entry) => { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'rankings', entry.uid), entry, { merge: true }); }
    }
  };
}
