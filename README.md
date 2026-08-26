# Be a Googler

Google Educator Level 1·2 학습을 위한 20일, 60개 미션 기반의 동료 학습 앱입니다.

## 현재 라이브 경로

현재 배포·렌더링되는 화면은 `src/features/main-v3/MainWorldV3.tsx`(전시용 정적 셸)뿐입니다. Stage 0에서 만든 `src/legacy/LegacyGooglerApp.tsx`(Firebase/도메인 로직/실제 콘텐츠 연결) 경로는 현재 어디서도 렌더링되지 않는 의도된 미연결 상태입니다 — 재배선은 별도 마일스톤입니다.

## Stage 0

Stage 0는 원본 제품의 문구·디자인·학습 흐름·60개 외부 리소스 URL을 보존하면서 콘텐츠, 도메인 로직, Firebase 경계, 화면 컴포넌트를 분리했습니다(`src/legacy/LegacyGooglerApp.tsx` 경로 한정). Firebase 환경 변수가 없거나 불완전하면 이 경로는 preview 모드로 실행됩니다. preview 데이터는 세션 한정이며 서버에 저장되지 않습니다.

## 실행과 검증

```bash
npm ci
npm run dev
npm run typecheck
npm run lint
npm run test:run
npm run build
npm run check
npm run preview
```

Vite base는 GitHub Pages의 `/googler/`이며 공식 Pages URL은 `https://edutogether.github.io/googler/`입니다.

## 구조

```text
src/
  features/main-v3/  # 현재 라이브 화면 (App.tsx가 렌더링하는 유일한 경로)
  content/       # Course, Day, Mission, 리소스 URL (legacy 경로 전용)
  domain/        # 진행률·완료·점수 순수 로직과 타입 (legacy 경로 전용)
  data/          # AppServices, Firebase 구현, preview 구현 (legacy 경로 전용)
  pages/         # 시작·학습·시험·재도전·랭킹 화면 (legacy 경로 전용)
  features/      # 프로필·학습 카드·공유·완료 UI (legacy 경로 전용)
  legacy/        # 최상위 상태, 서비스 연결, 이벤트, 페이지 조립 (현재 미렌더링)
```

Firebase 변수는 `.env.example`을 참고합니다. `firestore.rules`는 이미 작성돼 있고 `npm run rules:test`로 Firestore 에뮬레이터에 대해 CI에서 매 배포·PR마다 검증됩니다 — 다만 이 경로는 현재 라이브 화면(MainWorldV3)에서 호출되지 않는 legacy 전용 코드입니다(위 "현재 라이브 경로" 참고). 비밀값과 실제 `.env` 파일은 commit하지 않습니다.

현재 자동 테스트는 콘텐츠/도메인/서비스/화면 상호작용과 Firestore 보안 규칙을 검증합니다.
