import { Check } from 'lucide-react';
import type { CourseLevel, LearningDay } from '../../domain/course';
import { missionStorageKey } from '../../domain/progress';

type MissionChecklistProps = {
  currentLevel: CourseLevel;
  dayItem: LearningDay;
  progress: Record<string, boolean>;
  onToggleCheck: (dayProgressKey: string, missionIndex: number) => void;
};

export function MissionChecklist({ currentLevel, dayItem, progress, onToggleCheck }: MissionChecklistProps) {
  return (
    <div className="space-y-3">
                                  {dayItem.missions.map((mission, idx) => {
                                    const isChecked = progress[missionStorageKey(currentLevel, dayItem, idx)] || false;
                                    return (
                                      <label key={idx} className={`flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all border ${isChecked ? 'bg-[#F8F9FA] border-transparent shadow-none' : 'bg-white border-[#E8EAED] hover:border-[#DADCE0]'}`}>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isChecked ? 'bg-[#34A853] border-[#34A853]' : 'border-[#DADCE0]'}`}>
                                          {isChecked && <Check className="w-4 h-4 text-white" />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={isChecked} onChange={() => onToggleCheck(dayItem.progressKey, idx)} />
                                        <span className={`text-sm font-medium transition-colors ${isChecked ? 'text-[#9AA0A6] line-through' : 'text-[#202124]'}`}>{mission.text}</span>
                                      </label>
                                    )
                                  })}
    </div>
  );
}
