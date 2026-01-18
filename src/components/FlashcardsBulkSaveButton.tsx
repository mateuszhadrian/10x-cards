import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CreateFlashcardsCommandViewModelDTO, CreateFlashcardsCommandDTO, CreateFlashcardsResponseDTO } from "@/types";

interface FlashcardsBulkSaveButtonProps {
  flashcards: CreateFlashcardsCommandViewModelDTO[];
  generationId: number | null;
  onSaveSuccess: (savedCount: number) => void;
  onSaveError: (error: string) => void;
}

export default function FlashcardsBulkSaveButton({
  flashcards,
  generationId,
  onSaveSuccess,
  onSaveError,
}: FlashcardsBulkSaveButtonProps) {
  const [isSaving, setIsSaving] = useState(false);

  const acceptedCount = flashcards.filter((f) => f.accepted).length;
  const totalCount = flashcards.length;

  const handleSave = async (mode: "all" | "accepted") => {
    const flashcardsToSave = mode === "accepted" ? flashcards.filter((f) => f.accepted) : flashcards;

    if (flashcardsToSave.length === 0) {
      onSaveError("No flashcards to save");
      return;
    }

    setIsSaving(true);

    try {
      // Convert CreateFlashcardsCommandViewModelDTO[] to CreateFlashcardsCommandDTO[]
      const flashcardsPayload: CreateFlashcardsCommandDTO = {
        flashcards: flashcardsToSave.map((flashcard) => ({
          front: flashcard.front,
          back: flashcard.back,
          source: flashcard.edited ? "ai-edited" : flashcard.source,
          generation_id: generationId,
        })),
      };

      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(flashcardsPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save flashcards");
      }

      const data: CreateFlashcardsResponseDTO = await response.json();
      onSaveSuccess(data.flashcards.length);
      
      // Redirect to flashcards list after successful save
      setTimeout(() => {
        window.location.href = "/flashcards";
      }, 1500); // Give user time to see success message
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      onSaveError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const hasAccepted = acceptedCount > 0;
  const hasAny = totalCount > 0;

  return (
    <div 
      className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border p-4 -mx-4 sm:-mx-0 sm:rounded-lg sm:border sm:p-6"
      data-testid="flashcards-bulk-save-section"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-foreground">Save Flashcards</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {acceptedCount} of {totalCount} accepted
            </span>
            {acceptedCount > 0 && <Badge variant="secondary">{acceptedCount} selected</Badge>}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => handleSave("all")}
            disabled={!hasAny || isSaving}
            className="w-full sm:w-auto"
            data-testid="save-all-flashcards-button"
          >
            {isSaving ? "Saving..." : `Save All (${totalCount})`}
          </Button>
          <Button
            onClick={() => handleSave("accepted")}
            disabled={!hasAccepted || isSaving}
            className="w-full sm:w-auto"
            data-testid="save-accepted-flashcards-button"
          >
            {isSaving ? "Saving..." : `Save Accepted (${acceptedCount})`}
          </Button>
        </div>
      </div>
    </div>
  );
}

