import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { courses } from '../../content/courses';

// firestore.rules hard-codes two values that live elsewhere: the score ceiling
// (the real mission count per level) and the namespace segment (the client's
// default). Neither can be imported into the rules, so this reads both sides
// and fails if they drift. It needs no emulator, so it runs in test:run.
const root = path.join(import.meta.dirname, '..', '..', '..');
const rules = readFileSync(path.join(root, 'firestore.rules'), 'utf8');
const services = readFileSync(path.join(root, 'src', 'data', 'firebase', 'firebaseServices.ts'), 'utf8');

const missionCount = (level: 'L1' | 'L2') => {
  const course = courses.find((item) => item.level === level);
  return course ? course.days.reduce((count, day) => count + day.missions.length, 0) : 0;
};

describe('firestore.rules stays in sync with the app', () => {
  it('found the course data and the rules text — otherwise every check below is vacuous', () => {
    expect(missionCount('L1')).toBeGreaterThan(0);
    expect(missionCount('L2')).toBeGreaterThan(0);
    expect(rules).toContain('rankings/{uid}');
  });

  it.each([['scoreL1', 'L1'], ['scoreL2', 'L2']] as const)('%s ceiling equals the real number of %s missions', (field, level) => {
    const match = rules.match(new RegExp(`${field} >= 0 && request\\.resource\\.data\\.${field} <= (\\d+)`));
    expect(match).not.toBeNull();
    expect(Number(match![1])).toBe(missionCount(level));
  });

  it('uses the same namespace as the client default, with no {appId} wildcard left', () => {
    const clientDefault = services.match(/VITE_FIRESTORE_NAMESPACE \?\? '([^']+)'/);
    expect(clientDefault).not.toBeNull();
    expect(rules).toContain(`match /artifacts/${clientDefault![1]}/`);
    expect(rules).not.toMatch(/match \/artifacts\/\{/);
  });
});
