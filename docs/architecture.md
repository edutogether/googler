# Architecture

`content`는 화면 문구와 분리된 안정적 과정·Day·미션 ID를 소유한다. `domain`은 React와 Firebase에 의존하지 않는 진행률 규칙을 소유한다. `data`는 외부 저장소 경계이며 UI는 Firebase SDK를 직접 호출하지 않는다. `App`은 화면 조립과 로컬 미리보기 상태만 맡는다.

Firebase 경로는 기존 `artifacts/{appId}/users/{uid}/profile/info`, `artifacts/{appId}/users/{uid}/user_progress/gpass_data`, `artifacts/{appId}/public/data/rankings/{uid}`를 유지한다. 콘텐츠 문구 변경 시에도 ID는 유지하며, 콘텐츠 버전은 실제 저장소가 도입될 때 기록한다.

향후 LMS/YouTube, planner/calendar, iCal, community, notifications, ranking, chatbot, admin은 실제 요구가 확정될 때 feature와 data 경계를 추가한다. 플래너는 목표·단계·날짜·요일·학습시간·자동재배치와 clean/formal, cheerful/energetic, calm/emotional 톤을 지원하고, 사용자가 일정 제목·설명·이모지·색상·메모·시간·개별 톤·잠금값을 수정할 수 있어야 한다. iCal에는 해당 개인화 정보와 학습 URL을 담는다. 미래 기능을 위한 빈 코드는 만들지 않는다.
