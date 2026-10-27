// Browser smoke test: `npm test`. Needs `npx playwright install chromium` once per machine.
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const port = 4300 + Math.floor(Math.random() * 600);
const url = `http://127.0.0.1:${port}/`;
const server = spawn(process.execPath, [fileURLToPath(new URL('../server.mjs', import.meta.url))], { env: { ...process.env, PORT: String(port) } });
await new Promise((resolve, reject) => {
  server.stdout.once('data', resolve);
  server.once('exit', () => reject(new Error('The local server did not start.')));
});

const failures = [];
const check = (ok, message) => { if (!ok) failures.push(message); };
const browser = await chromium.launch();

async function open(viewport, { firstVisit = false, ...options } = {}) {
  const context = await browser.newContext({ viewport, ...options });
  if (!firstVisit) await context.addInitScript(() => localStorage.setItem('aa-intro-v2-seen', 'true'));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('requestfailed', (request) => errors.push(`failed request ${request.url()}`));
  await page.goto(url);
  return { context, page, errors };
}

try {
  // The first visit plays the intro, then hands the page back.
  {
    const { context, page, errors } = await open({ width: 1440, height: 900 }, { firstVisit: true });
    check(await page.evaluate(() => document.documentElement.classList.contains('intro-playing')), 'the intro does not play on a first visit');
    await page.waitForFunction(() => !document.documentElement.classList.contains('intro-playing'), null, { timeout: 6000 });
    check(!(await page.evaluate(() => document.querySelector('main').inert)), 'the page stays inert after the intro');
    check(!errors.length, `first visit: ${errors.join('; ')}`);
    await context.close();
  }

  // Every width: no sideways scrolling, the header stays pinned, and all scroll-in content appears.
  for (const width of [320, 375, 768, 1024, 1440]) {
    const { context, page, errors } = await open({ width, height: 900 });
    const result = await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 400) {
        scrollTo({ top: y, behavior: 'instant' });
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        headerTop: document.querySelector('.header').getBoundingClientRect().top,
        hidden: [...document.querySelectorAll('.reveal:not(.is-visible)')].map((el) => el.id || el.className),
      };
    });
    check(!result.overflow, `${width}px: the page scrolls sideways`);
    check(result.headerTop === 0, `${width}px: the header is not pinned to the top`);
    check(!result.hidden.length, `${width}px: scroll-in elements never appeared: ${result.hidden.join(', ')}`);
    check(!errors.length, `${width}px: ${errors.join('; ')}`);
    await context.close();
  }

  // The mobile menu closes when a header link is used.
  {
    const { context, page } = await open({ width: 375, height: 812 }, { isMobile: true, hasTouch: true });
    await page.tap('.menu-toggle');
    await page.tap('.header-contact');
    const stuck = await page.evaluate(() => document.querySelector('.mobile-nav').classList.contains('open') || document.querySelector('main').inert);
    check(!stuck, 'the mobile menu stays open after tapping a header link');
    await context.close();
  }

  // A project dialog opens, closes with Escape and returns focus to its card.
  {
    const { context, page } = await open({ width: 1440, height: 900 });
    await page.click('[data-project="orbit"]');
    check(await page.evaluate(() => document.querySelector('dialog').open), 'the project dialog does not open');
    await page.keyboard.press('Escape');
    check(await page.evaluate(() => !document.querySelector('dialog').open && document.activeElement.dataset.project === 'orbit'), 'the project dialog does not close or return focus');
    const row = page.locator('.project-row').first();
    const rowName = await row.locator('.project-row-name').textContent();
    await row.click();
    check(await page.evaluate((name) => document.querySelector('dialog').open && document.querySelector('#dialog-title').textContent === name, rowName), 'a "More projects" row does not open its project');
    await context.close();
  }

  // A shared project link opens that project directly, without the intro, even on a first visit.
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${url}#work/forma`);
    const state = await page.evaluate(() => ({ open: document.querySelector('dialog').open, title: document.querySelector('#dialog-title').textContent, intro: document.documentElement.classList.contains('intro-playing') }));
    check(state.open && state.title === 'Forma' && !state.intro, `a project link does not open its project: ${JSON.stringify(state)}`);
    check(!errors.length, `project link: ${errors.join('; ')}`);
    await context.close();
  }

  // If a script cannot load, the content is still shown.
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.route('**/intro.js', (route) => route.abort());
    const page = await context.newPage();
    await page.goto(url);
    await page.waitForTimeout(300);
    const hidden = await page.evaluate(() => [...document.querySelectorAll('.reveal')].filter((el) => getComputedStyle(el).opacity === '0').length);
    check(!hidden, `${hidden} elements stay hidden when a script fails to load`);
    await context.close();
  }
} finally {
  await browser.close();
  server.kill();
}

if (failures.length) {
  console.error(failures.map((failure) => `✗ ${failure}`).join('\n'));
  process.exit(1);
}
console.log('✓ All smoke checks passed.');
