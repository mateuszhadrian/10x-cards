import { Button } from "@/components/ui/button";

interface FlashcardsReviewListHeaderProps {
  totalCount: number;
  acceptedCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export default function FlashcardsReviewListHeader({
  totalCount,
  acceptedCount,
  onSelectAll,
  onDeselectAll,
}: FlashcardsReviewListHeaderProps) {
  const allSelected = acceptedCount === totalCount && totalCount > 0;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Review Generated Flashcards</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {totalCount} flashcard{totalCount !== 1 ? "s" : ""} generated. Review, edit, and select which ones to save.
        </p>
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        {!allSelected ? (
          <Button variant="outline" size="sm" onClick={onSelectAll} className="w-full sm:w-auto">
            Select All
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={onDeselectAll} className="w-full sm:w-auto">
            Deselect All
          </Button>
        )}
      </div>
    </div>
  );
}
