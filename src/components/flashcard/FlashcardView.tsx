import { Button } from "@/components/ui/button";
import type { CreateFlashcardsCommandViewModelDTO } from "@/types";

interface FlashcardViewProps {
  flashcard: CreateFlashcardsCommandViewModelDTO;
  index: number;
  onEdit: () => void;
  onReject: () => void;
}

/**
 * View mode component for displaying flashcard content
 */
export default function FlashcardView({ flashcard, index, onEdit, onReject }: FlashcardViewProps) {
  return (
    <>
      {/* Header with actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <label
            htmlFor={`flashcard-${index}`}
            className="text-sm font-medium cursor-pointer select-none text-foreground"
          >
            Flashcard #{index + 1}
          </label>
          {flashcard.edited && <span className="text-xs text-muted-foreground">✏️ Edited</span>}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit} data-testid={`flashcard-edit-button-${index}`}>
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              onReject();
            }}
            data-testid={`flashcard-reject-button-${index}`}
          >
            Reject
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="text-sm font-medium text-muted-foreground">Front:</div>
          <div className="text-base text-foreground" data-testid={`flashcard-front-text-${index}`}>
            {flashcard.front}
          </div>
        </div>
        <div className="h-px bg-border" />
        <div className="space-y-1">
          <div className="text-sm font-medium text-muted-foreground">Back:</div>
          <div className="text-base whitespace-pre-wrap text-foreground" data-testid={`flashcard-back-text-${index}`}>
            {flashcard.back}
          </div>
        </div>
      </div>
    </>
  );
}
