import type { AppServices } from './appServices';
import { getFirebaseConfig } from './firebase/config';
import { createFirebaseServices } from './firebase/firebaseServices';
import { createPreviewServices } from './local/previewServices';

export function createAppServices(): AppServices {
  const config = getFirebaseConfig();
  if (!config) return createPreviewServices();
  try { return createFirebaseServices(config); } catch { return createPreviewServices(); }
}
