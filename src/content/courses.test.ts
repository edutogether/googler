import { describe, expect, it } from 'vitest';
import { courses } from './courses';

describe('course content integrity', () => {
  it('preserves the complete two-level curriculum as explicit data', () => {
    const days = courses.flatMap((course) => course.days);
    const missions = days.flatMap((day) => day.missions);

    expect(courses).toHaveLength(2);
    expect(courses[0].days).toHaveLength(10);
    expect(courses[1].days).toHaveLength(10);
    expect(days).toHaveLength(20);
    expect(missions).toHaveLength(60);
    expect(days.every((day) => day.missions.length === 3)).toBe(true);
    expect(new Set(courses.map((course) => course.id)).size).toBe(2);
    expect(new Set(days.map((day) => day.id)).size).toBe(20);
    expect(new Set(missions.map((mission) => mission.id)).size).toBe(60);
    expect(courses.every((course) => course.title.trim().length > 0)).toBe(true);
    expect(days.every((day) => day.title.trim().length > 0)).toBe(true);
    expect(missions.every((mission) => mission.text.trim().length > 0)).toBe(true);
  });

  it('keeps every resource complete and retains representative original links', () => {
    const resources = courses.flatMap((course) => course.days.flatMap((day) => Object.values(day.resources)));

    expect(resources).toHaveLength(60);
    expect(resources.every((resource) => resource.label && resource.url)).toBe(true);
    expect(resources.every((resource) => /^https:\/\//.test(resource.url))).toBe(true);
    expect(courses[0].days[0].resources.help.url).toBe('https://support.google.com/drive/answer/2424368?hl=ko');
    expect(courses[1].days[9].resources.education.url).toBe('https://skillshop.exceedlms.com/student/path/61210-google-workspace-advanced');
  });
});
