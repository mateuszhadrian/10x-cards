import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import FlashcardsReviewList from "./FlashcardsReviewList";
import FlashcardsBulkSaveButton from "./FlashcardsBulkSaveButton";
import FlashcardsReviewListHeader from "./FlashcardsReviewListHeader";
import type { TriggerGenerationCommandDTO, GenerationResponseDTO, CreateFlashcardsCommandViewModelDTO } from "@/types";

const MIN_TEXT_LENGTH = 1000;
const MAX_TEXT_LENGTH = 10000;

export default function GenerateView() {
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<CreateFlashcardsCommandViewModelDTO[]>([]);
  const [generationId, setGenerationId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const flashcardsRef = useRef<HTMLDivElement>(null);

  // Validation
  const textLength = inputText.length;
  const isValidLength = textLength >= MIN_TEXT_LENGTH && textLength <= MAX_TEXT_LENGTH;
  const isGenerateDisabled = !isValidLength || isGenerating;

  // Character count color
  const getCharCountColor = () => {
    if (textLength === 0) return "text-muted-foreground";
    if (textLength < MIN_TEXT_LENGTH) return "text-destructive";
    if (textLength > MAX_TEXT_LENGTH) return "text-destructive";
    return "text-green-600 dark:text-green-500";
  };

  const handleGenerate = async () => {
    if (!isValidLength) return;

    setIsGenerating(true);
    setError(null);
    setFlashcards([]);

    try {
      const payload: TriggerGenerationCommandDTO = {
        input_text: inputText,
      };

      const response = await fetch("/api/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate flashcards");
      }

      const data: GenerationResponseDTO = await response.json();

      // Convert FlashcardRow[] to CreateFlashcardsCommandViewModelDTO[]
      const viewModelFlashcards: CreateFlashcardsCommandViewModelDTO[] = data.flashcards.map((flashcard) => ({
        front: flashcard.front,
        back: flashcard.back,
        source: "ai-full" as const,
        accepted: false,
        edited: false,
      }));

      setFlashcards(viewModelFlashcards);
      setGenerationId(data.generation.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFlashcardChange = (flashcardIndex: number, changes: Partial<CreateFlashcardsCommandViewModelDTO>) => {
    setFlashcards((prevFlashcards) =>
      prevFlashcards.map((flashcard, index) => (index === flashcardIndex ? { ...flashcard, ...changes } : flashcard))
    );
  };

  const handleFlashcardRemove = (flashcardIndex: number) => {
    setFlashcards((prevFlashcards) => prevFlashcards.filter((_, index) => index !== flashcardIndex));
  };

  const handleSaveSuccess = (savedCount: number) => {
    setSuccessMessage(`Successfully saved ${savedCount} flashcard${savedCount !== 1 ? "s" : ""}!`);
    setError(null);
    // Clear flashcards and reset form after successful save
    setFlashcards([]);
    setGenerationId(null);
    setInputText("");
  };

  const handleSaveError = (errorMessage: string) => {
    setError(errorMessage);
    setSuccessMessage(null);
  };

  const handleSelectAll = () => {
    setFlashcards((prevFlashcards) => prevFlashcards.map((flashcard) => ({ ...flashcard, accepted: true })));
  };

  const handleDeselectAll = () => {
    setFlashcards((prevFlashcards) => prevFlashcards.map((flashcard) => ({ ...flashcard, accepted: false })));
  };

  // Auto-scroll to flashcards section after generation
  useEffect(() => {
    if (flashcards.length > 0 && flashcardsRef.current) {
      setTimeout(() => {
        flashcardsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [flashcards.length]);

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
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Generate Flashcards</h1>
          <p className="mt-2 text-muted-foreground">
            Enter text (1,000-10,000 characters) to generate flashcard proposals using AI.
          </p>
        </div>

        {/* Input Form Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="input-text" className="text-sm font-medium text-foreground">
              Source Text
            </label>
            <Textarea
              id="input-text"
              placeholder="Paste your text here... (minimum 1,000 characters)"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isGenerating}
              className="min-h-[300px] resize-y bg-background text-foreground border-border"
            />
            <div className="flex items-center justify-between text-sm">
              <span className={getCharCountColor()}>
                {textLength.toLocaleString()} / {MAX_TEXT_LENGTH.toLocaleString()} characters
              </span>
              {textLength > 0 && textLength < MIN_TEXT_LENGTH && (
                <span className="text-destructive">
                  Need {(MIN_TEXT_LENGTH - textLength).toLocaleString()} more characters
                </span>
              )}
              {textLength > MAX_TEXT_LENGTH && (
                <span className="text-destructive">
                  Exceeded by {(textLength - MAX_TEXT_LENGTH).toLocaleString()} characters
                </span>
              )}
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={isGenerateDisabled} className="w-full sm:w-auto">
            {isGenerating ? "Generating..." : "Generate Flashcards"}
          </Button>
        </div>

        {/* Loading State */}
        {isGenerating && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-sm text-muted-foreground">Generating flashcards with AI...</span>
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-2 rounded-lg border border-border bg-card p-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ))}
            </div>
          </div>
        )}

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
            <AlertDescription className="text-green-700 dark:text-green-300 pr-8">{successMessage}</AlertDescription>
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

        {/* Flashcards Review List */}
        {!isGenerating && flashcards.length > 0 && (
          <div ref={flashcardsRef} className="space-y-4 scroll-mt-8">
            <FlashcardsReviewListHeader
              totalCount={flashcards.length}
              acceptedCount={flashcards.filter((f) => f.accepted).length}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
            />
            <FlashcardsReviewList
              flashcards={flashcards}
              onFlashcardChange={handleFlashcardChange}
              onFlashcardRemove={handleFlashcardRemove}
            />
            <FlashcardsBulkSaveButton
              flashcards={flashcards}
              generationId={generationId}
              onSaveSuccess={handleSaveSuccess}
              onSaveError={handleSaveError}
            />
          </div>
        )}
      </div>
    </div>
  );
}
