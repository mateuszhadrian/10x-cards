/**
 * E2E Tests - Generate Flashcards Flow
 *
 * Tests the complete workflow of generating and saving flashcards:
 * 1. Enter text input
 * 2. Generate flashcards
 * 3. Review and edit flashcards
 * 4. Save flashcards to database
 *
 * Testing Strategy:
 * - Use mocks for API responses to ensure fast, reliable, and cost-free testing
 * - Tests focus on UI behavior and user interactions
 * - Error scenarios use mocked failures to test error handling
 */

import { test, expect } from "@playwright/test";
import { GenerateFlashcardsPage } from "./pages/GenerateFlashcardsPage";
import { testGenerations } from "./fixtures/test-data";
import {
  setupSuccessfulGenerationMock,
  setupFailedGenerationMock,
  setupSuccessfulSaveMock,
  setupFailedSaveMock,
  setupSaveMockWithCountTracking,
  setupCompleteWorkflowMocks,
} from "./fixtures/api-mocks";

test.describe("Generate Flashcards", () => {
  let generatePage: GenerateFlashcardsPage;

  test.beforeEach(async ({ page }) => {
    generatePage = new GenerateFlashcardsPage(page);
    await generatePage.goto();
  });

  test.describe("Step 1: Text Input Validation", () => {
    test("should show character count", async () => {
      const initialCount = await generatePage.getCharacterCount();
      expect(initialCount).toBe(0);

      await generatePage.enterText("Hello World");
      const newCount = await generatePage.getCharacterCount();
      expect(newCount).toBe(11);
    });

    test("should disable generate button for text too short", async () => {
      await generatePage.enterText(testGenerations.shortInput);
      const isEnabled = await generatePage.isGenerateButtonEnabled();
      expect(isEnabled).toBe(false);
    });

    test("should disable generate button for text too long", async () => {
      await generatePage.enterText(testGenerations.tooLongInput);
      const isEnabled = await generatePage.isGenerateButtonEnabled();
      expect(isEnabled).toBe(false);
    });

    test("should enable generate button for valid text length", async () => {
      await generatePage.enterText(testGenerations.validInput);
      const isEnabled = await generatePage.isGenerateButtonEnabled();
      expect(isEnabled).toBe(true);
    });
  });

  test.describe("Step 2: Generation Process", () => {
    test("should show loading state during generation", async ({ page }) => {
      // Add delay to mock to capture loading state
      // Use setTimeout instead of page.waitForTimeout to avoid "Test ended" error
      await page.route("**/api/generations", (route) => {
        setTimeout(() => {
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              generation: { id: 1 },
              flashcards: [
                { id: 1, front: "Question 1", back: "Answer 1" },
                { id: 2, front: "Question 2", back: "Answer 2" },
                { id: 3, front: "Question 3", back: "Answer 3" },
              ],
            }),
          });
        }, 1000); // 1 second delay
      });

      await generatePage.enterText(testGenerations.validInput);
      await generatePage.clickGenerate();

      // Check loading state is visible (should appear while waiting for mock response)
      await expect(generatePage.loadingState).toBeVisible({ timeout: 2000 });
    });

    test("should generate flashcards successfully", async ({ page }) => {
      // Mock successful generation to avoid API costs
      await setupSuccessfulGenerationMock(page);

      const success = await generatePage.generateFlashcards(testGenerations.validInput);

      expect(success).toBe(true);
      await expect(generatePage.reviewSection).toBeVisible();

      const count = await generatePage.getFlashcardCount();
      expect(count).toBeGreaterThan(0);
    });

    test("should show error message on generation failure", async ({ page }) => {
      // Mock API failure
      await setupFailedGenerationMock(page, "Generation failed");

      await generatePage.enterText(testGenerations.validInput);
      await generatePage.clickGenerate();

      await expect(generatePage.errorAlert).toBeVisible();
      const errorMessage = await generatePage.getErrorMessage();
      expect(errorMessage).toContain("Generation failed");
    });
  });

  test.describe("Step 3: Review Flashcards", () => {
    test.beforeEach(async ({ page }) => {
      // Mock successful generation for UI tests (fast and reliable)
      await setupSuccessfulGenerationMock(page);
      await generatePage.generateFlashcards(testGenerations.validInput);
    });

    test("should display generated flashcards", async () => {
      const count = await generatePage.getFlashcardCount();
      expect(count).toBe(3);
    });

    test("should accept individual flashcard", async () => {
      const flashcard = generatePage.getFlashcardItem(0);

      expect(await flashcard.isAccepted()).toBe(false);
      await flashcard.accept();
      expect(await flashcard.isAccepted()).toBe(true);
    });

    test("should select all flashcards", async () => {
      await generatePage.selectAllFlashcards();

      const acceptedCount = await generatePage.getAcceptedCount();
      const totalCount = await generatePage.getFlashcardCount();
      expect(acceptedCount).toBe(totalCount);
    });

    test("should deselect all flashcards", async () => {
      await generatePage.selectAllFlashcards();
      await generatePage.deselectAllFlashcards();

      const acceptedCount = await generatePage.getAcceptedCount();
      expect(acceptedCount).toBe(0);
    });

    test("should edit flashcard content", async () => {
      const flashcard = generatePage.getFlashcardItem(0);

      await flashcard.editAndSave("New Question", "New Answer");

      expect(await flashcard.isEdited()).toBe(true);
      expect(await flashcard.getFrontText()).toBe("New Question");
      expect(await flashcard.getBackText()).toBe("New Answer");
    });

    test("should cancel edit without saving", async () => {
      const flashcard = generatePage.getFlashcardItem(0);
      const originalFront = await flashcard.getFrontText();

      await flashcard.startEdit();
      await flashcard.edit("Changed Question");
      await flashcard.cancelEdit();

      expect(await flashcard.getFrontText()).toBe(originalFront);
    });

    test("should reject flashcard", async () => {
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

    test("should disable save button when no flashcards accepted", async () => {
      const isEnabled = await generatePage.isSaveAcceptedButtonEnabled();
      expect(isEnabled).toBe(false);
    });

    test("should enable save button when flashcards accepted", async () => {
      const flashcard = generatePage.getFlashcardItem(0);
      await flashcard.accept();

      const isEnabled = await generatePage.isSaveAcceptedButtonEnabled();
      expect(isEnabled).toBe(true);
    });
  });

  test.describe("Step 4: Save Flashcards", () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to generate page (in case previous test redirected elsewhere)
      await generatePage.goto();

      // Mock successful generation for UI tests (fast and reliable)
      await setupSuccessfulGenerationMock(page);
      await generatePage.generateFlashcards(testGenerations.validInput);
    });

    test("should save all flashcards", async ({ page }) => {
      // Mock save endpoint for UI test
      await setupSuccessfulSaveMock(page);

      await generatePage.saveAllFlashcards();
      await generatePage.waitForSaveComplete();

      expect(page.url()).toContain("/flashcards");
    });

    test("should save only accepted flashcards", async ({ page }) => {
      // Accept first two flashcards
      await generatePage.getFlashcardItem(0).accept();
      await generatePage.getFlashcardItem(1).accept();

      // Mock save endpoint and verify correct count was sent
      const getSavedCount = await setupSaveMockWithCountTracking(page);

      await generatePage.saveAcceptedFlashcards();
      await generatePage.waitForSaveComplete();

      expect(getSavedCount()).toBe(2);
      expect(page.url()).toContain("/flashcards");
    });

    test("should show success message after save", async ({ page }) => {
      // Mock save endpoint for UI test
      await setupSuccessfulSaveMock(page);

      await generatePage.selectAllFlashcards();
      await generatePage.saveAcceptedFlashcards();

      await expect(generatePage.successAlert).toBeVisible();
      const message = await generatePage.getSuccessMessage();
      expect(message).toContain("saved");
    });

    test("should show error message on save failure", async ({ page }) => {
      // Mock save endpoint failure
      await setupFailedSaveMock(page, "Failed to save flashcards");

      await generatePage.selectAllFlashcards();
      await generatePage.saveAcceptedFlashcards();

      await expect(generatePage.errorAlert).toBeVisible();
      const errorMessage = await generatePage.getErrorMessage();
      expect(errorMessage).toContain("Failed to save");
    });
  });

  test.describe("Complete Workflow", () => {
    test("should complete full workflow: generate and save all (with mocks)", async ({ page }) => {
      // Mock complete workflow (generation + save)
      await setupCompleteWorkflowMocks(page);

      await generatePage.generateAndSaveAll(testGenerations.validInput);

      expect(page.url()).toContain("/flashcards");
    });

    test("should complete full workflow: generate, select specific, and save", async ({ page }) => {
      // Mock generation with 5 flashcards
      await setupSuccessfulGenerationMock(page, [
        { id: 1, front: "Question 1", back: "Answer 1" },
        { id: 2, front: "Question 2", back: "Answer 2" },
        { id: 3, front: "Question 3", back: "Answer 3" },
        { id: 4, front: "Question 4", back: "Answer 4" },
        { id: 5, front: "Question 5", back: "Answer 5" },
      ]);

      // Mock save and verify correct count was sent
      const getSavedCount = await setupSaveMockWithCountTracking(page);

      // Select only flashcards at index 0, 2, and 4
      await generatePage.generateAndSaveSelected(testGenerations.validInput, [0, 2, 4]);

      expect(getSavedCount()).toBe(3);
      expect(page.url()).toContain("/flashcards");
    });
  });
});
