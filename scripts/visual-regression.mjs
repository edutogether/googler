// Visual regression check for MainWorldV3.
//
//   npm run visual:update   현재 화면을 "정답지"(baseline)로 저장
//   npm run visual          현재 화면을 정답지와 픽셀 단위로 비교
//
// Captures the home screen and all four subpages at four viewport widths
// against the local production build (dist/), with reduced-motion emulation
// and qa-mute so every frame is deterministic. Baselines live in
// .visual-baselines/ (gitignored — they are machine-specific renderings)
// and diff images for failures land in .visual-diffs/.
//
// Uses the system Chrome install; no browser download needed.

import { execSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE_DIR = path.join(root, '.visual-baselines');
const DIFF_DIR = path.join(root, '.visual-diffs');
const CHROME_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
];
const PORT = 43117;
const BASE_URL = `http://localhost:${PORT}/googler/?preview=main-v3&qa-mute=1`;
// 대비 임계값: 전체 픽셀의 0.2% 초과가 다르면 실패로 간주.
const FAIL_RATIO = 0.002;

const VIEWPORTS = [
  { width: 1920, height: 1080, label: 'pc-1920' },
  { width: 1280, height: 1024, label: 'pc-4x3-1280' },
  { width: 850, height: 1200, label: 'tablet-850' },
  { width: 390, height: 844, label: 'mobile-390' },
];
const PAGES = [
  { nav: null, label: 'home' },
  { nav: '퀘스트', label: 'quest' },
  { nav: '플래너', label: 'planner' },
  { nav: '도감', label: 'encyclopedia' },
  { nav: '커뮤니티', label: 'community' },
];

const updating = process.argv.includes('--update');

function findChrome() {
  const found = CHROME_CANDIDATES.find((p) => existsSync(p));
  if (!found) { console.error('Chrome 실행 파일을 찾지 못했습니다.'); process.exit(1); }
  return found;
}

async function waitForServer(url, tries = 40) {
  for (let i = 0; i < tries; i++) {
    try { const res = await fetch(url); if (res.ok) return; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('preview 서버가 뜨지 않았습니다.');
}

async function captureAll(chromePath) {
  const shots = new Map();
  const browser = await chromium.launch({ executablePath: chromePath, headless: true });
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(700);
    for (const target of PAGES) {
      if (target.nav) {
        await page.locator('.mw3-navigation button', { hasText: target.nav }).first().click();
        // reduced-motion skips the transition sequence, so pages settle fast
        await page.waitForTimeout(900);
      }
      shots.set(`${viewport.label}--${target.label}`, await page.screenshot());
    }
    await context.close();
  }
  await browser.close();
  return shots;
}

function compare(name, actualBuffer) {
  const baselinePath = path.join(BASELINE_DIR, `${name}.png`);
  if (!existsSync(baselinePath)) return { name, status: 'missing' };
  const expected = PNG.sync.read(readFileSync(baselinePath));
  const actual = PNG.sync.read(actualBuffer);
  if (expected.width !== actual.width || expected.height !== actual.height) return { name, status: 'size-mismatch' };
  const diff = new PNG({ width: expected.width, height: expected.height });
  const mismatched = pixelmatch(expected.data, actual.data, diff.data, expected.width, expected.height, { threshold: 0.12 });
  const ratio = mismatched / (expected.width * expected.height);
  if (ratio > FAIL_RATIO) {
    mkdirSync(DIFF_DIR, { recursive: true });
    writeFileSync(path.join(DIFF_DIR, `${name}.diff.png`), PNG.sync.write(diff));
    writeFileSync(path.join(DIFF_DIR, `${name}.actual.png`), actualBuffer);
    return { name, status: 'changed', ratio };
  }
  return { name, status: 'ok', ratio };
}

async function main() {
  const chromePath = findChrome();
  console.log(updating ? '기준(정답지) 스크린샷을 새로 저장합니다…' : '현재 화면을 기준과 비교합니다…');
  execSync('npm run build', { cwd: root, stdio: 'inherit' });
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { cwd: root, shell: true, stdio: 'ignore' });
  try {
    await waitForServer(`http://localhost:${PORT}/googler/`);
    const shots = await captureAll(chromePath);

    if (updating) {
      rmSync(BASELINE_DIR, { recursive: true, force: true });
      mkdirSync(BASELINE_DIR, { recursive: true });
      for (const [name, buffer] of shots) writeFileSync(path.join(BASELINE_DIR, `${name}.png`), buffer);
      console.log(`기준 저장 완료: ${shots.size}장 -> .visual-baselines/`);
      return;
    }

    if (!existsSync(BASELINE_DIR) || readdirSync(BASELINE_DIR).length === 0) {
      console.error('기준 스크린샷이 없습니다. 먼저 `npm run visual:update`를 실행하세요.');
      process.exit(1);
    }
    rmSync(DIFF_DIR, { recursive: true, force: true });
    const results = [...shots].map(([name, buffer]) => compare(name, buffer));
    const failed = results.filter((r) => r.status !== 'ok');
    for (const r of results) {
      const pct = r.ratio !== undefined ? ` (차이 ${(r.ratio * 100).toFixed(3)}%)` : '';
      console.log(`  ${r.status === 'ok' ? '✓' : '✗'} ${r.name} ${r.status}${pct}`);
    }
    if (failed.length) {
      console.error(`\n${failed.length}장이 기준과 다릅니다. 비교 이미지는 .visual-diffs/ 에 저장했습니다.`);
      console.error('의도한 화면 변경이라면 `npm run visual:update`로 기준을 갱신하세요.');
      process.exit(1);
    }
    console.log(`\n전부 통과: ${results.length}장 모두 기준과 일치합니다.`);
  } finally {
    server.kill();
    execSync(`taskkill /F /T /PID ${server.pid} > nul 2>&1 || exit 0`, { shell: true });
  }
}

main().catch((error) => { console.error(error); process.exit(1); });
