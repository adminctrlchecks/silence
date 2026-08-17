import { expect, test } from '@playwright/test';

// Lightweight smoke coverage for public/static surfaces added or touched in
// the product redesign (docs/product-redesign/34-qa-acceptance-criteria.md
// §13, tests 7-8: RTL core-journey smoke, mobile viewport smoke). Unlike
// user-journey.spec.ts / admin-journey.spec.ts, none of this needs the
// seeded database — it only exercises public routes and static metadata
// endpoints, so it's cheap to run on every locale/viewport combination.

test.describe('legal and SEO surfaces', () => {
  test('terms and privacy pages render with their sections', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.getByRole('heading', { name: 'Terms & Conditions', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Astrology content and remedy disclaimer/ })).toBeVisible();

    await page.goto('/privacy');
    await expect(page.getByRole('heading', { name: 'Privacy Policy', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Cookies and session storage/ })).toBeVisible();
  });

  test('footer links to the legal pages resolve (not 404)', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Terms', exact: true }).click();
    await expect(page).toHaveURL(/\/terms$/);
    await expect(page.getByRole('heading', { name: 'Terms & Conditions', exact: true })).toBeVisible();
  });

  test('robots.txt and sitemap.xml are served', async ({ request }) => {
    const robots = await request.get('/robots.txt');
    expect(robots.ok()).toBeTruthy();
    expect(await robots.text()).toContain('Sitemap:');

    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.ok()).toBeTruthy();
    expect(await sitemap.text()).toContain('<urlset');
  });
});

test.describe('Arabic RTL smoke', () => {
  test('homepage renders right-to-left with translated chrome', async ({ page }) => {
    await page.goto('/ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    // Footer/legal links translated, not left over in English.
    await expect(page.getByRole('link', { name: 'الخصوصية' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'الشروط' })).toBeVisible();
  });

  test('register flow shows the 3-step indicator in Arabic', async ({ page }) => {
    await page.goto('/ar/register');
    await expect(page.getByText('الخطوة 1 من 3')).toHaveCount(1);
  });
});

test.describe('mobile viewport smoke', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('homepage has no horizontal overflow and shows the primary CTA', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
    await expect(page.getByRole('link', { name: 'Start your reading' })).toBeVisible();
  });

  test('register flow has no horizontal overflow', async ({ page }) => {
    await page.goto('/register');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
});
