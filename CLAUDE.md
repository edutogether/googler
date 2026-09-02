# CLAUDE.md — googler (Be a Googler)

Google Educator 인증 학습용 20일 60미션 동료학습 앱 (React/TS/Vite). 상위 원칙은 [D:\Projects\CLAUDE.md](../../CLAUDE.md) 상속 — 여기는 이 앱 전용 상태/이슈만 기록한다.

## LOCKED — 재논의·임의 수정 금지 (이미 확정된 결정, 본문에 근거 상세)
- `MainWorldV3`가 Firebase/진행률/콘텐츠와 연결 안 된 것은 버그가 아니라 의도된 설계(전시용 비전 화면, 개발자 확인 2026-08-10) — "제품화(재배선) 라운드를 위한 참고 메모" 섹션 참고.
- BGM이 매 방문 초기화되는 것은 공용 전시 키오스크 특성상 확정된 설계 — 재배선 전까지 유지.
- `eslint`(9→10)/`jsdom`(25→30)/`typescript`(5→7) 업그레이드는 각각 구체적 이유로 보류 — "나머지 outdated 패키지 정리" 섹션 참고.
- 재배선(MainWorldV3↔LegacyGooglerApp 연결)은 전시 라운드 범위 밖 — 하지 않는다.
- 랭킹 공개 범위는 로그인 참가자 한정(전체공개 아님), 예산 관리는 강제 차단 대신 레이트리밋 — "재배선 관련 대표 결정 사항" 섹션 참고.

## 현재 상태 (2026-09-02 기준)
- 브랜치: `main` (배포 브랜치이자 작업 브랜치)
- **배포처: Firebase Hosting** — 라이브 URL `https://g00gler.web.app/` (2026-09-02 GitHub Pages에서 이관, "Firebase Hosting 이관" 섹션 참고). GitHub Pages 배포는 폐기했다(`deploy-pages.yml` 삭제).
- 2026-08-10 외부 리뷰: `docs/EXTERNAL_HEALTH_REVIEW_20260810.md`

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
  - App Check 등록 완료(reCAPTCHA v3, 도메인 `edutogether.github.io`), **Cloud Firestore + Authentication 두 API 모두 Enforce 켜짐(2026-08-23)**. 최신 Firebase 콘솔은 앱 단위가 아니라 API 단위로 Enforce를 건다 — App Check → APIs 탭에서 각 항목을 켠 것. 이유: 클라이언트 코드가 Firebase를 안 부르더라도 Firestore/Auth 프로젝트 자체는 인터넷에 살아있어서, 프로젝트 ID만 알면 REST API로 직접 두드릴 수 있음 — App Check가 그 뒷문을 막는 유일한 방어선. **미해결 메모(2026-09-02)**: App Check reCAPTCHA v3 키에 등록된 도메인이 여전히 `edutogether.github.io` 하나뿐이다 — 라이브 오리진이 `g00gler.web.app`으로 바뀌었지만, 클라이언트 App Check 통합 코드가 아직 0줄(재배선 전)이라 지금은 영향 없다. **재배선 착수 시 반드시 `g00gler.web.app`을 App Check 도메인에 추가할 것.**

## 전시 프리즈 — 복구 지점 (최신: 2026-09-02)

**태그 `googler-freeze-20260902-2`** (문서 자기참조 특성상 여기 적는 커밋 해시가 태그 발행 순간의 정확한 HEAD와 한두 커밋 어긋날 수 있다 — 정확한 대상은 `git rev-parse googler-freeze-20260902-2`로 항상 확인 가능하니 그걸 신뢰할 것) = 최신 검증 완료 시점. Firebase Hosting 이관(`googler-freeze-20260902`)에 이어 같은 날 진행된 §7 종합감사(Sonnet+Opus 역할분리) 수정분까지 포함 — 자세한 내용은 아래 "2026-09-02 종합감사(§7)" 섹션 참고. `npm run check`(typecheck/lint/test/build) + `npm run rules:test`(에뮬레이터) 전부 통과 확인.

**이 섹션은 다음 정밀감사 라운드마다 반드시 최신 태그로 갱신할 것 — 낡은 채로 방치되면 실제 장애 시 이 문서를 그대로 따르는 것 자체가 사고 원인이 된다**(2026-08-26 정밀 재감사에서 실제로 35커밋 낡은 채 방치돼 있던 것이 발견된 전례, 그리고 2026-09-02 Opus 감사에서 이 섹션의 복구 명령이 `googler-freeze-20260826-3`을 가리킨 채 한 라운드 낡아있던 게 다시 발견된 전례 — 두 번째 사고는 태그를 새로 찍고도 아래 복구 명령 줄을 안 고치면 무의미하다는 걸 보여준다. 태그를 찍고 문서를 고친 직후에도 `git log --oneline -5`로 다시 한번 최신 여부를 확인하는 습관이 필요하다).

이전 지점들 — `googler-freeze-20260902`, `googler-freeze-20260826-3`(`edbd389`), `googler-freeze-20260826-2`(`36bae4f`), `googler-freeze-20260826`(`b74face`), `googler-exhibition-freeze-2026-08-17`(`e936bfe`), `googler-exhibition-freeze-2026-08-14`(`5413b7c`), `googler-exhibition-freeze-2026-08-13`(`990046e`) — 도 그대로 보존돼 있다. 더 이전 상태로 돌아가야 할 특수한 경우에만 사용. **주의**: `googler-freeze-20260902` 이전 태그로 복구하면 Firebase Hosting 이관 전체가 되돌아가 GitHub Pages 시절 상태로 돌아간다는 뜻이다 — GitHub Pages 배포 자체는 이미 폐기됐으니 그 상태로 되돌리는 건 특히 신중해야 한다.

이후 수정으로 뭔가 망가졌을 때 복구 절차 (디버깅하지 말고 바로 복원):

```bash
git checkout googler-freeze-20260902-2 -- .
```

그 다음 변경사항 확인 후 커밋·푸시하면 Firebase Hosting(`g00gler.web.app`)이 검증된 상태로 재배포된다.

**주의**: 이 저장소는 여러 세션에서 동시에 작업될 수 있다. 프리즈 태그를 새로 찍기 전에 항상 `git log --oneline -5`로 HEAD가 예상한 지점인지 먼저 확인할 것 — 마지막으로 내가 만든 커밋이 아닐 수 있다.

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

- 재연결에 필요한 구체 항목 체크리스트: `D:\Projects\_audits\20260817\googler.md`
- XP/레벨/배지 개념 자체가 `domain/progress.ts`에 없어서, 단순 "재배선"이 아니라 도메인 로직을 새로 설계해야 하는 규모다 (기존에 알려졌던 것보다 심각하다는 게 2026-08-17 재검증 결과).

**2026-08-23 재감사 후속**: Firebase가 실제로 켜진 걸 확인해 프로덕션 기준으로 재평가 → 평균 53.7점🔴로 예고대로 돌아옴. 다만 번들 스캔으로 재확인한 결과 급한 실사용자 위험은 아니었음(위 "Firebase 프로젝트" 섹션 참고). 즉시 조치 5건 중 랭킹 규칙 필드검증 추가 + CI 규칙 자동테스트 연결 2건은 당일 완료. App Check 강제 적용은 여전히 의도적 보류(재배선 착수 전 반드시 켤 것), 예산알림의 "알림만이고 차단 아님" 한계는 위에 명시해둠.

**2026-09-02 종합감사 후속으로 someday 7건 중 3건 처리, 나머지는 재배선과 한 묶음으로 확정 유지**(자세한 내용은 아래 "Firebase Hosting 이관" 섹션):
- ✅ **체크박스 디바운스** — 처리 완료(`LegacyGooglerApp.tsx`, 600ms).
- 🟡 **랭킹 구독 `orderBy`+`limit`** — `limit(200)`만 추가, `orderBy`는 의도적으로 안 함(`scoreL1`/`scoreL2`가 선택 필드라 orderBy를 걸면 아직 미션을 안 끝낸 신규 참가자가 쿼리 결과에서 통째로 빠짐 — 진짜 순위 정렬은 total-score 필드를 새로 설계해야 하는 문제라 XP/레벨 도메인 재설계와 한 묶음으로 재배선 라운드에 남김).
- ⏸ **나머지 4건(저장 실패해도 성공 UI가 뜨는 문제, 익명계정 삭제 후 고아 문서 정리 불가, 공개 랭킹 고지 없음, `execCommand('copy')` deprecated API)** — 여전히 미처리, `LegacyGooglerApp.tsx` 재배선과 한 묶음으로 처리하는 게 맞다는 판단 그대로 유지(저장 실패 UX는 재배선 때 실제 흐름을 다시 설계해야 하고, 공개 랭킹 고지는 위 "재배선 관련 대표 결정 사항" 2번의 로그인 참가자 한정 결정과 함께 반영될 것).

## "90점대 진입 4건" 진행 상황 (2026-08-23~)

사용자가 4건 모두 동시 진행을 명시적으로 승인("4건 다 지금 진행", 의존성 업그레이드는 원래 이번 라운드엔 급하지 않다고 권고했으나 사용자가 진행 결정).

1. **App Check Enforce (Authentication)** — 완료. Cloud Firestore에 이어 Authentication API도 Enforce 켜짐(위 Firebase 섹션 참고).
2. **의존성 메이저 업그레이드 (React 18→19, Vite 6→8)** — 완료·배포됨.
   - React 19: `useRef<number>()`처럼 초기값 없는 호출을 타입이 더 이상 허용하지 않아 `MainWorldV3.tsx`의 두 곳을 `useRef<number | undefined>(undefined)`로 수정(커밋 `9c65f4f`).
   - 이 과정에서 로컬(Windows)에선 통과하지만 GitHub Actions(Ubuntu) CI에서는 결정적으로 실패하는 테스트 하나 발견 — "다음 씬으로 전환 후 이전 '준비중' 카드가 사라졌는지" 확인하는 부분이 `activeNav` 변경에 반응하는 `useEffect`로 비동기 처리되는데, 테스트는 이걸 동기로 가정하고 있었음. React 19의 effect 스케줄링이 CI 환경에서 이 경쟁 조건을 노출시킴. `expect(...)`를 `await waitFor(...)`로 감싸 테스트가 실제 비동기 흐름을 올바르게 기다리도록 수정(컴포넌트 코드는 안 건드림, 커밋 `b193d57`).
   - Vite 6→8: vitest 2.x와 `@vitejs/plugin-react` 4.x가 각각 Vite 5-7까지만 지원해서 Vite 8과 함께 필수로 묶어 올림 — `vite@8.2.2`, `@vitejs/plugin-react@6.1.0`, `vitest@4.1.11`. 설정 변경 없이 그대로 동작. Vite 8의 기본 CSS 압축기가 달라져 산출물 바이트가 달라졌지만(홈 화면 0.040% 차이, 허용범위 내) 시각 회귀 20/20 통과로 실제 렌더링엔 변화 없음 확인(커밋 `d9df2b1`).
   - 참고: `eslint`(9→10), `typescript`(5→7), `jsdom`(25→30) 등은 이번엔 건드리지 않음 — 승인 범위(React/Vite) 밖이라 별도 논의 없이 끼워넣지 않았음.

3. **Tailwind CSS 3→4** (2026-08-25, 별도 승인 후 진행) — 완료·배포됨(커밋 `b3ef2e9`). 기존 설정이 테마 커스터마이징·플러그인 없이 최소 구성이라 마이그레이션이 단순했음: `src/index.css`의 `@tailwind base/components/utilities` 3줄이 `@import "tailwindcss";` 한 줄로 축약, PostCSS 플러그인이 `tailwindcss` → `@tailwindcss/postcss`로 교체(v4가 벤더 프리픽스를 자체 처리해서 `autoprefixer`는 제거), `tailwind.config.js`는 기존 content 글롭이 v4의 기본 자동 감지 범위와 동일해서 삭제. 시각 회귀 20/20 통과(Vite 8 업그레이드 때부터 있던 홈 화면 0.040% 오차 외 신규 차이 없음)로 실제 렌더링 변화 없음 확인.

## 나머지 outdated 패키지 정리 (2026-08-25)

`npm outdated`에 남아있던 6개를 검토 — 3개는 그대로 올리고, 3개는 각자 다른 진짜 이유로 보류. **이건 "밀린 일"이 아니라 각 패키지가 안정되거나 이 컴포넌트를 손볼 때 다시 검토할 참고 메모다:**

- **올린 것**: `@testing-library/jest-dom` 6→7, `lucide-react` 0.468→1.34 — 둘 다 코드 변경 없이 그대로 통과, 시각 회귀 20/20 확인(커밋 `0536b59`).
- **보류: `eslint` 9→10 + `eslint-plugin-react-hooks` 5→7`** — 이 둘은 따로 뗄 수 없다(hooks 플러그인이 eslint 10을 지원하는 버전 자체가 새 엄격 규칙까지 같이 딸려 나옴). 새 규칙(`set-state-in-effect`, `refs`)이 `MainWorldV3.tsx` 5곳에 걸리는데, 전부 이미 잘 동작하는 기존 패턴이라 "버전 올리기"가 아니라 "이 취약한 컴포넌트를 리팩터링하기"가 되어버림 — 재배선 라운드에서 그 컴포넌트를 어차피 다시 만질 때 같이 검토.
- **보류: `jsdom` 25→30** — 로컬에서 재현: `MainWorldV3.test.tsx`의 씬 전환 테스트 2개가 `data-transition="loading"`에서 멈춘 채 결정적으로 실패함(jsdom을 25로만 되돌리면 통과 — 원인 확정). React 19가 이미 한 번 노출시킨 것과 같은 계열의 타이밍 취약성(위 "React 19" 항목 참고)을 jsdom 30이 한 번 더 노출시킨 것으로 보임. 컴포넌트를 실제로 손봐야 안전하게 고칠 수 있어서 별도 조사 대상으로 남겨둠.
- **보류: `typescript` 5→7** — 사용자 결정(2026-08-25): 일반적인 메이저 버전이 아니라 tsc를 통째로 Go로 새로 짠 네이티브 컴파일러 전환(6.x 정식 출시 없이 바로 7.0)이라 아직 생태계가 덜 다져졌다고 판단, 안정화되면 그때 다시 검토하기로 함.
- **2026-09-02 추가로 올린 것(8개, 전부 차단 사유 없던 것들)**: `@sentry/react`(10.71→10.73), `@testing-library/react`(16.3.2→16.3.3), `@vitejs/plugin-react`(6.1.0→6.1.1), `firebase-tools`(15.28.1→15.28.2), `lucide-react`(1.34→1.38), `typescript-eslint`(8.65→8.69), `eslint-plugin-react-refresh`(0.4→0.5, 기존 semver 범위 밖이라 range 자체를 올림), `globals`(15→17, 마찬가지로 range를 올림 — `globals.browser`/`globals.node`만 쓰는 단순 사용이라 메이저 점프여도 위험 낮다고 판단). typecheck/lint/test/build 전부 재확인 후 반영. eslint/jsdom/typescript 메이저 3건은 이번에도 그대로 보류.
3. **Sentry 에러 모니터링** — 완료·배포됨. Sentry 프로젝트 "Be a Googler"(조직: 817beatles 개인 계정, codyssey와 별개 프로젝트). `src/main.tsx`에서 `import.meta.env.PROD`일 때만 `Sentry.init()` 실행(로컬 개발/테스트 중엔 잡음 안 남), `<Sentry.ErrorBoundary>`로 `<App />` 감싸서 렌더 크래시 시 한국어 폴백 문구 표시. DSN(`https://bb25f9469e6a53b7fb3b8c4dbaac0965@o4511966927912960.ingest.us.sentry.io/4511966996267008`)은 GitHub secret이 아니라 소스에 그대로 하드코딩 — Firebase API 키와 달리 Sentry는 DSN을 "전송 전용 공개 주소"로 문서화해 클라이언트 코드 노출이 안전하다고 명시함. 로컬 프로덕션 빌드에서 강제로 에러를 던져 실제로 Sentry ingest 엔드포인트로 전송되는 것까지 확인 후 배포(커밋 `5266e73`).
4. **개인정보처리방침 페이지** — 완료. `public/privacy.html`, 라이브: `https://edutogether.github.io/googler/privacy.html`.

## 크로스세션 라이브 감사 12건 수정 (2026-08-25)

배지 이미지 5.2MB→31KB 교체, 미참조 죽은 에셋 26MB 삭제, 오디오 프리로드 완화, Pretendard 폰트 self-host(그동안 선언만 있고 실제 로드 안 되고 있었음), 개인정보처리방침 실제 상태로 재작성+앱 내 링크 추가, 가이드 말풍선 무한 낭독 접근성 버그 수정, Sentry 이벤트 상한, AudioContext 재사용, 리사이즈 디바운스, 카카오 썸네일 압축(3.87MB→421KB), 키보드로 "준비중" 카드 접근 가능하게 — 전부 완료·배포(커밋 `b11ceff`). 이어서 홈 화면 전용 로고 마크가 다른 화면에도 겹쳐 보이던 버그(`showsMainWorld` 조건 누락)도 사용자가 스크린샷으로 직접 짚어줘서 발견·수정(커밋 `c2cf00f`).

**BGM 매 방문 초기화 — 현행 유지로 확정(2026-08-25)**: `useWorldAudio`가 마운트마다 `localStorage.removeItem(MAIN_V3_BGM_STORAGE_KEY)`로 저장된 설정을 지우고 무조건 켜짐으로 시작하는 것(MainWorldV3.tsx `useWorldAudio` 내부)은 **버그가 아니라 확정된 설계 결정**이다. 크로스세션 감사가 "교실 30대 동시접속 맥락에서 거슬릴 수 있다"고 지적했지만, 사용자가 직접 판단한 실제 이유: **이 화면은 하루 동안 여러 방문객이 거쳐가는 공용 전시 키오스크다.** 만약 마지막 상태를 기억하도록 바꾸면(옵션 B), 그날 첫 방문객이 BGM을 끄는 순간 그 뒤로 오는 모든 방문객이 음악 없이 보게 되어 몰입감이 떨어진다 — "같은 사람이 반복 방문"하는 맥락이 아니라 "하루 동안 다른 사람들이 이어서 방문"하는 맥락이라 현행 방식(매번 켜짐으로 리셋)이 맞다. **재배선 라운드에서 실제 사용 맥락이 바뀌지 않는 한 이 동작은 그대로 유지할 것.**

## 크로스세션 라이브 재감사 후속 6건 (2026-08-25)

앞 라운드 12건 중 실측 확인된 10건 재확인 + 이번에 새로 나온 항목 정리 후 전부 완료·배포(커밋 `742eb91`):

- **소스맵 + Sentry release**: `vite.config.ts`에 `build.sourcemap: true` 추가. GitHub Pages가 `dist/`를 통째로 공개 서빙하기 때문에, 업로드용 인증 토큰이나 CI 파이프라인 없이도 Sentry가 `sourceMappingURL` 주석을 보고 직접 맵을 가져가 심볼화한다. `Sentry.init`엔 `release: import.meta.env.VITE_COMMIT_SHA`를 추가하고, `deploy-pages.yml`의 build 스텝에 `VITE_COMMIT_SHA: ${{ github.sha }}`를 주입해 실제 배포 커밋과 값이 일치하도록 함.
- **배지 나머지 3장(emerald/violet/coral) webp 변환**: 107~115KB PNG 3장(합 333KB) → 11~15KB webp(합 37KB). 형제 배지들과 동일한 ffmpeg 파이프라인.
- **`sendDefaultPii: false`** 명시(SDK 기본값에 의존하지 않도록).
- **서브페이지 씬 프리로드를 hover/실제 이동 시점으로 지연**: 기존엔 홈 진입 즉시 퀘스트/플래너/도감/커뮤니티 4개 씬(약 1.5~2MB)을 무조건 미리 받았음. 이제 각 내비 버튼에 `onMouseEnter`/`onFocus`로 해당 씬만 프리로드하고, 터치처럼 hover가 없는 입력을 위해 `activateNavigation` 시작 시점에도 한 번 더 걸어둠(전환 애니메이션의 640ms cover 구간 안에 끝남). 전환 배경(loading-desktop/mobile.webp)은 어떤 목적지든 항상 필요해서 그대로 즉시 로드 유지.
- **CSP 메타 태그 추가**: 이 작업을 하려면 `index.html`의 인라인 파비콘 토글 스크립트를 `public/favicon-toggle.js`로 먼저 분리해야 했음 — 안 그러면 엄격한 `script-src 'self'`가 그 스크립트를 막거나, `'unsafe-inline'`을 넣어야 해서 CSP의 의미가 크게 줄어들었을 것. `style-src`는 여전히 `'unsafe-inline'`이 필요함(React 인라인 `style` prop + 패럴랙스 효과의 `style.setProperty` 직접 호출) — 이건 이 컴포넌트가 만들어진 방식에서 오는 실제 트레이드오프지, 놓친 게 아님. `connect-src`엔 Sentry ingest 호스트만 명시. **`frame-ancestors`/`report-uri`/`sandbox`는 의도적으로 뺐음** — GitHub Pages는 커스텀 HTTP 헤더를 못 걸고, 이 세 지시어는 `<meta>` 태그로 걸면 브라우저가 조용히 무시한다(실제 HTTP 헤더로만 동작) — 넣어봐야 가짜 안심만 줄 뿐이라 뺀 것.
- **`privacy.html`의 `robots noindex` 제거**: 이제 앱 안에서 링크가 걸려있어서(전 라운드에 추가) 검색엔진 노출을 막아둘 이유가 없어짐.

실측 검증: typecheck/lint/test(25/25, Firestore 규칙 포함)/build 전부 통과, 시각 회귀 20/20 완전 일치(0.000%). 실제 브라우저로 소스맵·release SHA 번들 포함 확인, 배지 6개 전부 webp로 로드, CSP 켠 채로 콘솔 에러 0, nav 버튼에 마우스만 올려도 해당 씬 하나만 정확히 요청되는 것, 클릭 내비게이션 정상 동작까지 확인.

**7순위 목록의 6번(가동 감시, UptimeRobot 등록)은 외부 계정 가입이 필요해 대표 본인만 할 수 있는 항목이라 코드/설정 작업은 하지 않음** — 안내만 별도로 전달.

## Opus 크로스체크 후속 2건 (2026-08-25)

- **Sentry 기본 세션 트래킹 끔**: `@sentry/react` 10.x는 `BrowserSession` 통합이 기본 포함돼있어, 에러 없이 정상 이용해도 idle/tab-hide 시점에 "세션" 비콘을 자동 전송한다(`privacy.html`의 "정상 이용 중엔 아무 정보도 전송 안 됨" 문구를 거짓으로 만듦). 지적받은 수정법(`autoSessionTracking: false`)은 `node_modules` 소스를 직접 확인해보니 이 SDK 버전엔 존재하지 않는 옵션이라 **그대로 안 믿고** `integrations: (defaults) => defaults.filter(i => i.name !== 'BrowserSession')` 방식으로 수정. 검증 도구 관련 발견: MCP Browser pane의 `read_network_requests`가 일부 cross-origin fetch를 못 잡는 사각지대가 있음을 확인(수동 fetch는 실제 200/400 응답을 받아오는데도 로그엔 안 잡힘) — 이후 Sentry 관련 네트워크 검증은 반드시 Playwright 스크립트(`playwright-core` 직접 실행)로 할 것, 이 MCP 도구의 네트워크 로그만으로 "요청이 없다"고 결론 내리지 말 것.
- **Sentry 이벤트 상한이 새로고침마다 리셋되던 문제 수정**: 기존엔 모듈 레벨 변수라 새로고침하면 카운트가 0으로 돌아갔음 — 전시 키오스크에서 같은 렌더버그로 새로고침을 반복하면(수백 번) 월 할당량을 태울 수 있었음. `localStorage`에 날짜별로 저장하는 방식으로 교체해 하루 단위로 실제로 상한이 유지되도록 함(커밋 `60cc6a7`).

실측 검증(Playwright, 실제 헤드리스 Chrome): `visibilitychange`를 hidden으로 강제 발생시켜도 Sentry 요청 0건(세션 트래킹 완전히 꺼짐 확인), 실제로 에러를 던지면 정확히 1건 전송(캡처 기능은 정상), CSP 위반 0건.

## 재배선 관련 대표 결정 사항 (2026-08-26 확정 — 결정만 남겨둠, 재배선 자체는 아직 착수 안 함)

2026-08-26 `googler-freeze-20260826` 정밀감사(Sonnet+Opus 역할분리, COMMON_STANDARDS.md §7) 후 (B) 트랙(원래 계획한 전체 제품 기준)에서 "대표 선택이 필요한 것"으로 올라온 3건에 대해 대표님이 결정했다. 재배선 라운드을 시작하지 않은 지금은 실행할 게 없는 결정이지만, 나중에 재배선에 착수할 때 이 결정을 그대로 따른다 — 그때 가서 다시 논의하지 않는다.

1. **재배선 착수 시점**: 아직 미정, 대략 2026년 9월 이후로 예상.
2. **랭킹 공개 범위**: **로그인 참가자 한정**으로 결정(전체공개 아님). 재배선 시 `firestore.rules`의 `rankings` 읽기 규칙을 `allow read: if true`가 아니라 인증된 사용자로 제한해야 하고, `ProfileEditor.tsx` 등 화면에도 "로그인 참가자에게만 공개됩니다" 같은 고지가 필요하다.
3. **예산 관리 방향**: 예산 초과 시 서비스를 강제 차단하지 않는다(학습이 막히면 안 되므로) — 대신 **무한 읽기/쓰기 같은 남용 패턴을 막는 레이트리밋**으로 애초에 비용이 커지지 않도록 설계한다. "느긋하게 자기 학습을 진행하는" 정상 사용 패턴을 전제로 설계할 것 — 정상 사용자를 막을 정도로 과하게 빡빡한 제한은 피한다. (참고: 감사에서 나온 `firebaseServices.ts`의 랭킹 구독에 `orderBy`/`limit` 없는 문제가 이 방향과 직결된다 — 재배선 시 그 수정이 곧 이 레이트리밋 설계의 일부다.)

## 개인정보처리방침 §30 항목 — 추가 안 함으로 종결 (2026-08-27 확정, 재논의 금지)

2026-08-26 정밀 재감사에서 "개인정보처리방침에 개인정보보호법 §30 항목(개인정보 보호책임자 성명·연락처, 권익침해 구제방법 등)을 추가할지"가 대표 선택 필요 항목으로 올라갔다. 대표님 판단: **"전시용 목업이야, 대기업 글로벌 서비스 아니야"** — 이 앱의 실제 규모(로그인·회원가입 없음, 이용자가 직접 입력하는 개인정보 수집 자체가 없음, 전시용 정적 셸)에 §30이 요구하는 수준의 형식적 고지 체계가 어울리지 않는다는 판단으로 **추가하지 않는 것으로 종결**한다. 다음 감사에서 같은 항목을 다시 "대표 선택 필요"로 올리지 말 것 — 이미 결론 난 사안이다.

## Firebase Hosting 이관 (2026-09-02 완료)

대표님 승인으로 GitHub Pages → Firebase Hosting 이관 진행. **라이브 URL: `https://g00gler.web.app/`** — 요청했던 사이트 ID `googler`는 프로젝트 ID(`be-a-g00gler`)를 만들 때와 같은 이유(상표 정책, "google" 문자열 금지)로 Firebase가 거부해서(`Invalid name: googler is invalid`) 같은 방식으로 `g00gler`를 대신 썼다.

- **CSP를 HTML meta 태그에서 실제 HTTP 헤더로 이동** — `firebase.json`의 `hosting.headers`에 CSP·X-Frame-Options·X-Content-Type-Options·Referrer-Policy·Permissions-Policy를 real header로 명시. GitHub Pages에선 못 걸던 `frame-ancestors 'none'`(클릭재킹 방어)이 이제 실제로 걸린다.
- **캐시 헤더**: Vite가 콘텐츠 해시를 붙이는 `assets/**`만 1년 immutable로 걸었다(`public/`의 BGM·webp 씬 이미지 등은 해시 없는 고정 파일명이라 여기에 긴 캐시를 걸면 나중에 그 파일을 다시 손봐도 방문자가 옛 버전을 오래 씀 — 위험 회피). `*.html`엔 no-cache를 걸었는데, **첫 배포 후 실측에서 `/`(루트) 요청엔 이 규칙이 안 먹는 걸 발견**했다 — Firebase Hosting의 헤더 매칭은 실제 요청 경로(`/`) 기준이라 `*.html` 글롭이 매칭 안 됨(서빙되는 파일이 `index.html`이라는 사실은 매칭에 반영 안 됨). `source: "/"` 규칙을 별도로 추가해서 해결, curl로 실제 헤더 재확인 완료(커밋 `943e927`).
- **GitHub Actions 배포 워크플로 첫 시도 실패 → 즉시 수정**: `firebase-hosting-merge.yml`에 Firestore 규칙·인덱스 CI 자동배포 스텝을 Hosting 배포보다 **앞에** 뒀다가, 그 스텝이 서비스계정 권한 부족(403)으로 실패하면서 뒤에 있던 진짜 중요한 Hosting 배포 스텝 자체가 스킵되는 사고가 있었다 — 즉 사이트가 배포 안 된 채로 워크플로만 초록불이 아니라는 걸 실측으로 확인하고 바로 순서를 바꿨다(Hosting 배포 먼저, Firestore 규칙/인덱스 배포는 뒤에 `continue-on-error: true`로). **이 순서(Hosting 배포 → 규칙/인덱스 배포 순, 후자는 continue-on-error)를 절대 바꾸지 말 것** — 반대로 하면 규칙 배포 하나 실패로 사이트 전체가 배포 안 되는 조용한 장애가 재발한다.
- **`FIREBASE_SERVICE_ACCOUNT_BE_A_G00GLER` GitHub secret**: 대표님이 `firebase init hosting:github`을 직접 실행해 등록. 이 서비스계정엔 기본적으로 Hosting 배포 권한만 있었고, Firestore 규칙/인덱스 배포엔 별도 IAM 권한(Firebase Rules Admin, Cloud Datastore Index Admin)이 필요해서 대표님이 GCP 콘솔에서 추가로 부여했다.
- **`.github/workflows/firebase-hosting-pull-request.yml` 신설** — PR 프리뷰 채널.
- **`firestore.indexes.json` 신설**(현재 빈 배열 — `firebaseServices.ts`의 랭킹 구독이 `limit()`만 쓰고 `orderBy` 없는 단순 쿼리라 복합 인덱스가 필요 없음, 실제로 필요해지면 그때 채운다).
- **`firebaseServices.ts`의 `appId` 상수를 `VITE_FIRESTORE_NAMESPACE` 환경변수로 오버라이드 가능하게** (기존 값이 기본값으로 유지되므로 지금 당장의 동작 변화는 없음).
- **`MainWorldV3` 훅 분해(`757986e`)로 새로 추출된 7개 훅**(`useWorldAudio`, `useSceneNavigation`, `useAnnouncements`, `useScenePreloader`, `useViewportBreakpoints`, `useDesktopGuideBubble`, `useParallaxTilt`)에 **단위테스트 37개 신규 작성** — 그전엔 `MainWorldV3.test.tsx` 통합테스트로만 간접 커버되고 있었다.
- **`privacy.html` 갱신** — Firebase Hosting을 새 처리자로 §3·§4에 명시(접속 IP 등 통상적 웹서버 로그), localStorage 저장 항목(sfx/bgm/에러상한 카운트) 고지 한 줄 추가.
- **`vite.config.ts`의 `base`를 `/googler/` → `/`로 변경** — Firebase Hosting은 루트 도메인으로 서빙하기 때문. `scripts/visual-regression.mjs`가 base 경로를 하드코딩하지 않고 `vite.config.ts`에서 직접 읽어오도록 고쳐서, 앞으로 base가 또 바뀌어도 이 검증 스크립트가 조용히 깨지는 일이 없게 했다.
- **해결됨(2026-09-02, 같은 날 후속)**: `.claude/settings.json`의 `"defaultMode": "bypassPermissions"`는 대표님이 이 세션 창에 직접 "진행해줘"라고 지시한 뒤 `.claude/settings.local.json`(gitignore됨)으로 옮기고 `git push`까지 완료했다 — COMMON_STANDARDS.md §9로 전 앱 공통 규칙이 됨(§9 섹션 참고: 팀장 경유 지시만으로는 항상 보류, 대표님 직접 확인 시에만 실행).
- 검증: `npm run check`(typecheck/lint/69개 테스트/build) 전부 통과, 실제 크롬 브라우저로 `g00gler.web.app` 접속(음소거 파라미터 `?qa-mute=1` 사용)해 홈·퀘스트 서브페이지 전환·콘솔 에러 0건·보안 헤더 실제 적용까지 확인.

**대표와의 소통 경로 관련 실전 사례 하나**: 이번 이관 중 `git push`(GitHub Actions를 실제로 트리거해 프로덕션 배포를 일으키는 행동) 승인을 놓고, 팀장 경유 크로스세션 메시지로 "대표님이 승인하셨다"는 전달이 여러 번 왔지만 이 세션은 계속 보류했다 — git push처럼 되돌리기 번거로운 배포 트리거 행동에 한해서는, 그 경로만으로는 "정말 대표님이 이번 건을 원하시는지" 이 세션 스스로 확인할 방법이 없었기 때문. 결국 대표님이 이 세션 창에 직접 들어와 "팀장의 말을 따르도록"이라고 확인해준 뒤에야 진행했다. **아래 "대표와의 소통 경로" 원칙(팀장 경유 지시 = 재확인 없이 실행) 자체는 유효하지만, git push나 이에 준하는 라이브 배포 트리거 행동만큼은 예외적으로 대표님의 직접 확인이 한 번은 필요하다는 게 이번에 실전으로 확인됐다** — 다만 그 확인이 한 번 이루어진 뒤로는(이번 세션 한정) 다시 재확인을 요구하지 않고 팀장 경유 지시를 그대로 따랐다.

## 2026-09-02 종합감사(§7) — Sonnet+Opus 독립 조사 후속

COMMON_STANDARDS.md §7 방식(Agent 도구 두 번 별도 호출, 서로 결과 미참조)으로 10개 항목 전부 독립 조사 후 발견된 결함을 같은 라운드에서 즉시 수정. 상세 점수·근거는 팀장에게 보낸 §6-1 형식 보고서 참고, 여기는 실제로 무엇을 고쳤는지만 기록한다.

**고침 (Sonnet 담당 4개 항목에서 발견):**
- `.claude/worktrees/`(격리 서브에이전트가 남긴 중첩 git 워크트리)가 `.gitignore`·`eslint.config.js` 양쪽에서 빠져 있어서 `npm run lint`/`npm run check`가 그 안의(스캔 시점 기준 구버전) 사본까지 같이 스캔해 가짜 lint 에러를 냈다 — 둘 다 무시 목록에 추가.
- `vite.config.ts`의 "dist/는 GitHub Pages에서 서빙된다"는 주석이 Firebase Hosting 이관 이후 그대로 남아있던 걸 정정.
- `src/data/firebase/firebaseServices.ts`: `signInAnonymously`가 실패해도 아무도 모르게 무시되던 것(`void signInAnonymously(auth)`)을 `.catch(console.error)`로 수정.
- `src/legacy/LegacyGooglerApp.tsx`: `handleSaveProfile`/`handlePassShare`/`persistProgress` 세 곳 모두 Firestore 저장 실패 시 콘솔에만 찍히고(또는 아무 표시도 없이) 성공한 것처럼 UI가 진행되던 문제 — 전부 `try/catch` + 사용자에게 보이는 토스트 메시지로 수정. 크로스세션 감사가 반복해서 지적했던 "저장 실패해도 성공 UI가 뜨는 문제"가 이걸로 해소됨.
- `lucide-react` 1.38→1.39 패치 업그레이드(보류 사유 없던 것).
- **테스트 커버리지**: `firebaseServices.ts`(실제 Firestore 호출 코드, 이전까지 테스트 0)에 6개, `LegacyGooglerApp.tsx`(336줄, 이전까지 테스트 0 — 저장소에서 가장 큰 미검증 파일이었음)에 4개 신규 테스트 작성 — 프로필 저장 성공/실패, 미션 체크 디바운스 저장 성공/실패 경로 전부 커버. `src/data/firebase/firebaseServices.test.ts`, `src/legacy/LegacyGooglerApp.test.tsx` 신규 파일.

**고침 (Opus 담당 6개 항목에서 발견, 코드/설정으로 가능한 것만):**
- `firestore.rules`: 랭킹 컬렉션 읽기를 `allow read: if true`(전체공개)에서 `allow read: if request.auth != null`(로그인 참가자 한정)으로 — CLAUDE.md에 이미 확정돼 있던 "재배선 관련 대표 결정 사항" 2번을 실제 규칙에 반영. 사용자 서브트리 규칙도 `{document=**}` 와일드카드(임의 문서/컬렉션 생성 허용)에서 실제로 쓰는 두 문서 경로(`profile/info`, `user_progress/gpass_data`)로 좁히고 각각 필드 화이트리스트·타입·길이 검증 추가. `firestore.rules.test.ts`에 회귀 테스트 4건 추가, 에뮬레이터로 8/8 통과 확인.
- `src/features/profile/ProfileEditor.tsx`: 닉네임 입력란 아래 "이 닉네임은 로그인한 참가자에게 공개되는 랭킹에 표시됩니다" 고지 추가.
- `src/data/createAppServices.ts`: Firebase 설정이 없거나 초기화가 실패하면 아무 신호 없이 preview 모드(세션 한정 저장)로 조용히 폴백하던 것에 `console.warn` 추가 — 시크릿 하나가 빠진 채 배포되는 사고가 나면 최소한 콘솔에는 남는다.
- `.github/workflows/firebase-hosting-merge.yml` / `firebase-hosting-pull-request.yml`: `FirebaseExtended/action-hosting-deploy@v0`(부동 태그, 서비스계정 시크릿을 넘기는 액션)를 실제 커밋 SHA로 고정. merge 워크플로에 `permissions: contents: read` 명시(기존엔 리포 기본 권한을 그대로 상속받고 있었음). 규칙/인덱스 배포 스텝의 서비스계정 임시파일 정리를 `rm -f` 마지막 줄 대신 `trap ... EXIT`로 바꿔서, 배포 실패 시에도(`set -e`로 스크립트가 중간에 끊겨도) 확실히 지워지게.
- `firebase.json`: CSP에 `report-uri`(Sentry 보안 리포트 엔드포인트) 추가 — 실제 HTTP 헤더로 CSP를 걸어둔 이후에도 위반이 발생하면 아무도 모르는 상태였음.
- 위 "미해결로 남은 것" → "해결됨"으로 갱신(`.claude/settings.json` bypassPermissions 이전, 이 라운드 착수 전에 이미 완료).

**2라운드 추가 수정(같은 날, 대표님이 "코드로 가능한 건 전부 100점으로" 지시한 후속):**
- `firebase.json`: `public/` 정적 자산 중 실제로 버전 관리되는 것만 골라 immutable 캐시 적용 — `visual-reset/*/*-v*-opt.webp` + `visual-reset/main/assets/*-v*-opt.webp`(파일명 자체에 버전 토큰이 박혀있는 씬/모바일 이미지 9개, 재인코딩할 때마다 새 파일명으로 나가는 게 기존 관행), `favicon/**` + `social/**`(index.html·favicon-toggle.js의 모든 참조가 이미 `?v=` 캐시버스팅 쿼리스트링을 달고 있음). 배지·로딩화면·메인 비주얼 등 버전 토큰이 없는 나머지 파일은 그대로 짧은 캐시 유지 — `minimatch`로 글롭 패턴이 실제 `dist/` 산출물과 정확히 일치하는지 검증 후 적용(오탐 0건 확인).
- **Opus의 확장성 X-2 finding 정정**: "데스크톱이 2560×1440 이미지를 그대로 받는다"는 지적이 있었는데, `ffmpeg`로 실제 배포 파일을 열어보니 파일명(`-2560x1440-`)과 달리 실제 인코딩 해상도는 이미 1672×941로 최적화돼 있었다(다른 씬 파일들도 동일). 즉 이 finding은 파일명을 실제 해상도로 오인한 오탐이었고, srcset/sizes 추가 작업은 필요 없다고 판단해 진행하지 않음.
- `.github/workflows/firebase-hosting-merge.yml`: Firestore 규칙/인덱스 배포가 `continue-on-error: true`라 실패해도 아무 신호가 없던 것 — 배포 스텝에 `id`를 붙이고, 실패 시(`outcome == 'failure'`) `::error::` 어노테이션 + `$GITHUB_STEP_SUMMARY`에 경고를 남기는 후속 스텝 추가(job 자체는 여전히 실패시키지 않음 — continue-on-error의 원래 목적 유지).
- **테스트 커버리지 나머지 전부**: `ExamPage`/`RetryPage`/`LeaderboardPage`(정렬·동점자 처리·빈 상태·본인 강조 로직 포함)/`MissionChecklist`/`LearningDayCard`/`DesktopProfileCluster`/`MiniVolumePanel`(rAF 트윈 애니메이션)/`mainWorldContent`/`uiSound`(공유 AudioContext 재사용·suspended 상태 재개) — 9개 파일 신규 테스트 24개 작성. 이제 저장소 전체에서 테스트 없는 파일은 순수 타입/데이터 정의뿐(의도적 생략).
- **Sentry 이벤트 상한 서버측 전체화는 재분류**: 처음엔 "코드로 가능"으로 분류했으나, 기기 간 카운터를 공유하려면 Firestore 등 공유 저장소가 필요하고 이는 `MainWorldV3`를 Firebase에 연결하는 셈이 되어 이번 라운드 LOCKED("재배선 범위 밖")와 정면충돌한다는 걸 뒤늦게 발견 — Cloud Functions 신규 구축도 마찬가지로 범위 밖. **올바른 해법은 Sentry 자체 콘솔의 Rate Limits/Spike Protection 설정**(Project Settings → Client Keys → Configure)이라고 정정해서 안내함 — 코드가 아니라 Sentry 계정 접근 권한이 있는 사람만 할 수 있는 콘솔 작업.

**의도적으로 고치지 않고 남긴 것(이유 포함, "나중에 해도 됨"이 아니라 지금 안전하게 못 고칠 구체적 이유가 있는 것들):**
- **재배선 도메인 작업 전체**(XP/레벨 도메인 신설, 랭킹 서버측 정렬용 total-score 필드 + 인덱스, App Check 클라이언트 SDK 통합, Firestore 쓰기 레이트리밋, CSP `connect-src`에 Firebase 엔드포인트 추가) — 전부 이번 라운드에 LOCKED로 못박은 "MainWorldV3↔LegacyGooglerApp 재배선" 자체가 선행돼야 하는 설계 작업이라, 지금 부분적으로 손대면 재배선 시점에 다시 뜯어고쳐야 하는 상태가 된다. LOCKED 예외는 "이미 존재하는 코드의 테스트/에러처리"(이번에 처리함)까지고, 아직 존재하지 않는 도메인 로직 신설은 그 예외 밖이라고 판단했다.
- **계정/데이터 삭제 경로 부재**(익명 계정 30일 자동정리는 인증 정보만 지우고 Firestore 문서·공개 랭킹 닉네임은 영구히 남음) — UX·정책 결정(삭제 시 랭킹 표시를 어떻게 할지 등)이 필요해 대표 선택 사안으로 분류. **2026-09-02 대표님 확인**: 현재 라이브 제품엔 계정 개념 자체가 없다(아래 참고) — 재배선 이후에나 유효해지는 항목.
- **닉네임 실명 입력 제한 여부** — 정책 결정 사안으로 분류. 마찬가지로 재배선 이후에나 유효.
- **`.env.example`에 `VITE_FIRESTORE_NAMESPACE` 추가** — 이 세션의 툴 권한이 `.env*` 패턴 파일 읽기/쓰기를 전부 차단하고 있어(비밀값 보호용 샌드박스 규칙으로 추정) 직접 수정 불가. 대표님 또는 다른 접근 권한이 있는 세션이 `.env.example`에 `VITE_FIRESTORE_NAMESPACE=` 한 줄만 추가하면 되는 사소한 작업.
- **App Check reCAPTCHA v3 허용 도메인에 `g00gler.web.app` 추가** — Firebase/Google reCAPTCHA 콘솔 설정이라 코드로 불가능(위 "Firebase 프로젝트" 섹션에 이미 미해결로 기록돼 있던 항목, 재배선 착수 시 처리 예정).
- **Sentry 이벤트 상한 전체화** — 위에서 정정한 대로 Sentry 콘솔 작업.
- **npm audit 모더레이트 5건** — 전부 `firebase-tools`(개발용 CLI, 브라우저 번들에 안 들어감)를 통한 간접 의존성. `npm audit fix --force`는 이번 세션이 방금 15.28.2로 올린 `firebase-tools`를 14.23.0으로 되돌리는 breaking downgrade라 적용하지 않음 — 실사용자에게 닿지 않는 개발도구 전용 취약점이고 상류 패키지가 해소해야 하는 문제라 §4-1 구조적 상한으로 처리.

**"계정이 없는 목업인데 계정 얘기를 왜 하냐"는 대표님 반응에 코드로 재확인한 사실(2026-09-02)**: `src/App.tsx`는 `MainWorldV3` 하나만 렌더링하고, 실제 배포 번들(`dist/assets/*.js`)을 grep하면 `firebase`/`signInAnonymously`/`getFirestore`/`LegacyGooglerApp` 문자열이 전부 0건이다 — 즉 **지금 `g00gler.web.app` 방문자에게는 계정도 닉네임 저장도 전혀 발생하지 않는다.** 위에 나온 P-1(랭킹 공개 고지)/P-2(계정 삭제)/P-4(닉네임 정책) findings는 Opus 감사의 "(B) 원래 계획한 전체 제품 기준" 트랙 — 재배선 이후를 가정한 참고 메모였다는 점을 분명히 한다. 다만 Firestore/Auth **백엔드 자체**는 이미 살아있는 인프라라(프로젝트 ID만 알면 REST로 직접 접근 가능) `firestore.rules`의 랭킹 읽기 제한(S-1)은 이 구분과 무관하게 지금도 유효한 보안 조치였다.

**검증**: `npm run check`(typecheck/lint/test/build) + `npm run rules:test`(Firestore 에뮬레이터, 8/8) 전부 통과.

## 대표와의 소통 경로 (2026-08-26 확정 — 반드시 지킬 것)
이 세션은 대표와 직접 대화를 시작하지 않는다. 진행상황 공유·질문·의사결정 요청은 전부 **팀장(D:\Projects 최상위 세션, "Project Engineering")을 거쳐서만** 한다 — 대표가 이 세션 창을 직접 열어서 먼저 말을 걸어온 경우에만 그 건에 한해 답한다(최상위 CLAUDE.md "조직 구조" 섹션 참고). 팀장에게서 온 메시지("Project Engineering의 메시지")는 곧 대표의 지시가 전달된 것이므로 별도로 대표에게 재확인하지 말고 그대로 실행한다.
