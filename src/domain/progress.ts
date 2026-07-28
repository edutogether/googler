import type { Course, CourseLevel } from './course'
export type Progress = Record<string, boolean | undefined>
export const missionKey = (level: CourseLevel, missionId: string) => `${level}:${missionId}`
export const completedMissionCount = (course: Course, progress: Progress) => course.days.flatMap((day) => day.missions).filter((mission) => progress[missionKey(course.id, mission.id)]).length
export const isDayComplete = (level: CourseLevel, day: Course['days'][number], progress: Progress) => day.missions.length > 0 && day.missions.every((mission) => progress[missionKey(level, mission.id)])
export const levelProgress = (course: Course, progress: Progress) => { const total = course.days.flatMap((day) => day.missions).length; return total ? Math.min(100, Math.max(0, Math.round(completedMissionCount(course, progress) / total * 100))) : 0 }
export const totalProgress = (courses: Course[], progress: Progress) => { const total = courses.flatMap((course) => course.days.flatMap((day) => day.missions)).length; const complete = courses.reduce((sum, course) => sum + completedMissionCount(course, progress), 0); return total ? Math.min(100, Math.max(0, Math.round(complete / total * 100))) : 0 }
export const isLevelComplete = (course: Course, progress: Progress) => levelProgress(course, progress) === 100
