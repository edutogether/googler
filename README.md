# Be a Googler

같이교육 구성원이 Google Educator Level 1·2부터 Trainer·Innovator까지 준비할 수 있도록 확장 예정인 학습·진도·랭킹 웹앱입니다.

## 현재 상태

- Gemini Canvas에서 확보한 원형 TSX를 실행 가능한 React + Vite + Tailwind CSS 프로젝트로 복원
- Level 1·2 학습 카드, 체크리스트, 진도율, 랭킹 화면 포함
- Firebase 설정값은 아직 비어 있으며 다음 단계에서 새 Firebase 프로젝트에 연결 예정
- 이름 + PIN 로그인, 슈퍼어드민, 공부 캘린더는 후속 개발 예정

## 실행

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

## 기준 버전

`v0-gemini-original` — Gemini 원형 보존용 최초 기준점

## GitHub Pages

이 저장소는 `https://817beatles.github.io/googler/` 경로로 배포되도록 Vite `base`와 GitHub Actions가 설정되어 있습니다.
저장소 Settings → Pages → Build and deployment → Source에서 `GitHub Actions`를 선택하세요.
