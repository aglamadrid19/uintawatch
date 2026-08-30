import { test, expect } from '@playwright/test';

const pages = [
  { path: '/', title: /Home/, heading: /Utah is burning/ },
  { path: '/about', title: /About/, heading: /Built by the Community/ },
  { path: '/sensors', title: /Sensors/, heading: /sensor hardware/ },
  { path: '/get-involved', title: /Get Involved/, heading: /Every person in the network/ },
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
      await expect(page.locator('footer')).toContainText('The ridges are watching');
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

});