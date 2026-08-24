# CLAUDE.md — googler (Be a Googler)

Google Educator 인증 학습용 20일 60미션 동료학습 앱 (React/TS/Vite). 상위 원칙은 [D:\Project\CLAUDE.md](../../CLAUDE.md) 상속 — 여기는 이 앱 전용 상태/이슈만 기록한다.

## 현재 상태 (2026-08-13 기준)
- 브랜치: `main` (배포 브랜치이자 작업 브랜치, GitHub Pages 자동 배포)
- 2026-08-10 외부 리뷰: `docs/EXTERNAL_HEALTH_REVIEW_20260810.md`

## Firebase 프로젝트 (2026-08-17 신규 생성, 2026-08-23 보강)

- **Google Cloud/Firebase 프로젝트 ID: `be-a-g00gler`** (조직 없음). 프로젝트 ID엔 "google" 문자열이 상표 정책상 금지돼 있어서 `googler`를 그대로 못 씀 — 그래서 두 번째 `o`를 숫자 `0`(zero)으로 바꾼 형태. 프로젝트 표시 이름은 "Be a Googler" 그대로.
- **"Firebase를 켰다"는 말의 정확한 의미**: 시크릿·규칙·인증·예산알림까지 인프라는 전부 살아있지만, **`MainWorldV3`(현재 렌더링되는 유일한 화면)는 여전히 Firebase를 단 한 줄도 호출하지 않는다.** `npm run build`로 실제 배포 번들을 grep해보면 `firebase`/`getFirestore`/`signInAnonymously` 전부 0건 — 트리셰이킹으로 아예 빠진다(2026-08-23 재확인). 즉 지금은 "위험한 라이브 백엔드"가 아니라 "재배선 시작 전까지 아무도 안 쓰는, 준비만 끝난 빈 백엔드"다. 이 구분을 잊지 말 것 — 재배선을 시작하는 순간 이 문장은 더 이상 사실이 아니게 된다.
- **완료된 것:**
  - 웹 앱 등록, 6개 SDK 키를 GitHub repo secrets에 등록(`VITE_FIREBASE_API_KEY` 등). **2026-08-23 정리**: `deploy-pages.yml`에서 이 6개를 build job의 `env:`로 주입하던 부분은 뺐다 — 재배선 전까지 어차피 안 쓰는 시크릿 주입 코드를 소스에 남겨두면 다음 세션이 "Firebase가 배선돼 있나?"하고 헷갈릴 수 있어서. **GitHub repo secrets 값 자체는 그대로 남아있다** — 재배선을 시작하면 `deploy-pages.yml`의 `build:` 아래에 아래 6줄만 다시 넣으면 원상복구다:
    ```yaml
    env:
      VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
      VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
      VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
      VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
      VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
      VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
    ```
  - Firestore Database 활성화(Standard edition, 서울 리전), 이 저장소의 `firestore.rules` 콘솔에 게시
  - `firestore.rules`의 `rankings` 쓰기 규칙에 필드 화이트리스트 + 타입/길이/점수범위 검증 추가(2026-08-23) — uid 일치만이 아니라 문서 모양 자체를 강제. 점수 상한(100000)은 실제 점수 체계가 아직 없어 잡은 넉넉한 안전판이지, 진짜 만점 기준이 아님.
  - **Firestore 규칙에 로컬+CI 자동 테스트 연결(2026-08-23)** — classcade와 동일 패턴. `npm run rules:test`(JDK21 + Firestore 에뮬레이터, `src/data/firebase/firestore.rules.test.ts`)가 `deploy-pages.yml`의 build 스텝 앞에서 매 배포마다 돈다. 로컬 실행 5/5 통과 확인. **다만 이건 "규칙이 규칙대로 동작하는지" 테스트만 하는 것이지, 규칙을 콘솔에 자동 배포하는 건 아니다** — 저장소의 `firestore.rules`를 고치면 여전히 콘솔에 수동으로 다시 붙여넣어야 실제 반영된다(classcade도 동일).
  - Firebase SDK `11.0.2` → `^12.18.0` 업그레이드(2026-08-23, `@firebase/rules-unit-testing`이 v12를 요구해서 겸사겸사) — typecheck/lint/test 25개/build 전부 재확인, 번들 크기 불변.
  - Authentication에서 익명 로그인 활성화(Auto clean-up 30일 켜짐 — 이 앱은 20일 완주 프로그램이라 주기상 문제없음)
  - Google Cloud 예산 알림 설정 완료(Alerts only, googler 프로젝트 단독 스코프). **한계 인지할 것: 이건 임계값 넘으면 메일만 오는 것이고, 실제로 API 호출을 막거나 결제를 중단시키진 않는다.** 진짜 강제 차단이 필요하면 예산 초과 시 API를 비활성화하는 Cloud Function을 별도로 만들어야 함(아직 없음).
  - App Check 등록 완료(reCAPTCHA v3, 도메인 `edutogether.github.io`), **Cloud Firestore + Authentication 두 API 모두 Enforce 켜짐(2026-08-23)**. 최신 Firebase 콘솔은 앱 단위가 아니라 API 단위로 Enforce를 건다 — App Check → APIs 탭에서 각 항목을 켠 것. 이유: 클라이언트 코드가 Firebase를 안 부르더라도 Firestore/Auth 프로젝트 자체는 인터넷에 살아있어서, 프로젝트 ID만 알면 REST API로 직접 두드릴 수 있음 — App Check가 그 뒷문을 막는 유일한 방어선.

## 전시 프리즈 — 복구 지점 (최신: 2026-08-17)

**태그 `googler-exhibition-freeze-2026-08-17`** (커밋 e936bfe) = 최신 검증 완료 시점. CI push 트리거 정상화(main), 배포 워크플로에 typecheck/lint/test 게이트 추가, `__initial_auth_token` 무검증 인증 코드 제거, journey/visual-reset 프로토타입 브랜치 5개 archive 정리 포함. 테스트 25개·타입체크·lint·build·CI 성공·라이브 확인까지 전부 통과.

이전 지점 `googler-exhibition-freeze-2026-08-14`(커밋 5413b7c), `googler-exhibition-freeze-2026-08-13`(커밋 990046e)도 그대로 보존돼 있다 — 더 이전 상태로 돌아가야 할 특수한 경우에만 사용.

이후 수정으로 뭔가 망가졌을 때 복구 절차 (디버깅하지 말고 바로 복원):

```bash
git checkout googler-exhibition-freeze-2026-08-17 -- .
```

그 다음 변경사항 확인 후 커밋·푸시하면 GitHub Pages가 검증된 상태로 재배포된다.

**주의**: 이 저장소는 여러 세션에서 동시에 작업될 수 있다. 프리즈 태그를 새로 찍기 전에 항상 `git log --oneline -5`로 HEAD가 예상한 지점인지 먼저 확인할 것 — 마지막으로 내가 만든 커밋이 아닐 수 있다.

## 시각 회귀 검사 (2026-08-13 도입)

CSS/화면 수정 후 배포 전에 반드시 실행:

- `npm run visual` — 홈+서브페이지 4개 × 해상도 4종(1920/1280/850/390)을 기준 스크린샷과 픽셀 비교. 다르면 실패하고 `.visual-diffs/`에 비교 이미지 저장.
- `npm run visual:update` — 화면을 의도적으로 바꿨을 때 기준(정답지)을 갱신.
- 기준 이미지는 `.visual-baselines/`(gitignore됨)에 로컬 저장 — 같은 PC에서만 유효.

## 알려진 이슈 — 다음 작업 후보

현재 렌더링되는 `src/features/main-v3/MainWorldV3.tsx`는 Firebase/진행률/콘텐츠가 연결 안 된 정적 셸이다. **이건 버그가 아니라 의도된 설계다** — "나중에 이걸 만들 거예요"를 보여주는 비전/피칭 화면으로, 처음부터 기능 연결 없이 만들어졌다 (개발자 확인, 2026-08-10).

실제 기능 구현은 `LegacyGooglerApp.tsx`에 있으며 현재 어디서도 렌더링되지 않는 고아 코드다 (비테스트 코드의 84% 추정, 리뷰 시점 기준 — 재확인 필요).

## 이번 라운드 목표 (2026-08-10 갱신)

**이번엔 전시(exhibition)만이 목표.** MainWorldV3를 LegacyGooglerApp에 재배선하는 건 이번 라운드 범위가 아님 — 하지 않는다.

만점(10/10) 기준 = "전시용으로서 완벽함"이지 "완성된 제품"이 아님:
- MainWorldV3가 화면에 에러 없이 뜨는지 (콘솔 에러 0, 깨진 레이아웃 없음)
- 시연할 디바이스/브라우저에서 실제로 확인
- 재배선(다음 라운드 후보였던 작업)은 지금 하지 않음 — 이번 라운드에서 손대면 오히려 범위 밖 작업으로 시간 낭비

**다음 라운드(전시 이후, 진짜 제품화할 때) 후보:** MainWorldV3를 실제 데이터/로직에 연결(재배선), `LegacyGooglerApp.tsx` 재사용 여부 판단.

## 전시용 평가 점수의 조건부 성격 (2026-08-17)

2026-08-17 최상위 전체 감사에서 googler는 "전시용 기준"으로 재평가되어 54.5점🔴 → 74.9점🟢으로 올라갔다. **이 74.9점은 "Firebase를 켜기 전까지"라는 조건이 붙은 점수다** — MainWorldV3/LegacyGooglerApp 단절과 Firestore 보안규칙 부재가 평가에서 제외된 결과이기 때문. **Firebase를 실제로 켜는 순간 이 평가는 원래 점수(54.5점, 레드 4개)로 되돌아간다는 걸 반드시 기억할 것.**

2026-08-17 당일 후속 조치로 Firebase 프로젝트 생성과 firestore.rules/예산알림/App Check까지 전부 준비를 끝내뒀다(위 "Firebase 프로젝트" 섹션 참고) — 그래서 "규칙 없이 무방비로 켜질" 위험은 이제 없다. 다만 이건 인프라 준비일 뿐, 아래는 여전히 유효하다:

- 재연결에 필요한 구체 항목 체크리스트: `D:\Project\_audits\20260817\googler.md`
- XP/레벨/배지 개념 자체가 `domain/progress.ts`에 없어서, 단순 "재배선"이 아니라 도메인 로직을 새로 설계해야 하는 규모다 (기존에 알려졌던 것보다 심각하다는 게 2026-08-17 재검증 결과).

**2026-08-23 재감사 후속**: Firebase가 실제로 켜진 걸 확인해 프로덕션 기준으로 재평가 → 평균 53.7점🔴로 예고대로 돌아옴. 다만 번들 스캔으로 재확인한 결과 급한 실사용자 위험은 아니었음(위 "Firebase 프로젝트" 섹션 참고). 즉시 조치 5건 중 랭킹 규칙 필드검증 추가 + CI 규칙 자동테스트 연결 2건은 당일 완료. App Check 강제 적용은 여전히 의도적 보류(재배선 착수 전 반드시 켤 것), 예산알림의 "알림만이고 차단 아님" 한계는 위에 명시해둠. 재배선 착수 시 같이 처리할 나머지(someday 7건 — 랭킹 구독 `orderBy`+`limit` 없음, 체크박스 디바운스 없음, 저장 실패해도 성공 UI가 뜨는 문제, 익명계정 삭제 후 고아 문서 정리 불가, 공개 랭킹 고지 없음, `execCommand('copy')` deprecated API)는 아직 손 안 댔음 — `LegacyGooglerApp.tsx` 재배선과 한 묶음으로 처리.

## "90점대 진입 4건" 진행 상황 (2026-08-23~)

사용자가 4건 모두 동시 진행을 명시적으로 승인("4건 다 지금 진행", 의존성 업그레이드는 원래 이번 라운드엔 급하지 않다고 권고했으나 사용자가 진행 결정).

1. **App Check Enforce (Authentication)** — 완료. Cloud Firestore에 이어 Authentication API도 Enforce 켜짐(위 Firebase 섹션 참고).
2. **의존성 메이저 업그레이드 (React 18→19, Vite 6→8)** — 아직 미착수. 승인은 났지만 손 안 댐.
3. **Sentry 에러 모니터링** — 완료·배포됨. Sentry 프로젝트 "Be a Googler"(조직: 817beatles 개인 계정, codyssey와 별개 프로젝트). `src/main.tsx`에서 `import.meta.env.PROD`일 때만 `Sentry.init()` 실행(로컬 개발/테스트 중엔 잡음 안 남), `<Sentry.ErrorBoundary>`로 `<App />` 감싸서 렌더 크래시 시 한국어 폴백 문구 표시. DSN(`https://bb25f9469e6a53b7fb3b8c4dbaac0965@o4511966927912960.ingest.us.sentry.io/4511966996267008`)은 GitHub secret이 아니라 소스에 그대로 하드코딩 — Firebase API 키와 달리 Sentry는 DSN을 "전송 전용 공개 주소"로 문서화해 클라이언트 코드 노출이 안전하다고 명시함. 로컬 프로덕션 빌드에서 강제로 에러를 던져 실제로 Sentry ingest 엔드포인트로 전송되는 것까지 확인 후 배포(커밋 `5266e73`).
4. **개인정보처리방침 페이지** — 완료. `public/privacy.html`, 라이브: `https://edutogether.github.io/googler/privacy.html`.
