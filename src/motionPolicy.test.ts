import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// 2026-11-11 Bumm님 결정: 브라우저가 «움직임 줄이기(prefers-reduced-motion)»를 보고해도
// 앱은 없을 때와 똑같이 움직인다(공용·원격 PC가 아무도 켜지 않은 신호를 보고해 연출이 멈춰 보였다).
// 실제 동작은 `npm run motion`(두 조건 모두 브라우저로 확인)이 보고, 이 시험은 그 신호를 읽는
// 코드·CSS가 앱 소스에 되살아나지 않게 지킨다. 시험 파일과 이 정책을 설명하는 주석은 제외한다.
const root = path.join(import.meta.dirname, '..');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(css|html|ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [full] : [];
  });
}

describe('움직임 줄이기 신호', () => {
  const files = [path.join(root, 'index.html'), ...sourceFiles(path.join(root, 'src'))];

  it('검사 대상 파일을 실제로 읽는다', () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it('앱 소스는 prefers-reduced-motion을 읽지 않는다', () => {
    const offenders = files.filter((file) => /prefers-reduced-motion/.test(readFileSync(file, 'utf8').replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, '')));
    expect(offenders.map((file) => path.relative(root, file))).toEqual([]);
  });
});
