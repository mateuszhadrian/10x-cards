import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/db/database.types";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

type FlashcardRow = Database["public"]["Tables"]["flashcards"]["Row"];

interface SavedFlashcardItemProps {
  flashcard: FlashcardRow;
  onDelete: (id: number) => Promise<void>;
}

/**
 * Component for displaying a single saved flashcard
 * Shows front, back, source, and delete functionality
 */
export default function SavedFlashcardItem({ flashcard, onDelete }: SavedFlashcardItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(flashcard.id);
      setShowDeleteModal(false);
    } catch {
      // Error is handled by the hook, just reset the deleting state
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const getSourceBadgeVariant = (source: string) => {
    switch (source) {
      case "ai-full":
        return "default";
      case "ai-edited":
        return "secondary";
      case "manual":
        return "outline";
      default:
        return "outline";
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "ai-full":
        return "AI Generated";
      case "ai-edited":
        return "AI Edited";
      case "manual":
        return "Manual";
      default:
        return source;
    }
  };

  return (
    <>
      <Card className="bg-card hover:shadow-md transition-shadow">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* Header with source badge and delete button */}
            <div className="flex items-start justify-between gap-4">
              <Badge variant={getSourceBadgeVariant(flashcard.source ?? "")}>
                {getSourceLabel(flashcard.source ?? "")}
              </Badge>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteClick}
                disabled={isDeleting}
                aria-label={`Delete flashcard: ${flashcard.front}`}
              >
                {isDeleting ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </span>
                ) : (
                  "Delete"
                )}
              </Button>
            </div>

            {/* Front text */}
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Front:</div>
              <div className="text-base text-foreground font-medium">{flashcard.front}</div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Back text */}
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Back:</div>
              <div className="text-base whitespace-pre-wrap text-foreground">{flashcard.back}</div>
            </div>

            {/* Metadata */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 text-xs text-muted-foreground">
              <div>Created: {formatDate(flashcard.created_at)}</div>
              {flashcard.updated_at && flashcard.updated_at !== flashcard.created_at && (
                <div>Updated: {formatDate(flashcard.updated_at)}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeleting}
        flashcardFront={flashcard.front}
      />
    </>
  );
}
