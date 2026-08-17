# CLAUDE.md — googler (Be a Googler)

Google Educator 인증 학습용 20일 60미션 동료학습 앱 (React/TS/Vite). 상위 원칙은 [D:\Project\CLAUDE.md](../../CLAUDE.md) 상속 — 여기는 이 앱 전용 상태/이슈만 기록한다.

## 현재 상태 (2026-08-13 기준)
- 브랜치: `main` (배포 브랜치이자 작업 브랜치, GitHub Pages 자동 배포)
- 2026-08-10 외부 리뷰: `docs/EXTERNAL_HEALTH_REVIEW_20260810.md`

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
