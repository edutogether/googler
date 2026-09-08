# AGENTS.md — googler (Be a Googler)

어떤 도구로 이 저장소를 열든(Codex, Claude Code, 사람) 먼저 읽는 문서. Google
Educator 인증 학습용 20일 60미션 동료학습 앱 (React 19 / TypeScript / Vite 8 /
Tailwind 4 / Firebase 12).

- 라이브: <https://g00gler.web.app/> (Firebase Hosting)
- 배포 브랜치이자 작업 브랜치: `main` (PR 없이 직접 커밋)

## 지금 실제로 렌더링되는 것

`src/App.tsx`는 `src/features/main-v3/MainWorldV3.tsx` **하나만** 렌더링한다.
이 화면은 Firebase·진행률·콘텐츠와 연결되지 않은 정적 전시용 셸이고, **이건
버그가 아니라 확정된 설계**다.

실제 기능 구현(`src/legacy/LegacyGooglerApp.tsx`, `src/pages/`, `src/data/`)은
저장소에 있지만 어디서도 렌더링되지 않는다. 빌드 산출물을 grep하면
`firebase`/`getFirestore`/`signInAnonymously`가 0건으로 트리셰이킹되어 빠진다.
**이 둘을 연결(재배선)하지 말 것** — 별도 라운드의 일이다.

## 명령

```bash
npm ci                  # Node 22 기준 (CI와 동일)
npm run dev             # 개발 서버
npm run typecheck       # tsc -b
npm run lint            # eslint
npm run test:run        # vitest 1회 실행
npm run build           # tsc -b && vite build → dist/
npm run check           # 위 넷을 순서대로 (커밋 전 기본)
npm run rules:test      # Firestore 규칙 테스트 (JDK 21 + 에뮬레이터 필요)
npm run visual          # 화면 스냅샷 비교 (아래 참고)
npm run visual:update   # 스냅샷 기준 갱신
npm run preview         # 프로덕션 빌드 미리보기
```

## 화면을 건드렸다면: 시각 회귀 검사

**CSS나 화면 컴포넌트를 고쳤으면 커밋 전에 반드시 `npm run visual`을 돌린다.**
홈 + 서브페이지 4개 × 해상도 4종 = 20장을 기준 스냅샷과 픽셀 비교한다.

- 실패하면 `.visual-diffs/`에 실제 화면과 차이 이미지가 남는다. **먼저 그 이미지를
  열어보고**, 의도한 변경이 맞을 때만 `npm run visual:update`로 기준을 갱신한 뒤
  커밋한다. 의도하지 않은 화면이 같이 바뀌었는지 확인하는 게 이 검사의 목적이다.
- 기준 이미지(`.visual-baselines/`)는 **gitignore되어 있고 그 PC에서만 유효하다.**
  새로 클론한 환경이나 CI에는 기준이 없어서 `npm run visual`이 바로 실패한다 —
  그 환경에서는 먼저 `npm run visual:update`로 기준을 만들고 시작한다.
- 시스템에 설치된 Chrome을 직접 구동한다(Playwright 브라우저 다운로드 없음).
  Windows·macOS·Linux의 표준 설치 경로를 자동으로 찾고, 못 찾으면 어디를 찾아봤는지
  출력하며 실패한다. 비표준 위치에 설치했다면 `CHROME_PATH`로 지정한다:
  `CHROME_PATH=/path/to/chrome npm run visual`
- 이 스크립트는 `vite.config.ts`의 `base` 값을 직접 읽는다. base를 바꾸면 스크립트도
  같이 따라가므로 손댈 필요 없다(예전에 두 값이 어긋나 조용히 깨진 적이 있어서 이렇게 바꿨다).

## 브라우저로 직접 열어볼 때

**URL에 `?qa-mute=1`을 붙인다.** 이 앱은 방문 즉시 BGM이 자동 재생되는 게 정상
동작이라, 확인용으로 열 때마다 소리가 난다. 제품 코드를 무음으로 바꾸는 것은
금지 — 뮤트는 여는 쪽 습관이다.

## 배포

`main`에 push하면 `.github/workflows/firebase-hosting-merge.yml`이
typecheck → lint → test → rules:test → build → Hosting 배포 → Firestore
규칙·인덱스 배포 순으로 돈다.

**이 스텝 순서를 바꾸지 말 것.** 예전에 Firestore 규칙 배포를 Hosting 배포보다
앞에 뒀다가, 규칙 배포가 권한 문제로 실패하면서 뒤의 Hosting 배포가 통째로
스킵됐다 — 워크플로는 초록불인데 사이트는 배포되지 않는 상태가 됐었다. 그래서
규칙 배포는 **뒤**에 두고 `continue-on-error: true`를 붙였고, 실패 시 별도 스텝이
경고 어노테이션을 남긴다.

배포 승인은 Bumm의 명시 승인이 전제이고, 커밋 메시지에 `(승인 Bumm M/D)`로 남긴다.

## 절대 하면 안 되는 것

- **재배선 금지** — `MainWorldV3`를 `LegacyGooglerApp`/Firebase에 연결하지 않는다.
- **BGM이 매 방문 초기화되는 것을 "고치지" 말 것** — 하루 동안 여러 방문객이
  거쳐가는 공용 전시 키오스크라서 매번 켜짐으로 리셋하는 게 확정된 설계다.
- **`eslint` 10 / `jsdom` 30 / `typescript` 7 업그레이드 금지** — 각각 구체적인
  이유로 보류 중이다(새 lint 규칙이 `MainWorldV3` 리팩터를 강제, jsdom 30에서 씬
  전환 테스트 2개가 결정적으로 실패, tsc 네이티브 전환 생태계 미성숙).
- **랭킹 읽기 규칙을 전체공개로 되돌리지 말 것** — `firestore.rules`의
  `rankings` 읽기는 로그인 참가자 한정(`request.auth != null`)이 확정 결정이다.
- **배포 워크플로 스텝 순서 변경 금지** (위 "배포" 참고).

## 알려진 함정

- **Firebase Hosting 헤더 매칭은 "요청 경로" 기준이다.** `firebase.json`의
  `*.html` 글롭은 루트 요청 `/`에 매칭되지 않는다(서빙되는 파일이 `index.html`이라는
  사실은 반영되지 않음). 그래서 `source: "/"` 규칙이 따로 있다.
- **긴 캐시(immutable)는 파일명에 버전 토큰이 박힌 자산에만 걸려 있다**
  (`visual-reset/**/*-v*-opt.webp`, 그리고 참조가 항상 `?v=`를 다는 `favicon/**`,
  `social/**`). 버전 토큰 없는 파일에 긴 캐시를 걸면 나중에 이미지를 갈아도
  방문자가 옛 버전을 최대 1년 본다.
- **부팅 스플래시는 전 앱 표준을 따른다**(`_shared/standards/splash-standard.md`).
  마크업은 `index.html`의 정적 `#splash`, 타이밍(유지 1800ms → 페이드 500ms →
  2400ms 소멸)은 `src/styles/splash.css`의 CSS 애니메이션이 잡는다. **JS 타이머로
  시간을 재지 않는다** — 번들 로드 시점부터 재게 되어 기기마다 달라진다.
  `src/splash.ts`는 시간을 재지 않고 "page load가 끝났는가"만 판정해, 아직이면
  `.is-held`로 유지를 연장하고 끝나면 페이드 후 노드를 지운다(상한 4초).
  스플래시 CSS는 번들이 아니라 `index.html`에서 직접 `<link>`로 불러온다 —
  번들이 import하면 dev 서버에서 JS로 주입돼 첫 페인트에 무스타일로 보인다.
- **Firebase 사이트/프로젝트 ID에 "google" 문자열을 쓸 수 없다**(상표 정책).
  그래서 프로젝트는 `be-a-g00gler`, 사이트는 `g00gler`다 — 오타가 아니다.
- **`.claude/worktrees/`는 git과 eslint 양쪽에서 무시된다.** 격리 서브에이전트가
  남긴 중첩 체크아웃을 lint가 같이 스캔해 가짜 에러를 낸 적이 있다.

## git 훅 (클론마다 한 번)

```bash
git config core.hooksPath .githooks
```

`.githooks/pre-push`가 freeze 태그(`*-freeze-*`)의 **삭제·이동을 차단**한다. 새
freeze 태그를 만드는 것과 일반 브랜치 push는 그대로 통과한다. 훅은 클라이언트
쪽이라 클론할 때마다 위 한 줄을 실행해야 켜진다.

## 문서 위치

- `CLAUDE.md` — Claude Code 세션용 상세 문서(확정 결정, 살아있는 규칙).
- `_docs/CHANGELOG.md` — 날짜별 작업 이력.
- `.claude/rules/app.md` — 이 앱의 개별 규칙(공통 헌법에 없는 것만).
- `.claude/rules/intent-workflow.md` — intent 문서 작성 규칙.
- `_docs/intents/` — 작업별 intent 문서. 새 intent는 `TEMPLATE.md`를 복사해 시작.
- `docs/` — 예전 리뷰·핸드오프 기록(보존용).
- `README.md` — GitHub 첫 화면용 앱 소개.
