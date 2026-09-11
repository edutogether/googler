# Be a Googler (googler) 개별 규칙
헌법(D:\Projects\CLAUDE.md → _shared/CONVENTIONS.md)에 없는 것만.

## 앱
- 무엇: Google Educator 인증 학습용 20일 60미션 동료학습 앱. 현재는 전시용 정적
  셸(`MainWorldV3`) 하나만 렌더링되고, 실제 기능 코드(`LegacyGooglerApp`)는
  의도적으로 연결하지 않은 상태.
- 사용자: 전시·시연 관람객. 공용 키오스크에서 하루 동안 여러 사람이 거쳐가는 형태
  (같은 사람의 반복 방문이 아님 — BGM 리셋 설계의 근거).
- 배포: Firebase Hosting. 사이트 `g00gler`, 프로젝트 `be-a-g00gler`
  (상표 정책상 ID에 "google" 문자열을 못 써서 `0`을 쓴 것 — 오타 아님).
- **정식 라이브 주소는 `googler.edutogether.kr`(영문 o)** — 위 `g00gler`(숫자 0
  둘)는 Firebase 배포 식별자(사이트 ID·프로젝트 ID)일 뿐, 사람에게 안내하는
  주소가 아니다. 서로 다른 오타가 아니라 애초에 다른 값이니 문서에서 바꿔
  쓰지 않는다. Firebase 기본 주소 `g00gler.web.app`도 계속 살아있다(이미
  나간 링크 보존용).
- App Check(reCAPTCHA v3)가 Firestore·Auth 두 API 모두 Enforce 상태 — 클라이언트
  코드가 Firebase를 안 부르는 지금도 프로젝트 자체는 REST로 직접 두드릴 수 있어서
  걸어둔 방어선. Google Cloud 예산 알림은 임계값 초과 시 메일만 온다(API 호출을
  실제로 막지는 않음) — 강제 차단이 필요하면 별도 Cloud Function이 있어야 한다.

## 배포 폴더
- `firebase.json` public = `dist`. `dist/`는 `vite build` 산출물이라
  `docs/`·`.claude/`는 구조상 포함될 수 없음 — 실제 산출물로 확인함 (확인일 9/8)

## 데이터
- 개인정보·미성년자 데이터: **현재 라이브에는 없음.** 배포 번들에
  `firebase`/`getFirestore`/`signInAnonymously`가 0건이라 방문자에게 계정 생성도
  닉네임 저장도 일어나지 않는다. 재배선하는 순간 이 문장은 더 이상 사실이 아니다.
- 보관·삭제 정책: 익명 계정 30일 자동정리(Firebase Auth). 단 이건 인증 정보만
  지우고 Firestore 문서·공개 랭킹 닉네임은 남는다 — 삭제 경로는 재배선 라운드 과제.
- rules: `firestore.rules` 있음 + `npm run rules:test`로 에뮬레이터 테스트,
  CI 3개 워크플로 전부에서 build 앞에 실행됨.
- localStorage: BGM/효과음 설정, Sentry 일일 이벤트 상한 카운트
  (`public/privacy.html`에 고지됨).

## 소셜 공유 카드 (og/twitter)
- `og:title`/`og:description`은 `{앱 이름} | {hook}` 규칙으로 6개 앱이 통일돼
  있음(Portal `apps.ts` 기준, 2026-09-10 확정). **포털이 카드 문구·그림을
  바꾸면 여기(`index.html`)도 같이 바꾼다.**
- `og:image`는 `public/og.jpg`(자기 도메인에서 배포) — 다른 저장소 도메인을
  직접 가리키지 않는다. 그쪽 배포가 막히면 이 앱 카드까지 같이 죽는다(2026-09-10
  Portal CI가 40분 넘게 막혔던 사례로 확인된 리스크).
- 기존 썸네일 파일(`public/social/be-a-googler-kakao-thumbnail.jpg`)은 카드
  그림을 바꾼 뒤에도 지우지 않는다 — 카카오톡 캐시에 그 주소로 이미 공유된
  카드가 남아있을 수 있다.

## 이 앱에서 절대 하면 안 되는 것
- **재배선 금지** — `MainWorldV3`를 `LegacyGooglerApp`/Firebase에 연결하지 않는다.
- **BGM 매 방문 초기화를 "고치지" 말 것** — 공용 키오스크 특성상 확정된 설계.
- **배포 워크플로 스텝 순서 변경 금지** — Hosting 배포가 먼저, Firestore
  규칙·인덱스 배포가 뒤(+`continue-on-error: true`). 반대로 두면 규칙 배포 실패
  하나로 사이트 배포가 통째로 스킵된다(실제로 발생한 사고).
- **랭킹 읽기 규칙을 전체공개로 되돌리지 말 것** — 로그인 참가자 한정이 확정 결정.
- **`eslint` 10 / `jsdom` 30 / `typescript` 7 업그레이드 금지** — 각각 구체적
  이유로 보류 중(CLAUDE.md "나머지 outdated 패키지 정리" 참고).
- **제품 코드를 기본 무음으로 바꾸지 말 것** — 확인용으로 열 때만 `?qa-mute=1`.

## 명령
- 테스트: `npm run test:run` / 규칙 테스트: `npm run rules:test` (JDK 21 필요)
- 린트: `npm run lint` / 전체: `npm run check`
- 로컬 실행: `npm run dev` / 빌드 미리보기: `npm run preview`
- 시각 회귀: `npm run visual` (기준 갱신은 `npm run visual:update`)
- 에뮬레이터: `rules:test`가 `firebase emulators:exec`로 Firestore만 띄운다
- git 훅 활성화(클론마다 1회): `git config core.hooksPath .githooks`
  — `.githooks/pre-push`가 freeze 태그 삭제·이동을 차단한다(생성은 허용)

## 자주 틀리는 것
- **브라우저로 열 때 `?qa-mute=1`을 빠뜨린다.** 방문 즉시 BGM이 자동 재생돼
  Bumm이 직접 음소거해야 했던 일이 반복됐다. 확인용 URL에는 항상 붙인다.
- **freeze 태그 섹션을 갱신하지 않는다.** CLAUDE.md의 복구 명령이 낡은 태그를
  가리킨 채 방치된 사고가 두 번 있었다(35커밋 낡음 / 태그는 새로 찍고 복구 명령
  줄만 안 고침). 태그를 찍었으면 **복구 명령 줄까지** 같이 고치고,
  `git log --oneline -5`로 HEAD가 예상 지점인지 다시 확인한다.
- **화면을 고치고 시각 회귀를 안 돌린다.** 기준은 로컬 전용이라 CI가 대신
  잡아주지 않는다 — 커밋 전에 직접 돌리고, 차이 이미지를 열어본 뒤 갱신한다.
- **의존성 메이저를 "그냥 최신으로" 올린다.** 위 금지 3종은 올릴 때마다 같은
  곳에서 깨진다(테스트 2개 결정적 실패 / 리팩터 강제).
- **시각 회귀 결과를 스플래시 타이밍의 증거로 오독한다.** 부팅 스플래시는
  "자기 CSS 애니메이션 종료"와 "page load 완료"를 둘 다 만족해야 사라지고
  4초 상한이 있다(`src/splash.ts`). **`npm run visual`은 `reduced-motion`을
  emulate하고 돌기 때문에 이 지연 자체가 거의 안 걸린다** — 그러니 시각
  회귀가 통과했다고 "스플래시가 즉시 사라진다"고 결론 내리지 않는다.
  일반 회선에서의 실제 타이밍은 `_docs/CHANGELOG.md`의 스플래시 표준
  전환 실측치를 본다.
- **다른 저장소의 "번들 안 안전판" 결함을 이 앱에도 있다고 단정한다.**
  **스플래시 안전판이 번들 안에 있어도 이 앱은 갇히지 않는다.** `#splash`의
  페이드가 `animation: splashOut 2900ms forwards`라는 **순수 CSS**라, JS가
  한 줄도 안 돌아도 브라우저가 스스로 재생한다. 번들을 영원히 멈춰 놓고 재도
  **3.1초에 `opacity:0`·`pointer-events:none`**이 되고 12초간 그 상태를
  유지한다(2026-09-11 실측). `installSplash()`(`src/splash.ts`)는 **끝난
  노드를 지우는 일**과 **로드가 안 끝났으면 유지를 연장하는 일**만 한다 —
  **사라짐 자체는 JS에 의존하지 않는다.**
  🟡 **다른 저장소(Poster Studio·Codyssey)는 JS가 페이드를 시작하는 구조라
  안전판을 번들 밖으로 빼야 했다. 이 앱에 그 처방을 그대로 가져오면 없는
  문제를 고치는 것이 된다.** 남는 것은 **투명하고 조작 안 되는 빈 요소
  하나**뿐이고 화면·클릭에 영향이 없다.
  🟠 **재는 방법도 주의**: DOM에 요소가 있는지로 판정하면 속는다 — 노드
  자체는 안 지워지고 그대로 남는다. **실제 `opacity`와 `pointer-events`를
  샘플링해야** 진짜 상태가 보인다.
