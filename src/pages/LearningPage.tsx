import { coursesByLevel } from '../content/courses';
import type { CourseLevel, LearningDay } from '../domain/course';
import { isDayComplete as isLearningDayComplete } from '../domain/progress';
import { LearningDayCard } from '../features/learning/LearningDayCard';

const themeColors: Record<string, { bg: string; highlight: string; text: string }> = {
  blue: { bg: 'bg-[#E8F0FE]', highlight: 'bg-[#D2E3FC]', text: 'text-[#1967D2]' },
  red: { bg: 'bg-[#FCE8E6]', highlight: 'bg-[#FAD2CF]', text: 'text-[#C5221F]' },
  yellow: { bg: 'bg-[#FEF7E0]', highlight: 'bg-[#FEEFC3]', text: 'text-[#E37400]' },
  green: { bg: 'bg-[#E6F4EA]', highlight: 'bg-[#CEEAD6]', text: 'text-[#137333]' },
};

type LearningPageProps = {
  currentLevel: CourseLevel;
  completedIds: string[];
  progress: Record<string, boolean>;
  onToggleCheck: (dayProgressKey: string, missionIndex: number) => void;
  onShare: (day: LearningDay, index: number) => void;
};

export function LearningPage({ currentLevel, completedIds, progress, onToggleCheck, onShare }: LearningPageProps) {
  return (
                  <div className="space-y-6 animate-fade-in">
                    <div className={`p-8 rounded-[2rem] shadow-sm text-white relative overflow-hidden ${currentLevel === 'L1' ? 'bg-gradient-to-r from-[#1A73E8] to-[#4285F4]' : 'bg-gradient-to-r from-[#EA4335] to-[#f06b60]'}`}>
                      <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
                      <h2 className="text-2xl font-extrabold mb-2 relative z-10">핵심 역량 마스터 코스 🌱</h2>
                      <p className="text-white/90 relative z-10 font-medium text-sm">하루 30분, 매일매일 미션을 깨고 랭킹 점수를 획득하세요!</p>
                    </div>

                    <div className="space-y-5">
                  {coursesByLevel[currentLevel].days.map((dayItem, index) => {
                    const isDayComplete = isLearningDayComplete(completedIds, dayItem);
                    const theme = themeColors[dayItem.theme] || themeColors.blue;

                    return (
                      <LearningDayCard
                        key={dayItem.id}
                        currentLevel={currentLevel}
                        dayItem={dayItem}
                        index={index}
                        isDayComplete={isDayComplete}
                        progress={progress}
                        theme={theme}
                        onToggleCheck={onToggleCheck}
                        onShare={onShare}
                      />
                    );
                  })}
                </div>
              </div>
  );
}
