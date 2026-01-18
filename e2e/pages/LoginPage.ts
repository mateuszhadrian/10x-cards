/**
 * Page Object Model - Login Page
 * 
 * This demonstrates the Page Object Model pattern for maintainable E2E tests.
 * Each page class encapsulates selectors and actions for a specific page.
 */

import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly registerLink: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.submitButton = page.getByRole('button', { name: /log in|sign in/i });
    this.errorMessage = page.getByRole('alert');
    this.registerLink = page.getByRole('link', { name: /register|sign up/i });
    this.forgotPasswordLink = page.getByRole('link', { name: /forgot password/i });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }

  async goToRegister() {
    await this.registerLink.click();
  }

  async goToForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  async isLoginSuccessful() {
    // Wait for navigation away from login page
    await this.page.waitForURL((url) => !url.pathname.includes('/login'));
    return !this.page.url().includes('/login');
  }
}
