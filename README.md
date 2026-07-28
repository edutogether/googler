# Be a Googler

Google Educator Level 1·2 학습을 위한 20일, 60개 미션 기반의 동료 학습 앱입니다.

## Stage 0

Stage 0는 원본 제품의 문구·디자인·학습 흐름·60개 외부 리소스 URL을 보존하면서 콘텐츠, 도메인 로직, Firebase 경계, 화면 컴포넌트를 분리합니다. Firebase 환경 변수가 없거나 불완전하면 앱은 preview 모드로 실행됩니다. preview 데이터는 세션 한정이며 서버에 저장되지 않습니다.

## 실행과 검증

```bash
npm ci
npm run dev
npm run typecheck
npm run lint
npm run test:run
npm run build
npm run check
npm run preview
```

Vite base는 GitHub Pages의 `/googler/`이며 공식 Pages URL은 `https://817beatles.github.io/googler/`입니다.

## 구조

```text
src/
  content/       # Course, Day, Mission, 리소스 URL
  domain/        # 진행률·완료·점수 순수 로직과 타입
  data/          # AppServices, Firebase 구현, preview 구현
  pages/         # 시작·학습·시험·재도전·랭킹 화면
  features/      # 프로필·학습 카드·공유·완료 UI
  legacy/        # 최상위 상태, 서비스 연결, 이벤트, 페이지 조립
```

Firebase 변수는 `.env.example`을 참고합니다. 실제 Firebase 인증과 보안 정책은 후속 단계에서 다룹니다. 비밀값과 실제 `.env` 파일은 commit하지 않습니다.

현재 자동 테스트는 콘텐츠/도메인/서비스/화면 상호작용을 검증합니다. Stage 1에서는 실제 Firebase 보안 정책, 운영 인증 흐름, 사용자 데이터 운영 검증을 수행합니다.
