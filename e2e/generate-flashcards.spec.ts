/**
 * E2E Tests - Generate Flashcards Flow
 * 
 * Tests the complete workflow of generating and saving flashcards:
 * 1. Enter text input
 * 2. Generate flashcards
 * 3. Review and edit flashcards
 * 4. Save flashcards to database
 */

import { test, expect } from '@playwright/test';
import { GenerateFlashcardsPage } from './pages/GenerateFlashcardsPage';
import { testGenerations } from './fixtures/test-data';

test.describe('Generate Flashcards', () => {
  let generatePage: GenerateFlashcardsPage;

  test.beforeEach(async ({ page }) => {
    generatePage = new GenerateFlashcardsPage(page);
    await generatePage.goto();
  });

  test.describe('Step 1: Text Input Validation', () => {
    test('should show character count', async () => {
      const initialCount = await generatePage.getCharacterCount();
      expect(initialCount).toBe(0);

      await generatePage.enterText('Hello World');
      const newCount = await generatePage.getCharacterCount();
      expect(newCount).toBe(11);
    });

    test('should disable generate button for text too short', async () => {
      await generatePage.enterText(testGenerations.shortInput);
      const isEnabled = await generatePage.isGenerateButtonEnabled();
      expect(isEnabled).toBe(false);
    });

    test('should disable generate button for text too long', async () => {
      await generatePage.enterText(testGenerations.tooLongInput);
      const isEnabled = await generatePage.isGenerateButtonEnabled();
      expect(isEnabled).toBe(false);
    });

    test('should enable generate button for valid text length', async () => {
      await generatePage.enterText(testGenerations.validInput);
      const isEnabled = await generatePage.isGenerateButtonEnabled();
      expect(isEnabled).toBe(true);
    });
  });

  test.describe('Step 2: Generation Process', () => {
    test('should show loading state during generation', async () => {
      await generatePage.enterText(testGenerations.validInput);
      await generatePage.clickGenerate();

      // Check loading state is visible
      await expect(generatePage.loadingState).toBeVisible();
    });

    test('should generate flashcards successfully', async ({ page }) => {
      // Skip if API is not available
      test.skip(!process.env.OPENROUTER_API_KEY, 'Requires OPENROUTER_API_KEY');

      const success = await generatePage.generateFlashcards(testGenerations.validInput);
      
      expect(success).toBe(true);
      await expect(generatePage.reviewSection).toBeVisible();
      
      const count = await generatePage.getFlashcardCount();
      expect(count).toBeGreaterThan(0);
    });

    test('should show error message on generation failure', async ({ page }) => {
      // Mock API failure
      await page.route('**/api/generations', (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Generation failed' }),
        });
      });

      await generatePage.enterText(testGenerations.validInput);
      await generatePage.clickGenerate();
      
      await expect(generatePage.errorAlert).toBeVisible();
      const errorMessage = await generatePage.getErrorMessage();
      expect(errorMessage).toContain('Generation failed');
    });
  });

  test.describe('Step 3: Review Flashcards', () => {
    test.beforeEach(async ({ page }) => {
      // Mock successful generation
      await page.route('**/api/generations', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            generation: { id: 1 },
            flashcards: [
              { id: 1, front: 'Question 1', back: 'Answer 1' },
              { id: 2, front: 'Question 2', back: 'Answer 2' },
              { id: 3, front: 'Question 3', back: 'Answer 3' },
            ],
          }),
        });
      });

      await generatePage.generateFlashcards(testGenerations.validInput);
    });

    test('should display generated flashcards', async () => {
      const count = await generatePage.getFlashcardCount();
      expect(count).toBe(3);
    });

    test('should accept individual flashcard', async () => {
      const flashcard = generatePage.getFlashcardItem(0);
      
      expect(await flashcard.isAccepted()).toBe(false);
      await flashcard.accept();
      expect(await flashcard.isAccepted()).toBe(true);
    });

    test('should select all flashcards', async () => {
      await generatePage.selectAllFlashcards();
      
      const acceptedCount = await generatePage.getAcceptedCount();
      const totalCount = await generatePage.getFlashcardCount();
      expect(acceptedCount).toBe(totalCount);
    });

    test('should deselect all flashcards', async () => {
      await generatePage.selectAllFlashcards();
      await generatePage.deselectAllFlashcards();
      
      const acceptedCount = await generatePage.getAcceptedCount();
      expect(acceptedCount).toBe(0);
    });

    test('should edit flashcard content', async () => {
      const flashcard = generatePage.getFlashcardItem(0);
      
      await flashcard.editAndSave('New Question', 'New Answer');
      
      expect(await flashcard.isEdited()).toBe(true);
      expect(await flashcard.getFrontText()).toBe('New Question');
      expect(await flashcard.getBackText()).toBe('New Answer');
    });

    test('should cancel edit without saving', async () => {
      const flashcard = generatePage.getFlashcardItem(0);
      const originalFront = await flashcard.getFrontText();
      
      await flashcard.startEdit();
      await flashcard.edit('Changed Question');
      await flashcard.cancelEdit();
      
      expect(await flashcard.getFrontText()).toBe(originalFront);
    });

    test('should reject flashcard', async () => {
      const initialCount = await generatePage.getFlashcardCount();
      expect(initialCount).toBeGreaterThan(0); // Ensure we have flashcards to reject
      
      // Reject the first flashcard
      const flashcard = generatePage.getFlashcardItem(0);
      await flashcard.reject();
      // Note: reject() already waits for count to decrease
      
      // Verify the count decreased by 1
      const newCount = await generatePage.getFlashcardCount();
      expect(newCount).toBe(initialCount - 1);
    });

    test('should disable save button when no flashcards accepted', async () => {
      const isEnabled = await generatePage.isSaveAcceptedButtonEnabled();
      expect(isEnabled).toBe(false);
    });

    test('should enable save button when flashcards accepted', async () => {
      const flashcard = generatePage.getFlashcardItem(0);
      await flashcard.accept();
      
      const isEnabled = await generatePage.isSaveAcceptedButtonEnabled();
      expect(isEnabled).toBe(true);
    });
  });

  test.describe('Step 4: Save Flashcards', () => {
    test.beforeEach(async ({ page }) => {
      // Mock successful generation
      await page.route('**/api/generations', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            generation: { id: 1 },
            flashcards: [
              { id: 1, front: 'Question 1', back: 'Answer 1' },
              { id: 2, front: 'Question 2', back: 'Answer 2' },
              { id: 3, front: 'Question 3', back: 'Answer 3' },
            ],
          }),
        });
      });

      await generatePage.generateFlashcards(testGenerations.validInput);
    });

    test('should save all flashcards', async ({ page }) => {
      // Mock save endpoint
      await page.route('**/api/flashcards', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            flashcards: [
              { id: 1, front: 'Question 1', back: 'Answer 1' },
              { id: 2, front: 'Question 2', back: 'Answer 2' },
              { id: 3, front: 'Question 3', back: 'Answer 3' },
            ],
          }),
        });
      });

      await generatePage.saveAllFlashcards();
      await generatePage.waitForSaveComplete();
      
      expect(page.url()).toContain('/flashcards');
    });

    test('should save only accepted flashcards', async ({ page }) => {
      // Accept first two flashcards
      await generatePage.getFlashcardItem(0).accept();
      await generatePage.getFlashcardItem(1).accept();
      
      // Mock save endpoint
      let savedCount = 0;
      await page.route('**/api/flashcards', (route) => {
        const request = route.request();
        const postData = request.postDataJSON();
        savedCount = postData.flashcards.length;
        
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            flashcards: postData.flashcards.map((f: any, i: number) => ({ id: i + 1, ...f })),
          }),
        });
      });

      await generatePage.saveAcceptedFlashcards();
      await generatePage.waitForSaveComplete();
      
      expect(savedCount).toBe(2);
      expect(page.url()).toContain('/flashcards');
    });

    test('should show success message after save', async ({ page }) => {
      // Mock save endpoint
      await page.route('**/api/flashcards', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            flashcards: [
              { id: 1, front: 'Question 1', back: 'Answer 1' },
            ],
          }),
        });
      });

      await generatePage.selectAllFlashcards();
      await generatePage.saveAcceptedFlashcards();
      
      await expect(generatePage.successAlert).toBeVisible();
      const message = await generatePage.getSuccessMessage();
      expect(message).toContain('saved');
    });

    test('should show error message on save failure', async ({ page }) => {
      // Mock save endpoint failure
      await page.route('**/api/flashcards', (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Failed to save flashcards' }),
        });
      });

      await generatePage.selectAllFlashcards();
      await generatePage.saveAcceptedFlashcards();
      
      await expect(generatePage.errorAlert).toBeVisible();
      const errorMessage = await generatePage.getErrorMessage();
      expect(errorMessage).toContain('Failed to save');
    });
  });

  test.describe('Complete Workflow', () => {
    test('should complete full workflow: generate and save all', async ({ page }) => {
      // Skip if API is not available
      test.skip(!process.env.OPENROUTER_API_KEY, 'Requires OPENROUTER_API_KEY');

      // Mock only the save endpoint
      await page.route('**/api/flashcards', (route) => {
        const request = route.request();
        const postData = request.postDataJSON();
        
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            flashcards: postData.flashcards.map((f: any, i: number) => ({ id: i + 1, ...f })),
          }),
        });
      });

      await generatePage.generateAndSaveAll(testGenerations.validInput);
      
      expect(page.url()).toContain('/flashcards');
    });

    test('should complete full workflow: generate, select specific, and save', async ({ page }) => {
      // Mock generation
      await page.route('**/api/generations', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            generation: { id: 1 },
            flashcards: [
              { id: 1, front: 'Question 1', back: 'Answer 1' },
              { id: 2, front: 'Question 2', back: 'Answer 2' },
              { id: 3, front: 'Question 3', back: 'Answer 3' },
              { id: 4, front: 'Question 4', back: 'Answer 4' },
              { id: 5, front: 'Question 5', back: 'Answer 5' },
            ],
          }),
        });
      });

      // Mock save
      let savedCount = 0;
      await page.route('**/api/flashcards', (route) => {
        const request = route.request();
        const postData = request.postDataJSON();
        savedCount = postData.flashcards.length;
        
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            flashcards: postData.flashcards.map((f: any, i: number) => ({ id: i + 1, ...f })),
          }),
        });
      });

      // Select only flashcards at index 0, 2, and 4
      await generatePage.generateAndSaveSelected(testGenerations.validInput, [0, 2, 4]);
      
      expect(savedCount).toBe(3);
      expect(page.url()).toContain('/flashcards');
    });
  });
});
