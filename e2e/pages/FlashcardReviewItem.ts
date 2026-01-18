/**
 * Page Object Model - Flashcard Review Item
 * 
 * This class encapsulates all interactions with a single flashcard in the review list.
 * It provides methods for accepting, editing, and rejecting flashcards.
 */

import { Page, Locator } from '@playwright/test';

export class FlashcardReviewItem {
  readonly page: Page;
  readonly index: number;
  
  // Main container
  readonly container: Locator;
  
  // Action elements
  readonly checkbox: Locator;
  readonly editButton: Locator;
  readonly rejectButton: Locator;
  
  // Edit mode elements
  readonly frontInput: Locator;
  readonly backTextarea: Locator;
  readonly saveEditButton: Locator;
  readonly cancelEditButton: Locator;
  
  // Content elements (view mode)
  readonly frontText: Locator;
  readonly backText: Locator;

  constructor(page: Page, index: number) {
    this.page = page;
    this.index = index;
    
    // Main container
    this.container = page.getByTestId(`flashcard-review-item-${index}`);
    
    // Actions
    this.checkbox = page.getByTestId(`flashcard-checkbox-${index}`);
    this.editButton = page.getByTestId(`flashcard-edit-button-${index}`);
    this.rejectButton = page.getByTestId(`flashcard-reject-button-${index}`);
    
    // Edit mode
    this.frontInput = page.getByTestId(`flashcard-edit-front-${index}`);
    this.backTextarea = page.getByTestId(`flashcard-edit-back-${index}`);
    this.saveEditButton = page.getByTestId(`flashcard-save-edit-button-${index}`);
    this.cancelEditButton = page.getByTestId(`flashcard-cancel-edit-button-${index}`);
    
    // View mode content
    this.frontText = this.container.locator('text=/Front:/').locator('..').locator('div').nth(1);
    this.backText = this.container.locator('text=/Back:/').locator('..').locator('div').nth(1);
  }

  /**
   * Check if the flashcard is accepted (checkbox checked)
   */
  async isAccepted(): Promise<boolean> {
    return await this.checkbox.isChecked();
  }

  /**
   * Accept the flashcard (check the checkbox)
   */
  async accept() {
    if (!await this.isAccepted()) {
      await this.checkbox.check();
    }
  }

  /**
   * Unaccept the flashcard (uncheck the checkbox)
   */
  async unaccept() {
    if (await this.isAccepted()) {
      await this.checkbox.uncheck();
    }
  }

  /**
   * Toggle the acceptance state
   */
  async toggleAccept() {
    await this.checkbox.click();
  }

  /**
   * Get the front text content (in view mode)
   */
  async getFrontText(): Promise<string> {
    return await this.frontText.textContent() || '';
  }

  /**
   * Get the back text content (in view mode)
   */
  async getBackText(): Promise<string> {
    return await this.backText.textContent() || '';
  }

  /**
   * Check if the flashcard is in edit mode
   */
  async isInEditMode(): Promise<boolean> {
    return await this.frontInput.isVisible();
  }

  /**
   * Start editing the flashcard
   */
  async startEdit() {
    if (!await this.isInEditMode()) {
      await this.editButton.click();
      await this.frontInput.waitFor({ state: 'visible' });
    }
  }

  /**
   * Edit the flashcard content
   * @param front - New front text (optional, keeps current if not provided)
   * @param back - New back text (optional, keeps current if not provided)
   */
  async edit(front?: string, back?: string) {
    await this.startEdit();
    
    if (front !== undefined) {
      await this.frontInput.clear();
      await this.frontInput.fill(front);
    }
    
    if (back !== undefined) {
      await this.backTextarea.clear();
      await this.backTextarea.fill(back);
    }
  }

  /**
   * Save the edit
   */
  async saveEdit() {
    await this.saveEditButton.click();
    await this.frontInput.waitFor({ state: 'hidden' });
  }

  /**
   * Cancel the edit
   */
  async cancelEdit() {
    await this.cancelEditButton.click();
    await this.frontInput.waitFor({ state: 'hidden' });
  }

  /**
   * Complete workflow: Edit and save
   */
  async editAndSave(front?: string, back?: string) {
    await this.edit(front, back);
    await this.saveEdit();
  }

  /**
   * Check if the flashcard is marked as edited
   */
  async isEdited(): Promise<boolean> {
    return await this.container.locator('text=/✏️ Edited/').isVisible();
  }

  /**
   * Reject the flashcard (removes it from the list)
   * 
   * Important: After clicking reject, React removes this item and re-renders
   * the entire list with new indices. We can't wait for this.container to 
   * become detached because after React re-renders, there might be a NEW
   * element with the same testid (if indices shift).
   * 
   * Instead, we wait for the total count of items to decrease by 1.
   */
  async reject() {
    // Get current count BEFORE clicking reject
    const countBefore = await this.page.getByTestId(/^flashcard-review-item-\d+$/).count();
    
    // Click reject button
    await this.rejectButton.click();
    
    // Wait for count to decrease by 1
    // This proves React finished removing the item and re-rendering the list
    await this.page.waitForFunction(
      (expectedCount: number) => {
        const items = document.querySelectorAll('[data-testid^="flashcard-review-item-"]');
        return items.length === expectedCount;
      },
      countBefore - 1,
      { timeout: 5000 }
    );
    
    // Small additional wait for React to stabilize (scroll position restoration, etc.)
    await this.page.waitForTimeout(200);
  }

  /**
   * Check if save edit button is enabled
   */
  async isSaveEditButtonEnabled(): Promise<boolean> {
    return await this.saveEditButton.isEnabled();
  }

  /**
   * Get the current value in the front input (edit mode)
   */
  async getFrontInputValue(): Promise<string> {
    return await this.frontInput.inputValue();
  }

  /**
   * Get the current value in the back textarea (edit mode)
   */
  async getBackInputValue(): Promise<string> {
    return await this.backTextarea.inputValue();
  }

  /**
   * Check if the container is visible
   */
  async isVisible(): Promise<boolean> {
    return await this.container.isVisible();
  }

  /**
   * Wait for the container to be visible
   */
  async waitForVisible() {
    await this.container.waitFor({ state: 'visible' });
  }
}
