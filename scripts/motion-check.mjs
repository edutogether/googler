// 움직임 줄이기(prefers-reduced-motion) 신호와 상관없이 연출이 똑같이 도는지 확인한다.
//
//   npm run motion
//
// 같은 검사를 emulateMedia reducedMotion 'reduce'와 'no-preference' 두 조건으로 돌려
// 결과가 같아야 통과한다(2026-11-11 Bumm님 결정: «움직임 줄이기와 상관없이 늘 정상처럼»).
// 공용 키오스크·원격 접속 PC가 이 신호를 켠 채로 보고해도 스플래시·화면 전환·말풍선이
// 멈춰 보이면 안 된다. 로컬 production 빌드(dist/)를 대상으로 하고, 시스템 Chrome을 쓴다.

import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 43118;
const HOST = '127.0.0.1';
const CHROME_CANDIDATES = {
  win32: [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(process.env.LOCALAPPDATA ?? '', 'Google\\Chrome\\Application\\chrome.exe'),
  ],
  darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium'],
  linux: ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/snap/bin/chromium'],
};
// 스플래시는 최소 두 바퀴(2300ms)를 지킨다(COMMON_STANDARDS §27).
const SPLASH_MIN_MS = 2300;

function findChrome() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const found = (CHROME_CANDIDATES[process.platform] ?? []).filter(Boolean).find((p) => existsSync(p));
  if (found) return found;
  console.error('Chrome 실행 파일을 찾지 못했습니다. CHROME_PATH 환경변수로 지정하세요.');
  process.exit(1);
}

async function waitForServer(url, tries = 40) {
  for (let i = 0; i < tries; i++) {
    try { const res = await fetch(url); if (res.ok) return; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('preview 서버가 뜨지 않았습니다.');
}

const viteConfigSource = readFileSync(path.join(root, 'vite.config.ts'), 'utf8');
const BASE_PATH = viteConfigSource.match(/base:\s*['"]([^'"]*)['"]/)?.[1];
if (BASE_PATH === undefined) { console.error('vite.config.ts에서 base 경로를 찾지 못했습니다.'); process.exit(1); }
// MOTION_URL로 배포된 라이브 주소를 직접 검사할 수 있다(예: https://googler.edutogether.kr/). 없으면 로컬 빌드 미리보기를 띄운다.
const LIVE_URL = process.env.MOTION_URL;
const URL_BASE = LIVE_URL ? `${LIVE_URL}?preview=main-v3&qa-mute=1` : `http://${HOST}:${PORT}${BASE_PATH}?preview=main-v3&qa-mute=1`;

async function checkCondition(browser, reducedMotion) {
  const failures = [];
  const fail = (message) => failures.push(`[${reducedMotion}] ${message}`);
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, reducedMotion });
  const page = await context.newPage();
  // 스플래시: 페이지를 열자마자 CSS 애니메이션 상태와 사라지는 시각을 잰다.
  await page.addInitScript(() => {
    window.__splashProbe = { start: performance.now(), gone: undefined, firstAnimations: undefined };
    const watch = () => {
      const splash = document.getElementById('splash');
      if (splash && window.__splashProbe.firstAnimations === undefined) {
        const style = getComputedStyle(splash);
        window.__splashProbe.firstAnimations = {
          splashDuration: style.animationDuration,
          logo: getComputedStyle(splash.querySelector('.logo')).animationName,
          bar: getComputedStyle(splash.querySelector('.sbar i')).animationName,
        };
      }
      if (!splash || getComputedStyle(splash).opacity === '0') {
        if (window.__splashProbe.gone === undefined && window.__splashProbe.firstAnimations) window.__splashProbe.gone = performance.now() - window.__splashProbe.start;
      }
      if (window.__splashProbe.gone === undefined) requestAnimationFrame(watch);
    };
    document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(watch));
    window.__guideLengths = new Set();
    window.setInterval(() => {
      const guide = document.querySelector('.mw3-guide');
      if (guide) window.__guideLengths.add((guide.textContent ?? '').trim().length);
    }, 16);
  });
  await page.goto(URL_BASE, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__splashProbe.gone !== undefined, null, { timeout: 15000 });
  const probe = await page.evaluate(() => window.__splashProbe);
  if (probe.firstAnimations?.splashDuration !== '2.9s') fail(`스플래시 애니메이션 길이가 ${probe.firstAnimations?.splashDuration}입니다(기대: 2.9s).`);
  if (probe.firstAnimations?.logo === 'none') fail('스플래시 로고 애니메이션이 꺼져 있습니다.');
  if (probe.firstAnimations?.bar === 'none') fail('스플래시 로딩 막대 애니메이션이 꺼져 있습니다.');
  if (probe.gone < SPLASH_MIN_MS) fail(`스플래시가 ${Math.round(probe.gone)}ms 만에 사라졌습니다(최소 ${SPLASH_MIN_MS}ms).`);

  await page.waitForSelector('#splash', { state: 'detached', timeout: 10000 });

  // 안내 말풍선: 한 글자씩 타이핑되어야 한다(신호가 있다고 전체 문장을 바로 보여주면 안 된다).
  // 타이핑은 스플래시 뒤에서 앱이 마운트되자마자 시작하므로, 페이지를 열 때부터 길이를 표본 추출해 둔다.
  const lengths = await page.evaluate(() => [...window.__guideLengths]);
  const full = Math.max(...lengths);
  const typedInSteps = lengths.some((length) => length > 0 && length < full);
  if (full === 0 || !typedInSteps) fail(`안내 말풍선이 한 글자씩 타이핑되지 않습니다(본 길이: ${[...new Set(lengths)].join(', ')}).`);

  // 기울기(패럴랙스): 포인터를 움직이면 CSS 변수가 바뀌어야 한다.
  await page.mouse.move(300, 200);
  await page.mouse.move(1600, 900);
  await page.waitForTimeout(150);
  const parallax = await page.evaluate(() => document.querySelector('.mw3-shell')?.style.getPropertyValue('--mw3-parallax-x'));
  if (!parallax || Number(parallax) === 0) fail(`포인터 기울기 효과가 꺼져 있습니다(--mw3-parallax-x=${parallax}).`);

  // CSS 연출: 노래 제목 흐름이 돌고 있어야 한다.
  const marquee = await page.evaluate(() => {
    const track = document.querySelector('.mw3-mini-song-track');
    return track ? getComputedStyle(track).animationName : 'missing';
  });
  if (marquee === 'none' || marquee === 'missing') fail(`노래 제목 흐름 애니메이션이 꺼져 있습니다(${marquee}).`);
  const globalDuration = await page.evaluate(() => getComputedStyle(document.querySelector('.mw3-shell')).transitionDuration);
  if (globalDuration.split(',').some((value) => value.trim() === '0.00001s')) fail('전체 transition이 .01ms로 줄어 있습니다.');

  // 화면 전환: 메뉴를 누르면 덮개(cover) → 로딩 → 드러남 순서를 거쳐야 한다.
  await page.locator('.mw3-navigation button', { hasText: '퀘스트' }).first().click();
  const phases = new Set();
  const deadline = Date.now() + 4000;
  while (Date.now() < deadline) {
    const phase = await page.evaluate(() => document.querySelector('.mw3-shell')?.getAttribute('data-transition'));
    if (phase) phases.add(phase);
    if (phases.has('reveal') && phase === 'idle') break;
    await page.waitForTimeout(40);
  }
  for (const expected of ['cover', 'loading', 'reveal']) {
    if (!phases.has(expected)) fail(`화면 전환에 '${expected}' 단계가 없습니다(본 단계: ${[...phases].join(', ')}).`);
  }

  await context.close();
  return failures;
}

async function main() {
  const chromePath = findChrome();
  const viteCli = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
  if (!LIVE_URL && !existsSync(path.join(root, 'dist', 'index.html'))) { console.error('dist/가 없습니다. 먼저 npm run build를 실행하세요.'); process.exit(1); }
  const server = LIVE_URL ? undefined : spawn(process.execPath, [viteCli, 'preview', '--host', HOST, '--port', String(PORT), '--strictPort'], { cwd: root, stdio: 'ignore' });
  try {
    if (!LIVE_URL) await waitForServer(`http://${HOST}:${PORT}${BASE_PATH}`);
    const browser = await chromium.launch({ executablePath: chromePath, headless: true });
    const conditions = ['reduce', 'no-preference'];
    let checked = 0;
    const failures = [];
    for (const condition of conditions) {
      failures.push(...await checkCondition(browser, condition));
      checked += 1;
    }
    await browser.close();
    if (checked !== conditions.length) { console.error('두 조건을 모두 검사하지 못했습니다.'); process.exit(1); }
    if (failures.length) {
      console.error(failures.join('\n'));
      console.error(`\n움직임 줄이기 신호 확인 실패: ${failures.length}건`);
      process.exit(1);
    }
    console.log(`통과: reduce·no-preference 두 조건 모두 스플래시(${SPLASH_MIN_MS}ms 이상)·말풍선·기울기·노래 제목·화면 전환이 정상입니다.`);
  } finally {
    server?.kill();
  }
}

main().catch((error) => { console.error(error); process.exit(1); });
