export function missionShareMessage(dayTitle = '', dayNumber = 0, progress = 0) {
  return {
    title: 'Google Educator Maker 미션 인증',
    text: `🚀 [Google Educator Maker]\n\n오늘 미션 클리어! ✌️✨\n👉 Day ${dayNumber} - '${dayTitle}'\n\n🔥 나의 현재 달성률: ${Math.max(0, Math.min(100, progress))}%\n얼른 들어와서 같이 구글 마스터 됩시다! 🏃‍♂️💨`
  };
}

export function levelShareMessage(level = '') {
  return {
    title: 'Google Educator Maker 합격 인증',
    text: `🎉 끝까지 해냈어요! 저 구글 교육자 ${level} 합격했어요!! 🏆✨\n\n같이 으쌰으쌰 해준 멤버들 덕분이에요! 💖\n아직 시험 안 보신 분들 제 꿀기운 팍팍 받아가세요! 무조건 할 수 있습니다! 화이팅!! 🚀`
  };
}

export function courseShareMessage(nickname = '', courseName = '') {
  return `${nickname || '참여자'}님이 ${courseName || 'Google Educator Maker'} 전체 과정을 완료했어요!`;
}
