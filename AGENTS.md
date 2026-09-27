# AGENTS.md — googler (Be a Googler)

어떤 도구로 이 저장소를 열든(Codex, Claude Code, 사람) 먼저 읽는 문서. Google
Educator 인증 학습용 20일 60미션 동료학습 앱 (React 19 / TypeScript / Vite 8 /
Tailwind 4 / Firebase 12).

- 라이브: <https://googler.edutogether.kr/> (Firebase Hosting, 2026-09-10 정식 도메인 연결. Firebase 기본 주소 `https://g00gler.web.app/`도 계속 살아있다)
- 배포 브랜치이자 작업 브랜치: `main` (PR 없이 직접 커밋)

## 조직 공통 규칙 — 다른 도구·클라우드에서도 (D:\Projects 헌법 요약)

이 저장소만 받아서 일하는 도구(Codex 클라우드, Claude Code 클라우드, 다른 기기)는 `D:\Projects`의 공통
문서를 못 본다. 그래서 꼭 지켜야 할 것을 여기 옮겨 둔다. 원본은 `817beatles/projects`의 `_shared/constitution.md`.

- **사람**: 최종 결정권자는 **Bumm님**. 모든 답·문서·커밋은 **한국어**, 호칭은 늘 "Bumm님".
- **앱 이름**은 정식 이름 하나로만: CLASSCADE · Poster Studio · Be a Googler · Voice Cinema · Portal ·
  Codyssey · InKY Calculator · AI Ways Incheon (줄임말·별명·번역어 금지).
- **보고 경로**: 앱 담당은 팀장(Project Engineering)과만 주고받는다. Bumm님이 직접 말을 걸면 그 건만 직접 답한다.
- 🔴 **`main` 푸시 = 라이브 배포.** Codex·클라우드·다른 기기에서 한 작업은 `main`에 직접 푸시하지 않는다 —
  작업 가지 → PR로 내고, 합치는 것은 팀장 확인 뒤. 되돌리기는 CI로만(프리즈 태그 기준), 라이브에 직접 손대지 않는다.
- 🔴 **멈추고 Bumm님께 묻는 것**: 콘솔 전용 작업(Firebase/GCP), 돈이 드는 결정, 법률·정책 판단, 되돌리기 어렵거나
  파괴적인 행동, 영구 식별자(프로젝트·사이트 ID, 버킷 이름) 생성, 새 제품 방향.
- **한 번에 완성**: "일단", "차선책", "우회", "나중에" 금지. 제대로 못 하면 멈추고 보고. `TODO`/`FIXME`/`임시` 금지.
  검사를 느슨하게 하거나 빼서 통과시키지 않는다. 검사는 실제로 돌리고 종료 코드로 확인한다.
- **숨길 것**: 어드민 화면·기능은 저장소·배포·커밋 어디에도 드러내지 않는다. 비밀 키·토큰·인증 코드는 쓰지 않는다.
- **인계(도구·기기를 바꿔 가며 이어서 할 때)**: 단계를 끝낼 때마다 작업 가지에 올리고, PR 설명에
  "한 일 / 다음에 할 일 / 주의할 것"을 적는다. 같은 가지를 두 도구가 동시에 고치지 않는다 — 한쪽이 올린 뒤 이어받는다.
- **로컬(집 PC) 전용 작업** — 클라우드에서는 하지 않는다: 콘솔 작업, 운영 데이터 읽기·쓰기, 배포 승인,
  집 PC 모니터를 쓰는 측정. 클라우드는 코드 수정·검사·PR까지만. 이 앱에서는 구체적으로 —
  Firebase 콘솔에서 App Check(reCAPTCHA v3) 키·Google Cloud 예산 알림 확인, 실물 키오스크
  화면에서 BGM 자동재생·부팅 스플래시 타이밍을 육안으로 확인하는 것이 해당한다.

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
- **부팅 스플래시는 전 앱 표준을 따른다**(`_shared/standards/splash-standard.md`,
  2026-09-09 전환). 마크업과 타이밍(유지 2300ms → 페이드 500ms → 2900ms 소멸 —
  유지 시간은 로딩바 `splashBar` 애니메이션이 최소 두 바퀴(1.15s×2) 도는
  시간으로 맞춰져 있다, COMMON_STANDARDS §27) CSS는 **`index.html` 헤드의
  인라인 `<style>`** — 별도 `.css` 파일이 아니다.
  외부 스타일시트(번들 포함)로 두면 그 CSS가 렌더를 막아 느린 회선에서
  스플래시 자체가 늦게 뜬다(3G급 실측 6.3초 지연 확인, 인라인 후 475ms). **JS
  타이머로 시간을 재지 않는다** — 번들 로드 시점부터 재게 되어 기기마다 달라진다.
  `src/splash.ts`는 시간을 재지 않고 "page load가 끝났는가"만 판정해, 아직이면
  `.is-held`로 유지를 연장하고 끝나면 페이드 후 노드를 지운다(상한 4초). 애니메이션이
  이미 끝난 뒤에 뒤늦게 실행되는 분기를 유지 연장으로 보내면 이미 사라진 스플래시가
  되살아나는 깜빡임이 생긴다 — 그 분기는 노드만 지운다(`src/splash.test.ts` 회귀
  테스트로 고정).
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
- `_docs/archive/` — 지금은 유효하지 않지만 근거로 남기는 지난 기록(예전 리뷰·핸드오프).
- `_docs/ops/` — 사람이 손으로 따라 하는 절차(배포·백업·복구).
- `README.md` — GitHub 첫 화면용 앱 소개.
