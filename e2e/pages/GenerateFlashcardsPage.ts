/**
 * Page Object Model - Generate Flashcards Page
 * 
 * This class encapsulates all interactions with the Generate Flashcards view.
 * It provides methods for the complete workflow: input text, generate, review, and save flashcards.
 */

import { Page, Locator } from '@playwright/test';
import { FlashcardReviewItem } from './FlashcardReviewItem';

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
    this.inputTextarea = page.getByTestId('generate-input-text');
    this.generateButton = page.getByTestId('generate-flashcards-button');
    this.characterCount = page.locator('text=/\\d+.*\\/.*10,000 characters/');
    
    // Step 2: Generation state
    this.loadingState = page.getByTestId('generate-loading-state');
    this.errorAlert = page.getByTestId('generate-error-alert');
    this.successAlert = page.getByTestId('generate-success-alert');
    
    // Step 3: Review
    this.reviewSection = page.getByTestId('flashcards-review-section');
    this.reviewList = page.getByTestId('flashcards-review-list');
    this.selectAllButton = page.getByTestId('select-all-flashcards-button');
    this.deselectAllButton = page.getByTestId('deselect-all-flashcards-button');
    
    // Step 4: Save
    this.saveSection = page.getByTestId('flashcards-bulk-save-section');
    this.saveAllButton = page.getByTestId('save-all-flashcards-button');
    this.saveAcceptedButton = page.getByTestId('save-accepted-flashcards-button');
  }

  async goto() {
    await this.page.goto('/generate');
  }

  /**
   * Step 1: Enter text into the input textarea
   * 
   * Hybrid approach based on text length:
   * - Short text (<500 chars): use pressSequentially (reliable, triggers React events)
   * - Long text (>=500 chars): use direct React state manipulation (fast)
   */
  async enterText(text: string) {
    await this.inputTextarea.click();
    
    if (text.length < 500) {
      // Short text: use pressSequentially for reliability
      await this.inputTextarea.clear();
      await this.inputTextarea.pressSequentially(text, { delay: 0 });
    } else {
      // Long text: directly manipulate React state (much faster)
      await this.inputTextarea.evaluate((el: HTMLTextAreaElement, value: string) => {
        // Get React's internal instance
        const key = Object.keys(el).find(k => k.startsWith('__reactProps'));
        if (key) {
          const props = (el as any)[key];
          // Call onChange handler directly with synthetic event
          if (props.onChange) {
            props.onChange({
              target: { value },
              currentTarget: { value },
            });
          }
        }
        // Also set the actual value
        el.value = value;
      }, text);
    }
    
    // Wait for character count to update
    const expectedCount = text.length.toLocaleString();
    await this.page.waitForFunction(
      (expected: string) => {
        const text = document.body.textContent || '';
        return text.includes(expected);
      },
      expectedCount,
      { timeout: 3000 }
    ).catch(() => {
      // If waiting for exact count fails, just wait a bit
      return this.page.waitForTimeout(500);
    });
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
   */
  async clickGenerate() {
    await this.generateButton.click();
  }

  /**
   * Wait for generation to complete (loading state disappears and review section appears)
   */
  async waitForGenerationComplete() {
    // Wait for loading to disappear
    await this.loadingState.waitFor({ state: 'hidden', timeout: 60000 });
    
    // Check if we got results or an error
    const hasError = await this.errorAlert.isVisible().catch(() => false);
    if (hasError) {
      return false;
    }
    
    // Wait for review section to appear
    await this.reviewSection.waitFor({ state: 'visible' });
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
    await this.page.waitForURL('/flashcards', { timeout: 10000 });
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
      throw new Error('Failed to generate flashcards');
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
      throw new Error('Failed to generate flashcards');
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
