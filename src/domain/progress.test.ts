import { describe, expect, it } from 'vitest';
import { courses } from '../content/courses';
import { countCompletedMissions, isCourseComplete, isDayComplete, isLevelComplete, overallProgressPercent, progressPercent, rankingScore, shouldCelebrateDayCompletion } from './progress';

const levelOne = courses[0];
const allIds = courses.flatMap((course) => course.days.flatMap((day) => day.missions.map((mission) => mission.id)));

describe('progress domain', () => {
  it('counts valid unique mission completion safely', () => {
    expect(countCompletedMissions([], levelOne)).toBe(0);
    expect(countCompletedMissions([levelOne.days[0].missions[0].id, levelOne.days[0].missions[0].id, 'unknown'], levelOne)).toBe(1);
    expect(progressPercent([], levelOne)).toBe(0);
    expect(progressPercent([...allIds, 'unknown'], levelOne)).toBe(100);
  });

  it('calculates day, level, and course completion', () => {
    const firstDay = levelOne.days[0];
    const firstDayIds = firstDay.missions.map((mission) => mission.id);
    const levelOneIds = levelOne.days.flatMap((day) => day.missions.map((mission) => mission.id));

    expect(isDayComplete(firstDayIds, firstDay)).toBe(true);
    expect(isLevelComplete(levelOneIds, levelOne)).toBe(true);
    expect(isCourseComplete(allIds, courses)).toBe(true);
    expect(overallProgressPercent(allIds, courses)).toBe(100);
    expect(rankingScore(allIds, courses)).toBe(60);
    expect(shouldCelebrateDayCompletion([], firstDayIds, firstDay)).toBe(true);
  });
});
