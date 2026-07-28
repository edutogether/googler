# Be a Googler

같이교육 구성원의 Google Educator Level 1·2 학습을 돕는 프런트엔드 프로토타입입니다. 현재 20개 Day, 60개 미션, 공식 학습 링크, 프로필 UI, 진행률 미리보기, 시험·재도전 안내와 공유 기능을 제공합니다.

Firebase 인증·실제 진도 저장·공개 랭킹·관리자·플래너·Trainer·Innovator 과정은 아직 구현하지 않았습니다. Firebase 환경변수가 비어 있으면 앱은 콘텐츠를 안전하게 열람하고 브라우저 내 미리보기 진행률만 제공합니다.

## 개발

```bash
npm ci
npm run dev
npm run typecheck
npm run lint
npm run test:run
npm run build
```

`npm run check`은 전체 품질 검사를 실행합니다. 환경 변수 이름은 `.env.example`을 참고하며 실제 값은 커밋하지 않습니다.

## 구조

- `src/content`: 과정·Day·미션·공식 링크
- `src/domain`: 안정적 ID와 순수 진행률 규칙
- `src/data/firebase`: 미연결 Firebase 설정 및 향후 저장소 경계
- `src/shared`: 공유 유틸리티

공식 저장소는 https://github.com/edutogether/googler 이며 Pages 주소는 https://edutogether.github.io/googler/ 입니다. Pages 배포는 main push와 수동 실행에서 이루어집니다.
