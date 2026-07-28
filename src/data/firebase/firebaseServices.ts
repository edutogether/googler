import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { collection, doc, getDoc, getFirestore, onSnapshot, setDoc } from 'firebase/firestore';
import type { AppServices, LeaderboardEntry, Profile } from '../appServices';
import type { FirebaseConfig } from './config';

const appId = 'gpass-custom-app-id';

export function createFirebaseServices(config: FirebaseConfig): AppServices {
  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);
  return {
    mode: 'firebase',
    subscribeToSession: (onUser) => {
      void (async () => {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token);
        else await signInAnonymously(auth);
      })();
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
      subscribe: (onEntries) => onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'rankings'), (snapshot) => onEntries(snapshot.docs.map((entry) => entry.data() as LeaderboardEntry))),
      save: async (entry) => { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'rankings', entry.uid), entry, { merge: true }); }
    }
  };
}
