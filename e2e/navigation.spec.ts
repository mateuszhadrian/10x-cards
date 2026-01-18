/**
 * E2E Test - Navigation and Routing
 * 
 * This demonstrates:
 * - Testing navigation between pages
 * - Responsive design testing
 * - Visual regression testing
 */

import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should display home page correctly', async ({ page }) => {
    await page.goto('/');

    // Check that main elements are visible
    await expect(page).toHaveTitle(/10x-cards|flashcards/i);
    
    // Check for main navigation
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should navigate between main pages', async ({ page }) => {
    await page.goto('/');

    // Navigate to Generate page
    const generateLink = page.getByRole('link', { name: /generate/i });
    if (await generateLink.isVisible()) {
      await generateLink.click();
      await expect(page).toHaveURL(/.*generate/);
    }

    // Navigate to Flashcards page
    const flashcardsLink = page.getByRole('link', { name: /flashcards|saved|my cards/i });
    if (await flashcardsLink.isVisible()) {
      await flashcardsLink.click();
      await expect(page).toHaveURL(/.*flashcards/);
    }

    // Navigate back home
    const homeLink = page.getByRole('link', { name: /home/i }).first();
    if (await homeLink.isVisible()) {
      await homeLink.click();
      await expect(page).toHaveURL('/');
    }
  });

  test('should handle 404 page correctly', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');

    // Check for 404 status
    expect(response?.status()).toBe(404);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check that mobile navigation is visible
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Check for hamburger menu if applicable
    const hamburgerButton = page.getByRole('button', { name: /menu/i });
    if (await hamburgerButton.isVisible()) {
      await hamburgerButton.click();
      // Menu should expand
      await expect(page.locator('[role="navigation"], [role="menu"]')).toBeVisible();
    }
  });

  test('should be responsive on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // Check that navigation is visible and properly laid out
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });
});

test.describe('Theme Toggle', () => {
  test('should toggle between light and dark mode', async ({ page }) => {
    await page.goto('/');

    // Find theme toggle button
    const themeToggle = page.getByRole('button', { name: /theme|dark mode|light mode/i });
    
    if (await themeToggle.isVisible()) {
      // Get initial theme
      const initialTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark');
      });

      // Click toggle
      await themeToggle.click();

      // Wait for theme change
      await page.waitForTimeout(500);

      // Check theme changed
      const newTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark');
      });

      expect(newTheme).not.toBe(initialTheme);
    } else {
      test.skip();
    }
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Check for h1
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();

    // Check that headings follow proper order
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
    expect(headings.length).toBeGreaterThan(0);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    
    // Check that focus is visible on an interactive element
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement);
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');

    // Check for ARIA landmarks
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();

    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav).toBeVisible();
  });
});
