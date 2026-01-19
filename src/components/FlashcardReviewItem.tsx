import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import FlashcardView from "./flashcard/FlashcardView";
import FlashcardEditForm from "./flashcard/FlashcardEditForm";
import { useFlashcardEdit } from "./hooks/useFlashcardEdit";
import type { CreateFlashcardsCommandViewModelDTO } from "@/types";

interface FlashcardReviewItemProps {
  flashcard: CreateFlashcardsCommandViewModelDTO;
  index: number;
  onAcceptChange: (index: number, accepted: boolean) => void;
  onEdit: (index: number, fields: { front: string; back: string }) => void;
  onReject: (index: number) => void;
}

export default function FlashcardReviewItem({
  flashcard,
  index,
  onAcceptChange,
  onEdit,
  onReject,
}: FlashcardReviewItemProps) {
  const { isEditing, editedFront, editedBack, setEditedFront, setEditedBack, startEdit, cancelEdit, canSave } =
    useFlashcardEdit(flashcard.front, flashcard.back);

  const handleSaveEdit = () => {
    if (canSave(1, 200, 1, 500)) {
      onEdit(index, { front: editedFront, back: editedBack });
      cancelEdit();
    }
  };

  return (
    <Card
      className={`transition-all ${flashcard.accepted ? "border-primary shadow-md bg-card" : "bg-card"}`}
      data-testid={`flashcard-review-item-${index}`}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          {/* Checkbox */}
          {!isEditing && (
            <div className="flex items-start gap-3">
              <Checkbox
                id={`flashcard-${index}`}
                data-testid={`flashcard-checkbox-${index}`}
                checked={flashcard.accepted}
                onCheckedChange={(checked) => onAcceptChange(index, checked === true)}
                className="mt-1"
              />
            </div>
          )}

          {/* Content - View or Edit mode */}
          {isEditing ? (
            <FlashcardEditForm
              index={index}
              front={editedFront}
              back={editedBack}
              onFrontChange={setEditedFront}
              onBackChange={setEditedBack}
              onSave={handleSaveEdit}
              onCancel={cancelEdit}
              canSave={canSave(1, 200, 1, 500)}
            />
          ) : (
            <FlashcardView flashcard={flashcard} index={index} onEdit={startEdit} onReject={() => onReject(index)} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
