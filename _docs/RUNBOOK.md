# RUNBOOK — Be a Googler

> 이 저장소에서 되풀이하는 일을 **그대로 따라 하면 끝나는 순서**로 적는다. 명령은 복사해서 바로 돌릴 수 있게 쓰고,
> 단계마다 «됐는지 확인하는 법»을 붙인다. 무엇을 지켜야 하는지는 `_docs/RULES.md`, 함정이 생긴 사연은
> `.claude/rules/app.md`에 있다 — 이 문서는 «어떻게 하나»만 다룬다(원본 양식: `D:\Projects\_shared\doc-kit\`).
> 일을 시작할 때 그 일의 절을 열고, 첫 진행 설명과 완료 보고에 «읽은 것: RUNBOOK §1»을 적는다.
> 검사기는 자잘하게 고치는 동안 돌리지 않는다 — 한 덩어리가 끝나면 «이제 검사기를 한 번에 돌리겠습니다»라고 알리고 한 번 돌린다.

## 목차

| 일 | 언제 하나 | 절 |
|---|---|---|
| 개발 서버 · 브라우저로 열어 확인 | 화면을 보거나 고칠 때 | §1 |
| 배포 (`main` 푸시) | 코드 · 설정을 라이브에 올릴 때 | §2 |
| 의존성 · 고정 액션 올리기 | §36 최신화, 보안 권고 | §3 |
| 재배선이 안 됐는지 확인 | 빌드 산출물을 볼 때, 배포 전 | §4 |
| 화면을 고친 뒤 검사 | CSS · 화면 컴포넌트를 바꿨을 때 | §5 |
| 규칙 테스트 · 에뮬레이터 | `firestore.rules`를 바꿨을 때, CI와 같은 확인 | §6 |
| 프리즈 태그 · 복구 | 큰 변경 전, 되돌려야 할 때 | §7 |
| 정기 종합감사 | 분기 말(다음 2026-12-31) | §8 |

## 1. 개발 서버 · 브라우저로 열어 확인

- **언제**: 화면을 보거나 고칠 때
- **시작 전에 읽을 규칙**: `RULES.md` R-7, R-11, R-18, R-20
- **순서**
  1. 처음 클론했다면 `npm ci`(Node 26)와 `git config core.hooksPath .githooks` → **확인**: `git config core.hooksPath`가 `.githooks`
  2. `npm run dev` (또는 빌드 미리보기는 `npm run build` 뒤 `npm run preview`) → **확인**: 터미널에 로컬 주소가 뜬다
  3. 브라우저(세션 자신의 Browser 패널)로 **`?qa-mute=1`을 붙여** 연다(예: `http://localhost:5173/?qa-mute=1`) → **확인**: 소리가 나지 않고 스플래시 뒤 첫 화면이 뜬다
  4. 라이브는 `https://googler.edutogether.kr/?qa-mute=1` — 보기만 하는 확인은 로그인이 없으니 Bumm님 Chrome을 쓰지 않는다
- **끝나면 남길 것**: 없음(읽기 작업)
- **막히면**: 소리가 난다면 `?qa-mute=1`을 빠뜨린 것이다. 제품 코드를 무음으로 바꾸지 않는다

## 2. 배포 (`main` 푸시 = 라이브 배포)

- **언제**: 코드 · 설정 변경을 라이브에 올릴 때. 팀장이 승인을 전하면 진행한다(Bumm님 직접 확인을 기다리지 않는다)
- **시작 전에 읽을 규칙**: `RULES.md` R-3, R-16, R-17, R-23, R-24, R-28, R-29, R-30, R-33
- **순서**
  1. 승인이 필요한 변경이면 **가지에서 작업**한다 — `git switch -c chore/<작업>` → **확인**: `git branch --show-current`. 문서만 바꾸는 작은 변경은 `main`에 직접 커밋해도 되고, 문서만 바뀐 커밋은 배포가 돌지 않는다
  2. 큰 변경이면 먼저 프리즈 태그(§7) → **확인**: `git ls-remote --tags origin 'googler-freeze-*'`에 새 태그가 있다
  3. 전체 검사를 한 번에 돌린다 — 「이제 검사기를 한 번에 돌리겠습니다」라고 알리고: `npm run typecheck && npm run lint && npm run test:run && npm run build && npm run rules:test` (화면을 건드렸다면 §5도) → **확인**: 모두 종료 코드 0, 테스트 요약에 실패 0
  4. 워크플로를 건드렸다면 스텝 순서를 본다 — Hosting 배포(`FirebaseExtended/action-hosting-deploy`)가 **먼저**, `Deploy Firestore rules and indexes`(`continue-on-error: true`)가 **뒤**, 그 아래 경고 스텝 → **확인**: `.github/workflows/firebase-hosting-merge.yml`에서 순서가 그대로다. `ci.yml` 등 PR로 도는 워크플로에 `secrets.`가 없다
  5. 가지를 올리고 PR을 연다(기록용): `git push -u origin <가지>` 그리고 `gh pr create` → **확인**: `gh pr checks`에서 `verify` · `CodeQL`이 모두 pass
  6. 팀장에게 «배포 승인 요청»을 한 번 보낸다(화면 변화 여부 포함). 승인이 오면 머지한다 — 머지 = 즉시 배포: `gh pr merge <번호> --squash --delete-branch` → **확인**: `gh run list --branch main --limit 3`에서 `Deploy to Firebase Hosting on merge` · `Verify` · `Push on main`이 success
  7. 라이브를 확인한다(§2 뒤쪽 «배포 후 확인») → **확인**: 아래 세 가지가 모두 된다
- **배포 후 확인**
  - `curl -s -o /dev/null -w "%{http_code}\n" https://googler.edutogether.kr/` → **확인**: `200`
  - 세션 자신의 Browser 패널로 `https://googler.edutogether.kr/?qa-mute=1`을 열어 첫 화면이 뜨고 콘솔 오류가 0건
  - `MOTION_URL=https://googler.edutogether.kr/ npm run motion` → **확인**: «통과: reduce·no-preference 두 조건 모두 …»
  - (선택) `node D:/Projects/_shared/ops/smoke-check.mjs _docs/ops/smoke.json` — 첫 화면 문구 확인
- **끝나면 남길 것**: `_docs/CHANGELOG.md`에 배포 결과 한 줄(PR 번호 · 커밋 · 라이브 확인 결과), 새로 겪은 함정은 `.claude/rules/app.md`에
- **막히면**: Hosting 배포가 스킵됐으면 스텝 순서가 바뀐 것이다(R-16). 되돌릴 때는 라이브에 직접 손대지 말고 프리즈 태그 기준으로 CI를 돌린다(§7). 규칙 배포만 실패하면 Actions 화면의 경고를 보고 팀장에게 보고한다

## 3. 의존성 · 고정 액션 올리기

- **언제**: §36 최신화 라운드, Dependabot 보안 PR, 새 보안 권고
- **시작 전에 읽을 규칙**: `RULES.md` R-23, R-25, R-26, R-27, R-28, R-30
- **순서**
  1. 프리즈 태그(§7)를 먼저 찍고 가지를 딴다 → **확인**: `git branch --show-current`가 작업 가지
  2. 올릴 목록을 본다: `npm outdated` → **확인**: «Latest» 열이 올릴 대상. 상류가 못 받는 것(`typescript` 7)은 제외하고 이유를 기록한다
  3. 올린다: `npm update` 또는 `npm install -D <패키지>@<판>`. `firebase-tools`는 `package.json`이 아니라 `rules:test` 스크립트와 워크플로의 `npx firebase-tools@<판>` 두 곳을 같이 바꾼다 → **확인**: `grep -rn "firebase-tools@" package.json .github/workflows` 두 곳이 같은 번호
  4. 고정 액션은 해시 고정을 유지해 최신 태그의 커밋 해시로 바꾼다(`gh api repos/<소유자>/<저장소>/releases/latest`, 그리고 태그의 해시) → **확인**: `grep -n "uses:" .github/workflows/*.yml`
  5. **Sentry를 올렸다면 다시 확인한다**: `src/main.tsx`에 `dataCollection` 엄격 기준선이 있고, 같은 옵션으로 초기화한 클라이언트의 통합 목록에 `BrowserSession`이 없다 → **확인**: 임시 시험 파일에서 `Sentry.init({... integrations: (d) => d.filter((i) => i.name !== 'BrowserSession'), dataCollection: {...}})` 뒤 `Object.keys(Sentry.getClient()._integrations)`를 던져 보고(시험 파일은 지운다)
  6. 새 린트 규칙이 걸리면 규칙을 끄지 않고 코드를 고친다(R-28) → **확인**: `npm run lint` 오류 0
  7. 전체 검사 + 화면 검사(§2 ③, §5) → **확인**: 테스트 · 규칙 테스트 · motion · visual 모두 통과, `npm audit` 0건
  8. §2 ⑤⑥⑦로 이어서 PR · 승인 요청 · 머지 · 라이브 확인
- **끝나면 남길 것**: `_docs/CHANGELOG.md`에 올린 것 · 못 올린 것(이유), `CLAUDE.md` · `app.md`의 보류 줄 갱신
- **막히면**: TypeScript 6 이상은 `tsconfig.app.json`의 `"types": ["node"]`와 `@types/node`가 필요하다. 못 올리는 것은 이유와 함께 팀장에게 보고한다(§36 표 · 매일 점검)

## 4. 재배선이 안 됐는지 확인

- **언제**: 빌드 산출물을 확인할 때, 화면 · 번들 구성을 건드린 배포 전
- **시작 전에 읽을 규칙**: `RULES.md` R-10, R-27
- **순서**
  1. `npm run build` → **확인**: `dist/`가 생긴다
  2. `grep -rlE "getFirestore|signInAnonymously" dist` → **확인**: 출력이 없다(0건). 나오면 `MainWorldV3`가 Firebase에 연결된 것이니 배포를 멈추고 팀장에게 보고한다
- **끝나면 남길 것**: 없음
- **막히면**: 재배선은 별도 라운드의 일이고 이 앱은 하지 않는다

## 5. 화면을 고친 뒤 검사

- **언제**: CSS나 화면 컴포넌트를 바꿨을 때. **고치는 동안에는 돌리지 않고**, 한 덩어리가 끝나면 알리고 한 번 돌린다
- **시작 전에 읽을 규칙**: `RULES.md` R-18, R-19, R-20, R-29
- **순서**
  1. `npm run build` → **확인**: 오류 없음
  2. `npm run motion` → **확인**: «통과: reduce·no-preference 두 조건 모두 스플래시(2300ms 이상)·말풍선·기울기·노래 제목·화면 전환이 정상입니다.»
  3. `npm run visual` → **확인**: «전부 통과: 40장 모두 기준과 일치합니다.» 실패하면 `.visual-diffs/`의 차이 이미지를 **열어 보고**, 의도한 변경일 때만 `npm run visual:update`로 기준을 갱신한다 (기준 `.visual-baselines/`는 gitignore라 새 클론에서는 먼저 `npm run visual:update`)
  4. 비표준 위치의 Chrome이면 `CHROME_PATH`를 지정한다
- **끝나면 남길 것**: `_docs/CHANGELOG.md` 한 줄. 스플래시를 건드렸으면 `npm run test:run`의 `src/splash.test.ts` · `src/motionPolicy.test.ts`도 통과해야 한다
- **막히면**: 시각 회귀 통과를 스플래시 타이밍의 증거로 읽지 않는다 — 타이밍은 `npm run motion`이 잰다

## 6. 규칙 테스트 · 에뮬레이터

- **언제**: `firestore.rules` · `firestore.indexes.json`을 바꿨을 때, 또는 CI와 같은 확인을 로컬에서 할 때
- **시작 전에 읽을 규칙**: `RULES.md` R-12, R-13, R-23, R-24
- **순서**
  1. JDK 21이 있는지 본다 → **확인**: `java -version`이 21
  2. `npm run rules:test` (내부적으로 `npx firebase-tools@<판> emulators:exec --only firestore …`) → **확인**: «Tests 13 passed (13)». 에뮬레이터는 `firebase.json`의 6400~6408 칸을 쓴다(firestore 6403 · websocket 6404)
  3. 시험 · 스크립트에 포트를 박지 않는다 — `FIRESTORE_EMULATOR_HOST`를 읽는다
- **끝나면 남길 것**: `_docs/CHANGELOG.md` 한 줄. 규칙 배포는 `main` 푸시 때 §2에서 Hosting 뒤에 돈다
- **막히면**: 다른 앱이 같은 포트를 쓴다면 이 앱 칸이 `firebase.json`에 그대로인지 확인한다(COMMON_STANDARDS §37)

## 7. 프리즈 태그 · 복구

- **언제**: 큰 변경 · 의존성 라운드 전, 종합감사 10/10 뒤, 되돌려야 할 때
- **시작 전에 읽을 규칙**: `RULES.md` R-30
- **순서 (태그 찍기)**
  1. 태그 이름을 정한다 — `googler-freeze-<YYYYMMDD>-pre-<작업>` 또는 감사 뒤 `googler-freeze-<YYYYMMDD>-audited-100` → **확인**: 이름이 두 꼴 중 하나
  2. `git tag <이름> && git push origin <이름>` → **확인**: `git ls-remote --tags origin '<이름>'`에 나온다
  3. 최신 태그가 바뀌었으면 `CLAUDE.md`의 «전시 프리즈 최신 태그» 줄과 `_docs/ops/freeze-recovery.md`의 복구 명령까지 같이 고치고 `git log --oneline -5`로 HEAD를 확인한다
- **순서 (복구)**: `_docs/ops/freeze-recovery.md`의 절차를 따른다(최신 프리즈 태그 기준으로 복원 후 푸시, 되돌리기는 CI로만)
- **끝나면 남길 것**: `_docs/CHANGELOG.md`에 태그 이름 한 줄
- **막히면**: `.githooks/pre-push`가 태그 삭제 · 이동을 막는다 — 이름을 잘못 찍었으면 지우지 말고 팀장에게 보고한다

## 8. 정기 종합감사

- **언제**: 분기 말(3 · 6 · 9 · 12월 마지막 날). 다음은 **2026-12-31**. 세션이 먼저 제안하지 않고, 그 사이엔 Bumm님 지시가 있을 때만 돈다
- **시작 전에 읽을 규칙**: `RULES.md` R-31, R-32, R-26, R-27
- **순서**
  1. `COMMON_STANDARDS.md` §4~§7 원문을 읽는다(채점 보정 · 보고 형식 · Sonnet+Opus 역할분리) → **확인**: 읽은 절 번호를 보고에 적는다
  2. 마지막 프리즈 이후 바뀐 것을 센다: `git rev-list --count googler-freeze-20261031-audited-100..main` (문서에 숫자를 박지 않는다)
  3. 이번 감사 때 함께 볼 것: `typescript` 7이 상류(`typescript-eslint`)에서 풀렸는지(`npm view typescript-eslint peerDependencies`), Sentry 설정(§3 ⑤)
  4. 발견한 결함은 전부 고치고 재채점한다 → **확인**: 결함 목록과 점수가 1:1
- **끝나면 남길 것**: `_docs/CHANGELOG.md`, 10/10이면 `…-audited-100` 태그(§7)와 `CLAUDE.md` 점수 줄
- **막히면**: 팀장에게 한 줄 보고

## 따로 있는 상세 런북

- `_docs/ops/operations.md` — 자동으로 도는 것 · 사람이 할 일 · 문제가 생기면 어디부터 보나(운영 개요).
- `_docs/ops/freeze-recovery.md` — 전시 프리즈 복구 지점과 복구 절차 전체.
- `_docs/ops/smoke.json` — 라이브 첫 화면 문구 스모크 확인 설정.
