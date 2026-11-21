import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// 규칙 장부(_docs/RULES.md)의 가벼운 규칙 검사기. 무엇을 재는지는 각 시험 이름 앞의 R-번호로 장부와 이어진다.
const root = path.join(import.meta.dirname, '..');
const read = (relative: string) => readFileSync(path.join(root, relative), 'utf8');

function files(dir: string, test: (name: string) => boolean): string[] {
  return readdirSync(path.join(root, dir)).flatMap((name) => {
    const relative = path.join(dir, name);
    if (statSync(path.join(root, relative)).isDirectory()) return files(relative, test);
    return test(name) ? [relative] : [];
  });
}

const sourceFiles = [...files('src', (n) => /\.(css|html|ts|tsx)$/.test(n) && !/\.test\.tsx?$/.test(n)), ...files('scripts', (n) => n.endsWith('.mjs')), 'index.html'];
const shellFiles = [...files('src/features/main-v3', (n) => /\.tsx?$/.test(n) && !/\.test\.tsx?$/.test(n)), 'src/App.tsx', 'index.html'];

describe('규칙 장부 검사기', () => {
  it('검사 대상 파일을 실제로 읽는다', () => {
    expect(sourceFiles.length).toBeGreaterThan(20);
    expect(shellFiles.length).toBeGreaterThan(8);
  });

  it('R-6: 코드와 스크립트에 TODO · FIXME를 남기지 않는다', () => {
    const offenders = sourceFiles.filter((file) => /\b(TODO|FIXME)\b/.test(read(file)));
    expect(offenders).toEqual([]);
  });

  it('R-5: 실제로 렌더링되는 화면(main-v3 · index.html)의 한글 문구는 느낌표 앞에 한 칸을 띄운다', () => {
    const offenders = shellFiles.filter((file) => /[가-힣]!/.test(read(file)));
    expect(offenders).toEqual([]);
  });

  it('R-20: 확인용 스크립트가 여는 주소에는 ?qa-mute=1이 붙어 있다', () => {
    for (const script of ['scripts/motion-check.mjs', 'scripts/visual-regression.mjs']) expect(read(script)).toMatch(/\?preview=main-v3&qa-mute=1/);
  });

  it('R-22: 소셜 카드는 «Be a Googler | …» 제목이고 그림은 자기 도메인에서 온다', () => {
    const html = read('index.html');
    expect(html).toMatch(/"og:title"\s+content="Be a Googler \| [^"]+"/);
    expect(html).toMatch(/"twitter:title"\s+content="Be a Googler \| [^"]+"/);
    const images = [...html.matchAll(/(?:og:image|og:image:secure_url|twitter:image)"\s+content="([^"]+)"/g)].map((m) => m[1]);
    expect(images.length).toBeGreaterThanOrEqual(3);
    for (const url of images) expect(url).toMatch(/^https:\/\/googler\.edutogether\.kr\//);
  });
});
