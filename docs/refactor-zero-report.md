# Refactor zero report

기존 단일 App에 콘텐츠·진도·공유·미연결 Firebase 코드가 결합되어 있었고, 사설 registry lockfile과 lockfile을 무시하는 Pages 설치가 있었습니다. 콘텐츠와 순수 진행률 규칙·공유 유틸리티를 분리하고, Firebase는 환경변수 설정과 향후 저장소 경계로 격리했습니다. 미사용 Firebase SDK 및 숨은 token 로그인 의존성은 제거했습니다. 남은 부채는 Firebase 인증/Rules 결정, 실제 저장소 구현, 컴포넌트 세분화입니다.
