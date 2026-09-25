import { chromium } from '@playwright/test';
import { mkdirSync } from 'fs';

const paths = ['/', '/about', '/sensors', '/get-involved', '/open-questions', '/journal'];
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 375, height: 812 },
];

mkdirSync('screenshots', { recursive: true });

const browser = await chromium.launch();

// discover journal post URLs once
const ctx0 = await browser.newContext();
const p0 = await ctx0.newPage();
await p0.goto('http://localhost:4321/journal', { waitUntil: 'networkidle' });
const journalLinks = await p0.locator('main a[href^="/journal/"]').evaluateAll(els => els.map(e => e.getAttribute('href')));
await ctx0.close();
const allPaths = [...new Set([...paths, ...journalLinks])];

for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  for (const path of allPaths) {
    await p.goto('http://localhost:4321' + path, { waitUntil: 'networkidle' });
    // scroll through to trigger lazy loading, then wait for every image
    await p.evaluate(async () => {
      await new Promise((resolve) => {
        let y = 0;
        const step = () => {
          y += 600;
          window.scrollTo(0, y);
          if (y < document.body.scrollHeight) setTimeout(step, 100);
          else { window.scrollTo(0, 0); resolve(); }
        };
        step();
      });
    });
    await p.evaluate(() => Promise.all(Array.from(document.images).map(img =>
      img.complete ? Promise.resolve() : new Promise(r => { img.onload = img.onerror = r; })
    )));
    await p.waitForTimeout(500);
    // report any still-unloaded images
    const broken = await p.evaluate(() => Array.from(document.images).filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src));
    if (broken.length) console.log(`UNLOADED on ${path}:`, broken);
    const name = (path === '/' ? 'home' : path.replace(/^\//, '').replace(/\//g, '-'));
    await p.screenshot({ path: `screenshots/${vp.name}-${name}.png`, fullPage: true });
    console.log(`captured ${vp.name} ${path}`);
  }
  await ctx.close();
}
await browser.close();
