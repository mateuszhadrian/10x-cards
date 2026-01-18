import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const [isEditing, setIsEditing] = useState(false);
  const [editedFront, setEditedFront] = useState(flashcard.front);
  const [editedBack, setEditedBack] = useState(flashcard.back);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditedFront(flashcard.front);
    setEditedBack(flashcard.back);
  };

  const handleSaveEdit = () => {
    if (editedFront.trim() && editedBack.trim()) {
      onEdit(index, { front: editedFront, back: editedBack });
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedFront(flashcard.front);
    setEditedBack(flashcard.back);
  };

  const isFrontValid = editedFront.trim().length >= 1 && editedFront.trim().length <= 200;
  const isBackValid = editedBack.trim().length >= 1 && editedBack.trim().length <= 500;
  const canSave = isFrontValid && isBackValid;

  return (
    <Card 
      className={`transition-all ${flashcard.accepted ? "border-primary shadow-md bg-card" : "bg-card"}`}
      data-testid={`flashcard-review-item-${index}`}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          {/* Header with checkbox and actions */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id={`flashcard-${index}`}
                data-testid={`flashcard-checkbox-${index}`}
                checked={flashcard.accepted}
                onCheckedChange={(checked) => onAcceptChange(index, checked === true)}
                className="mt-1"
              />
              <div className="flex flex-col gap-1">
                <label
                  htmlFor={`flashcard-${index}`}
                  className="text-sm font-medium cursor-pointer select-none text-foreground"
                >
                  Flashcard #{index + 1}
                </label>
                {flashcard.edited && <span className="text-xs text-muted-foreground">✏️ Edited</span>}
              </div>
            </div>

            {!isEditing && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleStartEdit}
                  data-testid={`flashcard-edit-button-${index}`}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    onReject(index);
                  }}
                  data-testid={`flashcard-reject-button-${index}`}
                >
                  Reject
                </Button>
              </div>
            )}
          </div>

          {/* Content - View or Edit mode */}
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor={`front-${index}`} className="text-sm font-medium text-foreground">
                  Front (Question)
                </label>
                <Input
                  id={`front-${index}`}
                  data-testid={`flashcard-edit-front-${index}`}
                  value={editedFront}
                  onChange={(e) => setEditedFront(e.target.value)}
                  placeholder="Enter front text..."
                  maxLength={200}
                  aria-invalid={!isFrontValid}
                  className="bg-background text-foreground border-border"
                />
                <div className="flex justify-between text-xs">
                  <span className={isFrontValid ? "text-muted-foreground" : "text-destructive"}>
                    {editedFront.length} / 200 characters
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor={`back-${index}`} className="text-sm font-medium text-foreground">
                  Back (Answer)
                </label>
                <Textarea
                  id={`back-${index}`}
                  data-testid={`flashcard-edit-back-${index}`}
                  value={editedBack}
                  onChange={(e) => setEditedBack(e.target.value)}
                  placeholder="Enter back text..."
                  maxLength={500}
                  className="min-h-[100px] bg-background text-foreground border-border"
                  aria-invalid={!isBackValid}
                />
                <div className="flex justify-between text-xs">
                  <span className={isBackValid ? "text-muted-foreground" : "text-destructive"}>
                    {editedBack.length} / 500 characters
                  </span>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCancelEdit}
                  data-testid={`flashcard-cancel-edit-button-${index}`}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSaveEdit} 
                  disabled={!canSave}
                  data-testid={`flashcard-save-edit-button-${index}`}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Front:</div>
                <div className="text-base text-foreground">{flashcard.front}</div>
              </div>
              <div className="h-px bg-border" />
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Back:</div>
                <div className="text-base whitespace-pre-wrap text-foreground">{flashcard.back}</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
