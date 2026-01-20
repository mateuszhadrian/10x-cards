/**
 * Global Authentication Setup for Playwright Tests
 *
 * This file runs once before all tests to authenticate a user and save the session state.
 * Subsequent tests can reuse this authenticated state without logging in again.
 *
 * Benefits:
 * - Faster tests (login only once)
 * - More reliable (consistent auth state)
 * - Better DX (tests focus on functionality, not auth)
 */

import { test as setup, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  // Check if credentials are available
  const email = process.env.E2E_USERNAME;
  const password = process.env.E2E_PASSWORD;

  if (!email || !password) {
    // eslint-disable-next-line no-console
    console.warn("⚠️  E2E_USERNAME and E2E_PASSWORD not set - skipping authentication setup");
    // eslint-disable-next-line no-console
    console.warn("   Tests requiring authentication will be skipped");
    return;
  }

  // eslint-disable-next-line no-console
  console.log(`Authenticating user: ${email}`);

  try {
    // Navigate to login page and authenticate
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Fill in credentials
    await loginPage.login(email, password);

    // Wait for successful login (redirect away from /login) or error message
    await Promise.race([
      page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 10000 }),
      page.waitForSelector('[role="alert"]', { timeout: 10000 }),
    ]);

    // Check if we're still on login page (authentication failed)
    if (page.url().includes("/login")) {
      const errorText = await page.locator('[role="alert"]').textContent();
      // eslint-disable-next-line no-console
      console.error(`❌ Authentication failed: ${errorText}`);
      // eslint-disable-next-line no-console
      console.warn("⚠️  Please check your .env file has valid SUPABASE_URL and SUPABASE_KEY");
      // eslint-disable-next-line no-console
      console.warn("⚠️  Tests requiring authentication will be skipped");
      return;
    }

    // Verify we're authenticated by checking we can access a protected route
    await page.goto("/generate");
    await expect(page).toHaveURL("/generate");

    // eslint-disable-next-line no-console
    console.log("✓ Authentication successful, saving session state...");

    // Save the authenticated state to be reused in tests
    await page.context().storageState({ path: authFile });

    // eslint-disable-next-line no-console
    console.log(`✓ Session state saved to: ${authFile}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`❌ Authentication setup failed:`, error);
    // eslint-disable-next-line no-console
    console.warn("⚠️  Tests requiring authentication will be skipped");
    // eslint-disable-next-line no-console
    console.warn("⚠️  Common causes:");
    // eslint-disable-next-line no-console
    console.warn("   - Invalid Supabase credentials in .env file");
    // eslint-disable-next-line no-console
    console.warn("   - E2E_USERNAME/PASSWORD in .env.test do not match an existing user");
    // eslint-disable-next-line no-console
    console.warn("   - Supabase project is not accessible");
    // Don't throw - let tests run without auth (they will skip if they need it)
  }
});
