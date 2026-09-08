# Stage 0 validation

- 기준 main: `b3c9af30e7ef5f61be4bebca47c9a7ab97ab0885`
- 검증 branch: `refactor/foundation-zero-v2`
- 검증 시작 SHA: `699a7763b5b24d78fc68a9f4d11937d333aeba15`

## 범위와 무결성

원본 보존 기준선, 콘텐츠 분리, 진행률·공유 순수 로직, Firebase/preview 서비스 경계, 핵심 화면, 프로필·랭킹·공유·완료 UI 분리를 완료했다. 콘텐츠는 Course 2개, Day 20개, Mission 60개, URL 60개다. 원본 URL의 누락·추가·변경은 없다.

UI와 `src/data/local`의 Firebase SDK 직접 import는 없고, SDK 구현은 `src/data/firebase`에만 있다. Firebase 설정이 불완전하면 preview 서비스를 선택하며 preview 데이터는 서버 저장이 아니다.

## 자동 검증

`npm ci`, `npm run typecheck`, `npm run lint`, `npm run test:run`, `npm run build`, `npm run check`, `git diff --check`를 실행한다. R6 시점 테스트는 8 파일, 14 케이스이며 모두 통과했다.

테스트는 콘텐츠 수량/ID/URL, 진행률·Day·Level·전체 완료, 공유 문구, Firebase 설정/preview, 시작·학습·시험·재도전·랭킹, 프로필 적용, 공유 버튼, 완료 축하를 다룬다.

## 브라우저 검수

로컬 production preview `http://127.0.0.1:4174/googler/`에서 HTTP와 asset 응답 200을 확인했다. 1366×768에서 시작, 프로필 입력·이모지 적용, 학습 화면, Day 카드, 리소스 href를 확인했다. 숨김 체크박스의 실제 자동 클릭은 브라우저 제어 표면의 제한으로 수행하지 못했으며 해당 토글과 완료 조건은 통합 테스트로 검증했다.

## npm audit

`npm audit --omit=dev --json`은 production 취약점 0개다. 전체 audit의 10건(critical 1, high 6, moderate 3)은 eslint/vitest/vite 및 전이 개발 도구 체인이다. production 번들 취약점이 아니며, `npm audit fix`는 실행하지 않았다. 의존성 maintenance에서 별도 처리한다.

## 의도적으로 하지 않은 작업과 후속

main 병합, Pages 배포, Firebase 프로젝트/콘솔 변경은 하지 않았다. Stage 1은 실제 Firebase 인증·보안 정책·운영 데이터 검증을 다룬다. R7은 명시적 승인 후 PR 리뷰와 main 반영만 수행한다.

## 판정

자동 검증과 production dependency audit은 통과했다. 모바일 viewport 전수와 실제 Firebase 운영 환경은 후속 수동 검수 제한으로 남아 있어, 현재 판정은 **B. 조건부 통과**다.
