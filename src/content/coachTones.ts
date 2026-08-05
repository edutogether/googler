export type CoachTone = {
  id: 'calm' | 'mate' | 'trainer';
  name: string;
  description: string;
  line: string;
  accentClass: string;
  selectedClass: string;
};

export const coachTones: readonly CoachTone[] = [
  { id: 'calm', name: '차분한 코치', description: '한 걸음씩 정리하며 함께 가는 안내자예요.', line: '서두르지 않아도 한 걸음씩 충분히 잘하고 있어요.', accentClass: 'bg-[#1a73e8]', selectedClass: 'border-[#1a73e8] bg-[#e8f0fe]' },
  { id: 'mate', name: '발랄한 메이트', description: '가볍게 응원하며 미션을 함께 깨는 동료예요.', line: '좋아! 오늘 미션도 같이 깨보자! ✨', accentClass: 'bg-gradient-to-r from-[#fbbc04] to-[#34a853]', selectedClass: 'border-[#34a853] bg-[#f1f8e9]' },
  { id: 'trainer', name: '도전형 트레이너', description: '분명한 목표와 기록으로 성장을 이끄는 트레이너예요.', line: '준비 완료. 오늘의 기록을 갱신해볼까요?', accentClass: 'bg-[#ea4335]', selectedClass: 'border-[#ea4335] bg-[#fce8e6]' },
];
