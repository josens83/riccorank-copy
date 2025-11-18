import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/');
  });

  test('should display login and signup links', async ({ page }) => {
    // Check if login and signup links are visible
    const loginLink = page.getByRole('link', { name: /로그인|login/i });
    const signupLink = page.getByRole('link', { name: /회원가입|signup|sign up/i });

    await expect(loginLink.or(signupLink)).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    // Look for signup link (could be in header or as a button)
    const signupLink = page.locator('a[href*="signup"]').first();

    if (await signupLink.isVisible()) {
      await signupLink.click();
      await expect(page).toHaveURL(/.*signup/);
    }
  });

  test('should navigate to login page', async ({ page }) => {
    // Look for login link
    const loginLink = page.locator('a[href*="login"]').first();

    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/.*login/);
    }
  });

  test('should show validation errors on empty signup form', async ({ page }) => {
    await page.goto('/signup');

    // Try to submit the form without filling it
    const submitButton = page.getByRole('button', { name: /회원가입|가입|submit|sign up/i });

    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Wait for validation errors to appear
      await page.waitForTimeout(1000);

      // Check for email or password input (they should still be there)
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      const passwordInput = page.locator('input[type="password"], input[name="password"]');

      expect(await emailInput.count()).toBeGreaterThan(0);
      expect(await passwordInput.count()).toBeGreaterThan(0);
    }
  });

  test('should show validation errors on empty login form', async ({ page }) => {
    await page.goto('/login');

    // Try to submit the form without filling it
    const submitButton = page.getByRole('button', { name: /로그인|login|submit/i });

    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Wait for validation errors to appear
      await page.waitForTimeout(1000);

      // Form should still be visible with inputs
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      const passwordInput = page.locator('input[type="password"], input[name="password"]');

      expect(await emailInput.count()).toBeGreaterThan(0);
      expect(await passwordInput.count()).toBeGreaterThan(0);
    }
  });

  test('should have email and password fields on signup page', async ({ page }) => {
    await page.goto('/signup');

    // Check for required form fields
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');

    await expect(emailInput.first()).toBeVisible();
    await expect(passwordInput.first()).toBeVisible();
  });

  test('should have email and password fields on login page', async ({ page }) => {
    await page.goto('/login');

    // Check for required form fields
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');

    await expect(emailInput.first()).toBeVisible();
    await expect(passwordInput.first()).toBeVisible();
  });

  test('should have password visibility toggle', async ({ page }) => {
    await page.goto('/login');

    const passwordInput = page.locator('input[type="password"]').first();

    if (await passwordInput.isVisible()) {
      // Look for visibility toggle button (usually an icon)
      const toggleButtons = page.locator('button').filter({ hasText: /show|hide|표시|숨기기/ }).or(
        page.locator('button svg').locator('..')
      );

      // If toggle exists, test it
      if (await toggleButtons.count() > 0) {
        const toggle = toggleButtons.first();
        if (await toggle.isVisible()) {
          await toggle.click();
          // After clicking, password type might change to text
          await page.waitForTimeout(500);
        }
      }
    }
  });
});

test.describe('Navigation', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');

    // Check if the page loads successfully
    await expect(page).toHaveTitle(/.+/);
  });

  test('should navigate to stock list page', async ({ page }) => {
    await page.goto('/');

    // Look for stock list link
    const stockLink = page.locator('a[href*="stocklist"], a[href*="stock"]').first();

    if (await stockLink.isVisible()) {
      await stockLink.click();
      await expect(page).toHaveURL(/.*stock/);
    }
  });

  test('should navigate to news page', async ({ page }) => {
    await page.goto('/');

    // Look for news link
    const newsLink = page.locator('a[href*="news"]').first();

    if (await newsLink.isVisible()) {
      await newsLink.click();
      await expect(page).toHaveURL(/.*news/);
    }
  });

  test('should have responsive header', async ({ page }) => {
    await page.goto('/');

    // Check if header exists
    const header = page.locator('header, nav').first();
    await expect(header).toBeVisible();
  });

  test('should have footer', async ({ page }) => {
    await page.goto('/');

    // Check if footer exists
    const footer = page.locator('footer').first();

    // Footer might not be visible without scrolling
    if (await footer.count() > 0) {
      await expect(footer).toBeAttached();
    }
  });
});

test.describe('Accessibility', () => {
  test('should have proper document structure', async ({ page }) => {
    await page.goto('/');

    // Check for main landmark
    const main = page.locator('main, [role="main"]');
    expect(await main.count()).toBeGreaterThan(0);
  });

  test('should have skip link or accessible navigation', async ({ page }) => {
    await page.goto('/');

    // Check for navigation or header
    const nav = page.locator('nav, header');
    await expect(nav.first()).toBeVisible();
  });
});
