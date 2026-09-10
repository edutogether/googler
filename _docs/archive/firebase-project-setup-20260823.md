# Firebase 프로젝트 신규 생성·보강 (2026-08-17~2026-09-02)

2026-09-10 문서 정리 라운드에서 `CLAUDE.md`에서 옮겨온 완료된 작업 기록이다.
현재 유효한 사실(프로젝트 ID, 배포 번들에 Firebase 호출 0건 등)은
`.claude/rules/app.md`의 "앱"·"데이터" 섹션 참고.

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
