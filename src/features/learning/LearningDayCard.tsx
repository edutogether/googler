import { BookOpen, Check, HelpCircle, MonitorPlay, Share2 } from 'lucide-react';
import type { CourseLevel, LearningDay } from '../../domain/course';
import { MissionChecklist } from './MissionChecklist';

type LearningDayCardProps = {
  currentLevel: CourseLevel;
  dayItem: LearningDay;
  index: number;
  isDayComplete: boolean;
  progress: Record<string, boolean>;
  theme: { bg: string; highlight: string; text: string };
  onToggleCheck: (dayProgressKey: string, missionIndex: number) => void;
  onShare: (day: LearningDay, index: number) => void;
};

export function LearningDayCard({ currentLevel, dayItem, index, isDayComplete, progress, theme, onToggleCheck, onShare }: LearningDayCardProps) {
  return (
                          <div key={dayItem.id} className={`bg-white rounded-[2rem] shadow-sm border overflow-hidden transition-all duration-300 ${isDayComplete ? 'border-[#CEEAD6] shadow-[#E6F4EA]' : 'border-[#E8EAED] hover:shadow-md'}`}>
                            <div className={`p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isDayComplete ? 'bg-[#F3F8F4]' : theme.bg}`}>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`text-xs font-extrabold px-3 py-1 rounded-lg tracking-wide ${isDayComplete ? 'bg-[#CEEAD6] text-[#0D652D]' : `${theme.highlight} ${theme.text}`}`}>
                                    Day {index + 1}
                                  </span>
                                  {isDayComplete && <span className="flex items-center text-xs font-bold text-[#0D652D]"><Check className="w-3.5 h-3.5 mr-0.5" /> 100% 완료</span>}
                                </div>
                                <h3 className="text-xl font-extrabold text-[#202124] flex items-center gap-2">{dayItem.title}</h3>
                                <p className="text-sm text-[#5F6368] mt-1.5 font-medium">{dayItem.description}</p>
                              </div>
                            </div>

                            <div className="px-6 md:px-8 py-4 border-y border-[#E8EAED] bg-white flex flex-wrap gap-2">
                              <a href={dayItem.resources.help.url} target="_blank" rel="noreferrer" className="flex-1 min-w-[100px] flex flex-col items-center justify-center p-3 rounded-xl bg-[#F8F9FA] hover:bg-[#FCE8E6] text-[#5F6368] hover:text-[#D93025] transition-colors border border-[#E8EAED] group"><HelpCircle className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" /><span className="text-[11px] font-bold">공식 도움말</span></a>
                              <a href={dayItem.resources.youtube.url} target="_blank" rel="noreferrer" className="flex-1 min-w-[100px] flex flex-col items-center justify-center p-3 rounded-xl bg-[#F8F9FA] hover:bg-[#FEF7E0] text-[#5F6368] hover:text-[#E37400] transition-colors border border-[#E8EAED] group"><MonitorPlay className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" /><span className="text-[11px] font-bold">영상 콘텐츠</span></a>
                              <a href={dayItem.resources.education.url} target="_blank" rel="noreferrer" className="flex-1 min-w-[100px] flex flex-col items-center justify-center p-3 rounded-xl bg-[#F8F9FA] hover:bg-[#E8F0FE] text-[#5F6368] hover:text-[#1A73E8] transition-colors border border-[#E8EAED] group"><BookOpen className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" /><span className="text-[11px] font-bold">공식 가이드</span></a>
                            </div>

                            <div className="p-6 md:p-8 bg-white">
                              <MissionChecklist
                                currentLevel={currentLevel}
                                dayItem={dayItem}
                                progress={progress}
                                onToggleCheck={onToggleCheck}
                              />
                              <div className="mt-6 pt-6 border-t border-[#E8EAED]">
                                <button
                                  onClick={() => onShare(dayItem, index)}
                                  disabled={!isDayComplete}
                                  className={`w-full font-extrabold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-transform text-lg ${isDayComplete ? 'bg-[#FEE500] hover:bg-[#F4DC00] text-[#371D1E] active:scale-95 cursor-pointer' : 'bg-[#F1F3F4] text-[#9AA0A6] cursor-not-allowed opacity-70'}`}
                                >
                                  <Share2 className="w-6 h-6" />
                                  {isDayComplete ? '미션 완료! 단톡방에 링크 공유하기 🎉' : '위 미션을 먼저 완료해주세요!'}
                                </button>
                              </div>
                            </div>
                          </div>
  );
}
