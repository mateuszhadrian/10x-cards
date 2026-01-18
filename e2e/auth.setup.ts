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

import { test as setup, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Check if credentials are available
  const email = process.env.E2E_USERNAME;
  const password = process.env.E2E_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'E2E_USERNAME and E2E_PASSWORD must be set in .env.test file.\n' +
      'Please ensure .env.test exists with these variables.'
    );
  }

  console.log(`Authenticating user: ${email}`);

  // Navigate to login page and authenticate
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  
  // Fill in credentials
  await loginPage.login(email, password);
  
  // Wait for successful login (redirect away from /login)
  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 });
  
  // Verify we're authenticated by checking we can access a protected route
  await page.goto('/generate');
  await expect(page).toHaveURL('/generate');
  
  console.log('Authentication successful, saving session state...');

  // End of authentication steps
  // Save the authenticated state to be reused in tests
  await page.context().storageState({ path: authFile });
  
  console.log(`Session state saved to: ${authFile}`);
});
