import FlashcardReviewItem from "./FlashcardReviewItem";
import type { CreateFlashcardsCommandViewModelDTO } from "@/types";

interface FlashcardsReviewListProps {
  flashcards: CreateFlashcardsCommandViewModelDTO[];
  onFlashcardChange: (flashcardIndex: number, changes: Partial<CreateFlashcardsCommandViewModelDTO>) => void;
  onFlashcardRemove: (flashcardIndex: number) => void;
}

export default function FlashcardsReviewList({
  flashcards,
  onFlashcardChange,
  onFlashcardRemove,
}: FlashcardsReviewListProps) {
  const handleAcceptChange = (index: number, accepted: boolean) => {
    onFlashcardChange(index, { accepted });
  };

  const handleEdit = (index: number, fields: { front: string; back: string }) => {
    onFlashcardChange(index, {
      front: fields.front,
      back: fields.back,
      source: "ai-edited",
      edited: true,
    });
  };

  const handleReject = (index: number) => {
    // Save current scroll position before removing
    const scrollPosition = window.scrollY;
    
    onFlashcardRemove(index);
    
    // Restore scroll position after React re-renders
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollPosition);
    });
  };

  if (flashcards.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">No flashcards to review.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="flashcards-review-list">
      {flashcards.map((flashcard, index) => (
        <FlashcardReviewItem
          key={`${flashcard.front}-${index}`}
          flashcard={flashcard}
          index={index}
          onAcceptChange={handleAcceptChange}
          onEdit={handleEdit}
          onReject={handleReject}
        />
      ))}
    </div>
  );
}
