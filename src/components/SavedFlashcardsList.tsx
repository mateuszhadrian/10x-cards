import { useFlashcards } from "@/components/hooks/useFlashcards";
import FlashcardsLoadingSkeleton from "@/components/FlashcardsLoadingSkeleton";
import SavedFlashcardItem from "@/components/SavedFlashcardItem";
import PaginationControl from "@/components/PaginationControl";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Main component for displaying saved flashcards list
 * Handles data fetching, loading states, and pagination
 */
export default function SavedFlashcardsList() {
  const { flashcards, isLoading, error, pagination, deleteFlashcard, changePage } = useFlashcards(1, 10);

  // Loading state
  if (isLoading && flashcards.length === 0) {
    return <FlashcardsLoadingSkeleton count={5} />;
  }

  // Error state
  if (error && flashcards.length === 0) {
    return (
      <Alert variant="destructive" role="alert">
        <AlertTitle>Error loading flashcards</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (!isLoading && flashcards.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
        <div className="space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">No flashcards yet</h3>
            <p className="text-sm text-muted-foreground">
              Get started by generating flashcards from your study material.
            </p>
          </div>
          <div className="pt-2">
            <a
              href="/generate"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Generate Flashcards
            </a>
          </div>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  // Main content
  return (
    <div className="space-y-6">
      {/* Stats header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {flashcards.length} of {pagination.total} flashcard{pagination.total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Flashcards list */}
      <div className="space-y-4">
        {flashcards.map((flashcard) => (
          <SavedFlashcardItem key={flashcard.id} flashcard={flashcard} onDelete={deleteFlashcard} />
        ))}
      </div>

      {/* Error message for failed operations */}
      {error && flashcards.length > 0 && (
        <Alert variant="destructive" role="alert">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-2">
          <PaginationControl
            currentPage={pagination.page}
            totalPages={totalPages}
            onPageChange={changePage}
            disabled={isLoading}
          />
        </div>
      )}
    </div>
  );
}
