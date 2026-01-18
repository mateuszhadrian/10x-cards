import { useEffect, useRef } from "react";
import FlashcardsReviewList from "./FlashcardsReviewList";
import FlashcardsBulkSaveButton from "./FlashcardsBulkSaveButton";
import FlashcardsReviewListHeader from "./FlashcardsReviewListHeader";
import GenerateInputForm from "./generate/GenerateInputForm";
import GenerateLoadingState from "./generate/GenerateLoadingState";
import GenerateAlerts from "./generate/GenerateAlerts";
import { useGenerateFlashcards } from "@/components/hooks/useGenerateFlashcards";
import { useAlertManager } from "@/components/hooks/useAlertManager";

export default function GenerateView() {
  const {
    inputText,
    setInputText,
    isGenerating,
    flashcards,
    generationId,
    isValidLength,
    generateFlashcards,
    updateFlashcard,
    removeFlashcard,
    selectAllFlashcards,
    deselectAllFlashcards,
    resetForm,
  } = useGenerateFlashcards();

  const { successMessage, errorMessage, showSuccess, showError, clearAlerts } = useAlertManager();

  const flashcardsRef = useRef<HTMLDivElement>(null);
  const hasScrolledToFlashcards = useRef(false);

  const handleGenerate = async () => {
    if (!isValidLength) return;

    clearAlerts();
    hasScrolledToFlashcards.current = false;

    try {
      await generateFlashcards();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred";
      showError(errorMsg);
    }
  };

  const handleSaveSuccess = (savedCount: number) => {
    showSuccess(`Successfully saved ${savedCount} flashcard${savedCount !== 1 ? "s" : ""}!`);
    resetForm();
    hasScrolledToFlashcards.current = false;
  };

  const handleSaveError = (errorMsg: string) => {
    showError(errorMsg);
  };

  // Auto-scroll to flashcards section after generation (only once per generation)
  useEffect(() => {
    if (flashcards.length > 0 && flashcardsRef.current && !hasScrolledToFlashcards.current) {
      hasScrolledToFlashcards.current = true;
      setTimeout(() => {
        flashcardsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [flashcards.length]);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-4">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Generate Flashcards</h1>
          <p className="mt-2 text-muted-foreground">
            Enter text (1,000-10,000 characters) to generate flashcard proposals using AI.
          </p>
        </div>

        {/* Input Form Section */}
        <GenerateInputForm
          inputText={inputText}
          onInputChange={setInputText}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          isValidLength={isValidLength}
        />

        {/* Loading State */}
        {isGenerating && <GenerateLoadingState />}

        {/* Alerts */}
        <GenerateAlerts successMessage={successMessage} errorMessage={errorMessage} onClearSuccess={clearAlerts} />

        {/* Flashcards Review List */}
        {!isGenerating && flashcards.length > 0 && (
          <div ref={flashcardsRef} className="space-y-4 scroll-mt-8" data-testid="flashcards-review-section">
            <FlashcardsReviewListHeader
              totalCount={flashcards.length}
              acceptedCount={flashcards.filter((f) => f.accepted).length}
              onSelectAll={selectAllFlashcards}
              onDeselectAll={deselectAllFlashcards}
            />
            <FlashcardsReviewList
              flashcards={flashcards}
              onFlashcardChange={updateFlashcard}
              onFlashcardRemove={removeFlashcard}
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
