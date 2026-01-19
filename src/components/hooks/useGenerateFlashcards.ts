import { useState, useCallback } from "react";
import type { TriggerGenerationCommandDTO, GenerationResponseDTO, CreateFlashcardsCommandViewModelDTO } from "@/types";

const MIN_TEXT_LENGTH = 1000;
const MAX_TEXT_LENGTH = 10000;

interface UseGenerateFlashcardsReturn {
  inputText: string;
  setInputText: (text: string) => void;
  isGenerating: boolean;
  flashcards: CreateFlashcardsCommandViewModelDTO[];
  generationId: number | null;
  isValidLength: boolean;
  textLength: number;
  generateFlashcards: () => Promise<void>;
  updateFlashcard: (index: number, changes: Partial<CreateFlashcardsCommandViewModelDTO>) => void;
  removeFlashcard: (index: number) => void;
  selectAllFlashcards: () => void;
  deselectAllFlashcards: () => void;
  resetForm: () => void;
}

/**
 * Custom hook for managing flashcard generation logic
 * Handles input validation, API calls, and flashcard state management
 */
export function useGenerateFlashcards(): UseGenerateFlashcardsReturn {
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [flashcards, setFlashcards] = useState<CreateFlashcardsCommandViewModelDTO[]>([]);
  const [generationId, setGenerationId] = useState<number | null>(null);

  const textLength = inputText.trim().length;
  const isValidLength = textLength >= MIN_TEXT_LENGTH && textLength <= MAX_TEXT_LENGTH;

  const generateFlashcards = useCallback(async () => {
    if (!isValidLength) {
      throw new Error("Invalid text length");
    }

    setIsGenerating(true);
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

      const viewModelFlashcards: CreateFlashcardsCommandViewModelDTO[] = data.flashcards.map((flashcard) => ({
        front: flashcard.front,
        back: flashcard.back,
        source: "ai-full" as const,
        accepted: false,
        edited: false,
      }));

      setFlashcards(viewModelFlashcards);
      setGenerationId(data.generation.id);
    } finally {
      setIsGenerating(false);
    }
  }, [inputText, isValidLength]);

  const updateFlashcard = useCallback((index: number, changes: Partial<CreateFlashcardsCommandViewModelDTO>) => {
    setFlashcards((prev) => prev.map((flashcard, i) => (i === index ? { ...flashcard, ...changes } : flashcard)));
  }, []);

  const removeFlashcard = useCallback((index: number) => {
    setFlashcards((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const selectAllFlashcards = useCallback(() => {
    setFlashcards((prev) => prev.map((flashcard) => ({ ...flashcard, accepted: true })));
  }, []);

  const deselectAllFlashcards = useCallback(() => {
    setFlashcards((prev) => prev.map((flashcard) => ({ ...flashcard, accepted: false })));
  }, []);

  const resetForm = useCallback(() => {
    setFlashcards([]);
    setGenerationId(null);
    setInputText("");
  }, []);

  return {
    inputText,
    setInputText,
    isGenerating,
    flashcards,
    generationId,
    isValidLength,
    textLength,
    generateFlashcards,
    updateFlashcard,
    removeFlashcard,
    selectAllFlashcards,
    deselectAllFlashcards,
    resetForm,
  };
}

export { MIN_TEXT_LENGTH, MAX_TEXT_LENGTH };
