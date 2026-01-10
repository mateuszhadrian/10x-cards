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
    onFlashcardRemove(index);
  };

  if (flashcards.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">No flashcards to review.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {flashcards.map((flashcard, index) => (
        <FlashcardReviewItem
          key={index}
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
