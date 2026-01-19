/**
 * Reusable API Mock Handlers for E2E Tests
 *
 * This file contains reusable mock handlers for API endpoints to avoid duplication
 * across test files. Mocks ensure tests are fast, reliable, and don't incur API costs.
 */

import { Page, Route } from "@playwright/test";

/**
 * Mock data for a successful flashcard generation
 */
export const mockGeneratedFlashcards = [
  { id: 1, front: "Question 1", back: "Answer 1" },
  { id: 2, front: "Question 2", back: "Answer 2" },
  { id: 3, front: "Question 3", back: "Answer 3" },
];

/**
 * Setup mock for successful flashcard generation
 * Returns a route that responds with generated flashcards
 */
export async function setupSuccessfulGenerationMock(page: Page, flashcards = mockGeneratedFlashcards) {
  await page.route("**/api/generations", (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        generation: { id: 1 },
        flashcards,
      }),
    });
  });
}

/**
 * Setup mock for failed flashcard generation
 * Returns a route that responds with an error
 */
export async function setupFailedGenerationMock(page: Page, errorMessage = "Generation failed") {
  await page.route("**/api/generations", (route: Route) => {
    route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: errorMessage }),
    });
  });
}

/**
 * Setup mock for successful flashcard save
 * Captures the request data and returns it with IDs
 */
export async function setupSuccessfulSaveMock(page: Page) {
  await page.route("**/api/flashcards", (route: Route) => {
    const request = route.request();
    const postData = request.postDataJSON();

    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        flashcards: postData.flashcards.map((f: { front: string; back: string }, i: number) => ({
          id: i + 1,
          ...f,
        })),
      }),
    });
  });
}

/**
 * Setup mock for failed flashcard save
 * Returns a route that responds with an error
 */
export async function setupFailedSaveMock(page: Page, errorMessage = "Failed to save flashcards") {
  await page.route("**/api/flashcards", (route: Route) => {
    route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: errorMessage }),
    });
  });
}

/**
 * Setup mock for successful save with count tracking
 * Useful for verifying how many flashcards were sent to the API
 *
 * @returns A function that returns the number of flashcards saved
 */
export async function setupSaveMockWithCountTracking(page: Page): Promise<() => number> {
  let savedCount = 0;

  await page.route("**/api/flashcards", (route: Route) => {
    const request = route.request();
    const postData = request.postDataJSON();
    savedCount = postData.flashcards.length;

    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        flashcards: postData.flashcards.map((f: { front: string; back: string }, i: number) => ({
          id: i + 1,
          ...f,
        })),
      }),
    });
  });

  return () => savedCount;
}

/**
 * Setup mocks for complete flashcard generation and save workflow
 * This is useful for tests that need both generation and save to succeed
 */
export async function setupCompleteWorkflowMocks(page: Page, flashcards = mockGeneratedFlashcards) {
  await setupSuccessfulGenerationMock(page, flashcards);
  await setupSuccessfulSaveMock(page);
}

/**
 * Clear all API mocks
 * Useful in beforeEach/afterEach to ensure clean state
 */
export async function clearAllMocks(page: Page) {
  await page.unroute("**/api/generations");
  await page.unroute("**/api/flashcards");
}
