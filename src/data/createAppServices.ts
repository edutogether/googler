import type { AppServices } from './appServices';
import { getFirebaseConfig } from './firebase/config';
import { createFirebaseServices } from './firebase/firebaseServices';
import { createPreviewServices } from './local/previewServices';

export function createAppServices(): AppServices {
  const config = getFirebaseConfig();
  if (!config) {
    console.warn('Firebase 환경변수가 없어 preview 모드(세션 한정 저장)로 실행됩니다.');
    return createPreviewServices();
  }
  try {
    return createFirebaseServices(config);
  } catch (error) {
    console.warn('Firebase 초기화 실패, preview 모드(세션 한정 저장)로 대체합니다:', error);
    return createPreviewServices();
  }
}
