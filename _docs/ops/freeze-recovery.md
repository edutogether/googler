# 전시 프리즈 — 복구 지점

2026-09-10 문서 정리 라운드에서 `CLAUDE.md`에서 옮겨온 절차 문서다.
사람이 실제로 따라 하는 백업·복구 절차라 `_docs/ops/`에 둔다.
`CLAUDE.md`의 "현재 상태" 섹션에 최신 태그 이름만 요약돼 있다.

## 전시 프리즈 — 복구 지점 (최신: 2026-09-10)

**태그 `googler-freeze-20260910-audited-100-2`** (`git rev-parse googler-freeze-20260910-audited-100-2`로 항상 정확한 대상 확인 가능, 태그 메시지에 고친 결함 목록·재채점 근거·검증 규모·라이브 실측값 전부 있음 — `git show googler-freeze-20260910-audited-100-2`) = 대표 지시 순서(문서 정리 → 종합감사 100 → 배포 → 프리즈)의 완료 지점. `_shared/DOC-STANDARD.md` 기준 문서 정리 + COMMON_STANDARDS §4~§7·§21 종합감사((A)트랙 10개 항목 100점, 검사·테스트 결함 3건 수정) + 배포 성공까지 반영. `npm run check` 통과 + 시각 회귀 20/20 + 실제로 `git checkout <태그> -- .` 실행해 차이 0건 확인 후 원위치.

직전 지점 **`googler-freeze-20260910-audited-100`**(`dfa5fb3`) = 위와 같은 라운드지만 결함 3(MainWorldV3.test.tsx의 두 번째 같은 패턴)을 찾기 전 시점 — 하루 안에 같은 라운드가 갱신된 경우라 시간차가 짧다.

그 전 **`googler-freeze-20260908-docs`** (문서 자기참조 특성상 여기 적는 커밋 해시가 태그 발행 순간의 정확한 HEAD와 한두 커밋 어긋날 수 있다) = 문서 구조 정비 완료 지점(`_docs/` 통합, `AGENTS.md`·개별법 신설, CHANGELOG 분리, pre-push 훅 추가)이고, 그 직전의 홈 화면 3건(스플래시 지연, 히어로 링크 가독성, CTA 간격)까지 포함한다.

그 전 **`googler-freeze-20260902-2`**(`1165bad`) = Firebase Hosting 이관 + §7 종합감사 수정분까지 반영된 상태 — 자세한 내용은 `_docs/CHANGELOG.md`의 "2026-09-02 종합감사(§7)" 섹션 참고.

**이 섹션은 다음 정밀감사 라운드마다 반드시 최신 태그로 갱신할 것 — 낡은 채로 방치되면 실제 장애 시 이 문서를 그대로 따르는 것 자체가 사고 원인이 된다**(2026-08-26 정밀 재감사에서 실제로 35커밋 낡은 채 방치돼 있던 것이 발견된 전례, 그리고 2026-09-02 Opus 감사에서 이 섹션의 복구 명령이 `googler-freeze-20260826-3`을 가리킨 채 한 라운드 낡아있던 게 다시 발견된 전례 — 두 번째 사고는 태그를 새로 찍고도 아래 복구 명령 줄을 안 고치면 무의미하다는 걸 보여준다. 태그를 찍고 문서를 고친 직후에도 `git log --oneline -5`로 다시 한번 최신 여부를 확인하는 습관이 필요하다).

이전 지점들 — `googler-freeze-20260902-2`(`1165bad`), `googler-freeze-20260902`, `googler-freeze-20260826-3`(`edbd389`), `googler-freeze-20260826-2`(`36bae4f`), `googler-freeze-20260826`(`b74face`), `googler-exhibition-freeze-2026-08-17`(`e936bfe`), `googler-exhibition-freeze-2026-08-14`(`5413b7c`), `googler-exhibition-freeze-2026-08-13`(`990046e`) — 도 그대로 보존돼 있다. 더 이전 상태로 돌아가야 할 특수한 경우에만 사용. **주의**: `googler-freeze-20260902` 이전 태그로 복구하면 Firebase Hosting 이관 전체가 되돌아가 GitHub Pages 시절 상태로 돌아간다는 뜻이다 — GitHub Pages 배포 자체는 이미 폐기됐으니 그 상태로 되돌리는 건 특히 신중해야 한다.

이후 수정으로 뭔가 망가졌을 때 복구 절차 (디버깅하지 말고 바로 복원):

```bash
git checkout googler-freeze-20260910-audited-100-2 -- .
```

그 다음 변경사항 확인 후 커밋·푸시하면 Firebase Hosting(`https://googler.edutogether.kr/`, 구 주소 `g00gler.web.app`도 동일하게 갱신됨)이 검증된 상태로 재배포된다.

**주의**: 이 저장소는 여러 세션에서 동시에 작업될 수 있다. 프리즈 태그를 새로 찍기 전에 항상 `git log --oneline -5`로 HEAD가 예상한 지점인지 먼저 확인할 것 — 마지막으로 내가 만든 커밋이 아닐 수 있다.

**기존 태그를 옮기거나 덮어쓰지 말 것 — 항상 새 날짜 태그를 찍는다**(CONVENTIONS §3.4). 태그를 덮어쓰는 순간 되돌아갈 지점 자체가 사라지기 때문이다. `.githooks/pre-push`가 원격의 freeze 태그 삭제·이동을 실제로 차단한다(신규 생성은 통과). 훅은 클론마다 `git config core.hooksPath .githooks`로 켜야 한다.

**찍은 태그는 반드시 push할 것** — `git push origin main`은 태그를 함께 보내지 않는다. 로컬에만 있는 복구 지점은 다른 기기에서 동작하지 않으므로 복구 지점이 아니다(2026-09-08에 `googler-freeze-20260902-2`가 실제로 이 상태로 발견돼 push함). `comm -23 <(git tag -l | sort) <(git ls-remote --tags origin | grep -v '\^{}' | awk '{print $2}' | sed 's|refs/tags/||' | sort)`로 대조한다.
