/**
 * MSW (Mock Service Worker) Setup
 *
 * This file configures MSW for mocking API requests in tests.
 * Use this when you need to test components that make HTTP requests.
 */

import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { afterAll, afterEach, beforeAll } from "vitest";

// Define request handlers
export const handlers = [
  // Example: Mock login endpoint
  http.post("/api/auth/login", async () => {
    return HttpResponse.json(
      {
        success: true,
        data: {
          user: {
            id: "1",
            email: "test@example.com",
          },
        },
      },
      { status: 200 }
    );
  }),

  // Example: Mock flashcards endpoint
  http.get("/api/flashcards", async () => {
    return HttpResponse.json(
      {
        success: true,
        data: {
          flashcards: [
            {
              id: "1",
              question: "What is React?",
              answer: "A JavaScript library",
              created_at: new Date().toISOString(),
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
        },
      },
      { status: 200 }
    );
  }),

  // Add more handlers as needed
];

// Create MSW server instance
export const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: "warn" });
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
});

// Close server after all tests
afterAll(() => {
  server.close();
});
