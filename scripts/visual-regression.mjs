// Visual regression check for MainWorldV3.
//
//   npm run visual:update   현재 화면을 "정답지"(baseline)로 저장
//   npm run visual          현재 화면을 정답지와 픽셀 단위로 비교
//
// Captures the home screen and all four subpages at four viewport widths
// against the local production build (dist/), under BOTH reduced-motion
// conditions ('reduce' and 'no-preference') and with qa-mute, so every frame is
// deterministic. The app must look the same whatever that signal says (Bumm
// 2026-11-11), so both conditions are compared against the same baseline. Baselines live in
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
// Uses whatever Chrome the machine already has. CHROME_PATH wins if set, so a
// non-standard install (or a pinned build) never needs a code change.
const CHROME_CANDIDATES_BY_PLATFORM = {
  win32: [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(process.env.LOCALAPPDATA ?? '', 'Google\\Chrome\\Application\\chrome.exe'),
  ],
  darwin: [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ],
  linux: [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
  ],
};
const PORT = 43117;
// Vite가 자동 선택한 IPv6 루프백(::1)과 Node의 localhost IPv4 해석이 엇갈리면,
// 서버는 떠 있어도 준비 확인이 실패한다. 수신·확인·브라우저 접근을 같은 IPv4
// 루프백으로 고정해 OS별 DNS 우선순위에 영향을 받지 않게 한다.
const PREVIEW_HOST = '127.0.0.1';
// Read Vite's base path from vite.config.ts instead of hardcoding it here —
// this script broke silently (server never came up) the last time the two
// drifted apart (GitHub Pages' `/googler/` vs. Firebase Hosting's `/`).
const viteConfigSource = readFileSync(path.join(root, 'vite.config.ts'), 'utf8');
const baseMatch = viteConfigSource.match(/base:\s*['"]([^'"]*)['"]/);
if (!baseMatch) { console.error('vite.config.ts에서 base 경로를 찾지 못했습니다.'); process.exit(1); }
const BASE_PATH = baseMatch[1];
const BASE_URL = `http://${PREVIEW_HOST}:${PORT}${BASE_PATH}?preview=main-v3&qa-mute=1`;
// 대비 임계값: 전체 픽셀의 0.2% 초과가 다르면 실패로 간주.
const FAIL_RATIO = 0.002;

const VIEWPORTS = [
  { width: 1920, height: 1080, label: 'pc-1920' },
  { width: 1280, height: 1024, label: 'pc-4x3-1280' },
  { width: 850, height: 1200, label: 'tablet-850' },
  { width: 390, height: 844, label: 'mobile-390' },
];
// 움직임 줄이기 신호가 켜진 PC와 꺼진 PC 모두에서 같은 화면이어야 한다.
const MOTION_CONDITIONS = ['reduce', 'no-preference'];
const PAGES = [
  { nav: null, label: 'home' },
  { nav: '퀘스트', label: 'quest' },
  { nav: '플래너', label: 'planner' },
  { nav: '도감', label: 'encyclopedia' },
  { nav: '커뮤니티', label: 'community' },
];

const updating = process.argv.includes('--update');

function findChrome() {
  if (process.env.CHROME_PATH) {
    if (existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
    console.error(`CHROME_PATH가 가리키는 파일이 없습니다: ${process.env.CHROME_PATH}`);
    process.exit(1);
  }
  const candidates = (CHROME_CANDIDATES_BY_PLATFORM[process.platform] ?? []).filter(Boolean);
  const found = candidates.find((p) => existsSync(p));
  if (found) return found;
  console.error(`Chrome 실행 파일을 찾지 못했습니다 (platform: ${process.platform}).`);
  console.error(candidates.length ? `찾아본 경로:\n${candidates.map((p) => `  - ${p}`).join('\n')}` : '이 플랫폼의 기본 경로 목록이 없습니다.');
  console.error('CHROME_PATH 환경변수로 직접 지정할 수 있습니다. 예: CHROME_PATH=/path/to/chrome npm run visual');
  process.exit(1);
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
  for (const motion of MOTION_CONDITIONS) {
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, reducedMotion: motion });
      const page = await context.newPage();
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      // The boot splash holds for 2300ms before fading (two loops of its own
      // loading-bar animation, COMMON_STANDARDS §27), and longer if the page
      // hasn't finished loading (see index.html's inline <style> and
      // src/splash.ts). Wait for the element to actually leave the DOM so a
      // timing change there can never silently bake a splash frame into every
      // baseline.
      await page.waitForSelector('#splash', { state: 'detached', timeout: 10000 });
      // The desktop guide bubble types its greeting out character by character
      // and then holds it ~9.9s; wait for the full message before the first shot
      // (the guide only exists on the desktop composition).
      if (await page.locator('.mw3-guide').count()) {
        await page.waitForFunction(() => (document.querySelector('.mw3-guide')?.textContent ?? '').trim().length >= 40, null, { timeout: 10000 });
      }
      await page.waitForTimeout(700);
      for (const target of PAGES) {
        if (target.nav) {
          await page.locator('.mw3-navigation button', { hasText: target.nav }).first().click();
          // 화면 전환 연출(덮개 → 로딩 → 드러남)이 실제로 돌고 끝날 때까지 기다린다.
          await page.waitForFunction(() => document.querySelector('.mw3-shell')?.getAttribute('data-transition') !== 'idle', null, { timeout: 3000 });
          await page.waitForFunction(() => document.querySelector('.mw3-shell')?.getAttribute('data-transition') === 'idle', null, { timeout: 8000 });
          await page.waitForTimeout(300);
        }
        // animations: 'disabled' freezes the endless ambient loops (dust, leaves,
        // shimmer) at their start frame so two runs are pixel-comparable; it does
        // not touch the reduced-motion signal, which the context already carries.
        const name = `${viewport.label}--${target.label}`;
        const shot = await page.screenshot({ animations: 'disabled' });
        if (motion === MOTION_CONDITIONS[0]) shots.set(name, shot);
        else shots.set(`${name}--${motion}`, shot);
      }
      await context.close();
    }
  }
  await browser.close();
  return shots;
}

function compare(name, actualBuffer) {
  // 'no-preference' 조건의 화면은 'reduce' 조건과 같은 기준과 비교한다(신호와 상관없이 같은 화면).
  const baselinePath = path.join(BASELINE_DIR, `${name.replace(/--no-preference$/, '')}.png`);
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
  // npx + shell은 Windows에서 중간 cmd.exe를 남길 수 있어 실패 뒤 Vite가 고아
  // 프로세스로 남는다. 프로젝트에 설치된 Vite CLI를 Node로 직접 실행한다.
  const viteCli = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
  const server = spawn(process.execPath, [viteCli, 'preview', '--host', PREVIEW_HOST, '--port', String(PORT), '--strictPort'], { cwd: root, stdio: 'ignore' });
  try {
    await waitForServer(`http://${PREVIEW_HOST}:${PORT}${BASE_PATH}`);

    // A gate whose success condition is "0 mismatches" is indistinguishable
    // from one that looked at nothing (COMMON_STANDARDS §21-1). Comparing
    // shots.size to VIEWPORTS.length * PAGES.length would be a tautology —
    // if PAGES/VIEWPORTS is ever emptied, that expected count becomes 0 too,
    // and the check still "passes". So the floor here is a number
    // independent of those arrays, not derived from them.
    const MIN_EXPECTED_SHOTS = 40;
    if (VIEWPORTS.length === 0 || PAGES.length === 0) {
      console.error('VIEWPORTS 또는 PAGES가 비어 있습니다 — 검사가 화면을 하나도 찍지 않게 됩니다.');
      process.exit(1);
    }
    const shots = await captureAll(chromePath);
    if (shots.size < MIN_EXPECTED_SHOTS) {
      console.error(`캡처된 스크린샷이 ${shots.size}장뿐입니다(최소 ${MIN_EXPECTED_SHOTS}장 기대). 검사가 실제로 화면을 보지 못했을 수 있습니다.`);
      process.exit(1);
    }

    if (updating) {
      rmSync(BASELINE_DIR, { recursive: true, force: true });
      mkdirSync(BASELINE_DIR, { recursive: true });
      const baselineShots = [...shots].filter(([name]) => !name.endsWith('--no-preference'));
      for (const [name, buffer] of baselineShots) writeFileSync(path.join(BASELINE_DIR, `${name}.png`), buffer);
      console.log(`기준 저장 완료: ${baselineShots.length}장 -> .visual-baselines/`);
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
  }
}

main().catch((error) => { console.error(error); process.exit(1); });
