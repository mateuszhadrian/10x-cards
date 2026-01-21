import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CharacterCounter from "@/components/CharacterCounter";
import GenerateAlerts from "@/components/generate/GenerateAlerts";
import { useCharacterValidation } from "@/components/hooks/useCharacterValidation";
import { useAlertManager } from "@/components/hooks/useAlertManager";
import type { CreateFlashcardsCommandDTO } from "@/types";

const MIN_FRONT_LENGTH = 1;
const MAX_FRONT_LENGTH = 200;
const MIN_BACK_LENGTH = 1;
const MAX_BACK_LENGTH = 500;

export default function AddManuallyView() {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { successMessage, errorMessage, showSuccess, showError, clearAlerts } = useAlertManager();
  const frontValidation = useCharacterValidation(front, MIN_FRONT_LENGTH, MAX_FRONT_LENGTH);
  const backValidation = useCharacterValidation(back, MIN_BACK_LENGTH, MAX_BACK_LENGTH);

  const isFormValid =
    frontValidation.isValid && backValidation.isValid && frontValidation.length > 0 && backValidation.length > 0;
  const isSaveDisabled = !isFormValid || isSaving;

  const handleSave = async () => {
    if (!isFormValid) return;

    setIsSaving(true);
    clearAlerts();

    try {
      const payload: CreateFlashcardsCommandDTO = {
        flashcards: [
          {
            front: front.trim(),
            back: back.trim(),
            source: "manual",
            generation_id: null,
          },
        ],
      };

      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save flashcard");
      }

      showSuccess("Successfully saved flashcard!");
      setFront("");
      setBack("");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred";
      showError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && isFormValid) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-4">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Add Flashcard Manually</h1>
          <p className="mt-2 text-muted-foreground">Create a new flashcard by entering the front and back text.</p>
        </div>

        {/* Alerts */}
        <GenerateAlerts successMessage={successMessage} errorMessage={errorMessage} onClearSuccess={clearAlerts} />

        {/* Input Form Section */}
        <div className="space-y-6">
          {/* Front Field */}
          <div className="space-y-2">
            <label htmlFor="front-text" className="text-sm font-medium text-foreground">
              Front
              <span className="text-destructive ml-1">*</span>
            </label>
            <Input
              id="front-text"
              placeholder="Enter the question or prompt..."
              value={front}
              onChange={(e) => setFront(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSaving}
              className="bg-background text-foreground border-border"
              aria-describedby="front-char-count"
              aria-invalid={frontValidation.length > 0 && !frontValidation.isValid}
            />
            <CharacterCounter
              current={frontValidation.length}
              max={MAX_FRONT_LENGTH}
              color={frontValidation.color}
              message={frontValidation.message}
            />
          </div>

          {/* Back Field */}
          <div className="space-y-2">
            <label htmlFor="back-text" className="text-sm font-medium text-foreground">
              Back
              <span className="text-destructive ml-1">*</span>
            </label>
            <Textarea
              id="back-text"
              placeholder="Enter the answer or explanation..."
              value={back}
              onChange={(e) => setBack(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSaving}
              className="h-[200px] resize-none overflow-y-auto bg-background text-foreground border-border"
              aria-describedby="back-char-count"
              aria-invalid={backValidation.length > 0 && !backValidation.isValid}
            />
            <CharacterCounter
              current={backValidation.length}
              max={MAX_BACK_LENGTH}
              color={backValidation.color}
              message={backValidation.message}
            />
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-4">
            <Button onClick={handleSave} disabled={isSaveDisabled} className="w-full sm:w-auto">
              {isSaving ? "Saving..." : "Save Flashcard"}
            </Button>
            <span className="text-sm text-muted-foreground hidden sm:inline">
              or press {typeof navigator !== "undefined" && navigator.platform?.includes("Mac") ? "⌘" : "Ctrl"}+Enter
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
