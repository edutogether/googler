# Be a Googler

같이교육 구성원이 Google Educator Level 1·2부터 Google Certified Trainer와 Innovator까지 단계적으로 학습하고, 서로의 진도와 성장을 함께 확인할 수 있는 학습·진도·랭킹 웹앱입니다.

## 프로젝트 소개

Be a Googler는 같이교육 구성원의 Google for Education 역량 성장을 지원하기 위한 내부 학습 프로젝트입니다.

단순히 학습자료를 확인하는 데서 끝나지 않고, 개인별 학습 진도와 활동 기록을 관리하고 구성원들이 서로의 성장 과정을 확인하며 함께 자격 취득에 도전할 수 있도록 개발하고 있습니다.

## 주요 기능

- Google Educator Level 1·2 학습 로드맵
- 학습 주제별 공식 도움말 제공
- 추천 영상 및 공식 학습자료 연결
- 일자별 학습 체크리스트
- 개인별 학습 진도율 확인
- Level 1·2 통합 학습 랭킹
- 시험 응시 및 합격 기록
- 모바일·PC 반응형 화면
- 학습 완료 및 합격 결과 공유

## 개발 예정 기능

- 이름과 개인 PIN을 이용한 로그인
- 일반 사용자·관리자·슈퍼어드민 권한 구분
- 사용자 계정 생성 및 활성·비활성 관리
- 개인 공부 캘린더
- 날짜별 학습 다이어리
- 학습시간 및 활동 기록
- 주간·월간 학습 리포트
- 배지 및 연속 학습일 기록
- Trainer 준비 과정
- Innovator 준비 과정
- 학습자료 및 과정 관리자 편집 기능
- Firebase 기반 사용자·진도 데이터 관리
- 웹푸시 및 학습 알림
- AI 기반 오답 설명 및 개인별 학습 추천

## 학습 과정

### Google Educator Level 1

- Chrome 및 Google Drive
- Google Docs
- Google Slides
- Google Forms
- Google Classroom
- Gmail
- Google Calendar 및 Tasks
- Google Meet
- Google Sites
- Google Groups 및 Google Keep

### Google Educator Level 2

- Google Drive 및 Docs 심화
- Google Sheets 심화
- Google Forms 및 Classroom 심화
- YouTube 교육 활용
- Google Sites 심화
- Google Earth 및 지도 활용
- Gmail 및 Calendar 심화
- Google Meet 및 Chat 활용
- Google Trends 및 Google Scholar
- 최종 복습 및 모의평가

## 기술 구성

- React
- TypeScript
- Vite
- Tailwind CSS
- Firebase Authentication
- Cloud Firestore
- GitHub
- GitHub Actions
- GitHub Pages

## 프로젝트 구조

```text
googler/
├─ .github/
│  └─ workflows/
│     └─ deploy-pages.yml
├─ src/
│  ├─ App.tsx
│  ├─ main.tsx
│  └─ index.css
├─ index.html
├─ package.json
├─ package-lock.json
├─ postcss.config.js
├─ tailwind.config.js
├─ tsconfig.json
├─ vite.config.ts
└─ README.md
```

## 로컬 실행

프로젝트를 컴퓨터에서 실행하려면 Node.js가 설치되어 있어야 합니다.

저장소를 내려받은 뒤 프로젝트 폴더에서 아래 명령어를 실행합니다.

```bash
npm install
npm run dev
```

개발 서버가 실행되면 터미널에 표시되는 로컬 주소로 접속합니다.

일반적으로 아래와 같은 주소가 사용됩니다.

```text
http://localhost:5173
```

## 프로덕션 빌드

실제 배포용 파일을 생성하려면 아래 명령어를 실행합니다.

```bash
npm run build
```

빌드가 완료되면 프로젝트 최상위에 `dist` 폴더가 생성됩니다.

빌드된 앱을 로컬에서 미리 확인하려면 아래 명령어를 실행합니다.

```bash
npm run preview
```

## GitHub Pages 배포

이 프로젝트는 GitHub Pages를 통해 배포합니다.

배포 주소는 다음과 같습니다.

```text
https://817beatles.github.io/googler/
```

Vite 프로젝트가 GitHub Pages의 `/googler/` 경로에서 정상적으로 실행될 수 있도록 `vite.config.ts`의 `base` 값이 설정되어 있습니다.

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/googler/',
})
```

## GitHub Pages 최초 설정

GitHub 저장소에서 아래 순서로 설정합니다.

```text
Settings
→ Pages
→ Build and deployment
→ Source
→ GitHub Actions
```

`GitHub Actions`를 선택하면 `.github/workflows/deploy-pages.yml` 파일을 기준으로 자동 배포가 진행됩니다.

## 자동 배포 방식

`main` 브랜치에 코드가 반영되면 GitHub Actions가 자동으로 다음 작업을 수행합니다.

```text
main 브랜치 업데이트
→ 프로젝트 의존성 설치
→ 프로덕션 빌드
→ GitHub Pages 배포
→ 실제 서비스 주소 반영
```

배포 진행 상태는 저장소 상단의 `Actions` 메뉴에서 확인할 수 있습니다.

정상적으로 완료되면 초록색 체크 표시가 나타납니다.

## Firebase 연결 예정

Firebase는 다음 기능에 사용합니다.

- 사용자 인증
- 개인별 학습 진도 저장
- 공부 다이어리 저장
- 실시간 랭킹
- 관리자 권한 관리
- 사용자 계정 관리
- 학습 활동 로그
- 주간 리포트 데이터
- 알림 및 향후 AI 기능 연동

Firebase 설정값은 공개 저장소 코드에 직접 입력하지 않고 환경변수로 관리합니다.

실제 환경변수 파일인 `.env`는 GitHub에 업로드하지 않습니다.

환경변수 예시는 `.env.example` 파일에서 관리합니다.

```text
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## 개발 운영 방식

Be a Googler는 실제 사용 과정에서 발견되는 문제와 개선사항을 지속적으로 반영하는 방식으로 개발합니다.

```text
기능 개발
→ GitHub 반영
→ 자동 배포
→ 실제 화면 테스트
→ 오류 및 개선사항 확인
→ 수정 및 재배포
```

## 향후 개발 단계

### 1단계

- 기존 학습 화면 안정화
- GitHub Pages 배포
- Firebase 프로젝트 연결
- 사용자 데이터 저장 구조 구현

### 2단계

- 이름 및 PIN 로그인
- 슈퍼어드민 기능
- 사용자 계정 관리
- 개인 공부 캘린더
- 학습 다이어리
- 관리자 대시보드

### 3단계

- 주간 학습 리포트
- 웹푸시 알림
- 배지 및 연속 학습 기록
- Trainer·Innovator 과정
- AI 학습 코치
- 개인별 오답 설명
- 다음 학습 추천

## 안내

Be a Googler는 같이교육 구성원을 위한 내부 학습 프로젝트입니다.

Google 및 Google for Education의 공식 서비스나 공식 인증 플랫폼이 아닙니다.
