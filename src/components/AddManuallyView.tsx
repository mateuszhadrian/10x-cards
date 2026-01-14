import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { CreateFlashcardsCommandDTO } from "@/types";

const MIN_FRONT_LENGTH = 1;
const MAX_FRONT_LENGTH = 200;
const MIN_BACK_LENGTH = 1;
const MAX_BACK_LENGTH = 500;

export default function AddManuallyView() {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Validation
  const frontLength = front.trim().length;
  const backLength = back.trim().length;
  const isFrontValid = frontLength >= MIN_FRONT_LENGTH && frontLength <= MAX_FRONT_LENGTH;
  const isBackValid = backLength >= MIN_BACK_LENGTH && backLength <= MAX_BACK_LENGTH;
  const isFormValid = isFrontValid && isBackValid && frontLength > 0 && backLength > 0;
  const isSaveDisabled = !isFormValid || isSaving;

  // Character count colors
  const getFrontCountColor = () => {
    if (frontLength === 0) return "text-muted-foreground";
    if (frontLength > MAX_FRONT_LENGTH) return "text-destructive";
    return "text-green-600 dark:text-green-500";
  };

  const getBackCountColor = () => {
    if (backLength === 0) return "text-muted-foreground";
    if (backLength > MAX_BACK_LENGTH) return "text-destructive";
    return "text-green-600 dark:text-green-500";
  };

  const handleSave = async () => {
    if (!isFormValid) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

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

      const data = await response.json();

      setSuccessMessage(`Successfully saved flashcard!`);
      // Clear form after successful save
      setFront("");
      setBack("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Save on Cmd+Enter or Ctrl+Enter
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && isFormValid) {
      e.preventDefault();
      handleSave();
    }
  };

  // Auto-dismiss success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-4">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Add Flashcard Manually</h1>
          <p className="mt-2 text-muted-foreground">
            Create a new flashcard by entering the front and back text.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Notification */}
        {successMessage && (
          <Alert className="border-green-600 bg-green-50 dark:bg-green-950/20 relative">
            <AlertTitle className="text-green-800 dark:text-green-400">Success</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-300 pr-8">
              {successMessage}
            </AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSuccessMessage(null)}
              className="absolute right-2 top-2 h-6 w-6 p-0 text-green-700 hover:text-green-900 dark:text-green-300 dark:hover:text-green-100"
            >
              ✕
            </Button>
          </Alert>
        )}

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
              aria-invalid={frontLength > 0 && !isFrontValid}
            />
            <div className="flex items-center justify-between text-sm">
              <span id="front-char-count" className={getFrontCountColor()}>
                {frontLength} / {MAX_FRONT_LENGTH} characters
              </span>
              {frontLength > MAX_FRONT_LENGTH && (
                <span className="text-destructive">
                  Exceeded by {frontLength - MAX_FRONT_LENGTH} characters
                </span>
              )}
            </div>
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
              aria-invalid={backLength > 0 && !isBackValid}
            />
            <div className="flex items-center justify-between text-sm">
              <span id="back-char-count" className={getBackCountColor()}>
                {backLength} / {MAX_BACK_LENGTH} characters
              </span>
              {backLength > MAX_BACK_LENGTH && (
                <span className="text-destructive">
                  Exceeded by {backLength - MAX_BACK_LENGTH} characters
                </span>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-4">
            <Button onClick={handleSave} disabled={isSaveDisabled} className="w-full sm:w-auto">
              {isSaving ? "Saving..." : "Save Flashcard"}
            </Button>
            <span className="text-sm text-muted-foreground hidden sm:inline">
              or press {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}+Enter
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
