export type FirebaseConfig = { apiKey: string; authDomain: string; projectId: string; storageBucket: string; messagingSenderId: string; appId: string };

export function getFirebaseConfig(env: Record<string, string | boolean | undefined> = import.meta.env): FirebaseConfig | null {
  const config = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID
  };
  return Object.values(config).every(Boolean) ? config as FirebaseConfig : null;
}
