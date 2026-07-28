import type { Course, CourseLevel, LearningDay } from './course';

export type ProgressState = Record<string, boolean | undefined>;

export function missionStorageKey(level: CourseLevel, day: LearningDay, missionIndex: number) {
  return `${level}_${day.progressKey}_${missionIndex}`;
}

export function completedMissionIds(progress: ProgressState, courses: Course[]) {
  return courses.flatMap((course) => course.days.flatMap((day) => day.missions.filter((_, index) => progress[missionStorageKey(course.level, day, index)]).map((mission) => mission.id)));
}

export function countCompletedMissions(completedIds: readonly string[], course: Course) {
  const validIds = new Set(course.days.flatMap((day) => day.missions.map((mission) => mission.id)));
  return new Set(completedIds.filter((id) => validIds.has(id))).size;
}

export function isDayComplete(completedIds: readonly string[], day: LearningDay) {
  const completed = new Set(completedIds);
  return day.missions.length > 0 && day.missions.every((mission) => completed.has(mission.id));
}

export function isLevelComplete(completedIds: readonly string[], course: Course) {
  return course.days.length > 0 && course.days.every((day) => isDayComplete(completedIds, day));
}

export function progressPercent(completedIds: readonly string[], course: Course) {
  const total = course.days.reduce((count, day) => count + day.missions.length, 0);
  if (!total) return 0;
  return Math.max(0, Math.min(100, Math.round((countCompletedMissions(completedIds, course) / total) * 100)));
}

export function overallProgressPercent(completedIds: readonly string[], courses: Course[]) {
  const total = courses.flatMap((course) => course.days.flatMap((day) => day.missions)).length;
  if (!total) return 0;
  const completed = new Set(completedIds);
  const validIds = new Set(courses.flatMap((course) => course.days.flatMap((day) => day.missions.map((mission) => mission.id))));
  return Math.max(0, Math.min(100, Math.round(([...completed].filter((id) => validIds.has(id)).length / total) * 100)));
}

export function isCourseComplete(completedIds: readonly string[], courses: Course[]) {
  return courses.length > 0 && courses.every((course) => isLevelComplete(completedIds, course));
}

export function rankingScore(completedIds: readonly string[], courses: Course[]) {
  return courses.reduce((score, course) => score + countCompletedMissions(completedIds, course), 0);
}

export function shouldCelebrateDayCompletion(previousIds: readonly string[], nextIds: readonly string[], day: LearningDay) {
  return !isDayComplete(previousIds, day) && isDayComplete(nextIds, day);
}
