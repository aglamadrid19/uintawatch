import { test, expect } from '@playwright/test';

const pages = [
  { path: '/', title: /Uinta Watch/, heading: /Utah is burning/ },
  { path: '/about', title: /About/, heading: /Built by the community/ },
  { path: '/sensors', title: /Sensors/, heading: /sensor hardware/ },
  { path: '/get-involved', title: /Get Involved/, heading: /Every person in the network/ },
  { path: '/open-questions', title: /Open Questions/, heading: /What we don't know/ },
  { path: '/journal', title: /Lab Journal/, heading: /in public/ },
];

test.describe('Uinta Watch', () => {

  test.describe('Page loads', () => {
    for (const { path, title, heading } of pages) {
      test(`${path} loads with correct title and heading`, async ({ page }) => {
        await page.goto(path);
        await expect(page).toHaveTitle(title);
        const appHeading = page.locator('main h1');
        await expect(appHeading).toContainText(heading);
      });
    }

    test('404 page returns 404 status', async ({ page }) => {
      const resp = await page.goto('/this-page-does-not-exist');
      expect(resp?.status()).toBe(404);
    });
  });

  test.describe('Navigation', () => {
    test('clicking nav links navigates correctly', async ({ page }) => {
      await page.goto('/');
      await page.locator('header a[href="/about"]').first().click();
      await expect(page).toHaveURL(/\/about/);

      await page.locator('header a[href="/sensors"]').first().click();
      await expect(page).toHaveURL(/\/sensors/);

      await page.locator('header a[href="/get-involved"]').first().click();
      await expect(page).toHaveURL(/\/get-involved/);
    });

    test('nav highlights current page', async ({ page }) => {
      await page.goto('/sensors');
      const sensorLink = page.locator('header a[href="/sensors"]').first();
      await expect(sensorLink).toHaveClass(/text-accent/);
    });
  });

  test.describe('Accessibility', () => {
    test('skip link is focusable', async ({ page }) => {
      await page.goto('/');
      const skipLink = page.locator('a[href="#main-content"]');
      await expect(skipLink).toHaveClass(/sr-only/);
      await skipLink.focus();
      const isVisible = await skipLink.evaluate((el: HTMLElement) => el.offsetWidth > 0 || el.offsetHeight > 0);
      expect(isVisible).toBe(true);
    });

    test('images have alt attributes', async ({ page }) => {
      for (const { path } of pages) {
        await page.goto(path);
        const images = page.locator('main img');
        const count = await images.count();
        for (let i = 0; i < count; i++) {
          await expect(images.nth(i)).toHaveAttribute('alt', /.*/);
        }
      }
    });
  });

  test.describe('Footer', () => {
    test('footer contains key links', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('footer')).toBeVisible();
      await expect(page.locator('footer a[href="/about"]').first()).toBeVisible();
      await expect(page.locator('footer a[href="/get-involved"]').first()).toBeVisible();
      await expect(page.locator('footer a[href="/sensors"]').first()).toBeVisible();
      await expect(page.locator('footer')).toContainText('Every sensor node is a neighbor');
    });
  });

  test.describe('Journal', () => {
    test('journal entry loads and links back', async ({ page }) => {
      await page.goto('/journal');
      await page.locator('main a[href^="/journal/"]').first().click();
      await expect(page).toHaveURL(/\/journal\/.+/);
      await expect(page.locator('main h1')).toBeVisible();
      await expect(page.locator('main a[href="/journal"]').first()).toBeVisible();
    });

    test('rss feed lists journal entries', async ({ page }) => {
      const resp = await page.goto('/rss.xml');
      expect(resp?.status()).toBe(200);
      const body = await resp?.text();
      expect(body).toContain('Where we started');
      expect(body).toContain('The pivot');
    });
  });

  test.describe('Console errors', () => {
    test('no console errors on any page', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      for (const { path } of pages) {
        await page.goto(path);
        await page.waitForLoadState('networkidle');
      }

      expect(errors).toEqual([]);
    });
  });

  test.describe('Responsive', () => {
    test('mobile viewport has no horizontal overflow', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      for (const { path } of pages) {
        await page.goto(path);
        await page.waitForLoadState('networkidle');
        const overflow = await page.evaluate(() =>
          document.documentElement.scrollWidth > document.documentElement.clientWidth
        );
        expect(overflow).toBe(false);
      }
    });
  });

  test.describe('Social cards (OG/Twitter)', () => {
    // Discover journal entries from the index so new entries are covered
    // automatically. Run `python3 make_og.py` after adding an entry so its
    // card image exists — a missing card fails the image-fetch assertion.
    const journalTest = async ({ request }) => {
      const journalIndex = await request.get('/journal/');
      expect(journalIndex.status()).toBe(200);
      const hrefs = [...new Set(
        (await journalIndex.text()).match(/\/journal\/[\w-]+\//g) ?? []
      )];

      const targets = [...pages.map(p => p.path), ...hrefs];
      expect(targets.length).toBeGreaterThanOrEqual(11);

      const checkedImages = new Map<string, { status: number; contentType: string; size: number }>();
      for (const path of targets) {
        const resp = await request.get(path);
        expect(resp.status(), `${path} loads`).toBe(200);
        const html = await resp.text();

        const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
        expect(ogImage, `${path} has og:image`).toBeTruthy();
        expect(ogImage!, `${path} og:image is absolute https`).toMatch(/^https:\/\//);

        expect(html, `${path} has twitter:card`).toContain('content="summary_large_image"');
        const twitterImage = html.match(/<meta name="twitter:image" content="([^"]+)"/)?.[1];
        expect(twitterImage, `${path} twitter:image matches og:image`).toBe(ogImage);

        const width = html.match(/og:image:width" content="(\d+)"/)?.[1];
        const height = html.match(/og:image:height" content="(\d+)"/)?.[1];
        expect(width, `${path} og:image:width`).toBe('1200');
        expect(height, `${path} og:image:height`).toBe('630');

        const alt = html.match(/og:image:alt" content="([^"]*)"/)?.[1];
        expect(alt?.length ?? 0, `${path} og:image:alt non-empty`).toBeGreaterThan(0);

        // Fetch each unique image once and verify it's a real, non-empty image
        // (via the local path — the absolute URL points at production, which
        // may not have the newest cards deployed yet)
        if (!checkedImages.has(ogImage!)) {
          const imagePath = new URL(ogImage!).pathname;
          const img = await request.get(imagePath);
          const contentType = img.headers()['content-type'] ?? '';
          const size = (await img.body()).length;
          checkedImages.set(ogImage!, { status: img.status(), contentType, size });
          expect(img.status(), `og image ${imagePath} resolves`).toBe(200);
          expect(contentType, `og image ${imagePath} is a png`).toMatch(/^image\/png/);
          expect(size, `og image ${imagePath} is non-empty`).toBeGreaterThan(5000);
        }
      }

      // Journal entries must carry their own card, not the site default
      for (const path of hrefs) {
        const html = await (await request.get(path)).text();
        const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
        expect(ogImage, `${path} uses its own og card, not the default`).toMatch(/\/images\/og\/[\w-]+\.png$/);
      }
    };

    test('every page has a proper og image that resolves', journalTest);
  });

});