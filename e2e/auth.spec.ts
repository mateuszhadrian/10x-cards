/**
 * E2E Test - Authentication Flow
 *
 * This demonstrates:
 * - Page Object Model usage
 * - Test isolation with browser contexts
 * - User flow testing
 * - API testing alongside UI tests
 *
 * NOTE: These tests do NOT use authenticated storage state
 * because they test the authentication process itself.
 */

import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";
import { testUsers } from "./fixtures/test-data";

// Disable authenticated storage state for auth tests
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page before each test
    await page.goto("/");
  });

  test("should display login page correctly", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Check that all elements are visible
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
    await expect(loginPage.registerLink).toBeVisible();
    await expect(loginPage.forgotPasswordLink).toBeVisible();
  });

  test("should show validation errors for empty fields", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Try to submit without filling fields
    await loginPage.submitButton.click();

    // Check for custom validation error messages (Zod validation)
    // Should show error for required email field - use testid for reliability
    // Note: Empty string fails email validation first, so we check for that
    const emailError = page.getByTestId(`${await loginPage.emailInput.getAttribute("id")}-error`);
    await expect(emailError).toBeVisible({ timeout: 3000 });
    await expect(emailError).toContainText(/invalid.*email|email.*required/i);
  });

  test("should show error for invalid credentials", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login(testUsers.invalidUser.email, testUsers.invalidUser.password);

    // Wait for error message
    await expect(loginPage.errorMessage).toBeVisible({ timeout: 5000 });
    const errorText = await loginPage.getErrorMessage();
    expect(errorText?.toLowerCase()).toContain("invalid");
  });

  test("should navigate to register page", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.goToRegister();

    // Check URL changed to register page
    await expect(page).toHaveURL(/.*register/);
  });

  test("should navigate to forgot password page", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.goToForgotPassword();

    // Check URL changed to forgot password page
    await expect(page).toHaveURL(/.*forgot-password/);
  });
});

test.describe("Registration", () => {
  test("should display registration form correctly", async ({ page }) => {
    await page.goto("/register");

    // Check that registration form is visible
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Confirm Password")).toBeVisible();
    await expect(page.getByRole("button", { name: /register|sign up/i })).toBeVisible();
  });

  test("should validate email format", async ({ page }) => {
    await page.goto("/register");

    const emailInput = page.getByLabel(/^email$/i);
    await emailInput.fill("invalid-email");

    // Use type=submit to get the form button (not navigation button)
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Check for validation error message
    // Use text locator as fallback since React useId() generates special characters
    const emailError = page.locator("p.text-destructive", { hasText: /invalid.*email/i }).first();
    await expect(emailError).toBeVisible({ timeout: 3000 });
  });
});
