export type JourneyLevel = {
  id: 'start' | 'foundation' | 'practice' | 'advanced';
  name: string;
  description: string;
  example: string;
  recommendation: string;
  duration: string;
  weeklySessions: string;
  dailyMinutes: string;
};

export const journeyLevels: readonly JourneyLevel[] = [
  {
    id: 'start',
    name: '처음부터 시작하기',
    description: 'Google을 처음 쓰거나 계정 사용이 아직 낯선 분을 위한 단계예요.',
    example: 'Google 계정 만들기, 로그인·로그아웃, 비밀번호 찾기부터 차근차근 배워요.',
    recommendation: '진단에서 기초 사용 경험을 더 쌓고 싶다고 답했어요.',
    duration: '8주',
    weeklySessions: '주 3회',
    dailyMinutes: '하루 30분',
  },
  {
    id: 'foundation',
    name: '기초를 탄탄하게',
    description: '기본 사용 경험은 있지만 더 편하게 쓰는 습관을 만들고 싶은 단계예요.',
    example: 'Gmail, Drive의 기본 기능을 실제 행동 순서로 정리해요.',
    recommendation: '핵심 도구를 일상에서 안정적으로 쓰는 연습이 도움이 돼요.',
    duration: '6주',
    weeklySessions: '주 3회',
    dailyMinutes: '하루 30분',
  },
  {
    id: 'practice',
    name: '활용 능력 넓히기',
    description: '이미 아는 도구를 공유와 협업 상황에 연결해 보고 싶은 단계예요.',
    example: '공유, 협업, 수업·업무 활용 능력을 연결해서 배워요.',
    recommendation: '혼자 쓰는 기능을 함께 쓰는 흐름으로 넓혀 볼 수 있어요.',
    duration: '5주',
    weeklySessions: '주 4회',
    dailyMinutes: '하루 35분',
  },
  {
    id: 'advanced',
    name: '심화·시험 준비',
    description: '복합 상황을 해결하고 Google Educator 시험까지 준비하는 단계예요.',
    example: '복합 상황 해결과 Google Educator 시험 준비를 진행해요.',
    recommendation: '현재 경험을 바탕으로 더 높은 목표에 도전할 준비가 되었어요.',
    duration: '4주',
    weeklySessions: '주 4회',
    dailyMinutes: '하루 40분',
  },
];
