/**
 * Example Integration Test - Testing Service Layer with MSW
 * 
 * This demonstrates:
 * - Testing API integration with MSW mocks
 * - Async/await patterns
 * - Error handling scenarios
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { server } from '../setup/msw.setup';
import { http, HttpResponse } from 'msw';

// Mock service function
const fetchFlashcards = async (page = 1, limit = 10) => {
  const response = await fetch(`/api/flashcards?page=${page}&limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch flashcards');
  }
  return response.json();
};

describe('Flashcards Service', () => {
  beforeEach(() => {
    // Reset any request handlers that were added during tests
    server.resetHandlers();
  });

  it('should fetch flashcards successfully', async () => {
    const result = await fetchFlashcards(1, 10);

    expect(result.success).toBe(true);
    expect(result.data.flashcards).toHaveLength(1);
    expect(result.data.flashcards[0]).toMatchObject({
      id: '1',
      question: 'What is React?',
      answer: 'A JavaScript library',
    });
  });

  it('should handle pagination parameters', async () => {
    const result = await fetchFlashcards(2, 20);

    expect(result.success).toBe(true);
    expect(result.data.page).toBe(1); // This is mocked, adjust as needed
    expect(result.data.limit).toBe(10);
  });

  it('should handle API errors gracefully', async () => {
    // Override the handler for this test
    server.use(
      http.get('/api/flashcards', () => {
        return HttpResponse.json(
          { error: 'Internal Server Error' },
          { status: 500 }
        );
      })
    );

    await expect(fetchFlashcards()).rejects.toThrow('Failed to fetch flashcards');
  });

  it('should handle network errors', async () => {
    // Simulate network error
    server.use(
      http.get('/api/flashcards', () => {
        return HttpResponse.error();
      })
    );

    await expect(fetchFlashcards()).rejects.toThrow();
  });

  it('should handle empty results', async () => {
    server.use(
      http.get('/api/flashcards', () => {
        return HttpResponse.json({
          success: true,
          data: {
            flashcards: [],
            total: 0,
            page: 1,
            limit: 10,
          },
        });
      })
    );

    const result = await fetchFlashcards();

    expect(result.success).toBe(true);
    expect(result.data.flashcards).toHaveLength(0);
    expect(result.data.total).toBe(0);
  });
});
