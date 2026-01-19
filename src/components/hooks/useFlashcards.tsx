import { useState, useEffect, useCallback } from "react";
import type { ListFlashcardsResponseDTO } from "@/types";
import type { Database } from "@/db/database.types";

type FlashcardRow = Database["public"]["Tables"]["flashcards"]["Row"];

interface UseFlashcardsState {
  flashcards: FlashcardRow[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

interface UseFlashcardsReturn extends UseFlashcardsState {
  fetchFlashcards: (page?: number) => Promise<void>;
  deleteFlashcard: (id: number) => Promise<void>;
  changePage: (page: number) => void;
}

/**
 * Custom hook for managing flashcards list
 * Handles fetching, deleting, pagination and loading states
 */
export function useFlashcards(initialPage = 1, limit = 10): UseFlashcardsReturn {
  const [state, setState] = useState<UseFlashcardsState>({
    flashcards: [],
    isLoading: true,
    error: null,
    pagination: {
      total: 0,
      page: initialPage,
      limit,
    },
  });
  const [shouldScrollToTop, setShouldScrollToTop] = useState(false);

  const fetchFlashcards = useCallback(
    async (page = state.pagination.page) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch(`/api/flashcards?page=${page}&limit=${limit}&is_deleted=false`);

        // Handle 404 as empty state (no flashcards found)
        if (response.status === 404) {
          setState({
            flashcards: [],
            isLoading: false,
            error: null,
            pagination: {
              total: 0,
              page: 1,
              limit,
            },
          });
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Failed to fetch flashcards" }));
          throw new Error(errorData.message || errorData.error || `HTTP error ${response.status}`);
        }

        const data: ListFlashcardsResponseDTO = await response.json();

        // Validate response structure
        if (!data.flashcards || !Array.isArray(data.flashcards)) {
          throw new Error("Invalid response structure: missing flashcards array");
        }

        if (!data.pagination || typeof data.pagination.total !== "number") {
          throw new Error("Invalid response structure: missing pagination data");
        }

        setState({
          flashcards: data.flashcards,
          isLoading: false,
          error: null,
          pagination: data.pagination,
        });
      } catch (error) {
        console.error("Error fetching flashcards:", error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : "An unexpected error occurred",
        }));
      }
    },
    [limit, state.pagination.page]
  );

  const deleteFlashcard = useCallback(
    async (id: number) => {
      try {
        const response = await fetch(`/api/flashcards/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Failed to delete flashcard" }));
          throw new Error(errorData.message || errorData.error || `HTTP error ${response.status}`);
        }

        // Refresh the list after successful deletion
        await fetchFlashcards(state.pagination.page);
      } catch (error) {
        console.error("Error deleting flashcard:", error);
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Failed to delete flashcard",
        }));
        throw error; // Re-throw to allow component to handle it
      }
    },
    [fetchFlashcards, state.pagination.page]
  );

  const changePage = useCallback(
    (page: number) => {
      if (page < 1 || page > Math.ceil(state.pagination.total / state.pagination.limit)) {
        console.warn(`Invalid page number: ${page}`);
        return;
      }
      setShouldScrollToTop(true);
      fetchFlashcards(page);
    },
    [fetchFlashcards, state.pagination.total, state.pagination.limit]
  );

  // Initial fetch on mount
  useEffect(() => {
    fetchFlashcards(initialPage);
  }, [initialPage]); // Only run on mount

  // Scroll to top after page change completes
  useEffect(() => {
    if (shouldScrollToTop && !state.isLoading) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setShouldScrollToTop(false);
    }
  }, [shouldScrollToTop, state.isLoading]);

  return {
    ...state,
    fetchFlashcards,
    deleteFlashcard,
    changePage,
  };
}
