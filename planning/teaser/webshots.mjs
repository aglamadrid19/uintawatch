import { chromium } from '@playwright/test';
import { mkdirSync } from 'fs';

const base = 'https://uintawatch.com';
const pages = ['/', '/open-questions', '/journal', '/get-involved'];
mkdirSync('/Volumes/CrucialX10/uintawatch/planning/teaser/frames/web', { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
for (const path of pages) {
  await p.goto(base + path, { waitUntil: 'networkidle', timeout: 45000 });
  await p.evaluate(async () => {
    await new Promise((resolve) => {
      let y = 0;
      const step = () => {
        y += 600; window.scrollTo(0, y);
        if (y < document.body.scrollHeight) setTimeout(step, 80);
        else { window.scrollTo(0, 0); resolve(); }
      };
      step();
    });
  });
  await p.evaluate(() => Promise.all(Array.from(document.images).map(img => img.complete ? null : new Promise(r => { img.onload = img.onerror = r; }))));
  await p.waitForTimeout(500);
  const name = path === '/' ? 'home' : path.slice(1).replaceAll('/', '-');
  await p.screenshot({ path: `/Volumes/CrucialX10/uintawatch/planning/teaser/frames/web/${name}.png` });
  console.log('shot', name);
}
await browser.close();
