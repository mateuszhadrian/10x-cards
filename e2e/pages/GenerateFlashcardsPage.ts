/**
 * Page Object Model - Generate Flashcards Page
 *
 * This class encapsulates all interactions with the Generate Flashcards view.
 * It provides methods for the complete workflow: input text, generate, review, and save flashcards.
 */

import { Page, Locator, expect } from "@playwright/test";
import { FlashcardReviewItem } from "./FlashcardReviewItem";

export class GenerateFlashcardsPage {
  readonly page: Page;

  // Step 1: Input elements
  readonly inputTextarea: Locator;
  readonly generateButton: Locator;
  readonly characterCount: Locator;

  // Step 2: Generation state elements
  readonly loadingState: Locator;
  readonly errorAlert: Locator;
  readonly successAlert: Locator;

  // Step 3: Review section elements
  readonly reviewSection: Locator;
  readonly reviewList: Locator;
  readonly selectAllButton: Locator;
  readonly deselectAllButton: Locator;

  // Step 4: Save section elements
  readonly saveSection: Locator;
  readonly saveAllButton: Locator;
  readonly saveAcceptedButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Step 1: Input
    this.inputTextarea = page.getByTestId("generate-input-text");
    this.generateButton = page.getByTestId("generate-flashcards-button");
    this.characterCount = page.locator("text=/\\d+.*\\/.*10,000 characters/");

    // Step 2: Generation state
    this.loadingState = page.getByTestId("generate-loading-state");
    this.errorAlert = page.getByTestId("generate-error-alert");
    this.successAlert = page.getByTestId("generate-success-alert");

    // Step 3: Review
    this.reviewSection = page.getByTestId("flashcards-review-section");
    this.reviewList = page.getByTestId("flashcards-review-list");
    this.selectAllButton = page.getByTestId("select-all-flashcards-button");
    this.deselectAllButton = page.getByTestId("deselect-all-flashcards-button");

    // Step 4: Save
    this.saveSection = page.getByTestId("flashcards-bulk-save-section");
    this.saveAllButton = page.getByTestId("save-all-flashcards-button");
    this.saveAcceptedButton = page.getByTestId("save-accepted-flashcards-button");
  }

  async goto() {
    await this.page.goto("/generate");
  }

  /**
   * Step 1: Enter text into the input textarea
   *
   * Hybrid approach:
   * 1. Type first 50 chars to ensure React onChange is triggered
   * 2. Use fill() to set remaining text (fast)
   *
   * This is reliable across all test scenarios (fresh page and reused page state)
   */
  async enterText(text: string) {
    // Clear any existing text first
    await this.inputTextarea.clear();

    // Click to focus the textarea (important for React event handlers)
    await this.inputTextarea.click();

    // Type first portion to trigger React onChange (this ensures hooks are properly initialized)
    const typeLength = Math.min(50, text.length);
    await this.inputTextarea.type(text.substring(0, typeLength), { delay: 0 });

    // If there's more text, use fill() for the rest (much faster)
    if (text.length > typeLength) {
      // Select all and replace with full text
      await this.inputTextarea.press("Meta+A"); // Ctrl+A on Windows/Linux, Cmd+A on Mac
      await this.inputTextarea.fill(text);
    }

    // Wait for character count to update
    // Use the character count locator which is much faster than searching the entire DOM
    const expectedCount = text.trim().length.toLocaleString();
    await expect(this.characterCount).toContainText(expectedCount, { timeout: 5000 });

    // If text length is valid for generation, wait for button to become enabled
    const textLength = text.trim().length;
    const MIN_LENGTH = 1000;
    const MAX_LENGTH = 10000;
    if (textLength >= MIN_LENGTH && textLength <= MAX_LENGTH) {
      // Wait for React to update button state and for button to become enabled
      await expect(this.generateButton).toBeEnabled({ timeout: 5000 });
    }
  }

  /**
   * Get the current character count
   */
  async getCharacterCount(): Promise<number> {
    const text = await this.inputTextarea.inputValue();
    return text.length;
  }

  /**
   * Check if the generate button is enabled
   */
  async isGenerateButtonEnabled(): Promise<boolean> {
    return await this.generateButton.isEnabled();
  }

  /**
   * Step 2: Click the generate button to start flashcard generation
   * Waits for the button to be enabled before clicking to avoid race conditions
   */
  async clickGenerate() {
    // Wait for button to be visible
    await this.generateButton.waitFor({ state: "visible", timeout: 5000 });

    // Wait for button to be enabled (not disabled)
    // This is critical to avoid race conditions where React hasn't updated the button state yet
    try {
      await this.page.waitForFunction(
        (buttonTestId: string) => {
          const button = document.querySelector(`[data-testid="${buttonTestId}"]`) as HTMLButtonElement;
          return button && !button.disabled;
        },
        "generate-flashcards-button",
        { timeout: 5000 }
      );
    } catch (error) {
      // If button doesn't become enabled, check if it's intentional (e.g., invalid text length)
      const isEnabled = await this.generateButton.isEnabled();
      if (!isEnabled) {
        throw new Error(`Generate button is disabled. Check if text input is valid (1000-10000 chars).`);
      }
      throw error;
    }

    await this.generateButton.click();
  }

  /**
   * Wait for generation to complete (loading state disappears and review section appears)
   */
  async waitForGenerationComplete() {
    // Wait for loading to disappear
    await this.loadingState.waitFor({ state: "hidden", timeout: 60000 });

    // Check if we got results or an error
    const hasError = await this.errorAlert.isVisible().catch(() => false);
    if (hasError) {
      return false;
    }

    // Wait for review section to appear
    await this.reviewSection.waitFor({ state: "visible" });
    return true;
  }

  /**
   * Check if generation resulted in an error
   */
  async hasGenerationError(): Promise<boolean> {
    return await this.errorAlert.isVisible();
  }

  /**
   * Get the error message text
   */
  async getErrorMessage(): Promise<string | null> {
    if (await this.hasGenerationError()) {
      return await this.errorAlert.textContent();
    }
    return null;
  }

  /**
   * Check if generation was successful (success message visible)
   */
  async hasSuccessMessage(): Promise<boolean> {
    return await this.successAlert.isVisible();
  }

  /**
   * Get the success message text
   */
  async getSuccessMessage(): Promise<string | null> {
    if (await this.hasSuccessMessage()) {
      return await this.successAlert.textContent();
    }
    return null;
  }

  /**
   * Step 3: Get all flashcard review items
   */
  async getFlashcardItems(): Promise<FlashcardReviewItem[]> {
    const items = await this.page.getByTestId(/^flashcard-review-item-\d+$/).all();
    return items.map((locator, index) => new FlashcardReviewItem(this.page, index));
  }

  /**
   * Get the count of generated flashcards
   * Counts actual DOM elements by testid pattern
   */
  async getFlashcardCount(): Promise<number> {
    return await this.page.getByTestId(/^flashcard-review-item-\d+$/).count();
  }

  /**
   * Get a specific flashcard by index
   */
  getFlashcardItem(index: number): FlashcardReviewItem {
    return new FlashcardReviewItem(this.page, index);
  }

  /**
   * Select all flashcards
   */
  async selectAllFlashcards() {
    await this.selectAllButton.click();
  }

  /**
   * Deselect all flashcards
   */
  async deselectAllFlashcards() {
    await this.deselectAllButton.click();
  }

  /**
   * Get the count of accepted (checked) flashcards
   */
  async getAcceptedCount(): Promise<number> {
    const items = await this.getFlashcardItems();
    let count = 0;
    for (const item of items) {
      if (await item.isAccepted()) {
        count++;
      }
    }
    return count;
  }

  /**
   * Step 4: Save all flashcards
   */
  async saveAllFlashcards() {
    await this.saveAllButton.click();
  }

  /**
   * Save only accepted flashcards
   */
  async saveAcceptedFlashcards() {
    await this.saveAcceptedButton.click();
  }

  /**
   * Check if save buttons are enabled
   */
  async isSaveAllButtonEnabled(): Promise<boolean> {
    return await this.saveAllButton.isEnabled();
  }

  async isSaveAcceptedButtonEnabled(): Promise<boolean> {
    return await this.saveAcceptedButton.isEnabled();
  }

  /**
   * Wait for save operation to complete (redirects to /flashcards)
   */
  async waitForSaveComplete() {
    await this.page.waitForURL("/flashcards", { timeout: 10000 });
  }

  /**
   * Complete workflow: Enter text and generate
   */
  async generateFlashcards(text: string): Promise<boolean> {
    await this.enterText(text);
    await this.clickGenerate();
    return await this.waitForGenerationComplete();
  }

  /**
   * Complete workflow: Generate and save all
   */
  async generateAndSaveAll(text: string) {
    const success = await this.generateFlashcards(text);
    if (!success) {
      throw new Error("Failed to generate flashcards");
    }
    await this.saveAllFlashcards();
    await this.waitForSaveComplete();
  }

  /**
   * Complete workflow: Generate, select specific cards, and save
   */
  async generateAndSaveSelected(text: string, indicesToSelect: number[]) {
    const success = await this.generateFlashcards(text);
    if (!success) {
      throw new Error("Failed to generate flashcards");
    }

    // Accept specific flashcards
    for (const index of indicesToSelect) {
      const item = this.getFlashcardItem(index);
      await item.accept();
    }

    await this.saveAcceptedFlashcards();
    await this.waitForSaveComplete();
  }
}
