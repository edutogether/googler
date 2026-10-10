import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { courses } from '../../content/courses';

// firestore.rules hard-codes the namespace segment (the client's default), which
// cannot be imported into the rules, so this reads both sides and fails if they
// drift. It also pins that the ranking score/pass fields stay locked. It needs
// no emulator, so it runs in test:run.
const root = path.join(import.meta.dirname, '..', '..', '..');
const rules = readFileSync(path.join(root, 'firestore.rules'), 'utf8');
const services = readFileSync(path.join(root, 'src', 'data', 'firebase', 'firebaseServices.ts'), 'utf8');

describe('firestore.rules stays in sync with the app', () => {
  it('found the rules text — otherwise every check below is vacuous', () => {
    expect(rules).toContain('rankings/{uid}');
  });

  it.each(['scoreL1', 'scoreL2', 'passedL1', 'passedL2'])('keeps %s locked against client writes', (field) => {
    expect(rules).toContain(`unchanged('${field}')`);
  });

  it('caps the progress map at the real mission count plus the two pass flags', () => {
    const missions = courses.reduce((total, course) => total + course.days.reduce((count, day) => count + day.missions.length, 0), 0);
    expect(missions).toBeGreaterThan(0);
    const match = rules.match(/progress\.size\(\) <= (\d+)/);
    expect(match).not.toBeNull();
    expect(Number(match![1])).toBe(missions + 2);
  });

  it('uses the same namespace as the client default, with no {appId} wildcard left', () => {
    const clientDefault = services.match(/VITE_FIRESTORE_NAMESPACE \?\? '([^']+)'/);
    expect(clientDefault).not.toBeNull();
    expect(rules).toContain(`match /artifacts/${clientDefault![1]}/`);
    expect(rules).not.toMatch(/match \/artifacts\/\{/);
  });
});
