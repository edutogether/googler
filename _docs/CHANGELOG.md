# CHANGELOG — googler (Be a Googler)

날짜별 작업 이력. CLAUDE.md에는 지금 유효한 규칙만 두고, 지나간 라운드의 기록은
여기로 모은다(2026-09-08 분리, CONVENTIONS §1.2). **아래 내용은 CLAUDE.md에서
한 줄도 고치지 않고 그대로 옮긴 것이다** — 당시 표현·판단을 그대로 보존한다.

과거 시점의 서술이므로 지금 상태와 다를 수 있다. 현재 유효한 규칙은 CLAUDE.md,
앱 고유 규칙은 `.claude/rules/app.md`, 도구 공통 안내는 `AGENTS.md`를 본다.

---

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

**대표와의 소통 경로 관련 실전 사례 하나**: 이번 이관 중 `git push`(GitHub Actions를 실제로 트리거해 프로덕션 배포를 일으키는 행동) 승인을 놓고, 팀장 경유 크로스세션 메시지로 "대표님이 승인하셨다"는 전달이 여러 번 왔지만 이 세션은 계속 보류했다 — git push처럼 되돌리기 번거로운 배포 트리거 행동에 한해서는, 그 경로만으로는 "정말 대표님이 이번 건을 원하시는지" 이 세션 스스로 확인할 방법이 없었기 때문. 결국 대표님이 이 세션 창에 직접 들어와 "팀장의 말을 따르도록"이라고 확인해준 뒤에야 진행했다.

**2026-09-03, COMMON_STANDARDS.md §11로 이 예외가 공식적으로 폐지됐다.** git push/배포는 팀장이 "대표님이 승인하셨습니다"라고 전달하면 그것으로 충분하다 — 대표님 본인이 매번 이 세션 창에 직접 들어와 확인할 필요는 없다(§9, 세션 자신의 권한/설정 파일 수정만 여전히 대표님 직접 확인 필요, 변경 없음). 위 사례는 §11이 왜 필요했는지를 보여주는 과거 기록으로 남겨두고, "그래서 앞으로도 매번 직접 확인이 필요하다"는 결론은 §11로 대체한다 — **팀장 경유 지시(= 재확인 없이 실행) 원칙이 push에도 그대로 적용된다.**

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
- **Sentry 이벤트 상한 서버측 전체화 — 해결됨(2026-09-02, 대표님 콘솔 작업)**: 처음엔 "코드로 가능"으로 분류했으나, 기기 간 카운터를 공유하려면 Firestore 등 공유 저장소가 필요하고 이는 `MainWorldV3`를 Firebase에 연결하는 셈이 되어 이번 라운드 LOCKED("재배선 범위 밖")와 정면충돌한다는 걸 뒤늦게 발견 — Cloud Functions 신규 구축도 마찬가지로 범위 밖이라 코드로는 못 고치는 항목으로 재분류(Sentry 자체 콘솔의 Rate Limits/Spike Protection, Project Settings → Client Keys → Configure)했다. **대표님이 직접 Sentry 콘솔에서 Rate Limits를 시간당 100개로 설정 완료** — 기기별 localStorage 상한(`src/sentryEventCap.ts`)과 별개로, 이제 프로젝트 전체 유입량에도 진짜 상한이 걸려있다.

**의도적으로 고치지 않고 남긴 것(이유 포함, "나중에 해도 됨"이 아니라 지금 안전하게 못 고칠 구체적 이유가 있는 것들):**
- **재배선 도메인 작업 전체**(XP/레벨 도메인 신설, 랭킹 서버측 정렬용 total-score 필드 + 인덱스, App Check 클라이언트 SDK 통합, Firestore 쓰기 레이트리밋, CSP `connect-src`에 Firebase 엔드포인트 추가) — 전부 이번 라운드에 LOCKED로 못박은 "MainWorldV3↔LegacyGooglerApp 재배선" 자체가 선행돼야 하는 설계 작업이라, 지금 부분적으로 손대면 재배선 시점에 다시 뜯어고쳐야 하는 상태가 된다. LOCKED 예외는 "이미 존재하는 코드의 테스트/에러처리"(이번에 처리함)까지고, 아직 존재하지 않는 도메인 로직 신설은 그 예외 밖이라고 판단했다.
- **계정/데이터 삭제 경로 부재**(익명 계정 30일 자동정리는 인증 정보만 지우고 Firestore 문서·공개 랭킹 닉네임은 영구히 남음) — UX·정책 결정(삭제 시 랭킹 표시를 어떻게 할지 등)이 필요해 대표 선택 사안으로 분류. **2026-09-02 대표님 확인**: 현재 라이브 제품엔 계정 개념 자체가 없다(아래 참고) — 재배선 이후에나 유효해지는 항목.
- **닉네임 실명 입력 제한 여부** — 정책 결정 사안으로 분류. 마찬가지로 재배선 이후에나 유효.
- **`.env.example`에 `VITE_FIRESTORE_NAMESPACE` 추가** — 이 세션의 툴 권한이 `.env*` 패턴 파일 읽기/쓰기를 전부 차단하고 있어(비밀값 보호용 샌드박스 규칙으로 추정) 직접 수정 불가. 대표님 또는 다른 접근 권한이 있는 세션이 `.env.example`에 `VITE_FIRESTORE_NAMESPACE=` 한 줄만 추가하면 되는 사소한 작업.
- **App Check reCAPTCHA v3 허용 도메인 — 해결됨**, 위 "Firebase 프로젝트" 섹션 참고.
- **Sentry 이벤트 상한 전체화 — 해결됨**, 위에서 정정한 대로 Sentry 콘솔 작업으로 대표님이 직접 완료.
- **npm audit 모더레이트 5건** — 전부 `firebase-tools`(개발용 CLI, 브라우저 번들에 안 들어감)를 통한 간접 의존성. `npm audit fix --force`는 이번 세션이 방금 15.28.2로 올린 `firebase-tools`를 14.23.0으로 되돌리는 breaking downgrade라 적용하지 않음 — 실사용자에게 닿지 않는 개발도구 전용 취약점이고 상류 패키지가 해소해야 하는 문제라 §4-1 구조적 상한으로 처리.

**"계정이 없는 목업인데 계정 얘기를 왜 하냐"는 대표님 반응에 코드로 재확인한 사실(2026-09-02)**: `src/App.tsx`는 `MainWorldV3` 하나만 렌더링하고, 실제 배포 번들(`dist/assets/*.js`)을 grep하면 `firebase`/`signInAnonymously`/`getFirestore`/`LegacyGooglerApp` 문자열이 전부 0건이다 — 즉 **지금 `g00gler.web.app` 방문자에게는 계정도 닉네임 저장도 전혀 발생하지 않는다.** 위에 나온 P-1(랭킹 공개 고지)/P-2(계정 삭제)/P-4(닉네임 정책) findings는 Opus 감사의 "(B) 원래 계획한 전체 제품 기준" 트랙 — 재배선 이후를 가정한 참고 메모였다는 점을 분명히 한다. 다만 Firestore/Auth **백엔드 자체**는 이미 살아있는 인프라라(프로젝트 ID만 알면 REST로 직접 접근 가능) `firestore.rules`의 랭킹 읽기 제한(S-1)은 이 구분과 무관하게 지금도 유효한 보안 조치였다.

**검증**: `npm run check`(typecheck/lint/test/build) + `npm run rules:test`(Firestore 에뮬레이터, 8/8) 전부 통과.
