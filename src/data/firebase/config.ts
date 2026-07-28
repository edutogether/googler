export interface FirebaseConfig { apiKey: string; authDomain: string; projectId: string; storageBucket: string; messagingSenderId: string; appId: string }
const keys = ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_STORAGE_BUCKET', 'VITE_FIREBASE_MESSAGING_SENDER_ID', 'VITE_FIREBASE_APP_ID'] as const
export const firebaseConfig = (): FirebaseConfig | null => {
  const values = keys.map((key) => import.meta.env[key]?.trim() ?? '')
  return values.every(Boolean) ? { apiKey: values[0], authDomain: values[1], projectId: values[2], storageBucket: values[3], messagingSenderId: values[4], appId: values[5] } : null
}
