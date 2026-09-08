# CLAUDE.md — googler (Be a Googler)

Google Educator 인증 학습용 20일 60미션 동료학습 앱 (React/TS/Vite). 상위 원칙은 [D:\Projects\CLAUDE.md](../../CLAUDE.md) 상속 — 여기는 이 앱 전용 상태/이슈만 기록한다.

**함께 보는 문서**
- [`AGENTS.md`](AGENTS.md) — 도구 무관 안내(명령, 시각 회귀 절차, 배포, 금지 항목, 함정). Codex 등 다른 도구도 이걸 읽는다.
- [`.claude/rules/app.md`](.claude/rules/app.md) — 이 앱의 개별 규칙(공통 헌법에 없는 것만).
- [`_docs/CHANGELOG.md`](_docs/CHANGELOG.md) — 날짜별 작업 이력. 지나간 라운드 기록은 전부 여기.
- [`_docs/intents/`](_docs/intents/) — 작업별 intent 문서. 규칙은 [`.claude/rules/intent-workflow.md`](.claude/rules/intent-workflow.md).

## LOCKED — 재논의·임의 수정 금지 (이미 확정된 결정, 본문에 근거 상세)
- `MainWorldV3`가 Firebase/진행률/콘텐츠와 연결 안 된 것은 버그가 아니라 의도된 설계(전시용 비전 화면, 개발자 확인 2026-08-10) — "제품화(재배선) 라운드를 위한 참고 메모" 섹션 참고.
- BGM이 매 방문 초기화되는 것은 공용 전시 키오스크 특성상 확정된 설계 — 재배선 전까지 유지.
- `eslint`(9→10)/`jsdom`(25→30)/`typescript`(5→7) 업그레이드는 각각 구체적 이유로 보류 — "나머지 outdated 패키지 정리" 섹션 참고.
- 재배선(MainWorldV3↔LegacyGooglerApp 연결)은 전시 라운드 범위 밖 — 하지 않는다.
- 랭킹 공개 범위는 로그인 참가자 한정(전체공개 아님), 예산 관리는 강제 차단 대신 레이트리밋 — "재배선 관련 대표 결정 사항" 섹션 참고.
- **2026-09-02~2026-09-30: 실운영 모드.** 이 세션은 정기감사(9월 30일) 전까지 재감사·추가 작업을 먼저 제안하지 않는다 — 아래 "실운영 모드" 섹션 참고.

## 현재 상태 (2026-09-02 기준)
- 브랜치: `main` (배포 브랜치이자 작업 브랜치)
- **배포처: Firebase Hosting** — 라이브 URL `https://g00gler.web.app/` (2026-09-02 GitHub Pages에서 이관, `_docs/CHANGELOG.md`의 "Firebase Hosting 이관" 섹션 참고). GitHub Pages 배포는 폐기했다(`deploy-pages.yml` 삭제).
- 2026-08-10 외부 리뷰: `_docs/archive/EXTERNAL_HEALTH_REVIEW_20260810.md`

## 실운영 모드 (2026-09-02 확정, portal과 동일 방침)

**(A)트랙(지금 만든 만큼 기준) 10개 항목 전부 100점**으로 2026-09-02 §7 종합감사(Sonnet+Opus 독립 조사)가 마무리됐다. 대표님 지시: **다음 정기감사(2026-09-30)까지 실운영 모드로 둔다** — 이 세션이 먼저 재감사·리팩터링·추가 개선 작업을 제안하지 않는다.

- 대표님/팀장이 명시적으로 요청하는 버그 수정·기능 추가·질문 대응은 평소대로 처리한다. 막는 건 "시켜서가 아니라 이 세션이 스스로 판단해서" 벌이는 추가 감사/정리 작업이다.
- 실제 장애·보안 사고처럼 즉시 대응이 필요한 상황은 이 방침의 예외다 — 발견하면 먼저 보고하고, 명백히 위험한 것만 즉시 조치한다.
- 9월 30일 정기감사가 도래하면 이 섹션을 갱신하고 새 라운드를 시작한다.

## Firebase 프로젝트 (2026-08-17 신규 생성, 2026-08-23 보강)

- **Google Cloud/Firebase 프로젝트 ID: `be-a-g00gler`** (조직 없음). 프로젝트 ID엔 "google" 문자열이 상표 정책상 금지돼 있어서 `googler`를 그대로 못 씀 — 그래서 두 번째 `o`를 숫자 `0`(zero)으로 바꾼 형태. 프로젝트 표시 이름은 "Be a Googler" 그대로.
- **"Firebase를 켰다"는 말의 정확한 의미**: 시크릿·규칙·인증·예산알림까지 인프라는 전부 살아있지만, **`MainWorldV3`(현재 렌더링되는 유일한 화면)는 여전히 Firebase를 단 한 줄도 호출하지 않는다.** `npm run build`로 실제 배포 번들을 grep해보면 `firebase`/`getFirestore`/`signInAnonymously` 전부 0건 — 트리셰이킹으로 아예 빠진다(2026-08-23 재확인). 즉 지금은 "위험한 라이브 백엔드"가 아니라 "재배선 시작 전까지 아무도 안 쓰는, 준비만 끝난 빈 백엔드"다. 이 구분을 잊지 말 것 — 재배선을 시작하는 순간 이 문장은 더 이상 사실이 아니게 된다.
- **완료된 것:**
  - 웹 앱 등록, 6개 SDK 키를 GitHub repo secrets에 등록(`VITE_FIREBASE_API_KEY` 등). **2026-08-23 정리**: 당시 `deploy-pages.yml`에서 이 6개를 build job의 `env:`로 주입하던 부분을 뺐었다(재배선 전까지 어차피 안 쓰는 시크릿 주입 코드가 혼동을 줄 수 있어서). **2026-09-02 갱신**: `deploy-pages.yml` 자체가 Firebase Hosting 이관으로 삭제됐다 — 재배선을 시작하면 이제 `.github/workflows/firebase-hosting-merge.yml`의 `build` 스텝(`run: npm run build` 아래) `env:`에 이 6줄을 넣으면 된다:
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
  - **Firestore 규칙에 로컬+CI 자동 테스트 연결(2026-08-23)** — classcade와 동일 패턴. `npm run rules:test`(JDK21 + Firestore 에뮬레이터, `src/data/firebase/firestore.rules.test.ts`)가 build 스텝 앞에서 매 배포마다 돈다(현재는 `firebase-hosting-merge.yml`/`firebase-hosting-pull-request.yml`, `ci.yml` 세 워크플로 전부). 로컬 실행 통과 확인.
  - **Firestore 규칙·인덱스 콘솔 수동 배포 → CI 자동 배포로 전환(2026-09-02)** — Firebase Hosting 이관으로 서비스계정 인증(`FIREBASE_SERVICE_ACCOUNT_BE_A_G00GLER`)이 CI에 생긴 김에, `firebase-hosting-merge.yml`에 `firebase deploy --only firestore:rules,firestore:indexes` 스텝을 추가했다(Hosting 배포 스텝 **뒤**에 두고 `continue-on-error: true` — 이 스텝이 실패해도 실제 사이트 배포는 막히지 않게, 첫 시도 때 순서가 반대여서 실제로 배포가 통째로 막힌 적이 있었음). 처음엔 규칙 배포만 403(권한 부족)으로 실패했는데, 대표님이 서비스계정에 Firebase Rules Admin + Cloud Datastore Index Admin 권한을 직접 추가해주신 뒤 재실행해서 **규칙·인덱스 배포 전부 성공("Deploy complete!") 확인.** 이제 규칙을 바꿀 일이 생기면 콘솔 수동 붙여넣기 없이 push만으로 반영된다.
  - Firebase SDK `11.0.2` → `^12.18.0` 업그레이드(2026-08-23, `@firebase/rules-unit-testing`이 v12를 요구해서 겸사겸사) — typecheck/lint/test 25개/build 전부 재확인, 번들 크기 불변.
  - Authentication에서 익명 로그인 활성화(Auto clean-up 30일 켜짐 — 이 앱은 20일 완주 프로그램이라 주기상 문제없음)
  - Google Cloud 예산 알림 설정 완료(Alerts only, googler 프로젝트 단독 스코프). **한계 인지할 것: 이건 임계값 넘으면 메일만 오는 것이고, 실제로 API 호출을 막거나 결제를 중단시키진 않는다.** 진짜 강제 차단이 필요하면 예산 초과 시 API를 비활성화하는 Cloud Function을 별도로 만들어야 함(아직 없음).
  - App Check 등록 완료(reCAPTCHA v3), **Cloud Firestore + Authentication 두 API 모두 Enforce 켜짐(2026-08-23)**. 최신 Firebase 콘솔은 앱 단위가 아니라 API 단위로 Enforce를 건다 — App Check → APIs 탭에서 각 항목을 켠 것. 이유: 클라이언트 코드가 Firebase를 안 부르더라도 Firestore/Auth 프로젝트 자체는 인터넷에 살아있어서, 프로젝트 ID만 알면 REST API로 직접 두드릴 수 있음 — App Check가 그 뒷문을 막는 유일한 방어선. **해결됨(2026-09-02, 대표님이 Google reCAPTCHA 관리 콘솔에서 직접 처리)**: reCAPTCHA v3 허용 도메인을 `g00gler.web.app` 추가 + `edutogether.github.io` 삭제(GitHub Pages 이미 폐기됨)로 정리 완료 — 현재 라이브 오리진과 정확히 일치한다.

## 전시 프리즈 — 복구 지점 (최신: 2026-09-08)

**태그 `googler-freeze-20260908-docs`** (문서 자기참조 특성상 여기 적는 커밋 해시가 태그 발행 순간의 정확한 HEAD와 한두 커밋 어긋날 수 있다 — 정확한 대상은 `git rev-parse googler-freeze-20260908-docs`로 항상 확인 가능하니 그걸 신뢰할 것) = 최신 검증 완료 시점. 문서 구조 정비 완료 지점(`_docs/` 통합, `AGENTS.md`·개별법 신설, CHANGELOG 분리, pre-push 훅 추가)이고, 그 직전의 홈 화면 3건(스플래시 지연, 히어로 링크 가독성, CTA 간격)까지 포함한다. `npm run check`(typecheck/lint/test 105개/build) 통과 + 시각 회귀 20/20 + 라이브 실측 확인.

직전 지점 **`googler-freeze-20260902-2`**(`1165bad`) = Firebase Hosting 이관 + §7 종합감사 수정분까지 반영된 상태 — 자세한 내용은 `_docs/CHANGELOG.md`의 "2026-09-02 종합감사(§7)" 섹션 참고.

**이 섹션은 다음 정밀감사 라운드마다 반드시 최신 태그로 갱신할 것 — 낡은 채로 방치되면 실제 장애 시 이 문서를 그대로 따르는 것 자체가 사고 원인이 된다**(2026-08-26 정밀 재감사에서 실제로 35커밋 낡은 채 방치돼 있던 것이 발견된 전례, 그리고 2026-09-02 Opus 감사에서 이 섹션의 복구 명령이 `googler-freeze-20260826-3`을 가리킨 채 한 라운드 낡아있던 게 다시 발견된 전례 — 두 번째 사고는 태그를 새로 찍고도 아래 복구 명령 줄을 안 고치면 무의미하다는 걸 보여준다. 태그를 찍고 문서를 고친 직후에도 `git log --oneline -5`로 다시 한번 최신 여부를 확인하는 습관이 필요하다).

이전 지점들 — `googler-freeze-20260902-2`(`1165bad`), `googler-freeze-20260902`, `googler-freeze-20260826-3`(`edbd389`), `googler-freeze-20260826-2`(`36bae4f`), `googler-freeze-20260826`(`b74face`), `googler-exhibition-freeze-2026-08-17`(`e936bfe`), `googler-exhibition-freeze-2026-08-14`(`5413b7c`), `googler-exhibition-freeze-2026-08-13`(`990046e`) — 도 그대로 보존돼 있다. 더 이전 상태로 돌아가야 할 특수한 경우에만 사용. **주의**: `googler-freeze-20260902` 이전 태그로 복구하면 Firebase Hosting 이관 전체가 되돌아가 GitHub Pages 시절 상태로 돌아간다는 뜻이다 — GitHub Pages 배포 자체는 이미 폐기됐으니 그 상태로 되돌리는 건 특히 신중해야 한다.

이후 수정으로 뭔가 망가졌을 때 복구 절차 (디버깅하지 말고 바로 복원):

```bash
git checkout googler-freeze-20260908-docs -- .
```

그 다음 변경사항 확인 후 커밋·푸시하면 Firebase Hosting(`g00gler.web.app`)이 검증된 상태로 재배포된다.

**주의**: 이 저장소는 여러 세션에서 동시에 작업될 수 있다. 프리즈 태그를 새로 찍기 전에 항상 `git log --oneline -5`로 HEAD가 예상한 지점인지 먼저 확인할 것 — 마지막으로 내가 만든 커밋이 아닐 수 있다.

**기존 태그를 옮기거나 덮어쓰지 말 것 — 항상 새 날짜 태그를 찍는다**(CONVENTIONS §3.4). 태그를 덮어쓰는 순간 되돌아갈 지점 자체가 사라지기 때문이다. `.githooks/pre-push`가 원격의 freeze 태그 삭제·이동을 실제로 차단한다(신규 생성은 통과). 훅은 클론마다 `git config core.hooksPath .githooks`로 켜야 한다.

**찍은 태그는 반드시 push할 것** — `git push origin main`은 태그를 함께 보내지 않는다. 로컬에만 있는 복구 지점은 다른 기기에서 동작하지 않으므로 복구 지점이 아니다(2026-09-08에 `googler-freeze-20260902-2`가 실제로 이 상태로 발견돼 push함). `comm -23 <(git tag -l | sort) <(git ls-remote --tags origin | grep -v '\^{}' | awk '{print $2}' | sed 's|refs/tags/||' | sort)`로 대조한다.

## 시각 회귀 검사 (2026-08-13 도입)

CSS/화면 수정 후 배포 전에 반드시 실행:

- `npm run visual` — 홈+서브페이지 4개 × 해상도 4종(1920/1280/850/390)을 기준 스크린샷과 픽셀 비교. 다르면 실패하고 `.visual-diffs/`에 비교 이미지 저장.
- `npm run visual:update` — 화면을 의도적으로 바꿨을 때 기준(정답지)을 갱신.
- 기준 이미지는 `.visual-baselines/`(gitignore됨)에 로컬 저장 — 같은 PC에서만 유효.

## 제품화(재배선) 라운드를 위한 참고 메모 — "밀린 일"이 아니라 그때 기억할 것들 (2026-08-25 표현 정정)

**아래 항목들은 지금 처리해야 할 미완료 작업 목록이 아니다.** 전시용 라운드의 범위 밖이라 "일단 못 한 것"처럼 보일 수 있지만, 실제로는 전부 "나중에 진짜 앱(MainWorldV3 재배선/제품화)을 만들 때 시작점에서 다시 훑어봐야 할 참고 메모"다. 그 라운드가 오기 전까지는 굳이 진행 상황을 추적하거나 독촉할 대상이 아니다.

## 알려진 이슈 — 다음 작업 후보

현재 렌더링되는 `src/features/main-v3/MainWorldV3.tsx`는 Firebase/진행률/콘텐츠가 연결 안 된 정적 셸이다. **이건 버그가 아니라 의도된 설계다** — "나중에 이걸 만들 거예요"를 보여주는 비전/피칭 화면으로, 처음부터 기능 연결 없이 만들어졌다 (개발자 확인, 2026-08-10).

실제 기능 구현은 `LegacyGooglerApp.tsx`에 있으며 현재 어디서도 렌더링되지 않는 고아 코드다 (비테스트 코드의 84% 추정, 리뷰 시점 기준 — 재확인 필요).

## 나머지 outdated 패키지 정리 (2026-08-25)

`npm outdated`에 남아있던 6개를 검토 — 3개는 그대로 올리고, 3개는 각자 다른 진짜 이유로 보류. **이건 "밀린 일"이 아니라 각 패키지가 안정되거나 이 컴포넌트를 손볼 때 다시 검토할 참고 메모다:**

- **올린 것**: `@testing-library/jest-dom` 6→7, `lucide-react` 0.468→1.34 — 둘 다 코드 변경 없이 그대로 통과, 시각 회귀 20/20 확인(커밋 `0536b59`).
- **보류: `eslint` 9→10 + `eslint-plugin-react-hooks` 5→7`** — 이 둘은 따로 뗄 수 없다(hooks 플러그인이 eslint 10을 지원하는 버전 자체가 새 엄격 규칙까지 같이 딸려 나옴). 새 규칙(`set-state-in-effect`, `refs`)이 `MainWorldV3.tsx` 5곳에 걸리는데, 전부 이미 잘 동작하는 기존 패턴이라 "버전 올리기"가 아니라 "이 취약한 컴포넌트를 리팩터링하기"가 되어버림 — 재배선 라운드에서 그 컴포넌트를 어차피 다시 만질 때 같이 검토.
- **보류: `jsdom` 25→30** — 로컬에서 재현: `MainWorldV3.test.tsx`의 씬 전환 테스트 2개가 `data-transition="loading"`에서 멈춘 채 결정적으로 실패함(jsdom을 25로만 되돌리면 통과 — 원인 확정). React 19가 이미 한 번 노출시킨 것과 같은 계열의 타이밍 취약성(`_docs/CHANGELOG.md`의 "90점대 진입 4건" → React 19 항목 참고)을 jsdom 30이 한 번 더 노출시킨 것으로 보임. 컴포넌트를 실제로 손봐야 안전하게 고칠 수 있어서 별도 조사 대상으로 남겨둠.
- **보류: `typescript` 5→7** — 사용자 결정(2026-08-25): 일반적인 메이저 버전이 아니라 tsc를 통째로 Go로 새로 짠 네이티브 컴파일러 전환(6.x 정식 출시 없이 바로 7.0)이라 아직 생태계가 덜 다져졌다고 판단, 안정화되면 그때 다시 검토하기로 함.
- **2026-09-02 추가로 올린 것(8개, 전부 차단 사유 없던 것들)**: `@sentry/react`(10.71→10.73), `@testing-library/react`(16.3.2→16.3.3), `@vitejs/plugin-react`(6.1.0→6.1.1), `firebase-tools`(15.28.1→15.28.2), `lucide-react`(1.34→1.38), `typescript-eslint`(8.65→8.69), `eslint-plugin-react-refresh`(0.4→0.5, 기존 semver 범위 밖이라 range 자체를 올림), `globals`(15→17, 마찬가지로 range를 올림 — `globals.browser`/`globals.node`만 쓰는 단순 사용이라 메이저 점프여도 위험 낮다고 판단). typecheck/lint/test/build 전부 재확인 후 반영. eslint/jsdom/typescript 메이저 3건은 이번에도 그대로 보류.
3. **Sentry 에러 모니터링** — 완료·배포됨. Sentry 프로젝트 "Be a Googler"(조직: 817beatles 개인 계정, codyssey와 별개 프로젝트). `src/main.tsx`에서 `import.meta.env.PROD`일 때만 `Sentry.init()` 실행(로컬 개발/테스트 중엔 잡음 안 남), `<Sentry.ErrorBoundary>`로 `<App />` 감싸서 렌더 크래시 시 한국어 폴백 문구 표시. DSN(`https://bb25f9469e6a53b7fb3b8c4dbaac0965@o4511966927912960.ingest.us.sentry.io/4511966996267008`)은 GitHub secret이 아니라 소스에 그대로 하드코딩 — Firebase API 키와 달리 Sentry는 DSN을 "전송 전용 공개 주소"로 문서화해 클라이언트 코드 노출이 안전하다고 명시함. 로컬 프로덕션 빌드에서 강제로 에러를 던져 실제로 Sentry ingest 엔드포인트로 전송되는 것까지 확인 후 배포(커밋 `5266e73`).
4. **개인정보처리방침 페이지** — 완료. `public/privacy.html`, 라이브: `https://edutogether.github.io/googler/privacy.html`.

## 재배선 관련 대표 결정 사항 (2026-08-26 확정 — 결정만 남겨둠, 재배선 자체는 아직 착수 안 함)

2026-08-26 `googler-freeze-20260826` 정밀감사(Sonnet+Opus 역할분리, COMMON_STANDARDS.md §7) 후 (B) 트랙(원래 계획한 전체 제품 기준)에서 "대표 선택이 필요한 것"으로 올라온 3건에 대해 대표님이 결정했다. 재배선 라운드을 시작하지 않은 지금은 실행할 게 없는 결정이지만, 나중에 재배선에 착수할 때 이 결정을 그대로 따른다 — 그때 가서 다시 논의하지 않는다.

1. **재배선 착수 시점**: 아직 미정, 대략 2026년 9월 이후로 예상.
2. **랭킹 공개 범위**: **로그인 참가자 한정**으로 결정(전체공개 아님). 재배선 시 `firestore.rules`의 `rankings` 읽기 규칙을 `allow read: if true`가 아니라 인증된 사용자로 제한해야 하고, `ProfileEditor.tsx` 등 화면에도 "로그인 참가자에게만 공개됩니다" 같은 고지가 필요하다.
3. **예산 관리 방향**: 예산 초과 시 서비스를 강제 차단하지 않는다(학습이 막히면 안 되므로) — 대신 **무한 읽기/쓰기 같은 남용 패턴을 막는 레이트리밋**으로 애초에 비용이 커지지 않도록 설계한다. "느긋하게 자기 학습을 진행하는" 정상 사용 패턴을 전제로 설계할 것 — 정상 사용자를 막을 정도로 과하게 빡빡한 제한은 피한다. (참고: 감사에서 나온 `firebaseServices.ts`의 랭킹 구독에 `orderBy`/`limit` 없는 문제가 이 방향과 직결된다 — 재배선 시 그 수정이 곧 이 레이트리밋 설계의 일부다.)

## 개인정보처리방침 §30 항목 — 추가 안 함으로 종결 (2026-08-27 확정, 재논의 금지)

2026-08-26 정밀 재감사에서 "개인정보처리방침에 개인정보보호법 §30 항목(개인정보 보호책임자 성명·연락처, 권익침해 구제방법 등)을 추가할지"가 대표 선택 필요 항목으로 올라갔다. 대표님 판단: **"전시용 목업이야, 대기업 글로벌 서비스 아니야"** — 이 앱의 실제 규모(로그인·회원가입 없음, 이용자가 직접 입력하는 개인정보 수집 자체가 없음, 전시용 정적 셸)에 §30이 요구하는 수준의 형식적 고지 체계가 어울리지 않는다는 판단으로 **추가하지 않는 것으로 종결**한다. 다음 감사에서 같은 항목을 다시 "대표 선택 필요"로 올리지 말 것 — 이미 결론 난 사안이다.

## 대표와의 소통 경로 (2026-08-26 확정 — 반드시 지킬 것)
이 세션은 대표와 직접 대화를 시작하지 않는다. 진행상황 공유·질문·의사결정 요청은 전부 **팀장(D:\Projects 최상위 세션, "Project Engineering")을 거쳐서만** 한다 — 대표가 이 세션 창을 직접 열어서 먼저 말을 걸어온 경우에만 그 건에 한해 답한다(최상위 CLAUDE.md "조직 구조" 섹션 참고). 팀장에게서 온 메시지("Project Engineering의 메시지")는 곧 대표의 지시가 전달된 것이므로 별도로 대표에게 재확인하지 말고 그대로 실행한다.
