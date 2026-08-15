# Be a Googler — 세션 핸드오프 (2026-08-14)

## 1. 앱 요약

Google Educator 인증 학습용 20일 60미션 동료학습 앱 (React/TS/Vite). 현재 라이브에 렌더링되는 `MainWorldV3.tsx`는 **전시(exhibition)용 정적 비전 화면**이다 — Firebase/진행률/실제 콘텐츠는 의도적으로 미연결. 실제 기능 구현은 `LegacyGooglerApp.tsx`에 있지만 어디서도 렌더링되지 않는 고아 코드(재배선은 다음 라운드 과제, 이번 세션 범위 아님).

배포: `main` 브랜치 → GitHub Pages 자동 배포 → `https://edutogether.github.io/googler/`

## 2. 진단 결과

- 전방위 스캔(구조/흐름/설계/테스트/보안/성능) 완료, **최종 10/10**
- npm audit 취약점 8건(critical 1)은 전부 개발 도구 체인(eslint/vitest/postcss) 소속 — 번들 grep으로 브라우저 코드 0건 확인, 조치 불필요
- 고아 레거시 코드 ~1,400줄은 번들에 0바이트 포함 — 방문자 영향 없음, 그대로 둠

## 3. 완료한 것

- **버그 수정**: 태블릿 폭(768-999px) 레이아웃 깨짐 / BGM 두 번 눌러야 소리 나던 문제 / 헤더 버튼 클릭 시 원치 않게 모달 동시에 뜨던 문제
- **성능**: 모바일 불필요 다운로드 제거, PC 배경 5장 PNG→webp(2.7MB→0.35MB), BGM 128kbps(6.1MB→2.3MB), 데이터섬 썸네일 최적화
- **UX**: 페이지 전환 로딩 화면 리디자인(블러 완화, 로고/바 강화 예정 — 4번 참고), 부트 스플래시 신규 추가(CLASSCADE 패턴을 구글러 톤으로)
- **누더기 정리**: 죽은 CSS(`.mw3-menu-preview-*`), 도달 불가 분기, 테스트 try/finally 보강, 옛 모바일 CSS 초안 제거
- **도구**: `npm run visual` / `visual:update` — 시각 회귀 검사(홈+서브페이지4 × 해상도4 = 20장 픽셀 비교) 신규 구축, 검증 완료
- **프리즈**: 태그 `googler-exhibition-freeze-2026-08-14`(커밋 5413b7c) — CLAUDE.md에 복구 절차 기록

## 4. 미완료 / 다음에 이어서 할 것

- **로딩 화면 로고+진행바 일러스트** — 사용자에게 이미지 생성 프롬프트 전달됨(`loading-emblem-prompt.txt`, 스크래치 폴더). 사용자가 그림 생성해서 `public/visual-reset/main/be-a-googler-loading-emblem.png`로 저장하면, 코드에서 진행률만큼 채우는 부분을 그 안에 정렬해 붙이는 작업 남음.
- **재배선(다음 라운드)**: `MainWorldV3`를 `LegacyGooglerApp`/실제 Firebase 데이터에 연결 — 이번 세션에서 명시적으로 범위 밖으로 미룸, 지금 손대지 말 것.

## 5. 주의사항

- **이 저장소는 여러 세션이 동시에 작업할 수 있다.** 실제로 이번 세션 중 다른 세션이 BGM 볼륨 관련 커밋 2개를 먼저 푸시한 적 있음. **작업 시작 전 항상 `git log --oneline -5`로 HEAD 확인**, 새 프리즈 태그 찍기 전에도 동일.
- **프리즈 태그는 "잠금"이 아니라 복구 지점**이다 — 수정은 자유롭게 하되, 문제 생기면 디버깅 대신 `git checkout googler-exhibition-freeze-2026-08-14 -- .`로 즉시 복원 가능.
- 화면/CSS를 건드리는 수정 후에는 배포 전 `npm run visual` 필수(기준 이미지는 `.visual-baselines/`, gitignore됨 — 다른 머신에서는 `npm run visual:update`로 새로 만들어야 함).
- 재배선 작업은 **명시적 요청 없이 시작하지 말 것** — 지난 세션에서 사용자가 "이번엔 하지말자"고 두 차례 확정함.
